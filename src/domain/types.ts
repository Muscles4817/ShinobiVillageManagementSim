// Core domain model for the Enclave sim.
// These are plain data shapes only -- no behaviour lives here.

export type AttributeKey =
  | 'combat'
  | 'technique'
  | 'control'
  | 'intelligence'
  | 'mobility'
  | 'presence'
  | 'resilience'

export type Attributes = Record<AttributeKey, number>

export type RankId = 'initiate' | 'field_operative' | 'veteran' | 'elite'

export type WarriorStatus =
  | 'available'
  | 'training'
  | 'injured'
  | 'travelling'
  | 'deployed'

export type InjurySeverity = 'bruised' | 'strained' | 'wounded' | 'severely_wounded'

export interface ActiveInjury {
  injuryId: string
  severity: InjurySeverity
  daysRemaining: number
}

export interface MissionHistoryEntry {
  contractId: string
  templateId: string
  day: number
  outcome: MissionOutcomeTier
}

export interface Warrior {
  id: string
  name: string
  age: number
  rank: RankId
  archetype: string
  attributes: Attributes
  traitIds: string[]
  techniqueIds: string[]
  specialityIds: string[]
  loyalty: number
  morale: number
  fatigue: number
  health: number
  experience: number
  level: number
  injuries: ActiveInjury[]
  status: WarriorStatus
  teamId: string | null
  missionHistory: MissionHistoryEntry[]
  relationships: Record<string, number>
  wage: number
  isRecruit?: boolean
  background?: string
  hiddenLoyaltyNote?: string
  joinedDay: number
}

export type TeamStatus = 'idle' | 'travelling' | 'deployed' | 'resting'

export interface Team {
  id: string
  name: string
  memberIds: string[]
  leaderId: string
  mentorId: string | null
  cohesion: number
  status: TeamStatus
  missionHistory: MissionHistoryEntry[]
  createdDay: number
  lastReformedDay: number
}

export type DangerEstimate = 'low' | 'moderate' | 'high' | 'unknown'
export type InfoConfidence = 'poor' | 'fair' | 'good'

export interface MissionStageTemplate {
  id: string
  label: string
  attributes: AttributeKey[]
  weight: number
  difficultyBase: number
}

export type MissionCategory =
  | 'courier'
  | 'escort'
  | 'caravan_protection'
  | 'missing_person'
  | 'bandit_suppression'
  | 'wildlife_threat'
  | 'sabotage_investigation'
  | 'village_defence'
  | 'intelligence_gathering'
  | 'fugitive_pursuit'
  | 'hostage_rescue'
  | 'infiltration'
  | 'diplomatic_escort'
  | 'smuggling_interception'
  | 'ruin_exploration'
  | 'disaster_relief'
  | 'counter_espionage'
  | 'border_patrol'
  | 'assassination_prevention'
  | 'high_risk_capture'

export interface MissionTemplate {
  id: string
  category: MissionCategory
  title: string
  summaryTemplate: string
  minRank: RankId
  stages: MissionStageTemplate[]
  durationRange: [number, number]
  travelRange: [number, number]
  rewardRange: [number, number]
  reputationRewardRange: [number, number]
  dangerBand: DangerEstimate
  baseInfoConfidence: InfoConfidence
  sensitivity?: boolean
  recommendedTeamSize: [number, number]
}

export type ContractStatus = 'available' | 'accepted' | 'active' | 'resolved' | 'expired'

export interface Contract {
  id: string
  templateId: string
  clientId: string
  title: string
  summary: string
  duration: number
  travelTime: number
  reward: number
  reputationReward: number
  dangerEstimate: DangerEstimate
  infoConfidence: InfoConfidence
  expiryDay: number
  sensitivity: boolean
  status: ContractStatus
  createdDay: number
}

export interface StageResult {
  stageId: string
  label: string
  success: boolean
  margin: number
  complication?: string
}

export interface MissionResult {
  contractId: string
  teamId: string
  outcome: MissionOutcomeTier
  stageResults: StageResult[]
  standoutWarriorIds: string[]
  injuries: { warriorId: string; injuryId: string; severity: InjurySeverity }[]
  experienceGained: Record<string, number>
  fundsAwarded: number
  reputationAwarded: number
  intelDiscovered: number
  complications: string[]
  narrative: string[]
}

export type MissionOutcomeTier =
  | 'exceptional_success'
  | 'success'
  | 'partial_success'
  | 'failure'
  | 'disaster'

export interface ActiveMission {
  id: string
  contractId: string
  templateId: string
  teamId: string
  startDay: number
  travelDaysRemaining: number
  missionDaysRemaining: number
  expectedReturnDay: number
  result?: MissionResult
}

export type FacilityId =
  | 'mission_hall'
  | 'training_grounds'
  | 'medical_ward'
  | 'intel_office'
  | 'academy'
  | 'defensive_works'

export interface Facility {
  id: FacilityId
  name: string
  level: number
  maxLevel: number
  upgrading: boolean
  constructionEndsDay: number | null
}

