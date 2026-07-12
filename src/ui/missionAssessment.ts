import type { MissionTemplate, Team, Warrior } from '../domain/types'
import { computeStageCapability } from '../sim/teamSim'

export type StageAssessment = 'strong' | 'favourable' | 'risky' | 'overwhelmed'

export const STAGE_ASSESSMENT_LABEL: Record<StageAssessment, string> = {
  strong: 'Strong',
  favourable: 'Favourable',
  risky: 'Risky',
  overwhelmed: 'Overwhelmed',
}

export function assessStage(team: Team, warriors: Warrior[], template: MissionTemplate, stageId: string): StageAssessment {
  const stage = template.stages.find((s) => s.id === stageId)
  if (!stage) return 'risky'
  const capability = computeStageCapability(team, warriors, stage)
  const margin = capability.score - stage.difficultyBase
  if (margin >= 15) return 'strong'
  if (margin >= 0) return 'favourable'
  if (margin >= -15) return 'risky'
  return 'overwhelmed'
}
