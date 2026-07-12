export type ScreenId = 'overview' | 'roster' | 'teams' | 'missions' | 'village' | 'training' | 'intelligence' | 'reports'

export const NAV_ITEMS: { id: ScreenId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'roster', label: 'Roster' },
  { id: 'teams', label: 'Teams' },
  { id: 'missions', label: 'Missions' },
  { id: 'village', label: 'Village' },
  { id: 'training', label: 'Training' },
  { id: 'intelligence', label: 'Intelligence' },
  { id: 'reports', label: 'Reports' },
]
