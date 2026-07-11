import type { AttributeKey, TrainingCategory, Warrior } from '../domain/types'
import type { Rng } from '../utils/rng'
import { traitEffectsOfType } from './warriorSim'

const TRAINING_ATTRIBUTE: Record<TrainingCategory, AttributeKey[]> = {
  combat_drills: ['combat'],
  technique_practice: ['technique'],
  mobility_training: ['mobility'],
  leadership_development: ['presence'],
  medical_training: ['intelligence', 'resilience'],
  investigation_training: ['intelligence'],
  team_exercises: ['control'],
  recovery_conditioning: ['resilience'],
}

const BASE_GAIN = 1.4
const BASE_FATIGUE_GAIN = 10
const YOUNG_AGE_THRESHOLD = 23
const YOUNG_BONUS = 0.2

export function applyTraining(warrior: Warrior, category: TrainingCategory, facilityLevel: number, rng: Rng): Warrior {
  const attributesToTrain = TRAINING_ATTRIBUTE[category]
  const trainingSpeedBonus = traitEffectsOfType(warrior, 'training_speed').reduce((s, e) => s + (e.amount ?? 0), 0)
  const youngBonus = warrior.age <= YOUNG_AGE_THRESHOLD ? YOUNG_BONUS : 0
  const facilityBonus = facilityLevel >= 2 ? 0.3 : 0

  const gainMultiplier = 1 + trainingSpeedBonus + youngBonus + facilityBonus
  const attributes = { ...warrior.attributes }
  for (const attr of attributesToTrain) {
    const gain = (BASE_GAIN * gainMultiplier * rng.float(0.7, 1.3)) / attributesToTrain.length
    attributes[attr] = Math.min(100, attributes[attr] + gain)
  }

  const fatigue = Math.min(100, warrior.fatigue + BASE_FATIGUE_GAIN)
  const experience = warrior.experience + 4

  return { ...warrior, attributes, fatigue, experience }
}

export function trainingCategoryLabel(category: TrainingCategory): string {
  const labels: Record<TrainingCategory, string> = {
    combat_drills: 'Combat Drills',
    technique_practice: 'Technique Practice',
    mobility_training: 'Mobility Training',
    leadership_development: 'Leadership Development',
    medical_training: 'Medical Training',
    investigation_training: 'Investigation Training',
    team_exercises: 'Team Exercises',
    recovery_conditioning: 'Recovery & Conditioning',
  }
  return labels[category]
}
