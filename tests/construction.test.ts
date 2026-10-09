import { describe, expect, it } from 'vitest'
import { canStartUpgrade, progressConstruction, startUpgrade } from '../src/sim/construction'
import { facilityDefinitionById } from '../src/content/facilities'
import type { Facility } from '../src/domain/types'

describe('construction', () => {
  it('refuses to start an upgrade without enough funds', () => {
    const facility: Facility = { id: 'mission_hall', name: 'Mission Hall', level: 1, maxLevel: 2, upgrading: false, constructionEndsDay: null }
    const definition = facilityDefinitionById('mission_hall')
    const check = canStartUpgrade(facility, definition, 10)
    expect(check.ok).toBe(false)
  })

  it('starts an upgrade and sets a construction end day', () => {
    const facility: Facility = { id: 'mission_hall', name: 'Mission Hall', level: 1, maxLevel: 2, upgrading: false, constructionEndsDay: null }
    const definition = facilityDefinitionById('mission_hall')
    const upgraded = startUpgrade(facility, definition, 5)
    expect(upgraded.upgrading).toBe(true)
    expect(upgraded.constructionEndsDay).toBeGreaterThan(5)
  })

  it('does not complete construction before the target day', () => {
    const facility: Facility = { id: 'mission_hall', name: 'Mission Hall', level: 1, maxLevel: 2, upgrading: true, constructionEndsDay: 10 }
    const { facility: after, completed } = progressConstruction(facility, 8)
    expect(completed).toBe(false)
    expect(after.level).toBe(1)
  })

  it('completes construction and increments the level once the target day is reached', () => {
    const facility: Facility = { id: 'mission_hall', name: 'Mission Hall', level: 1, maxLevel: 2, upgrading: true, constructionEndsDay: 10 }
    const { facility: after, completed } = progressConstruction(facility, 10)
    expect(completed).toBe(true)
    expect(after.level).toBe(2)
    expect(after.upgrading).toBe(false)
    expect(after.constructionEndsDay).toBeNull()
  })

  it('refuses to upgrade past the maximum level', () => {
    const facility: Facility = { id: 'mission_hall', name: 'Mission Hall', level: 2, maxLevel: 2, upgrading: false, constructionEndsDay: null }
    const definition = facilityDefinitionById('mission_hall')
    const check = canStartUpgrade(facility, definition, 100000)
    expect(check.ok).toBe(false)
  })
})
