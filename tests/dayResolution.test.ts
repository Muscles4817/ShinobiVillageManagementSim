import { describe, expect, it } from 'vitest'
import { createNewGame } from '../src/sim/gameSetup'
import { resolveDay } from '../src/sim/dayResolution'
import { defaultContentPack } from '../src/content'
import { createRng, deriveSeed } from '../src/utils/rng'
import type { GameState } from '../src/domain/types'

function advance(state: GameState, days: number): GameState {
  let s = state
  for (let i = 0; i < days; i++) {
    const rng = createRng(deriveSeed(s.rngSeed, s.rngCounter + 1))
    s = resolveDay(s, defaultContentPack, rng)
  }
  return s
}

describe('time advancement', () => {
  it('increments the day counter by exactly one per call', () => {
    const state = createNewGame(defaultContentPack, 1, 'Testhold')
    const next = resolveDay(state, defaultContentPack, createRng(1))
    expect(next.village.day).toBe(state.village.day + 1)
  })

  it('advances several days in sequence', () => {
    const state = createNewGame(defaultContentPack, 1, 'Testhold')
    const next = advance(state, 5)
    expect(next.village.day).toBe(6)
  })

  it('expires contracts once their expiry day has passed', () => {
    const state = createNewGame(defaultContentPack, 1, 'Testhold')
    const targetExpiry = Math.max(...state.contracts.map((c) => c.expiryDay))
    const next = advance(state, targetExpiry + 2)
    const stillAvailable = next.contracts.filter((c) => c.status === 'available' && c.expiryDay < next.village.day)
    expect(stillAvailable.length).toBe(0)
  })
})

describe('team availability while deployed', () => {
  it('members of a deployed team are unavailable for the duration of the trip, and return afterward', () => {
    let state = createNewGame(defaultContentPack, 3, 'Testhold')
    const members = state.warriors.slice(0, 2)
    const team = {
      id: 'team_test',
      name: 'Test Team',
      memberIds: members.map((m) => m.id),
      leaderId: members[0].id,
      mentorId: null,
      cohesion: 50,
      status: 'idle' as const,
      missionHistory: [],
      createdDay: 1,
      lastReformedDay: 1,
    }
    // Force known travel/duration values so the away-time math in this test
    // is exact, regardless of which contracts were randomly generated.
    const contract = { ...state.contracts[0], travelTime: 2, duration: 3, status: 'active' as const }
    const activeMission = {
      id: 'mission_test',
      contractId: contract.id,
      templateId: contract.templateId,
      teamId: team.id,
      startDay: 1,
      travelDaysRemaining: contract.travelTime,
      missionDaysRemaining: contract.duration,
      returnTravelDaysRemaining: contract.travelTime,
      expectedReturnDay: 1 + contract.travelTime * 2 + contract.duration,
    }

    state = {
      ...state,
      teams: [team],
      contracts: state.contracts.map((c) => (c.id === contract.id ? contract : c)),
      activeMissions: [activeMission],
      warriors: state.warriors.map((w) => (team.memberIds.includes(w.id) ? { ...w, status: 'travelling' as const } : w)),
    }

    // The full round trip takes travelTime + duration + travelTime days.
    // While away, deployed members should never be 'available'.
    const tripDays = contract.travelTime + contract.duration + contract.travelTime
    let current = state
    for (let i = 0; i < tripDays - 1; i++) {
      const rng = createRng(deriveSeed(current.rngSeed, current.rngCounter + 1))
      current = resolveDay(current, defaultContentPack, rng)
      const away = current.warriors.filter((w) => team.memberIds.includes(w.id))
      expect(away.every((w) => w.status !== 'available')).toBe(true)
    }

    const final = advance(current, 2)
    const returned = final.warriors.filter((w) => team.memberIds.includes(w.id))
    expect(returned.every((w) => w.status === 'available' || w.status === 'injured')).toBe(true)
    expect(final.activeMissions.length).toBe(0)
  })
})
