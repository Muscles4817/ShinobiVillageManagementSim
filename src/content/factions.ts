import type { FactionState } from '../domain/types'

export const playerFactionSeed: Pick<FactionState, 'id' | 'name' | 'isPlayer'> = {
  id: 'faction_player',
  name: 'Player Enclave',
  isPlayer: true,
}

export const rivalFactionSeed: FactionState = {
  id: 'faction_ironvale',
  name: 'Ironvale Enclave',
  isPlayer: false,
  relationship: 10,
  strength: 55,
  reputation: 60,
  hostility: 25,
  knownIntel: 20,
  recentActions: ['Ironvale has been quietly expanding its contract reach along the river road.'],
}
