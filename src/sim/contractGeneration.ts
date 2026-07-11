import type { Contract, ContentPack, MissionTemplate } from '../domain/types'
import type { Rng } from '../utils/rng'
import { generateSeededId } from '../utils/idGen'

function eligibleTemplates(templates: MissionTemplate[], day: number): MissionTemplate[] {
  return templates.filter((t) => {
    if ((t.dangerBand === 'high' || t.dangerBand === 'unknown') && day < 6) return false
    if (t.minRank === 'elite' && day < 12) return false
    if (t.minRank === 'veteran' && day < 5) return false
    return true
  })
}

export function generateContract(contentPack: ContentPack, rng: Rng, day: number): Contract {
  const templates = eligibleTemplates(contentPack.missionTemplates, day)
  const template = rng.pick(templates.length > 0 ? templates : contentPack.missionTemplates)
  const favouredClients = contentPack.clients.filter((c) => c.favouredCategories.includes(template.category))
  const client = rng.pick(favouredClients.length > 0 ? favouredClients : contentPack.clients)

  let infoConfidence = template.baseInfoConfidence
  if (rng.chance(0.25)) {
    if (infoConfidence === 'good') infoConfidence = 'fair'
    else if (infoConfidence === 'fair') infoConfidence = 'poor'
  }

  const destination = `${client.name.split(' ')[0]}'s territory`

  return {
    id: generateSeededId('contract', rng),
    templateId: template.id,
    clientId: client.id,
    title: template.title,
    summary: template.summaryTemplate.replace('{destination}', destination),
    duration: rng.int(template.durationRange[0], template.durationRange[1]),
    travelTime: rng.int(template.travelRange[0], template.travelRange[1]),
    reward: rng.int(template.rewardRange[0], template.rewardRange[1]),
    reputationReward: rng.int(template.reputationRewardRange[0], template.reputationRewardRange[1]),
    dangerEstimate: template.dangerBand,
    infoConfidence,
    expiryDay: day + rng.int(4, 8),
    sensitivity: template.sensitivity ?? false,
    status: 'available',
    createdDay: day,
  }
}

export function refreshContracts(contracts: Contract[], contentPack: ContentPack, rng: Rng, day: number, missionHallLevel: number): Contract[] {
  const availableCount = contracts.filter((c) => c.status === 'available').length
  const maxAvailable = missionHallLevel >= 2 ? 8 : 5
  const addChance = 0.45 + missionHallLevel * 0.1

  if (availableCount < maxAvailable && rng.chance(addChance)) {
    return [...contracts, generateContract(contentPack, rng, day)]
  }
  return contracts
}

export function acceptedContractLimit(missionHallLevel: number): number {
  return missionHallLevel >= 2 ? 5 : 3
}
