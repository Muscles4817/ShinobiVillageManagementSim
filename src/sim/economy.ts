import type { Facility, VillageState, Warrior } from '../domain/types'

export function totalWages(warriors: Warrior[]): number {
  return warriors.reduce((sum, w) => sum + w.wage, 0)
}

export function totalFacilityUpkeep(facilities: Facility[]): number {
  return facilities.reduce((sum, f) => sum + f.level, 0)
}

export function applyDailyUpkeep(village: VillageState, warriors: Warrior[], facilities: Facility[]): VillageState {
  const upkeep = totalWages(warriors) + totalFacilityUpkeep(facilities)
  return { ...village, funds: village.funds - upkeep }
}

export function computeSecurity(warriors: Warrior[], facilities: Facility[], rivalHostility: number): number {
  const homeDefenders = warriors.filter((w) => w.status === 'available' || w.status === 'training').length
  const defensiveWorks = facilities.find((f) => f.id === 'defensive_works')
  const intelOffice = facilities.find((f) => f.id === 'intel_office')

  let security = 30
  security += Math.min(30, homeDefenders * 3)
  security += (defensiveWorks?.level ?? 0) * 15
  security += (intelOffice?.level ?? 0) * 8
  security -= Math.round(rivalHostility * 0.15)

  return Math.max(0, Math.min(100, Math.round(security)))
}
