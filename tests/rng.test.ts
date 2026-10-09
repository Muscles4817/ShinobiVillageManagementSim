import { describe, expect, it } from 'vitest'
import { createRng, deriveSeed } from '../src/utils/rng'

describe('seeded RNG determinism', () => {
  it('produces an identical sequence for the same seed', () => {
    const a = createRng(12345)
    const b = createRng(12345)
    const seqA = Array.from({ length: 20 }, () => a.next())
    const seqB = Array.from({ length: 20 }, () => b.next())
    expect(seqA).toEqual(seqB)
  })

  it('produces a different sequence for a different seed', () => {
    const a = createRng(1)
    const b = createRng(2)
    const seqA = Array.from({ length: 20 }, () => a.next())
    const seqB = Array.from({ length: 20 }, () => b.next())
    expect(seqA).not.toEqual(seqB)
  })

  it('int() stays within the requested inclusive bounds', () => {
    const rng = createRng(99)
    for (let i = 0; i < 200; i++) {
      const v = rng.int(5, 9)
      expect(v).toBeGreaterThanOrEqual(5)
      expect(v).toBeLessThanOrEqual(9)
    }
  })

  it('deriveSeed is a pure function of its inputs (same in, same out)', () => {
    expect(deriveSeed(42, 7)).toBe(deriveSeed(42, 7))
    expect(deriveSeed(42, 7)).not.toBe(deriveSeed(42, 8))
  })
})
