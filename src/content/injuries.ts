import type { InjuryDefinition } from '../domain/types'

export const injuries: InjuryDefinition[] = [
  {
    id: 'injury_bruised',
    name: 'Bruised',
    severity: 'bruised',
    attributePenaltyPercent: 10,
    baseRecoveryDays: 1,
    description: 'Minor bumps and knocks. Barely slows an operative down.',
  },
  {
    id: 'injury_strained',
    name: 'Strained',
    severity: 'strained',
    attributePenaltyPercent: 20,
    baseRecoveryDays: 2,
    description: 'A pulled muscle or twisted joint. Uncomfortable but manageable.',
  },
  {
    id: 'injury_wounded',
    name: 'Wounded',
    severity: 'wounded',
    attributePenaltyPercent: 35,
    baseRecoveryDays: 4,
    description: 'A real injury from blade, blunt force, or a bad fall. Needs proper treatment.',
  },
  {
    id: 'injury_severely_wounded',
    name: 'Severely Wounded',
    severity: 'severely_wounded',
    attributePenaltyPercent: 55,
    baseRecoveryDays: 7,
    description: 'A serious, dangerous injury. Long recovery, and a real scare for the whole Enclave.',
  },
]

export function injuryById(id: string): InjuryDefinition {
  const injury = injuries.find((i) => i.id === id)
  if (!injury) throw new Error(`Unknown injury id: ${id}`)
  return injury
}
