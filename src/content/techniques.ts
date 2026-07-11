import type { TechniqueDefinition } from '../domain/types'

export const techniques: TechniqueDefinition[] = [
  {
    id: 'tech_shadowstep',
    name: 'Shadowstep Technique',
    description: 'A method of moving between cover unseen, closing distance without alerting a target.',
    requiredRank: 'field_operative',
    stageAttributes: ['mobility'],
    bonus: 8,
  },
  {
    id: 'tech_iron_guard',
    name: 'Iron Guard Stance',
    description: 'A defensive combat stance that turns aside blows that would otherwise land clean.',
    requiredRank: 'initiate',
    stageAttributes: ['combat', 'resilience'],
    bonus: 6,
  },
  {
    id: 'tech_piercing_strike',
    name: 'Piercing Strike Form',
    description: 'An aggressive striking form built to end fights quickly.',
    requiredRank: 'field_operative',
    stageAttributes: ['combat'],
    bonus: 9,
  },
  {
    id: 'tech_whisper_reading',
    name: 'Whisper Reading',
    description: 'A questioning technique that draws out truth from reluctant witnesses.',
    requiredRank: 'field_operative',
    stageAttributes: ['intelligence', 'presence'],
    bonus: 7,
  },
  {
    id: 'tech_field_suture',
    name: 'Field Suture Method',
    description: 'Battlefield medicine adapted for use without a proper ward.',
    requiredRank: 'initiate',
    stageAttributes: ['resilience', 'intelligence'],
    bonus: 7,
  },
  {
    id: 'tech_long_stride',
    name: 'Long Stride Method',
    description: 'A breathing and pacing discipline that lets a team cover ground far faster than normal.',
    requiredRank: 'initiate',
    stageAttributes: ['mobility'],
    bonus: 6,
  },
  {
    id: 'tech_silent_approach',
    name: 'Silent Approach',
    description: 'Controlled footwork and breath discipline for moving through hostile ground undetected.',
    requiredRank: 'veteran',
    stageAttributes: ['mobility', 'control'],
    bonus: 10,
  },
  {
    id: 'tech_rally_cry',
    name: 'Rally Cry Discipline',
    description: 'A trained cadence and presence that steadies a team under pressure.',
    requiredRank: 'veteran',
    stageAttributes: ['presence'],
    bonus: 9,
  },
  {
    id: 'tech_focused_mind',
    name: 'Focused Mind Technique',
    description: 'A meditative control technique that sharpens precision under stress.',
    requiredRank: 'field_operative',
    stageAttributes: ['control'],
    bonus: 8,
  },
  {
    id: 'tech_terrain_reading',
    name: 'Terrain Reading',
    description: 'Trained observation of ground, weather, and signs of passage to anticipate danger.',
    requiredRank: 'field_operative',
    stageAttributes: ['intelligence', 'mobility'],
    bonus: 7,
  },
]

export function techniqueById(id: string): TechniqueDefinition {
  const technique = techniques.find((t) => t.id === id)
  if (!technique) throw new Error(`Unknown technique id: ${id}`)
  return technique
}
