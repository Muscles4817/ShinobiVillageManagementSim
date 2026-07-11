import type { ContentPack, EventEffect, EventInstance, GameState, Warrior } from '../domain/types'
import type { Rng } from '../utils/rng'
import { generateSeededId } from '../utils/idGen'

export function maybeTriggerEvent(state: GameState, contentPack: ContentPack, rng: Rng): EventInstance | null {
  if (state.pendingEvents.length >= 2) return null
  if (!rng.chance(0.3)) return null

  const pendingTemplateIds = new Set(state.pendingEvents.map((e) => e.templateId))
  const eligible = contentPack.eventTemplates.filter((t) => (t.minDay ?? 0) <= state.village.day && !pendingTemplateIds.has(t.id))
  if (eligible.length === 0) return null

  const totalWeight = eligible.reduce((s, t) => s + t.weight, 0)
  let roll = rng.float(0, totalWeight)
  let chosen = eligible[0]
  for (const template of eligible) {
    if (roll < template.weight) {
      chosen = template
      break
    }
    roll -= template.weight
  }

  return { id: generateSeededId('event', rng), templateId: chosen.id, day: state.village.day }
}

function pickTargetWarrior(warriors: Warrior[], rng: Rng): Warrior | null {
  const training = warriors.filter((w) => w.status === 'training')
  const pool = training.length > 0 ? training : warriors.filter((w) => w.status !== 'injured')
  if (pool.length === 0) return null
  return rng.pick(pool)
}

export function applyEventEffects(state: GameState, effects: EventEffect[], rng: Rng): GameState {
  let village = { ...state.village }
  let rival = { ...state.rival }
  let warriors = state.warriors

  for (const effect of effects) {
    switch (effect.type) {
      case 'funds':
        village = { ...village, funds: village.funds + (effect.amount ?? 0) }
        break
      case 'reputation':
        village = { ...village, reputation: Math.max(0, village.reputation + (effect.amount ?? 0)) }
        break
      case 'supplies':
        village = { ...village, supplies: Math.max(0, village.supplies + (effect.amount ?? 0)) }
        break
      case 'intel':
        village = { ...village, intel: Math.max(0, village.intel + (effect.amount ?? 0)) }
        break
      case 'security':
        village = { ...village, security: Math.max(0, Math.min(100, village.security + (effect.amount ?? 0))) }
        break
      case 'rival_relationship':
        rival = { ...rival, relationship: Math.max(-100, Math.min(100, rival.relationship + (effect.amount ?? 0))) }
        break
      case 'morale_all':
        warriors = warriors.map((w) => ({ ...w, morale: Math.max(0, Math.min(100, w.morale + (effect.amount ?? 0))) }))
        break
      case 'loyalty_all':
        warriors = warriors.map((w) => ({ ...w, loyalty: Math.max(0, Math.min(100, w.loyalty + (effect.amount ?? 0))) }))
        break
      case 'warrior_morale': {
        const target = pickTargetWarrior(warriors, rng)
        if (target) warriors = warriors.map((w) => (w.id === target.id ? { ...w, morale: Math.max(0, Math.min(100, w.morale + (effect.amount ?? 0))) } : w))
        break
      }
      case 'warrior_loyalty': {
        const target = pickTargetWarrior(warriors, rng)
        if (target) warriors = warriors.map((w) => (w.id === target.id ? { ...w, loyalty: Math.max(0, Math.min(100, w.loyalty + (effect.amount ?? 0))) } : w))
        break
      }
      case 'warrior_trait': {
        const target = pickTargetWarrior(warriors, rng)
        if (target && effect.traitId && !target.traitIds.includes(effect.traitId)) {
          warriors = warriors.map((w) => (w.id === target.id ? { ...w, traitIds: [...w.traitIds, effect.traitId as string] } : w))
        }
        break
      }
    }
  }

  return { ...state, village, rival, warriors }
}
