import type { Warrior } from '../../domain/types'
import { Avatar } from './Avatar'
import { rankById } from '../../content/ranks'
import { effectiveAttributes } from '../../sim/warriorSim'

const ATTRIBUTE_LABELS: Record<string, string> = {
  combat: 'Combat',
  technique: 'Technique',
  control: 'Control',
  intelligence: 'Intelligence',
  mobility: 'Mobility',
  presence: 'Presence',
  resilience: 'Resilience',
}

const STATUS_LABELS: Record<Warrior['status'], string> = {
  available: 'Available',
  training: 'Training',
  injured: 'Injured',
  travelling: 'Travelling',
  deployed: 'Deployed',
}

interface WarriorCardProps {
  warrior: Warrior
  onClick?: () => void
  teamName?: string
  selected?: boolean
}

export function WarriorCard({ warrior, onClick, teamName, selected }: WarriorCardProps) {
  const attrs = effectiveAttributes(warrior)
  const topAttrs = Object.entries(attrs)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)

  return (
    <button className={`warrior-card ${selected ? 'warrior-card-selected' : ''}`} onClick={onClick}>
      <Avatar name={warrior.name} size={44} dimmed={warrior.status === 'injured'} />
      <div className="warrior-card-info">
        <div className="warrior-card-name">{warrior.name}</div>
        <div className="warrior-card-meta">
          {rankById(warrior.rank).name} · {warrior.archetype}
        </div>
        <div className="warrior-card-attrs">
          {topAttrs.map(([key, value]) => (
            <span key={key} className="attr-pill">
              {ATTRIBUTE_LABELS[key]} {value}
            </span>
          ))}
        </div>
        <div className="warrior-card-footer">
          <span className={`status-badge status-${warrior.status}`}>{STATUS_LABELS[warrior.status]}</span>
          {teamName && <span className="team-tag">{teamName}</span>}
        </div>
      </div>
    </button>
  )
}
