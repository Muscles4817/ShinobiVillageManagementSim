import type { Attributes, ContentPack, RankId, RecruitCandidate } from '../domain/types'
import type { Rng } from '../utils/rng'
import { generateSeededId } from '../utils/idGen'
import { generateName } from '../utils/nameGenerator'

const ARCHETYPE_PRIMARY_ATTRIBUTES: Record<string, [keyof Attributes, keyof Attributes]> = {
  'Vanguard Fighter': ['combat', 'resilience'],
  'Blade Specialist': ['combat', 'mobility'],
  'Field Medic': ['intelligence', 'resilience'],
  Scout: ['mobility', 'intelligence'],
  Infiltrator: ['mobility', 'control'],
  Tactician: ['intelligence', 'control'],
  Marksman: ['control', 'combat'],
  'Support Operative': ['presence', 'resilience'],
}

const RANK_BAND: Record<RankId, { base: [number, number]; primary: [number, number] }> = {
  initiate: { base: [14, 30], primary: [30, 42] },
  field_operative: { base: [24, 44], primary: [42, 55] },
  veteran: { base: [38, 58], primary: [55, 70] },
  elite: { base: [52, 72], primary: [70, 88] },
}

const RANK_WAGE: Record<RankId, number> = { initiate: 3, field_operative: 4, veteran: 8, elite: 14 }
const RANK_SIGNING_COST: Record<RankId, [number, number]> = {
  initiate: [35, 55],
  field_operative: [60, 90],
  veteran: [150, 220],
  elite: [280, 400],
}

function rollRank(rng: Rng): RankId {
  const roll = rng.next()
  if (roll < 0.55) return 'initiate'
  if (roll < 0.85) return 'field_operative'
  if (roll < 0.97) return 'veteran'
  return 'elite'
}

function rollAttributes(rank: RankId, archetype: string, rng: Rng): Attributes {
  const band = RANK_BAND[rank]
  const primaryAttrs = ARCHETYPE_PRIMARY_ATTRIBUTES[archetype] ?? ['combat', 'resilience']
  const attributes = {} as Attributes
  const keys: (keyof Attributes)[] = ['combat', 'technique', 'control', 'intelligence', 'mobility', 'presence', 'resilience']
  for (const key of keys) {
    const isPrimary = primaryAttrs.includes(key)
    const [min, max] = isPrimary ? band.primary : band.base
    attributes[key] = rng.int(min, max)
  }
  return attributes
}

function rollTraits(contentPack: ContentPack, rng: Rng): string[] {
  const count = rng.chance(0.6) ? 1 : 2
  const pool = [...contentPack.traits]
  const chosen: string[] = []
  for (let i = 0; i < count && pool.length > 0; i++) {
    const idx = rng.int(0, pool.length - 1)
    chosen.push(pool[idx].id)
    pool.splice(idx, 1)
  }
  return chosen
}

export function generateRecruitCandidate(contentPack: ContentPack, rng: Rng, day: number): RecruitCandidate {
  const rank = rollRank(rng)
  const archetype = rng.pick(contentPack.archetypes)
  const attributes = rollAttributes(rank, archetype, rng)
  const traitIds = rollTraits(contentPack, rng)
  const [signMin, signMax] = RANK_SIGNING_COST[rank]

  return {
    id: generateSeededId('recruit', rng),
    name: generateName(contentPack.firstNames, contentPack.lastNames, rng),
    age: rng.int(rank === 'veteran' || rank === 'elite' ? 28 : 17, rank === 'veteran' || rank === 'elite' ? 48 : 26),
    rank,
    attributes,
    traitIds,
    specialityIds: [],
    wage: RANK_WAGE[rank],
    signingCost: rng.int(signMin, signMax),
    background: `A ${archetype.toLowerCase()} looking for a place with the Enclave.`,
    archetype,
    expiresDay: day + rng.int(6, 10),
  }
}

export function refreshRecruitPool(
  pool: RecruitCandidate[],
  contentPack: ContentPack,
  rng: Rng,
  day: number,
  academyLevel: number,
): RecruitCandidate[] {
  const notExpired = pool.filter((c) => c.expiresDay >= day)
  const maxPoolSize = academyLevel >= 2 ? 8 : academyLevel >= 1 ? 7 : 6
  const addChance = 0.25 + academyLevel * 0.15

  if (notExpired.length < maxPoolSize && rng.chance(addChance)) {
    return [...notExpired, generateRecruitCandidate(contentPack, rng, day)]
  }
  return notExpired
}
