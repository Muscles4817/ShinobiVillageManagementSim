import { describe, expect, it } from 'vitest'
import { applyPromotion, checkPromotion, effectiveAttributes, fatiguePenaltyPercent, worstInjuryPenaltyPercent } from '../src/sim/warriorSim'
import type { Attributes, Warrior } from '../src/domain/types'

function attrs(): Attributes {
  return { combat: 50, technique: 50, control: 50, intelligence: 50, mobility: 50, presence: 50, resilience: 50 }
}

function makeWarrior(overrides: Partial<Warrior> = {}): Warrior {
  return {
    id: 'w1',
    name: 'W',
    age: 25,
    rank: 'initiate',
    archetype: 'Vanguard Fighter',
    attributes: attrs(),
    traitIds: [],
    techniqueIds: [],
    specialityIds: [],
    loyalty: 60,
    morale: 60,
    fatigue: 0,
    health: 100,
    experience: 0,
    level: 1,
    injuries: [],
    status: 'available',
    teamId: null,
    missionHistory: [],
    relationships: {},
    wage: 2,
    joinedDay: 1,
    ...overrides,
  }
}

describe('warrior fatigue and injury effects', () => {
  it('low fatigue has no attribute penalty', () => {
    expect(fatiguePenaltyPercent(makeWarrior({ fatigue: 30 }))).toBe(0)
  })

  it('high fatigue reduces effective attributes', () => {
    const rested = makeWarrior({ fatigue: 0 })
    const exhausted = makeWarrior({ fatigue: 95 })
    expect(effectiveAttributes(exhausted).combat).toBeLessThan(effectiveAttributes(rested).combat)
  })

  it('a more severe injury reduces effective attributes more than a mild one', () => {
    const bruised = makeWarrior({ injuries: [{ injuryId: 'injury_bruised', severity: 'bruised', daysRemaining: 1 }] })
    const severelyWounded = makeWarrior({ injuries: [{ injuryId: 'injury_severely_wounded', severity: 'severely_wounded', daysRemaining: 1 }] })

    expect(worstInjuryPenaltyPercent(severelyWounded)).toBeGreaterThan(worstInjuryPenaltyPercent(bruised))
    expect(effectiveAttributes(severelyWounded).combat).toBeLessThan(effectiveAttributes(bruised).combat)
  })
})

describe('promotion', () => {
  it('does not promote a warrior below the experience threshold', () => {
    const warrior = makeWarrior({ rank: 'initiate', experience: 10, attributes: { ...attrs(), combat: 90 } })
    expect(checkPromotion(warrior)).toBeNull()
  })

  it('promotes a warrior once experience and attribute thresholds are met', () => {
    const warrior = makeWarrior({ rank: 'initiate', experience: 200, attributes: { ...attrs(), combat: 90, technique: 90 } })
    expect(checkPromotion(warrior)).toBe('field_operative')
  })

  it('applyPromotion updates rank and wage together', () => {
    const warrior = makeWarrior({ rank: 'initiate', wage: 2 })
    const promoted = applyPromotion(warrior, 'field_operative')
    expect(promoted.rank).toBe('field_operative')
    expect(promoted.wage).toBeGreaterThan(warrior.wage)
  })
})
