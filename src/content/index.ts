import type { ContentPack } from '../domain/types'
import { ranks } from './ranks'
import { traits } from './traits'
import { techniques } from './techniques'
import { injuries } from './injuries'
import { facilities } from './facilities'
import { missionTemplates } from './missionTemplates'
import { eventTemplates } from './events'
import { clients } from './clients'
import { narrativeFragments } from './narrativeFragments'
import { firstNames, lastNames, archetypes, teamArchetypeSuggestions } from './names'

export const defaultContentPack: ContentPack = {
  id: 'content_default_reach',
  name: 'The Reach (Original Setting)',
  ranks,
  traits,
  techniques,
  injuries,
  facilities,
  missionTemplates,
  eventTemplates,
  clients,
  narrativeFragments,
  firstNames,
  lastNames,
  archetypes,
  teamArchetypeSuggestions,
}

export * from './ranks'
export * from './traits'
export * from './techniques'
export * from './injuries'
export * from './facilities'
export * from './missionTemplates'
export * from './events'
export * from './clients'
export * from './narrativeFragments'
export * from './names'
export * from './factions'
export * from './warriors'
