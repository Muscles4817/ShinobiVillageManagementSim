import type { Rng } from './rng'

export function generateName(firstNames: readonly string[], lastNames: readonly string[], rng: Rng): string {
  return `${rng.pick(firstNames)} ${rng.pick(lastNames)}`
}
