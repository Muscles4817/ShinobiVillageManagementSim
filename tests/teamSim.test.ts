import { describe, expect, it } from 'vitest'
import { cohesionPenaltyForReform, computeStageCapability, updateCohesionAfterMission } from '../src/sim/teamSim'
import type { Attributes, MissionStageTemplate, Team, Warrior } from '../src/domain/types'

function attrs(overrides: Partial<Attributes> = {}): Attributes {
  return { combat: 20, technique: 20, control: 20, intelligence: 20, mobility: 20, presence: 20, resilience: 20, ...overrides }
}

function makeWarrior(id: string, attributes: Attributes): Warrior {
  return {
    id,
    name: id,
    age: 25,
    rank: 'field_operative',
    archetype: 'Vanguard Fighter',
    attributes,
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
    teamId: 'team_1',
    missionHistory: [],
    relationships: {},
    wage: 4,
    joinedDay: 1,
  }
}

function makeTeam(memberIds: string[], cohesion = 50): Team {
  return {
    id: 'team_1',
    name: 'Test Team',
    memberIds,
    leaderId: memberIds[0],
    mentorId: null,
    cohesion,
    status: 'idle',
    missionHistory: [],
    createdDay: 1,
    lastReformedDay: 1,
  }
}

const stage: MissionStageTemplate = { id: 'stage_combat', label: 'Fight', attributes: ['combat'], weight: 1, difficultyBase: 30 }

describe('team capability scoring', () => {
  it('a team with higher relevant attributes scores higher on a stage', () => {
    const strongWarriors = [makeWarrior('a', attrs({ combat: 70 })), makeWarrior('b', attrs({ combat: 60 }))]
    const weakWarriors = [makeWarrior('c', attrs({ combat: 20 })), makeWarrior('d', attrs({ combat: 15 }))]
    const strongTeam = makeTeam(['a', 'b'])
    const weakTeam = makeTeam(['c', 'd'])

    const strongCapability = computeStageCapability(strongTeam, strongWarriors, stage)
    const weakCapability = computeStageCapability(weakTeam, weakWarriors, stage)

    expect(strongCapability.score).toBeGreaterThan(weakCapability.score)
  })

  it('higher cohesion improves capability score, all else equal', () => {
    const warriors = [makeWarrior('a', attrs({ combat: 50 })), makeWarrior('b', attrs({ combat: 50 }))]
    const lowCohesion = makeTeam(['a', 'b'], 10)
    const highCohesion = makeTeam(['a', 'b'], 95)

    expect(computeStageCapability(highCohesion, warriors, stage).score).toBeGreaterThan(computeStageCapability(lowCohesion, warriors, stage).score)
  })
})

describe('cohesion progression', () => {
  it('successful missions raise cohesion', () => {
    const warriors = [makeWarrior('a', attrs()), makeWarrior('b', attrs())]
    const team = makeTeam(['a', 'b'], 50)
    expect(updateCohesionAfterMission(team, warriors, true)).toBeGreaterThan(50)
  })

  it('failed missions lower cohesion', () => {
    const warriors = [makeWarrior('a', attrs()), makeWarrior('b', attrs())]
    const team = makeTeam(['a', 'b'], 50)
    expect(updateCohesionAfterMission(team, warriors, false)).toBeLessThan(50)
  })

  it('reforming a team carries a cohesion penalty', () => {
    expect(cohesionPenaltyForReform(80)).toBeLessThan(80)
    expect(cohesionPenaltyForReform(5)).toBeGreaterThanOrEqual(0)
  })
})
