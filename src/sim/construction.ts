import type { Facility, FacilityDefinition } from '../domain/types'

export function nextLevelDefinition(definition: FacilityDefinition, currentLevel: number) {
  return definition.levels.find((l) => l.level === currentLevel + 1) ?? null
}

export function canStartUpgrade(facility: Facility, definition: FacilityDefinition, funds: number): { ok: boolean; reason?: string } {
  if (facility.upgrading) return { ok: false, reason: 'Already under construction.' }
  const next = nextLevelDefinition(definition, facility.level)
  if (!next) return { ok: false, reason: 'Already at maximum level.' }
  if (funds < next.cost) return { ok: false, reason: 'Not enough funds.' }
  return { ok: true }
}

export function startUpgrade(facility: Facility, definition: FacilityDefinition, day: number): Facility {
  const next = nextLevelDefinition(definition, facility.level)
  if (!next) return facility
  return { ...facility, upgrading: true, constructionEndsDay: day + next.buildDays }
}

export function progressConstruction(facility: Facility, day: number): { facility: Facility; completed: boolean } {
  if (!facility.upgrading || facility.constructionEndsDay === null) return { facility, completed: false }
  if (day < facility.constructionEndsDay) return { facility, completed: false }
  return {
    facility: { ...facility, level: facility.level + 1, upgrading: false, constructionEndsDay: null },
    completed: true,
  }
}
