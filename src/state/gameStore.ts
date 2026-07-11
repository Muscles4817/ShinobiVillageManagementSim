import { create } from 'zustand'
import type { FacilityId, GameState, TrainingCategory } from '../domain/types'
import { defaultContentPack } from '../content'
import { createNewGame } from '../sim/gameSetup'
import { resolveDay } from '../sim/dayResolution'
import { createRng, deriveSeed } from '../utils/rng'
import { generateId } from '../utils/idGen'
import { canStartUpgrade, startUpgrade } from '../sim/construction'
import { facilityDefinitionById } from '../content/facilities'
import { acceptedContractLimit } from '../sim/contractGeneration'
import { cohesionPenaltyForReform } from '../sim/teamSim'
import { applyEventEffects } from '../sim/events'
import { eventTemplateById } from '../content/events'
import { makeReport } from '../sim/reports'
import { saveGame, loadGame, clearSave, hasSave } from '../persistence/saveManager'

interface ActionResult {
  ok: boolean
  reason?: string
}

interface GameStore {
  game: GameState | null
  hasExistingSave: boolean

  newGame: (villageName: string) => void
  continueGame: () => boolean
  resetGame: () => void

  advanceDay: () => void
  completeOnboarding: () => void

  acceptContract: (contractId: string) => ActionResult
  assignTeamToMission: (contractId: string, teamId: string) => ActionResult

  createTeam: (name: string, memberIds: string[], leaderId: string, mentorId: string | null) => ActionResult
  dissolveTeam: (teamId: string) => ActionResult
  reformTeam: (teamId: string, memberIds: string[], leaderId: string, mentorId: string | null) => ActionResult

  setTraining: (warriorId: string, category: TrainingCategory | null) => ActionResult

  hireRecruit: (recruitId: string) => ActionResult

  startFacilityUpgrade: (facilityId: FacilityId) => ActionResult

  resolveEventChoice: (eventInstanceId: string, choiceId: string) => ActionResult

  setMedicalPriority: (ids: string[]) => void
}

function nextRng(state: GameState) {
  return createRng(deriveSeed(state.rngSeed, state.rngCounter + 1))
}

