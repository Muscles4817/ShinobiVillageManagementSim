import type { ClientDefinition } from '../domain/types'

export const clients: ClientDefinition[] = [
  {
    id: 'client_river_road_merchants',
    name: 'River Road Merchant Guild',
    description: 'A coalition of traders moving goods along the river routes.',
    favouredCategories: ['caravan_protection', 'courier', 'smuggling_interception'],
    region: 'the river road',
  },
  {
    id: 'client_millhaven_council',
    name: 'Millhaven Town Council',
    description: 'The elected council of a mid-sized farming town near the Enclave.',
    favouredCategories: ['village_defence', 'disaster_relief', 'border_patrol'],
    region: 'Millhaven',
  },
  {
    id: 'client_greywater_farmers',
    name: 'Greywater Farmers Cooperative',
    description: 'Smallholders banding together to deal with threats to their land.',
    favouredCategories: ['wildlife_threat', 'bandit_suppression', 'missing_person'],
    region: 'the Greywater fields',
  },
  {
    id: 'client_house_arden',
    name: 'House Arden',
    description: 'A minor noble house with modest holdings and outsized ambitions.',
    favouredCategories: ['diplomatic_escort', 'assassination_prevention', 'counter_espionage'],
    region: "House Arden's estate",
  },
  {
    id: 'client_lantern_district',
    name: 'Lantern District Watch',
    description: 'The civic watch of a crowded trade district, stretched thin.',
    favouredCategories: ['sabotage_investigation', 'fugitive_pursuit', 'infiltration'],
    region: 'the Lantern District',
  },
  {
    id: 'client_wayfarers_lodge',
    name: "Wayfarers' Lodge",
    description: 'An inn and waystation that hires help for travellers in trouble.',
    favouredCategories: ['escort', 'missing_person', 'courier'],
    region: 'the coast road',
  },
  {
    id: 'client_stonecross_mine',
    name: 'Stonecross Mining Concern',
    description: 'A mining operation plagued by theft, cave threats, and unreliable labour.',
    favouredCategories: ['ruin_exploration', 'sabotage_investigation', 'bandit_suppression'],
    region: 'Stonecross',
  },
  {
    id: 'client_hollow_reach_temple',
    name: 'Hollow Reach Temple',
    description: 'A quiet religious order that occasionally needs discreet, careful help.',
    favouredCategories: ['hostage_rescue', 'intelligence_gathering', 'ruin_exploration'],
    region: 'the Hollow Reach',
  },
  {
    id: 'client_free_company_scouts',
    name: 'Free Company of Scouts',
    description: 'An independent band of scouts and guides who subcontract dangerous work.',
    favouredCategories: ['border_patrol', 'intelligence_gathering', 'counter_espionage'],
    region: 'the border camps',
  },
  {
    id: 'client_anonymous_broker',
    name: 'Anonymous Broker',
    description: 'A go-between who never gives a real name. Reliable pay, unreliable ethics.',
    favouredCategories: ['high_risk_capture', 'infiltration', 'smuggling_interception'],
    region: 'an unmarked meeting point',
  },
]

export function clientById(id: string): ClientDefinition {
  const client = clients.find((c) => c.id === id)
  if (!client) throw new Error(`Unknown client id: ${id}`)
  return client
}
