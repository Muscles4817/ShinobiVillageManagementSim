import type { Team, Warrior } from '../../domain/types'
import { Avatar } from './Avatar'
import { Meter } from './Meter'

interface TeamCardProps {
  team: Team
  members: Warrior[]
  onClick?: () => void
}

const STATUS_LABELS: Record<Team['status'], string> = {
  idle: 'At the Enclave',
  travelling: 'Travelling',
  deployed: 'Deployed',
  resting: 'Resting',
}

export function TeamCard({ team, members, onClick }: TeamCardProps) {
  const leader = members.find((m) => m.id === team.leaderId)

  return (
    <div className="team-card" onClick={onClick}>
      <div className="team-card-header">
        <h4>{team.name}</h4>
        <span className={`team-status team-status-${team.status}`}>{STATUS_LABELS[team.status]}</span>
      </div>
      <div className="team-card-members">
        {members.map((m) => (
          <div key={m.id} className="team-card-member">
            <Avatar name={m.name} size={36} />
            <span>{m.name}{m.id === team.leaderId ? ' (Leader)' : ''}{m.id === team.mentorId ? ' (Mentor)' : ''}</span>
          </div>
        ))}
      </div>
      <Meter label="Cohesion" value={team.cohesion} tone={team.cohesion >= 60 ? 'good' : team.cohesion >= 30 ? 'default' : 'warning'} />
      {leader && <div className="team-card-leader-note">Led by {leader.name}</div>}
    </div>
  )
}
