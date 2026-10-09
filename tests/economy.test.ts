import { describe, expect, it } from 'vitest'
import { applyDailyUpkeep, computeSecurity, totalFacilityUpkeep, totalWages } from '../src/sim/economy'
import type { Attributes, Facility, VillageState, Warrior } from '../src/domain/types'

function attrs(): Attributes {
  return { combat: 20, technique: 20, control: 20, intelligence: 20, mobility: 20, presence: 20, resilience: 20 }
}

function makeWarrior(wage: number, status: Warrior['status'] = 'available'): Warrior {
  return {
    id: Math.random().toString(),
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
    status,
    teamId: null,
    missionHistory: [],
    relationships: {},
    wage,
    joinedDay: 1,
  }
}

const village: VillageState = {
  day: 1,
  villageName: 'Test',
  funds: 100,
  reputation: 10,
  supplies: 50,
  intel: 10,
  security: 40,
  tier: 'outpost',
}

describe('economy', () => {
  it('deducts total warrior wages and facility upkeep from funds each day', () => {
    const warriors = [makeWarrior(2), makeWarrior(4)]
    const facilities: Facility[] = [{ id: 'mission_hall', name: 'Mission Hall', level: 1, maxLevel: 2, upgrading: false, constructionEndsDay: null }]

    expect(totalWages(warriors)).toBe(6)
    expect(totalFacilityUpkeep(facilities)).toBe(1)

    const next = applyDailyUpkeep(village, warriors, facilities)
    expect(next.funds).toBe(village.funds - 7)
  })

  it('wages are charged even for deployed or injured warriors', () => {
    const warriors = [makeWarrior(5, 'deployed'), makeWarrior(3, 'injured')]
    const next = applyDailyUpkeep(village, warriors, [])
    expect(next.funds).toBe(village.funds - 8)
  })

  it('security rises with more defenders and defensive works, and falls with rival hostility', () => {
    const fewDefenders = [makeWarrior(2, 'deployed'), makeWarrior(2, 'deployed')]
    const manyDefenders = [makeWarrior(2, 'available'), makeWarrior(2, 'available'), makeWarrior(2, 'training')]
    const facilities: Facility[] = [{ id: 'defensive_works', name: 'Defensive Works', level: 1, maxLevel: 2, upgrading: false, constructionEndsDay: null }]

    const lowSecurity = computeSecurity(fewDefenders, [], 80)
    const highSecurity = computeSecurity(manyDefenders, facilities, 10)

    expect(highSecurity).toBeGreaterThan(lowSecurity)
  })
})
