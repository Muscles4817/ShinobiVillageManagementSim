import { describe, expect, it } from 'vitest'
import { applyTraining } from '../src/sim/training'
import { createRng } from '../src/utils/rng'
import type { Attributes, Warrior } from '../src/domain/types'

function attrs(overrides: Partial<Attributes> = {}): Attributes {
  return {
    combat: 20,
    technique: 20,
    control: 20,
    intelligence: 20,
    mobility: 20,
    presence: 20,
    resilience: 20,
    ...overrides,
  }
}

function makeWarrior(overrides: Partial<Warrior> = {}): Warrior {
  return {
    id: 'w1',
    name: 'Test Warrior',
    age: 30,
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
    status: 'training',
    teamId: null,
    missionHistory: [],
    relationships: {},
    wage: 2,
    joinedDay: 1,
    ...overrides,
  }
}

describe('training', () => {
  it('raises the trained attribute and increases fatigue', () => {
    const warrior = makeWarrior()
    const trained = applyTraining(warrior, 'combat_drills', 1, createRng(1))

    expect(trained.attributes.combat).toBeGreaterThan(warrior.attributes.combat)
    expect(trained.fatigue).toBeGreaterThan(warrior.fatigue)
  })

  it('produces gradual gains, not rapid stat inflation, over a single session', () => {
    const warrior = makeWarrior()
    const trained = applyTraining(warrior, 'combat_drills', 1, createRng(1))
    expect(trained.attributes.combat - warrior.attributes.combat).toBeLessThan(5)
  })

  it('gifted characters improve faster than otherwise-identical peers', () => {
    const plain = makeWarrior({ id: 'plain' })
    const gifted = makeWarrior({ id: 'gifted', traitIds: ['trait_gifted'] })

    let plainGain = 0
    let giftedGain = 0
    for (let seed = 0; seed < 30; seed++) {
      const trainedPlain = applyTraining(plain, 'combat_drills', 1, createRng(seed))
      const trainedGifted = applyTraining(gifted, 'combat_drills', 1, createRng(seed))
      plainGain += trainedPlain.attributes.combat - plain.attributes.combat
      giftedGain += trainedGifted.attributes.combat - gifted.attributes.combat
    }

    expect(giftedGain).toBeGreaterThan(plainGain)
  })

  it('young characters improve faster than older characters, all else equal', () => {
    const young = makeWarrior({ id: 'young', age: 19 })
    const old = makeWarrior({ id: 'old', age: 45 })

    let youngGain = 0
    let oldGain = 0
    for (let seed = 0; seed < 30; seed++) {
      youngGain += applyTraining(young, 'combat_drills', 1, createRng(seed)).attributes.combat - young.attributes.combat
      oldGain += applyTraining(old, 'combat_drills', 1, createRng(seed)).attributes.combat - old.attributes.combat
    }

    expect(youngGain).toBeGreaterThan(oldGain)
  })
})
