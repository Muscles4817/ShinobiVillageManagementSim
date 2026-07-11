import type { GameState } from '../domain/types'
import { SAVE_VERSION } from '../sim/gameSetup'

const SAVE_KEY = 'enclave_sim_save_v1'

export function saveGame(state: GameState): void {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state))
}

export function loadGame(): GameState | null {
  const raw = localStorage.getItem(SAVE_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as GameState
    if (parsed.saveVersion !== SAVE_VERSION) {
      console.warn(`Save version mismatch (found ${parsed.saveVersion}, expected ${SAVE_VERSION}). Discarding save.`)
      return null
    }
    return parsed
  } catch (err) {
    console.warn('Failed to parse save data.', err)
    return null
  }
}

export function hasSave(): boolean {
  return localStorage.getItem(SAVE_KEY) !== null
}

export function clearSave(): void {
  localStorage.removeItem(SAVE_KEY)
}
