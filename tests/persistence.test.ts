import { beforeEach, describe, expect, it } from 'vitest'
import { createNewGame, SAVE_VERSION } from '../src/sim/gameSetup'
import { defaultContentPack } from '../src/content'

class FakeLocalStorage {
  private store = new Map<string, string>()
  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null
  }
  setItem(key: string, value: string): void {
    this.store.set(key, value)
  }
  removeItem(key: string): void {
    this.store.delete(key)
  }
  clear(): void {
    this.store.clear()
  }
}

beforeEach(() => {
  ;(globalThis as { localStorage?: unknown }).localStorage = new FakeLocalStorage()
})

describe('save / load', () => {
  it('round-trips a game state through save and load unchanged', async () => {
    const { saveGame, loadGame } = await import('../src/persistence/saveManager')
    const state = createNewGame(defaultContentPack, 123, 'Testhold')

    saveGame(state)
    const loaded = loadGame()

    expect(loaded).toEqual(state)
  })

  it('reports no save present before one has been written', async () => {
    const { hasSave } = await import('../src/persistence/saveManager')
    expect(hasSave()).toBe(false)
  })

  it('reports a save present after writing one, and none after clearing it', async () => {
    const { saveGame, hasSave, clearSave } = await import('../src/persistence/saveManager')
    const state = createNewGame(defaultContentPack, 1, 'Testhold')

    saveGame(state)
    expect(hasSave()).toBe(true)

    clearSave()
    expect(hasSave()).toBe(false)
  })

  it('discards a save whose version does not match the current save format', async () => {
    const { loadGame } = await import('../src/persistence/saveManager')
    const state = createNewGame(defaultContentPack, 1, 'Testhold')
    const stale = { ...state, saveVersion: SAVE_VERSION + 1 }
    localStorage.setItem('enclave_sim_save_v1', JSON.stringify(stale))

    expect(loadGame()).toBeNull()
  })
})
