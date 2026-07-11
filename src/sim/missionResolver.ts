import type {
  Contract,
  InjurySeverity,
  MissionOutcomeTier,
  MissionResult,
  MissionStageTemplate,
  MissionTemplate,
  StageResult,
  Team,
  Warrior,
} from '../domain/types'
import type { Rng } from '../utils/rng'
import { computeStageCapability, teamMembers } from './teamSim'
import { effectiveAttributes, traitEffectsOfType } from './warriorSim'
import { injuries } from '../content/injuries'
import { fragmentsForOutcome } from '../content/narrativeFragments'

const CONFIDENCE_BASE_COMPLICATION: Record<string, number> = { poor: 0.32, fair: 0.18, good: 0.08 }
const DANGER_BASE_INJURY: Record<string, number> = { low: 0.06, moderate: 0.12, high: 0.2, unknown: 0.16 }

const OUTCOME_FUNDS_MULTIPLIER: Record<MissionOutcomeTier, number> = {
  exceptional_success: 1.25,
  success: 1.0,
  partial_success: 0.55,
  failure: 0.15,
  disaster: 0,
}

const OUTCOME_REP_MULTIPLIER: Record<MissionOutcomeTier, number> = {
  exceptional_success: 1.3,
  success: 1.0,
  partial_success: 0.4,
  failure: -0.3,
  disaster: -1,
}

const OUTCOME_EXP_BONUS: Record<MissionOutcomeTier, number> = {
  exceptional_success: 25,
  success: 15,
  partial_success: 8,
  failure: 4,
  disaster: 2,
}

const RANK_EXP_MULTIPLIER: Record<string, number> = {
  initiate: 1.3,
  field_operative: 1.1,
  veteran: 1.0,
  elite: 0.8,
}

function severityForMargin(margin: number): InjurySeverity {
  if (margin >= -5) return 'bruised'
  if (margin >= -15) return 'strained'
  if (margin >= -30) return 'wounded'
  return 'severely_wounded'
}

function injuryIdForSeverity(severity: InjurySeverity): string {
  const def = injuries.find((i) => i.severity === severity)
  if (!def) throw new Error(`No injury defined for severity ${severity}`)
  return def.id
}

function determineOutcome(weightedMargin: number, successRatio: number): MissionOutcomeTier {
  if (weightedMargin >= 18 && successRatio >= 0.99) return 'exceptional_success'
  if (weightedMargin >= 4 && successRatio >= 0.5) return 'success'
  if (weightedMargin >= -12) return 'partial_success'
  if (weightedMargin >= -28) return 'failure'
  return 'disaster'
}

function topContributor(team: Team, warriors: Warrior[], stage: MissionStageTemplate): string | null {
  const members = teamMembers(team, warriors)
  if (members.length === 0) return null
  let best: Warrior | null = null
  let bestScore = -Infinity
  for (const member of members) {
    const attrs = effectiveAttributes(member)
    const score = stage.attributes.reduce((s, a) => s + attrs[a], 0)
    if (score > bestScore) {
      bestScore = score
      best = member
    }
  }
  return best?.id ?? null
}

