import type { AttributeKey, Attributes, RankId, TraitEffect, Warrior } from '../domain/types'
import { injuryById } from '../content/injuries'
import { traitById } from '../content/traits'
import { rankById } from '../content/ranks'

const ATTRIBUTE_KEYS: AttributeKey[] = ['combat', 'technique', 'control', 'intelligence', 'mobility', 'presence', 'resilience']

export function worstInjuryPenaltyPercent(warrior: Warrior): number {
  if (warrior.injuries.length === 0) return 0
  return Math.max(...warrior.injuries.map((i) => injuryById(i.injuryId).attributePenaltyPercent))
}

export function fatiguePenaltyPercent(warrior: Warrior): number {
  // Fatigue under 40 has no mechanical penalty; above that it scales up to 40% at fatigue 100.
  if (warrior.fatigue <= 40) return 0
  return Math.min(40, ((warrior.fatigue - 40) / 60) * 40)
}

export function effectiveAttributes(warrior: Warrior): Attributes {
  const injuryPenalty = worstInjuryPenaltyPercent(warrior)
  const fatiguePenalty = fatiguePenaltyPercent(warrior)
  const totalMultiplier = Math.max(0.2, 1 - (injuryPenalty + fatiguePenalty) / 100)
  const traitBonuses = traitAttributeBonuses(warrior)
  const result = {} as Attributes
  for (const key of ATTRIBUTE_KEYS) {
    result[key] = Math.round((warrior.attributes[key] + (traitBonuses[key] ?? 0)) * totalMultiplier)
  }
  return result
}

function traitAttributeBonuses(warrior: Warrior): Partial<Record<AttributeKey, number>> {
  const bonuses: Partial<Record<AttributeKey, number>> = {}
  for (const traitId of warrior.traitIds) {
    for (const effect of traitById(traitId).effects) {
      if (effect.type === 'attribute_bonus' && effect.attribute) {
        bonuses[effect.attribute] = (bonuses[effect.attribute] ?? 0) + (effect.amount ?? 0)
      }
    }
  }
  return bonuses
}

export function traitEffectsOfType(warrior: Warrior, type: TraitEffect['type']): TraitEffect[] {
  const out: TraitEffect[] = []
  for (const traitId of warrior.traitIds) {
    for (const effect of traitById(traitId).effects) {
      if (effect.type === type) out.push(effect)
    }
  }
  return out
}

export function isAvailable(warrior: Warrior): boolean {
  return warrior.status === 'available'
}

export function wageForWarrior(warrior: Warrior): number {
  return warrior.wage
}

export function averageAttribute(attributes: Attributes): number {
  return ATTRIBUTE_KEYS.reduce((sum, k) => sum + attributes[k], 0) / ATTRIBUTE_KEYS.length
}

const PROMOTION_RULES: { from: RankId; to: RankId; expThreshold: number; avgAttrFloor: number }[] = [
  { from: 'initiate', to: 'field_operative', expThreshold: 120, avgAttrFloor: 32 },
  { from: 'field_operative', to: 'veteran', expThreshold: 320, avgAttrFloor: 42 },
  { from: 'veteran', to: 'elite', expThreshold: 700, avgAttrFloor: 55 },
]

export function checkPromotion(warrior: Warrior): RankId | null {
  const rule = PROMOTION_RULES.find((r) => r.from === warrior.rank)
  if (!rule) return null
  if (warrior.experience >= rule.expThreshold && averageAttribute(warrior.attributes) >= rule.avgAttrFloor) {
    return rule.to
  }
  return null
}

export function applyPromotion(warrior: Warrior, newRank: RankId): Warrior {
  const rankDef = rankById(newRank)
  return { ...warrior, rank: newRank, wage: rankDef.wage }
}

export function leadershipScore(warrior: Warrior): number {
  const rankDef = rankById(warrior.rank)
  const traitBonus = traitEffectsOfType(warrior, 'leadership_bonus').reduce((s, e) => s + (e.amount ?? 0), 0)
  const presence = effectiveAttributes(warrior).presence
  return rankDef.leadershipBonus + presence * 0.3 + traitBonus * 100
}

export function _attributeKeys(): AttributeKey[] {
  return [...ATTRIBUTE_KEYS]
}
