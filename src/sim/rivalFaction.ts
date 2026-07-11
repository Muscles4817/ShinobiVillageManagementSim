import type { FactionState } from '../domain/types'
import type { Rng } from '../utils/rng'

const FLAVOUR_ACTIONS = [
  'secured a new contract with a merchant guild along the river road.',
  'was seen recruiting near the eastern border.',
  'reinforced its outer watch posts.',
  'sent scouts through contested territory.',
  'quietly expanded its intelligence network.',
  'turned down a contract that later fell to your Enclave.',
  'lost an operative to injury on a difficult contract.',
  'held a ceremony promoting several of its operatives.',
]

export function simulateRivalTick(rival: FactionState, day: number, rng: Rng): FactionState {
  const strength = Math.max(0, Math.min(100, rival.strength + rng.int(-1, 3)))
  const reputation = Math.max(0, Math.min(100, rival.reputation + rng.int(-1, 2)))
  const hostilityDrift = rival.relationship < 0 ? 1 : -1
  const hostility = Math.max(0, Math.min(100, rival.hostility + rng.int(-1, 1) + (rng.chance(0.2) ? hostilityDrift : 0)))
  const relationship = Math.max(-100, Math.min(100, rival.relationship + rng.int(-2, 1)))

  const recentActions = [...rival.recentActions]
  if (rng.chance(0.35)) {
    recentActions.push(`Day ${day}: Ironvale Enclave ${rng.pick(FLAVOUR_ACTIONS)}`)
    if (recentActions.length > 6) recentActions.shift()
  }

  return { ...rival, strength, reputation, hostility, relationship, recentActions }
}
