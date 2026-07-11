import type { ContentPack, Facility, GameState, RecruitCandidate, Warrior } from '../domain/types'
import { createRng } from '../utils/rng'
import { generateSeededId } from '../utils/idGen'
import { generateContract } from './contractGeneration'
import { startingWarriors, startingRecruitPool } from '../content/warriors'
import { rivalFactionSeed } from '../content/factions'

const SAVE_VERSION = 1
const INITIAL_CONTRACT_COUNT = 5
const RECRUIT_POOL_EXPIRY_DAYS = 8

const INITIAL_FACILITIES: Omit<Facility, 'name'>[] = [
  { id: 'mission_hall', level: 1, maxLevel: 2, upgrading: false, constructionEndsDay: null },
  { id: 'training_grounds', level: 1, maxLevel: 2, upgrading: false, constructionEndsDay: null },
  { id: 'medical_ward', level: 1, maxLevel: 2, upgrading: false, constructionEndsDay: null },
  { id: 'intel_office', level: 0, maxLevel: 2, upgrading: false, constructionEndsDay: null },
  { id: 'academy', level: 0, maxLevel: 2, upgrading: false, constructionEndsDay: null },
  { id: 'defensive_works', level: 0, maxLevel: 2, upgrading: false, constructionEndsDay: null },
]

export function createNewGame(contentPack: ContentPack, seed: number, villageName: string): GameState {
  const rng = createRng(seed)

  const warriors: Warrior[] = startingWarriors.map((w) => ({ ...w, id: generateSeededId('warrior', rng) }))

  const recruitPool: RecruitCandidate[] = startingRecruitPool.map((r) => ({
    ...r,
    id: generateSeededId('recruit', rng),
    expiresDay: 1 + RECRUIT_POOL_EXPIRY_DAYS,
  }))

  const facilities: Facility[] = INITIAL_FACILITIES.map((f) => ({
    ...f,
    name: contentPack.facilities.find((def) => def.id === f.id)?.name ?? f.id,
  }))

  const contracts = Array.from({ length: INITIAL_CONTRACT_COUNT }, () => generateContract(contentPack, rng, 1))

  return {
    saveVersion: SAVE_VERSION,
    contentPackId: contentPack.id,
    rngSeed: seed,
    rngCounter: 0,
    village: {
      day: 1,
      villageName,
      funds: 220,
      reputation: 5,
      supplies: 60,
      intel: 15,
      security: 45,
      tier: 'outpost',
    },
    warriors,
    teams: [],
    contracts,
    activeMissions: [],
    facilities,
    rival: rivalFactionSeed,
    reports: [],
    recruitPool,
    pendingEvents: [],
    trainingAssignments: {},
    medicalPriority: [],
    onboardingComplete: false,
  }
}

export { SAVE_VERSION }
