import { useState } from 'react'
import type { GameState, Report } from '../../domain/types'
import { Panel } from '../components/Panel'

interface ReportsScreenProps {
  game: GameState
}

const CATEGORY_LABELS: Record<Report['category'], string> = {
  mission: 'Missions',
  injury: 'Injuries',
  promotion: 'Promotions',
  recruitment: 'Recruitment',
  event: 'Events',
  finance: 'Finance',
  rival: 'Rival',
  construction: 'Construction',
  system: 'Village',
}

export function ReportsScreen({ game }: ReportsScreenProps) {
  const [filter, setFilter] = useState<Report['category'] | 'all'>('all')
  const reports = [...game.reports].reverse().filter((r) => filter === 'all' || r.category === filter)

  return (
    <div className="screen reports-screen">
      <Panel title="Reports">
        <div className="report-filters">
          <button className={`filter-chip ${filter === 'all' ? 'filter-chip-active' : ''}`} onClick={() => setFilter('all')}>
            All
          </button>
          {(Object.keys(CATEGORY_LABELS) as Report['category'][]).map((cat) => (
            <button key={cat} className={`filter-chip ${filter === cat ? 'filter-chip-active' : ''}`} onClick={() => setFilter(cat)}>
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        {reports.length === 0 && <p className="muted">No reports yet.</p>}
        <ul className="report-list">
          {reports.map((r) => (
            <li key={r.id} className={`report-item report-${r.category}`}>
              <div className="report-item-header">
                <span className="report-day">Day {r.day}</span>
                <span className="report-category">{CATEGORY_LABELS[r.category]}</span>
              </div>
              <h4>{r.title}</h4>
              <p>{r.body}</p>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  )
}
