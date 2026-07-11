// Deterministic seeded PRNG (mulberry32) so mission outcomes and other
// randomised sim steps are reproducible from a save's seed + counter.

export interface Rng {
  next(): number
  int(min: number, max: number): number
  float(min: number, max: number): number
  pick<T>(items: readonly T[]): T
  chance(probability: number): boolean
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function createRng(seed: number): Rng {
  const gen = mulberry32(seed)
  return {
    next: () => gen(),
    int(min: number, max: number) {
      return Math.floor(gen() * (max - min + 1)) + min
    },
    float(min: number, max: number) {
      return gen() * (max - min) + min
    },
    pick<T>(items: readonly T[]): T {
      return items[Math.floor(gen() * items.length)]
    },
    chance(probability: number): boolean {
      return gen() < probability
    },
  }
}

// Derives a fresh per-day seed from a base seed and counter so successive
// days do not reuse the exact same random sequence, while remaining fully
// deterministic given the same (seed, counter) pair.
export function deriveSeed(baseSeed: number, counter: number): number {
  return (Math.imul(baseSeed ^ 0x9e3779b9, counter + 0x85ebca6b) ^ (baseSeed + counter)) >>> 0
}