export interface FactionState {
  id: string
  name: string
  isPlayer: boolean
  relationship: number
  strength: number
  reputation: number
  hostility: number
  knownIntel: number
  recentActions: string[]
}

export interface EventChoice {
  id: string
  label: string
  effects: EventEffect[]
  requirement?: EventRequirement
}

export interface EventEffect {
  type:
    | 'funds'
    | 'reputation'
    | 'supplies'
    | 'intel'
    | 'security'
    | 'morale_all'
    | 'loyalty_all'
    | 'rival_relationship'
    | 'warrior_trait'
    | 'warrior_loyalty'
    | 'warrior_morale'
  amount?: number
  traitId?: string
}

export interface EventRequirement {
  minFunds?: number
  minIntel?: number
}

export interface EventTemplate {
  id: string
  title: string
  prompt: string
  choices: EventChoice[]
  weight: number
  minDay?: number
}

export interface EventInstance {
  id: string
  templateId: string
  day: number
  resolvedChoiceId?: string
}

export type VillageTier = 'outpost' | 'recognised_settlement' | 'minor_hidden_village' | 'regional_power'

export interface VillageState {
  day: number
  villageName: string
  funds: number
  reputation: number
  supplies: number
  intel: number
  security: number
  tier: VillageTier
}

export interface Report {
  id: string
  day: number
  category:
    | 'mission'
    | 'injury'
    | 'promotion'
    | 'recruitment'
    | 'event'
    | 'finance'
    | 'rival'
    | 'construction'
    | 'system'
  title: string
  body: string
  refs?: { warriorIds?: string[]; teamId?: string; contractId?: string }
}

export interface RecruitCandidate {
  id: string
  name: string
  age: number
  rank: RankId
  attributes: Attributes
  traitIds: string[]
  specialityIds: string[]
  wage: number
  signingCost: number
  background: string
  hiddenLoyaltyNote?: string
  archetype: string
  expiresDay: number
}

export interface TraitDefinition {
  id: string
  name: string
  description: string
  effects: TraitEffect[]
}

export interface TraitEffect {
  type:
    | 'attribute_bonus'
    | 'variance_reduction'
    | 'variance_increase'
    | 'injury_risk_modifier'
    | 'cohesion_bonus'
    | 'cohesion_penalty'
    | 'training_speed'
    | 'leadership_bonus'
    | 'morale_bonus'
    | 'stage_bonus'
    | 'loyalty_bonus'
    | 'recovery_speed'
  attribute?: AttributeKey
  amount?: number
  stageAttribute?: AttributeKey
}

export interface TechniqueDefinition {
  id: string
  name: string
  description: string
  requiredRank: RankId
  stageAttributes: AttributeKey[]
  bonus: number
}

export interface RankDefinition {
  id: RankId
  name: string
  order: number
  wage: number
  leadershipBonus: number
  description: string
}

export interface InjuryDefinition {
  id: string
  name: string
  severity: InjurySeverity
  attributePenaltyPercent: number
  baseRecoveryDays: number
  description: string
}

export interface FacilityDefinition {
  id: FacilityId
  name: string
  description: string
  levels: FacilityLevelDefinition[]
}

export interface FacilityLevelDefinition {
  level: number
  cost: number
  buildDays: number
  description: string
  unlocks: string[]
}

export interface ClientDefinition {
  id: string
  name: string
  description: string
  favouredCategories: MissionCategory[]
}

export interface NarrativeFragmentSet {
  outcome: MissionOutcomeTier
  fragments: string[]
}

export interface ContentPack {
  id: string
  name: string
  ranks: RankDefinition[]
  traits: TraitDefinition[]
  techniques: TechniqueDefinition[]
  injuries: InjuryDefinition[]
  facilities: FacilityDefinition[]
  missionTemplates: MissionTemplate[]
  eventTemplates: EventTemplate[]
  clients: ClientDefinition[]
  narrativeFragments: NarrativeFragmentSet[]
  firstNames: string[]
  lastNames: string[]
  archetypes: string[]
  teamArchetypeSuggestions: { name: string; description: string }[]
}

export interface PlayerOrders {
  contractsToAccept: string[]
  contractsToAssign: { contractId: string; teamId: string }[]
  trainingAssignments: { warriorId: string; category: TrainingCategory }[]
  facilityUpgrades: FacilityId[]
  eventChoices: { eventInstanceId: string; choiceId: string }[]
  medicalPriority: string[]
}

export type TrainingCategory =
  | 'combat_drills'
  | 'technique_practice'
  | 'mobility_training'
  | 'leadership_development'
  | 'medical_training'
  | 'investigation_training'
  | 'team_exercises'
  | 'recovery_conditioning'

export interface GameState {
  saveVersion: number
  contentPackId: string
  rngSeed: number
  rngCounter: number
  village: VillageState
  warriors: Warrior[]
  teams: Team[]
  contracts: Contract[]
  activeMissions: ActiveMission[]
  facilities: Facility[]
  rival: FactionState
  reports: Report[]
  recruitPool: RecruitCandidate[]
  pendingEvents: EventInstance[]
  trainingAssignments: Record<string, TrainingCategory>
  onboardingComplete: boolean
}
