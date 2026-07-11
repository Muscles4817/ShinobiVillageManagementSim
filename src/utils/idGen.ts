import type { Rng } from './rng'

let counter = 0

// Id generator for entities created directly from UI actions (e.g. a team
// the player names). Not a UUID -- ids just need to be unique within a
// session/save; using Date.now() here is fine since these are never part
// of a deterministic sim calculation.
export function generateId(prefix: string): string {
  counter += 1
  return `${prefix}_${Date.now().toString(36)}_${counter.toString(36)}`
}

// Id generator for entities the sim creates deterministically (recruits,
// contracts, events) so the same seed always produces the same ids.
export function generateSeededId(prefix: string, rng: Rng): string {
  counter += 1
  return `${prefix}_${rng.int(0, 0xffffffff).toString(36)}_${counter.toString(36)}`
}

export function resetIdCounter(): void {
  counter = 0
}
