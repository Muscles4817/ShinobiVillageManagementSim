import { describe, expect, it } from 'vitest'
import { progressHealing } from '../src/sim/healing'
import { createRng } from '../src/utils/rng'
import type { Attributes, Warrior } from '../src/domain/types'

function attrs(): Attributes {
  return { combat: 20, technique: 20, control: 20, intelligence: 20, mobility: 20, presence: 20, resilience: 20 }
}

function injuredWarrior(id: string, daysRemaining: number): Warrior {
  return {
    id,
    name: id,
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
    health: 60,
    experience: 0,
    level: 1,
    injuries: [{ injuryId: 'injury_wounded', severity: 'wounded', daysRemaining }],
    status: 'injured',
    teamId: null,
    missionHistory: [],
    relationships: {},
    wage: 2,
    joinedDay: 1,
  }
}

describe('healing', () => {
  it('reduces days remaining on active injuries each day', () => {
    const warrior = injuredWarrior('w1', 4)
    const [healed] = progressHealing([warrior], 1, [], createRng(1))
    expect(healed.injuries[0].daysRemaining).toBeLessThan(4)
  })

  it('clears the injury and restores availability once fully healed', () => {
    const warrior = injuredWarrior('w1', 1)
    const [healed] = progressHealing([warrior], 1, [], createRng(1))
    expect(healed.injuries.length).toBe(0)
    expect(healed.status).toBe('available')
    expect(healed.health).toBe(100)
  })

  it('respects medical ward capacity: only priority patients heal when over capacity', () => {
    const patients = [injuredWarrior('a', 4), injuredWarrior('b', 4), injuredWarrior('c', 4), injuredWarrior('d', 4)]
    // Level 1 medical ward can only treat 3 at once.
    const healed = progressHealing(patients, 1, ['d', 'c', 'b'], createRng(1))

    const byId = Object.fromEntries(healed.map((w) => [w.id, w]))
    expect(byId.d.injuries[0].daysRemaining).toBeLessThan(4)
    expect(byId.c.injuries[0].daysRemaining).toBeLessThan(4)
    expect(byId.b.injuries[0].daysRemaining).toBeLessThan(4)
    expect(byId.a.injuries[0].daysRemaining).toBe(4)
  })

  it('a level 2 medical ward treats more patients at once than level 1', () => {
    const patients = [injuredWarrior('a', 4), injuredWarrior('b', 4), injuredWarrior('c', 4), injuredWarrior('d', 4)]
    const healed = progressHealing(patients, 2, [], createRng(1))
    const untouched = healed.filter((w) => w.injuries[0].daysRemaining === 4)
    expect(untouched.length).toBe(0)
  })
})