export function resolveMission(params: {
  contract: Contract
  template: MissionTemplate
  team: Team
  warriors: Warrior[]
  rng: Rng
}): MissionResult {
  const { contract, template, team, warriors, rng } = params

  const stageResults: StageResult[] = []
  const standoutWarriorIds = new Set<string>()
  const injuriesResult: MissionResult['injuries'] = []
  const complications: string[] = []
  const injuredThisMission = new Set<string>()

  let weightedMarginSum = 0
  let weightSum = 0
  let successCount = 0

  for (const stage of template.stages) {
    const capability = computeStageCapability(team, warriors, stage)
    const noise = rng.float(-capability.variance, capability.variance)
    const baseComplicationChance = CONFIDENCE_BASE_COMPLICATION[contract.infoConfidence] ?? 0.18
    const complicationChance = Math.max(0, Math.min(0.7, baseComplicationChance + capability.complicationChanceModifier))
    const complicationTriggered = rng.chance(complicationChance)
    const effectiveDifficulty = stage.difficultyBase + (complicationTriggered ? rng.int(5, 15) : 0)
    const finalValue = capability.score + noise
    const margin = finalValue - effectiveDifficulty
    const success = margin >= 0

    if (success) successCount += 1
    weightedMarginSum += stage.weight * margin
    weightSum += stage.weight

    const complicationText = complicationTriggered
      ? `${stage.label}: something went wrong that nobody anticipated.`
      : undefined
    if (complicationText) complications.push(complicationText)

    stageResults.push({ stageId: stage.id, label: stage.label, success, margin, complication: complicationText })

    if (margin > 8) {
      const contributor = topContributor(team, warriors, stage)
      if (contributor) standoutWarriorIds.add(contributor)
    }

    if (!success || complicationTriggered) {
      const dangerInjuryChance = DANGER_BASE_INJURY[template.dangerBand] ?? 0.12
      const members = teamMembers(team, warriors).filter((m) => !injuredThisMission.has(m.id))
      for (const member of members) {
        let chance = dangerInjuryChance
        for (const effect of traitEffectsOfType(member, 'injury_risk_modifier')) chance += effect.amount ?? 0
        chance = Math.max(0.01, Math.min(0.6, chance)) * (success ? 0.4 : 1)
        if (rng.chance(chance)) {
          const severity = severityForMargin(margin)
          injuriesResult.push({ warriorId: member.id, injuryId: injuryIdForSeverity(severity), severity })
          injuredThisMission.add(member.id)
        }
      }
    }
  }

  const weightedMargin = weightSum > 0 ? weightedMarginSum / weightSum : 0
  const successRatio = template.stages.length > 0 ? successCount / template.stages.length : 0
  const outcome = determineOutcome(weightedMargin, successRatio)

  const experienceGained: Record<string, number> = {}
  for (const member of teamMembers(team, warriors)) {
    const rankMultiplier = RANK_EXP_MULTIPLIER[member.rank] ?? 1
    const standoutBonus = standoutWarriorIds.has(member.id) ? 10 : 0
    const gained = Math.round((15 + OUTCOME_EXP_BONUS[outcome] + standoutBonus) * rankMultiplier)
    experienceGained[member.id] = gained
  }

  const fundsAwarded = Math.round(contract.reward * OUTCOME_FUNDS_MULTIPLIER[outcome])
  const reputationAwarded = Math.round(contract.reputationReward * OUTCOME_REP_MULTIPLIER[outcome])
  const intelDiscovered =
    successRatio >= 0.5 && (template.category === 'intelligence_gathering' || template.category === 'counter_espionage' || template.category === 'infiltration')
      ? rng.int(2, 6)
      : successRatio >= 0.5
        ? rng.int(0, 2)
        : 0

  const narrative: string[] = []
  const outcomeFragments = fragmentsForOutcome(outcome)
  if (outcomeFragments.length > 0) narrative.push(rng.pick(outcomeFragments))
  if (standoutWarriorIds.size > 0) {
    const names = Array.from(standoutWarriorIds)
      .map((id) => warriors.find((w) => w.id === id)?.name)
      .filter((n): n is string => Boolean(n))
    if (names.length > 0) narrative.push(`${names.join(' and ')} stood out during the contract.`)
  }
  if (injuriesResult.length > 0) {
    const names = injuriesResult.map((i) => warriors.find((w) => w.id === i.warriorId)?.name).filter((n): n is string => Boolean(n))
    narrative.push(`Injuries were sustained: ${names.join(', ')}.`)
  }
  for (const complicationText of complications) narrative.push(complicationText)

  return {
    contractId: contract.id,
    teamId: team.id,
    outcome,
    stageResults,
    standoutWarriorIds: Array.from(standoutWarriorIds),
    injuries: injuriesResult,
    experienceGained,
    fundsAwarded,
    reputationAwarded,
    intelDiscovered,
    complications,
    narrative,
  }
}
