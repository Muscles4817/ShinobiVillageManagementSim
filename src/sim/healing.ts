import type { Warrior } from '../domain/types'
import type { Rng } from '../utils/rng'
import { traitEffectsOfType } from './warriorSim'

function medicalCapacity(medicalWardLevel: number): number {
  if (medicalWardLevel >= 2) return 6
  if (medicalWardLevel >= 1) return 3
  return 1
}

export function progressHealing(warriors: Warrior[], medicalWardLevel: number, priorityIds: string[], rng: Rng): Warrior[] {
  const capacity = medicalCapacity(medicalWardLevel)
  const injured = warriors.filter((w) => w.injuries.length > 0)
  if (injured.length === 0) return warriors

  const priorityRank = new Map(priorityIds.map((id, idx) => [id, idx]))
  const sorted = [...injured].sort((a, b) => {
    const pa = priorityRank.has(a.id) ? (priorityRank.get(a.id) as number) : Number.MAX_SAFE_INTEGER
    const pb = priorityRank.has(b.id) ? (priorityRank.get(b.id) as number) : Number.MAX_SAFE_INTEGER
    if (pa !== pb) return pa - pb
    return b.injuries.length - a.injuries.length
  })
  const treatedIds = new Set(sorted.slice(0, capacity).map((w) => w.id))

  return warriors.map((warrior) => {
    if (warrior.injuries.length === 0) return warrior
    if (!treatedIds.has(warrior.id)) return warrior

    const facilityBonus = medicalWardLevel >= 2 ? 1 : 0
    const recoveryTraitBonus = traitEffectsOfType(warrior, 'recovery_speed').some((e) => rng.chance(e.amount ?? 0)) ? 1 : 0
    const daysAdvanced = 1 + facilityBonus + recoveryTraitBonus

    const injuries = warrior.injuries
      .map((injury) => ({ ...injury, daysRemaining: injury.daysRemaining - daysAdvanced }))
      .filter((injury) => injury.daysRemaining > 0)

    const status = injuries.length === 0 && warrior.status === 'injured' ? 'available' : warrior.status
    const health = injuries.length === 0 ? 100 : warrior.health

    return { ...warrior, injuries, status, health }
  })
}