export const useGameStore = create<GameStore>((set, get) => ({
  game: null,
  hasExistingSave: hasSave(),

  newGame: (villageName: string) => {
    const seed = Math.floor(Math.random() * 0xffffffff)
    const game = createNewGame(defaultContentPack, seed, villageName || 'Thornwatch Enclave')
    saveGame(game)
    set({ game, hasExistingSave: true })
  },

  continueGame: () => {
    const loaded = loadGame()
    if (!loaded) return false
    set({ game: loaded })
    return true
  },

  resetGame: () => {
    clearSave()
    set({ game: null, hasExistingSave: false })
  },

  advanceDay: () => {
    const state = get().game
    if (!state) return
    const rng = nextRng(state)
    const next = resolveDay(state, defaultContentPack, rng)
    saveGame(next)
    set({ game: next })
  },

  completeOnboarding: () => {
    const state = get().game
    if (!state) return
    const next = { ...state, onboardingComplete: true }
    saveGame(next)
    set({ game: next })
  },

  acceptContract: (contractId: string) => {
    const state = get().game
    if (!state) return { ok: false, reason: 'No active game.' }
    const contract = state.contracts.find((c) => c.id === contractId)
    if (!contract || contract.status !== 'available') return { ok: false, reason: 'Contract is not available.' }

    const missionHallLevel = state.facilities.find((f) => f.id === 'mission_hall')?.level ?? 1
    const acceptedCount = state.contracts.filter((c) => c.status === 'accepted' || c.status === 'active').length
    if (acceptedCount >= acceptedContractLimit(missionHallLevel)) {
      return { ok: false, reason: 'The Mission Hall cannot manage any more accepted contracts right now.' }
    }

    const contracts = state.contracts.map((c) => (c.id === contractId ? { ...c, status: 'accepted' as const } : c))
    const next = { ...state, contracts }
    saveGame(next)
    set({ game: next })
    return { ok: true }
  },

  assignTeamToMission: (contractId: string, teamId: string) => {
    const state = get().game
    if (!state) return { ok: false, reason: 'No active game.' }
    const contract = state.contracts.find((c) => c.id === contractId)
    const team = state.teams.find((t) => t.id === teamId)
    if (!contract || contract.status !== 'accepted') return { ok: false, reason: 'Contract must be accepted first.' }
    if (!team || team.status !== 'idle') return { ok: false, reason: 'Team is not available to deploy.' }

    const members = state.warriors.filter((w) => team.memberIds.includes(w.id))
    if (members.some((w) => w.status !== 'available')) {
      return { ok: false, reason: 'Not every member of this team is available.' }
    }

    const day = state.village.day
    const activeMission = {
      id: generateId('mission'),
      contractId: contract.id,
      templateId: contract.templateId,
      teamId: team.id,
      startDay: day,
      travelDaysRemaining: contract.travelTime,
      missionDaysRemaining: contract.duration,
      returnTravelDaysRemaining: contract.travelTime,
      expectedReturnDay: day + contract.travelTime * 2 + contract.duration,
    }

    const warriors = state.warriors.map((w) => (team.memberIds.includes(w.id) ? { ...w, status: 'travelling' as const } : w))
    const teams = state.teams.map((t) => (t.id === teamId ? { ...t, status: 'travelling' as const } : t))
    const contracts = state.contracts.map((c) => (c.id === contractId ? { ...c, status: 'active' as const } : c))
    const activeMissions = [...state.activeMissions, activeMission]

    const next = { ...state, warriors, teams, contracts, activeMissions }
    saveGame(next)
    set({ game: next })
    return { ok: true }
  },

  createTeam: (name, memberIds, leaderId, mentorId) => {
    const state = get().game
    if (!state) return { ok: false, reason: 'No active game.' }
    if (memberIds.length < 2 || memberIds.length > 4) return { ok: false, reason: 'Teams need 2 to 4 members.' }
    if (!memberIds.includes(leaderId)) return { ok: false, reason: 'The leader must be a member of the team.' }

    const members = state.warriors.filter((w) => memberIds.includes(w.id))
    if (members.length !== memberIds.length || members.some((w) => w.status !== 'available' || w.teamId)) {
      return { ok: false, reason: 'All members must be available and not already on a team.' }
    }

    const team = {
      id: generateId('team'),
      name,
      memberIds,
      leaderId,
      mentorId,
      cohesion: 45,
      status: 'idle' as const,
      missionHistory: [],
      createdDay: state.village.day,
      lastReformedDay: state.village.day,
    }

    const warriors = state.warriors.map((w) => (memberIds.includes(w.id) ? { ...w, teamId: team.id } : w))
    const next = { ...state, teams: [...state.teams, team], warriors }
    saveGame(next)
    set({ game: next })
    return { ok: true }
  },

  dissolveTeam: (teamId: string) => {
    const state = get().game
    if (!state) return { ok: false, reason: 'No active game.' }
    const team = state.teams.find((t) => t.id === teamId)
    if (!team) return { ok: false, reason: 'Team not found.' }
    if (team.status !== 'idle') return { ok: false, reason: 'Cannot dissolve a team that is away from the village.' }

    const warriors = state.warriors.map((w) => (team.memberIds.includes(w.id) ? { ...w, teamId: null } : w))
    const teams = state.teams.filter((t) => t.id !== teamId)
    const next = { ...state, teams, warriors }
    saveGame(next)
    set({ game: next })
    return { ok: true }
  },

  reformTeam: (teamId, memberIds, leaderId, mentorId) => {
    const state = get().game
    if (!state) return { ok: false, reason: 'No active game.' }
    const team = state.teams.find((t) => t.id === teamId)
    if (!team) return { ok: false, reason: 'Team not found.' }
    if (team.status !== 'idle') return { ok: false, reason: 'Cannot reorganise a team that is away from the village.' }
    if (memberIds.length < 2 || memberIds.length > 4) return { ok: false, reason: 'Teams need 2 to 4 members.' }
    if (!memberIds.includes(leaderId)) return { ok: false, reason: 'The leader must be a member of the team.' }

    const members = state.warriors.filter((w) => memberIds.includes(w.id))
    const availableForTeam = members.every((w) => w.status === 'available' && (w.teamId === null || w.teamId === teamId))
    if (members.length !== memberIds.length || !availableForTeam) {
      return { ok: false, reason: 'All members must be available and not already on another team.' }
    }

    const removedIds = team.memberIds.filter((id) => !memberIds.includes(id))
    const cohesion = cohesionPenaltyForReform(team.cohesion)

    const warriors = state.warriors.map((w) => {
      if (removedIds.includes(w.id)) return { ...w, teamId: null }
      if (memberIds.includes(w.id)) return { ...w, teamId: teamId }
      return w
    })

    const teams = state.teams.map((t) => (t.id === teamId ? { ...t, memberIds, leaderId, mentorId, cohesion, lastReformedDay: state.village.day } : t))
    const next = { ...state, teams, warriors }
    saveGame(next)
    set({ game: next })
    return { ok: true }
  },

  setTraining: (warriorId, category) => {
    const state = get().game
    if (!state) return { ok: false, reason: 'No active game.' }
    const warrior = state.warriors.find((w) => w.id === warriorId)
    if (!warrior) return { ok: false, reason: 'Warrior not found.' }

    if (category === null) {
      if (warrior.status !== 'training') return { ok: true }
      const warriors = state.warriors.map((w) => (w.id === warriorId ? { ...w, status: 'available' as const } : w))
      const trainingAssignments = { ...state.trainingAssignments }
      delete trainingAssignments[warriorId]
      const next = { ...state, warriors, trainingAssignments }
      saveGame(next)
      set({ game: next })
      return { ok: true }
    }

    if (warrior.status !== 'available') return { ok: false, reason: 'Warrior is not available to train.' }
    const warriors = state.warriors.map((w) => (w.id === warriorId ? { ...w, status: 'training' as const } : w))
    const trainingAssignments = { ...state.trainingAssignments, [warriorId]: category }
    const next = { ...state, warriors, trainingAssignments }
    saveGame(next)
    set({ game: next })
    return { ok: true }
  },

  hireRecruit: (recruitId: string) => {
    const state = get().game
    if (!state) return { ok: false, reason: 'No active game.' }
    const candidate = state.recruitPool.find((r) => r.id === recruitId)
    if (!candidate) return { ok: false, reason: 'Recruit is no longer available.' }
    if (state.village.funds < candidate.signingCost) return { ok: false, reason: 'Not enough funds to sign this recruit.' }

    const warrior = {
      id: generateId('warrior'),
      name: candidate.name,
      age: candidate.age,
      rank: candidate.rank,
      archetype: candidate.archetype,
      attributes: candidate.attributes,
      traitIds: candidate.traitIds,
      techniqueIds: [],
      specialityIds: candidate.specialityIds,
      loyalty: candidate.hiddenLoyaltyNote ? 42 : 58,
      morale: 60,
      fatigue: 0,
      health: 100,
      experience: 0,
      level: 1,
      injuries: [],
      status: 'available' as const,
      teamId: null,
      missionHistory: [],
      relationships: {},
      wage: candidate.wage,
      isRecruit: true,
      background: candidate.background,
      hiddenLoyaltyNote: candidate.hiddenLoyaltyNote,
      joinedDay: state.village.day,
    }

    const warriors = [...state.warriors, warrior]
    const recruitPool = state.recruitPool.filter((r) => r.id !== recruitId)
    const village = { ...state.village, funds: state.village.funds - candidate.signingCost }
    const rng = nextRng(state)
    const reports = [...state.reports, makeReport(rng, state.village.day, 'recruitment', 'New Recruit', `${warrior.name} has signed on with the Enclave.`, { warriorIds: [warrior.id] })]

    const next = { ...state, warriors, recruitPool, village, reports, rngCounter: state.rngCounter + 1 }
    saveGame(next)
    set({ game: next })
    return { ok: true }
  },

  startFacilityUpgrade: (facilityId: FacilityId) => {
    const state = get().game
    if (!state) return { ok: false, reason: 'No active game.' }
    const facility = state.facilities.find((f) => f.id === facilityId)
    if (!facility) return { ok: false, reason: 'Facility not found.' }
    const definition = facilityDefinitionById(facilityId)

    const check = canStartUpgrade(facility, definition, state.village.funds)
    if (!check.ok) return { ok: false, reason: check.reason }

    const nextLevel = definition.levels.find((l) => l.level === facility.level + 1)
    const upgraded = startUpgrade(facility, definition, state.village.day)
    const facilities = state.facilities.map((f) => (f.id === facilityId ? upgraded : f))
    const village = { ...state.village, funds: state.village.funds - (nextLevel?.cost ?? 0) }

    const next = { ...state, facilities, village }
    saveGame(next)
    set({ game: next })
    return { ok: true }
  },

  resolveEventChoice: (eventInstanceId: string, choiceId: string) => {
    const state = get().game
    if (!state) return { ok: false, reason: 'No active game.' }
    const eventInstance = state.pendingEvents.find((e) => e.id === eventInstanceId)
    if (!eventInstance) return { ok: false, reason: 'Event is no longer pending.' }
    const template = eventTemplateById(eventInstance.templateId)
    const choice = template.choices.find((c) => c.id === choiceId)
    if (!choice) return { ok: false, reason: 'Invalid choice.' }

    const rng = nextRng(state)
    const afterEffects = applyEventEffects(state, choice.effects, rng)
    const pendingEvents = state.pendingEvents.filter((e) => e.id !== eventInstanceId)
    const reports = [...afterEffects.reports, makeReport(rng, state.village.day, 'event', template.title, `You chose: ${choice.label}`)]

    const next = { ...afterEffects, pendingEvents, reports, rngCounter: state.rngCounter + 1 }
    saveGame(next)
    set({ game: next })
    return { ok: true }
  },

  setMedicalPriority: (ids: string[]) => {
    const state = get().game
    if (!state) return
    const next = { ...state, medicalPriority: ids }
    saveGame(next)
    set({ game: next })
  },
}))
