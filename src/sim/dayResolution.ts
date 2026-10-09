import type { ActiveMission, Contract, ContentPack, GameState, Team, VillageTier, Warrior } from '../domain/types'
import type { Rng } from '../utils/rng'
import { applyDailyUpkeep, computeSecurity } from './economy'
import { resolveMission } from './missionResolver'
import { updateCohesionAfterMission } from './teamSim'
import { applyPromotion, checkPromotion } from './warriorSim'
import { progressHealing } from './healing'
import { applyTraining } from './training'
import { progressConstruction } from './construction'
import { refreshRecruitPool } from './recruitment'
import { refreshContracts } from './contractGeneration'
import { simulateRivalTick } from './rivalFaction'
import { maybeTriggerEvent } from './events'
import { makeReport } from './reports'
import { missionTemplateById } from '../content/missionTemplates'
import { facilityDefinitionById } from '../content/facilities'
import { injuryById } from '../content/injuries'
import { eventTemplateById } from '../content/events'

const TRAVEL_FATIGUE = 5
const MISSION_FATIGUE = 6
const PASSIVE_FATIGUE_RECOVERY = 10

function applyFatigue(warriors: Warrior[], ids: string[], amount: number): Warrior[] {
  const idSet = new Set(ids)
  return warriors.map((w) => (idSet.has(w.id) ? { ...w, fatigue: Math.max(0, Math.min(100, w.fatigue + amount)) } : w))
}

function updateMoraleDrift(warriors: Warrior[]): Warrior[] {
  return warriors.map((w) => {
    if (w.fatigue > 80) return { ...w, morale: Math.max(0, w.morale - 2) }
    if (w.status === 'available' && w.fatigue < 30) return { ...w, morale: Math.min(100, w.morale + 1) }
    return w
  })
}

interface MissionStepOutput {
  warriors: Warrior[]
  teams: Team[]
  contracts: Contract[]
  activeMissions: ActiveMission[]
  village: GameState['village']
  rival: GameState['rival']
  reports: GameState['reports']
}

function progressMissions(state: GameState, rng: Rng, reportDay: number): MissionStepOutput {
  let warriors = [...state.warriors]
  let teams = [...state.teams]
  let contracts = [...state.contracts]
  let village = { ...state.village }
  const rival = { ...state.rival }
  const reports = [...state.reports]
  const stillActive: ActiveMission[] = []

  for (const mission of state.activeMissions) {
    const team = teams.find((t) => t.id === mission.teamId)
    if (!team) continue
    const memberIds = team.memberIds

    if (mission.travelDaysRemaining > 0) {
      warriors = applyFatigue(warriors, memberIds, TRAVEL_FATIGUE)
      stillActive.push({ ...mission, travelDaysRemaining: mission.travelDaysRemaining - 1 })
      continue
    }

    if (mission.missionDaysRemaining > 0) {
      warriors = applyFatigue(warriors, memberIds, MISSION_FATIGUE)
      warriors = warriors.map((w) => (memberIds.includes(w.id) ? { ...w, status: 'deployed' } : w))
      const missionDaysRemaining = mission.missionDaysRemaining - 1

      if (missionDaysRemaining === 0) {
        const contract = contracts.find((c) => c.id === mission.contractId)
        const template = missionTemplateById(mission.templateId)
        let missionResult = mission.result
        if (contract) {
          const result = resolveMission({ contract, template, team, warriors, rng })
          missionResult = result

          village = {
            ...village,
            funds: village.funds + result.fundsAwarded,
            reputation: Math.max(0, village.reputation + result.reputationAwarded),
            intel: Math.max(0, village.intel + result.intelDiscovered),
          }

          const injuryMap = new Map(result.injuries.map((i) => [i.warriorId, i]))
          warriors = warriors.map((w) => {
            if (!memberIds.includes(w.id)) return w
            let updated = { ...w, experience: w.experience + (result.experienceGained[w.id] ?? 0) }
            const injury = injuryMap.get(w.id)
            if (injury) {
              const def = injuryById(injury.injuryId)
              updated = { ...updated, injuries: [...updated.injuries, { injuryId: injury.injuryId, severity: injury.severity, daysRemaining: def.baseRecoveryDays }] }
            }
            const promotion = checkPromotion(updated)
            if (promotion) {
              updated = applyPromotion(updated, promotion)
              reports.push(makeReport(rng, reportDay, 'promotion', 'Promotion', `${w.name} has been promoted to ${promotion.replace('_', ' ')}.`, { warriorIds: [w.id] }))
            }
            return updated
          })

          const missionSucceeded = result.outcome !== 'failure' && result.outcome !== 'disaster'
          const newCohesion = updateCohesionAfterMission(team, warriors, missionSucceeded)
          teams = teams.map((t) =>
            t.id === team.id
              ? { ...t, cohesion: newCohesion, missionHistory: [...t.missionHistory, { contractId: contract.id, templateId: template.id, day: reportDay, outcome: result.outcome }] }
              : t,
          )

          contracts = contracts.map((c) => (c.id === contract.id ? { ...c, status: 'resolved' } : c))

          reports.push(
            makeReport(rng, reportDay, 'mission', `${template.title}: ${result.outcome.replace('_', ' ')}`, result.narrative.join(' '), {
              warriorIds: memberIds,
              teamId: team.id,
              contractId: contract.id,
            }),
          )

          for (const injury of result.injuries) {
            if (injury.severity === 'wounded' || injury.severity === 'severely_wounded') {
              const name = warriors.find((w) => w.id === injury.warriorId)?.name ?? 'An operative'
              reports.push(makeReport(rng, reportDay, 'injury', 'Injury Report', `${name} suffered a ${injury.severity.replace('_', ' ')} injury.`, { warriorIds: [injury.warriorId] }))
            }
          }
        }

        if (mission.returnTravelDaysRemaining <= 0) {
          // No return travel needed (e.g. a zero-travel-time contract) -- the
          // team is home the moment the contract work itself concludes.
          teams = teams.map((t) => (t.id === team.id ? { ...t, status: 'idle' } : t))
          warriors = warriors.map((w) => (memberIds.includes(w.id) ? { ...w, status: w.injuries.length > 0 ? 'injured' : 'available', teamId: team.id } : w))
          continue
        }

        stillActive.push({ ...mission, missionDaysRemaining: 0, result: missionResult })
        continue
      }

      stillActive.push({ ...mission, missionDaysRemaining })
      continue
    }

    if (mission.returnTravelDaysRemaining > 0) {
      warriors = applyFatigue(warriors, memberIds, TRAVEL_FATIGUE)
      warriors = warriors.map((w) => (memberIds.includes(w.id) ? { ...w, status: 'travelling' } : w))
      const returnTravelDaysRemaining = mission.returnTravelDaysRemaining - 1

      if (returnTravelDaysRemaining === 0) {
        teams = teams.map((t) => (t.id === team.id ? { ...t, status: 'idle' } : t))
        warriors = warriors.map((w) => (memberIds.includes(w.id) ? { ...w, status: w.injuries.length > 0 ? 'injured' : 'available', teamId: team.id } : w))
        continue
      }

      stillActive.push({ ...mission, returnTravelDaysRemaining })
    }
  }

  return { warriors, teams, contracts, activeMissions: stillActive, village, rival, reports }
}

