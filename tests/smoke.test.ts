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

describe('smoke: new game + day advance', () => {
  it('creates a new game and advances several days without throwing', () => {
    let state = createNewGame(defaultContentPack, 42, 'Thornwatch Enclave')
    expect(state.warriors.length).toBe(12)
    expect(state.contracts.length).toBe(5)

    state = advance(state, 10)

    expect(state.village.day).toBe(11)
  })

  it('creates a team, assigns it to an accepted contract, and resolves the mission over several days', () => {
    let state = createNewGame(defaultContentPack, 7, 'Thornwatch Enclave')

    const members = state.warriors.slice(0, 3)
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
    state = { ...state, teams: [team] }

    const contract = state.contracts[0]
    state = { ...state, contracts: state.contracts.map((c) => (c.id === contract.id ? { ...c, status: 'accepted' as const } : c)) }

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
      contracts: state.contracts.map((c) => (c.id === contract.id ? { ...c, status: 'active' as const } : c)),
      activeMissions: [activeMission],
      warriors: state.warriors.map((w) => (team.memberIds.includes(w.id) ? { ...w, status: 'travelling' as const } : w)),
    }

    state = advance(state, activeMission.expectedReturnDay + 1)

    expect(state.activeMissions.length).toBe(0)
    const resolvedContract = state.contracts.find((c) => c.id === contract.id)
    expect(resolvedContract?.status).toBe('resolved')

    const missionReport = state.reports.find((r) => r.category === 'mission')
    expect(missionReport).toBeDefined()
  })
})
