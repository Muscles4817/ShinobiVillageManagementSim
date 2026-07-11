export function formatDay(day: number): string {
  return `Day ${day}`
}

export function daysUntil(currentDay: number, targetDay: number): number {
  return Math.max(0, targetDay - currentDay)
}
