import type { TraitDefinition } from '../domain/types'

export const traits: TraitDefinition[] = [
  {
    id: 'trait_calm_under_pressure',
    name: 'Calm Under Pressure',
    description: 'Keeps a level head in danger. Reduces the swing of bad outcomes on risky stages.',
    effects: [{ type: 'variance_reduction', amount: 0.3 }],
  },
  {
    id: 'trait_reckless',
    name: 'Reckless',
    description: 'Throws themselves at danger. Higher highs, higher lows, and more prone to injury.',
    effects: [
      { type: 'variance_increase', amount: 0.35 },
      { type: 'injury_risk_modifier', amount: 0.2 },
    ],
  },
  {
    id: 'trait_gifted',
    name: 'Gifted',
    description: 'Learns unusually fast. Training produces noticeably quicker gains.',
    effects: [{ type: 'training_speed', amount: 0.4 }],
  },
  {
    id: 'trait_poor_team_player',
    name: 'Poor Team Player',
    description: 'Struggles to mesh with others. Slows team cohesion growth.',
    effects: [{ type: 'cohesion_penalty', amount: 0.25 }],
  },
  {
    id: 'trait_loyal',
    name: 'Loyal',
    description: 'Deeply committed to the Enclave. Loyalty erodes far more slowly.',
    effects: [{ type: 'loyalty_bonus', amount: 0.5 }],
  },
  {
    id: 'trait_ambitious',
    name: 'Ambitious',
    description: 'Hungry to prove themselves and lead. Strong as a leader, but restless as a follower.',
    effects: [
      { type: 'leadership_bonus', amount: 0.15 },
      { type: 'cohesion_penalty', amount: 0.1 },
    ],
  },
  {
    id: 'trait_cautious',
    name: 'Cautious',
    description: 'Takes few unnecessary risks. Noticeably less likely to be injured.',
    effects: [{ type: 'injury_risk_modifier', amount: -0.3 }],
  },
  {
    id: 'trait_natural_leader',
    name: 'Natural Leader',
    description: 'Commands respect effortlessly. Improves team cohesion and coordination when leading.',
    effects: [
      { type: 'leadership_bonus', amount: 0.25 },
      { type: 'cohesion_bonus', amount: 0.15 },
    ],
  },
  {
    id: 'trait_medic',
    name: 'Medic',
    description: 'Field medical training. Boosts stages requiring care and speeds squadmate recovery.',
    effects: [
      { type: 'stage_bonus', stageAttribute: 'intelligence', amount: 0.2 },
      { type: 'recovery_speed', amount: 0.25 },
    ],
  },
  {
    id: 'trait_tracker',
    name: 'Tracker',
    description: 'Reads terrain and trails with ease. Strong on stages needing mobility or investigation.',
    effects: [{ type: 'stage_bonus', stageAttribute: 'mobility', amount: 0.2 }],
  },
  {
    id: 'trait_scout',
    name: 'Scout',
    description: 'Moves unseen and reports back reliably. Reduces variance on stealth-related stages.',
    effects: [
      { type: 'stage_bonus', stageAttribute: 'mobility', amount: 0.15 },
      { type: 'variance_reduction', amount: 0.15 },
    ],
  },
  {
    id: 'trait_fast_learner',
    name: 'Fast Learner',
    description: 'Picks up new instruction quickly, especially early in their career.',
    effects: [{ type: 'training_speed', amount: 0.25 }],
  },
]

export function traitById(id: string): TraitDefinition {
  const trait = traits.find((t) => t.id === id)
  if (!trait) throw new Error(`Unknown trait id: ${id}`)
  return trait
}
