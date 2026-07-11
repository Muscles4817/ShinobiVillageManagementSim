import type { FacilityDefinition } from '../domain/types'

export const facilities: FacilityDefinition[] = [
  {
    id: 'mission_hall',
    name: 'Mission Hall',
    description: 'Where contracts are logged, vetted, and posted for teams to accept.',
    levels: [
      {
        level: 1,
        cost: 0,
        buildDays: 0,
        description: 'A modest office. Generates a small trickle of local contracts.',
        unlocks: ['Up to 3 accepted contracts at once', 'Basic client access'],
      },
      {
        level: 2,
        cost: 260,
        buildDays: 3,
        description: 'A busier hall with a standing courier network, attracting better-paying clients.',
        unlocks: ['Up to 5 accepted contracts at once', 'Higher-value clients appear', 'Better base info confidence'],
      },
    ],
  },
  {
    id: 'training_grounds',
    name: 'Training Grounds',
    description: 'Yards and equipment for drilling individuals and full teams.',
    levels: [
      {
        level: 1,
        cost: 0,
        buildDays: 0,
        description: 'Open yards with basic equipment.',
        unlocks: ['Individual training assignments', 'Team drill exercises'],
      },
      {
        level: 2,
        cost: 220,
        buildDays: 3,
        description: 'Covered ranges and dedicated drill instructors.',
        unlocks: ['Faster attribute gains', 'Improved cohesion from team exercises'],
      },
    ],
  },
  {
    id: 'medical_ward',
    name: 'Medical Ward',
    description: 'Where the injured are treated and recovery is managed.',
    levels: [
      {
        level: 1,
        cost: 0,
        buildDays: 0,
        description: 'A small ward with limited beds and supplies.',
        unlocks: ['Basic treatment', 'Up to 3 treated at once'],
      },
      {
        level: 2,
        cost: 240,
        buildDays: 3,
        description: 'An expanded ward with a resident physician.',
        unlocks: ['Faster recovery', 'Lower complication chance', 'Up to 6 treated at once'],
      },
    ],
  },
  {
    id: 'intel_office',
    name: 'Intelligence Office',
    description: 'A small bureau dedicated to gathering and interpreting information on contracts and rivals.',
    levels: [
      {
        level: 1,
        cost: 180,
        buildDays: 2,
        description: 'A single analyst tracking rumours and client reports.',
        unlocks: ['Improved contract info confidence', 'Basic rival visibility', 'Passive intel generation'],
      },
      {
        level: 2,
        cost: 320,
        buildDays: 4,
        description: 'A proper network of informants across the Reach.',
        unlocks: ['Detects hidden mission complications', 'Stronger rival visibility'],
      },
    ],
  },
  {
    id: 'academy',
    name: 'Academy',
    description: 'Trains promising youths into Initiates, feeding the Enclave a steady pipeline of recruits.',
    levels: [
      {
        level: 1,
        cost: 200,
        buildDays: 3,
        description: 'A single instructor and a small class of trainees.',
        unlocks: ['Periodic new Initiate graduates', 'Basic curriculum choice'],
      },
      {
        level: 2,
        cost: 340,
        buildDays: 4,
        description: 'A proper curriculum with specialised instructors.',
        unlocks: ['Higher quality graduates', 'Faster graduation'],
      },
    ],
  },
  {
    id: 'defensive_works',
    name: 'Defensive Works',
    description: 'Walls, watchtowers, and traps that protect the village while teams are away.',
    levels: [
      {
        level: 1,
        cost: 160,
        buildDays: 2,
        description: 'A perimeter fence and a manned watch post.',
        unlocks: ['Improved village security score', 'Reduced infiltration risk'],
      },
      {
        level: 2,
        cost: 300,
        buildDays: 4,
        description: 'Reinforced walls and a trained standing guard.',
        unlocks: ['Further improved security', 'Reduced impact of low security while teams are away'],
      },
    ],
  },
]

export function facilityDefinitionById(id: string): FacilityDefinition {
  const facility = facilities.find((f) => f.id === id)
  if (!facility) throw new Error(`Unknown facility id: ${id}`)
  return facility
}