function checkVillageTier(reputation: number, currentTier: VillageTier): VillageTier {
  if (currentTier === 'outpost' && reputation >= 35) return 'recognised_settlement'
  if (currentTier === 'recognised_settlement' && reputation >= 70) return 'minor_hidden_village'
  return currentTier
}

export function resolveDay(state: GameState, contentPack: ContentPack, rng: Rng): GameState {
  const newDay = state.village.day + 1
  const reports = [...state.reports]

  let village = applyDailyUpkeep(state.village, state.warriors, state.facilities)

  const missionStep = progressMissions({ ...state, village }, rng, newDay)
  village = missionStep.village
  let warriors = missionStep.warriors
  let teams = missionStep.teams
  let contracts = missionStep.contracts
  let activeMissions = missionStep.activeMissions
  let rival = missionStep.rival
  reports.push(...missionStep.reports.slice(state.reports.length))

  const deployedOrTravellingIds = new Set(
    activeMissions.flatMap((m) => teams.find((t) => t.id === m.teamId)?.memberIds ?? []),
  )
  warriors = warriors.map((w) => {
    if (deployedOrTravellingIds.has(w.id)) return w
    if (w.status === 'training') return w
    return { ...w, fatigue: Math.max(0, w.fatigue - PASSIVE_FATIGUE_RECOVERY) }
  })
  warriors = updateMoraleDrift(warriors)

  const medicalWard = state.facilities.find((f) => f.id === 'medical_ward')
  warriors = progressHealing(warriors, medicalWard?.level ?? 1, state.medicalPriority, rng)

  const trainingGrounds = state.facilities.find((f) => f.id === 'training_grounds')
  warriors = warriors.map((w) => {
    const category = state.trainingAssignments[w.id]
    if (!category || w.status !== 'training') return w
    return applyTraining(w, category, trainingGrounds?.level ?? 1, rng)
  })

  let facilities = [...state.facilities]
  const constructionReports: GameState['reports'] = []
  facilities = facilities.map((f) => {
    const { facility, completed } = progressConstruction(f, newDay)
    if (completed) {
      const def = facilityDefinitionById(f.id)
      constructionReports.push(makeReport(rng, newDay, 'construction', 'Construction Complete', `${def.name} has been upgraded to level ${facility.level}.`))
    }
    return facility
  })
  reports.push(...constructionReports)

  const academy = facilities.find((f) => f.id === 'academy')
  const recruitPool = refreshRecruitPool(state.recruitPool, contentPack, rng, newDay, academy?.level ?? 0)

  rival = simulateRivalTick(rival, newDay, rng)

  contracts = contracts.map((c) => (c.status === 'available' && c.expiryDay < newDay ? { ...c, status: 'expired' } : c))

  const missionHall = facilities.find((f) => f.id === 'mission_hall')
  contracts = refreshContracts(contracts, contentPack, rng, newDay, missionHall?.level ?? 1)

  const security = computeSecurity(warriors, facilities, rival.hostility)
  const tier = checkVillageTier(village.reputation, village.tier)
  if (tier !== village.tier) {
    reports.push(makeReport(rng, newDay, 'system', 'Village Recognised', `Your Enclave has grown into a ${tier.replace(/_/g, ' ')}.`))
  }
  village = { ...village, day: newDay, security, tier }

  let pendingEvents = [...state.pendingEvents]
  const newEvent = maybeTriggerEvent({ ...state, village, pendingEvents }, contentPack, rng)
  if (newEvent) {
    pendingEvents = [...pendingEvents, newEvent]
    const template = eventTemplateById(newEvent.templateId)
    reports.push(makeReport(rng, newDay, 'event', template.title, template.prompt))
  }

  return {
    ...state,
    village,
    warriors,
    teams,
    contracts,
    activeMissions,
    facilities,
    rival,
    reports,
    recruitPool,
    pendingEvents,
    rngCounter: state.rngCounter + 1,
  }
}
