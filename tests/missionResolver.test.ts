import { describe, expect, it } from 'vitest'
import { resolveMission } from '../src/sim/missionResolver'
import { createRng } from '../src/utils/rng'
import type { Attributes, Contract, MissionTemplate, Team, Warrior } from '../src/domain/types'

function attrs(overrides: Partial<Attributes>): Attributes {
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
    status: 'deployed',
    teamId: 'team_1',
    missionHistory: [],
    relationships: {},
    wage: 4,
    joinedDay: 1,
  }
}

function makeTeam(memberIds: string[]): Team {
  return {
    id: 'team_1',
    name: 'Test Team',
    memberIds,
    leaderId: memberIds[0],
    mentorId: null,
    cohesion: 60,
    status: 'deployed',
    missionHistory: [],
    createdDay: 1,
    lastReformedDay: 1,
  }
}

const template: MissionTemplate = {
  id: 'mt_test',
  category: 'bandit_suppression',
  title: 'Test Mission',
  summaryTemplate: 'Test mission near {destination}.',
  minRank: 'initiate',
  stages: [
    { id: 'stage_combat', label: 'Fight', attributes: ['combat'], weight: 0.6, difficultyBase: 40 },
    { id: 'stage_control', label: 'Coordinate', attributes: ['control'], weight: 0.4, difficultyBase: 30 },
  ],
  durationRange: [2, 2],
  travelRange: [1, 1],
  rewardRange: [100, 100],
  reputationRewardRange: [4, 4],
  dangerBand: 'moderate',
  baseInfoConfidence: 'fair',
  recommendedTeamSize: [2, 3],
}

function makeContract(): Contract {
  return {
    id: 'contract_1',
    templateId: template.id,
    clientId: 'client_test',
    title: template.title,
    summary: 'Test',
    duration: 2,
    travelTime: 1,
    reward: 100,
    reputationReward: 4,
    dangerEstimate: 'moderate',
    infoConfidence: 'fair',
    expiryDay: 10,
    sensitivity: false,
    status: 'active',
    createdDay: 1,
  }
}

describe('mission resolution', () => {
  it('is deterministic for a given seed', () => {
    const strongWarriors = [makeWarrior('w1', attrs({ combat: 70, control: 60 })), makeWarrior('w2', attrs({ combat: 65, control: 55 }))]
    const team = makeTeam(strongWarriors.map((w) => w.id))
    const contract = makeContract()

    const resultA = resolveMission({ contract, template, team, warriors: strongWarriors, rng: createRng(555) })
    const resultB = resolveMission({ contract, template, team, warriors: strongWarriors, rng: createRng(555) })

    expect(resultA).toEqual(resultB)
  })

  it('a strong, well-suited team outperforms a weak, poorly-suited team on average', () => {
    const strongWarriors = [makeWarrior('w1', attrs({ combat: 75, control: 65 })), makeWarrior('w2', attrs({ combat: 70, control: 60 }))]
    const weakWarriors = [makeWarrior('w3', attrs({ combat: 15, control: 10 })), makeWarrior('w4', attrs({ combat: 12, control: 10 }))]
    const strongTeam = makeTeam(strongWarriors.map((w) => w.id))
    const weakTeam = makeTeam(weakWarriors.map((w) => w.id))
    const contract = makeContract()

    const outcomeRank: Record<string, number> = { disaster: 0, failure: 1, partial_success: 2, success: 3, exceptional_success: 4 }

    let strongTotal = 0
    let weakTotal = 0
    for (let seed = 0; seed < 25; seed++) {
      const strongResult = resolveMission({ contract, template, team: strongTeam, warriors: strongWarriors, rng: createRng(seed) })
      const weakResult = resolveMission({ contract, template, team: weakTeam, warriors: weakWarriors, rng: createRng(seed) })
      strongTotal += outcomeRank[strongResult.outcome]
      weakTotal += outcomeRank[weakResult.outcome]
    }

    expect(strongTotal).toBeGreaterThan(weakTotal)
  })

  it('generates injuries and lower rewards when a weak team struggles', () => {
    const weakWarriors = [makeWarrior('w3', attrs({ combat: 8, control: 5 })), makeWarrior('w4', attrs({ combat: 5, control: 5 }))]
    const weakTeam = makeTeam(weakWarriors.map((w) => w.id))
    const contract = makeContract()

    let anyInjury = false
    let anyLowReward = false
    for (let seed = 0; seed < 40; seed++) {
      const result = resolveMission({ contract, template, team: weakTeam, warriors: weakWarriors, rng: createRng(seed) })
      if (result.injuries.length > 0) anyInjury = true
      if (result.fundsAwarded < contract.reward) anyLowReward = true
    }

    expect(anyInjury).toBe(true)
    expect(anyLowReward).toBe(true)
  })

  it('awards full experience gain entries for every deployed team member', () => {
    const warriors = [makeWarrior('w1', attrs({ combat: 50, control: 50 })), makeWarrior('w2', attrs({ combat: 50, control: 50 }))]
    const team = makeTeam(warriors.map((w) => w.id))
    const contract = makeContract()

    const result = resolveMission({ contract, template, team, warriors, rng: createRng(1) })
    expect(Object.keys(result.experienceGained).sort()).toEqual(['w1', 'w2'])
    expect(result.experienceGained.w1).toBeGreaterThan(0)
  })
})
