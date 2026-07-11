import type { RankDefinition } from '../domain/types'

export const ranks: RankDefinition[] = [
  {
    id: 'initiate',
    name: 'Initiate',
    order: 1,
    wage: 2,
    leadershipBonus: 0,
    description: 'Freshly graduated from basic training. Eager, unproven, and inexpensive to keep.',
  },
  {
    id: 'field_operative',
    name: 'Field Operative',
    order: 2,
    wage: 4,
    leadershipBonus: 5,
    description: 'Has survived several real contracts. Competent enough to lead small, low-risk teams.',
  },
  {
    id: 'veteran',
    name: 'Veteran',
    order: 3,
    wage: 7,
    leadershipBonus: 10,
    description: 'A seasoned professional with a proven record. The backbone of a growing Enclave.',
  },
  {
    id: 'elite',
    name: 'Elite',
    order: 4,
    wage: 12,
    leadershipBonus: 18,
    description: 'Among the most capable operatives in the Reach. Expensive, rare, and decisive.',
  },
]

export function rankById(id: string): RankDefinition {
  const rank = ranks.find((r) => r.id === id)
  if (!rank) throw new Error(`Unknown rank id: ${id}`)
  return rank
}
