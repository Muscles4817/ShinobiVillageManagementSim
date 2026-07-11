import type { MissionStageTemplate, Team, TechniqueDefinition, Warrior } from '../domain/types'
import { effectiveAttributes, leadershipScore, traitEffectsOfType } from './warriorSim'
import { techniques } from '../content/techniques'

export function teamMembers(team: Team, warriors: Warrior[]): Warrior[] {
  return team.memberIds
    .map((id) => warriors.find((w) => w.id === id))
    .filter((w): w is Warrior => w !== undefined)
}

function memberStageScore(warrior: Warrior, stage: MissionStageTemplate): number {
  const attrs = effectiveAttributes(warrior)
  const base = stage.attributes.reduce((sum, a) => sum + attrs[a], 0) / stage.attributes.length

  const techniqueBonus = warrior.techniqueIds
    .map((id) => techniques.find((t: TechniqueDefinition) => t.id === id))
    .filter((t): t is TechniqueDefinition => t !== undefined)
    .filter((t) => t.stageAttributes.some((a) => stage.attributes.includes(a)))
    .reduce((sum, t) => sum + t.bonus, 0)

  const traitBonus = traitEffectsOfType(warrior, 'stage_bonus')
    .filter((e) => e.stageAttribute && stage.attributes.includes(e.stageAttribute))
    .reduce((sum, e) => sum + base * (e.amount ?? 0), 0)

  return base + techniqueBonus + traitBonus
}

export interface StageCapability {
  score: number
  variance: number
  complicationChanceModifier: number
}

export function computeStageCapability(team: Team, warriors: Warrior[], stage: MissionStageTemplate): StageCapability {
  const members = teamMembers(team, warriors)
  if (members.length === 0) {
    return { score: 0, variance: 20, complicationChanceModifier: 0 }
  }

  const scores = members.map((m) => memberStageScore(m, stage))
  const best = Math.max(...scores)
  const average = scores.reduce((s, v) => s + v, 0) / scores.length

  const leader = members.find((m) => m.id === team.leaderId) ?? members[0]
  const leaderBonus = leadershipScore(leader) * 0.15

  const cohesionMultiplier = 0.8 + (team.cohesion / 100) * 0.2

  let variance = 14
  let complicationChanceModifier = 0
  for (const member of members) {
    for (const effect of traitEffectsOfType(member, 'variance_reduction')) variance -= 14 * (effect.amount ?? 0)
    for (const effect of traitEffectsOfType(member, 'variance_increase')) variance += 14 * (effect.amount ?? 0)
    for (const effect of traitEffectsOfType(member, 'injury_risk_modifier')) complicationChanceModifier += effect.amount ?? 0
  }
  variance = Math.max(4, variance)

  const rawScore = best * 0.5 + average * 0.35 + leaderBonus
  const score = rawScore * cohesionMultiplier

  return { score, variance, complicationChanceModifier }
}

export function updateCohesionAfterMission(team: Team, warriors: Warrior[], missionSucceeded: boolean): number {
  const members = teamMembers(team, warriors)
  const hasPoorTeamPlayer = members.some((m) => traitEffectsOfType(m, 'cohesion_penalty').length > 0)
  const hasNaturalLeader = members.some((m) => traitEffectsOfType(m, 'cohesion_bonus').length > 0)

  let delta = missionSucceeded ? 6 : -3
  if (hasPoorTeamPlayer) delta *= 0.6
  if (hasNaturalLeader) delta += 2

  return Math.max(0, Math.min(100, team.cohesion + delta))
}

export function cohesionPenaltyForReform(cohesion: number): number {
  return Math.max(0, cohesion - 15)
}
