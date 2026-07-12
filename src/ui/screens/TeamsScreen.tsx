import { useState } from 'react'
import type { GameState } from '../../domain/types'
import { Panel } from '../components/Panel'
import { TeamCard } from '../components/TeamCard'
import { Avatar } from '../components/Avatar'
import { useGameStore } from '../../state/gameStore'
import { defaultContentPack } from '../../content'

interface TeamsScreenProps {
  game: GameState
  onSelectWarrior: (id: string) => void
}

function TeamBuilderForm({
  game,
  initialMemberIds,
  initialLeaderId,
  initialMentorId,
  initialName,
  editingTeamId,
  onDone,
}: {
  game: GameState
  initialMemberIds: string[]
  initialLeaderId: string
  initialMentorId: string | null
  initialName: string
  editingTeamId: string | null
  onDone: () => void
}) {
  const createTeam = useGameStore((s) => s.createTeam)
  const reformTeam = useGameStore((s) => s.reformTeam)
  const [name, setName] = useState(initialName)
  const [memberIds, setMemberIds] = useState<string[]>(initialMemberIds)
  const [leaderId, setLeaderId] = useState(initialLeaderId)
  const [mentorId, setMentorId] = useState<string | null>(initialMentorId)
  const [error, setError] = useState<string | null>(null)

  const availableWarriors = game.warriors.filter((w) => w.status === 'available' && (w.teamId === null || w.teamId === editingTeamId))

  function toggleMember(id: string) {
    setMemberIds((prev) => {
      if (prev.includes(id)) {
        const next = prev.filter((m) => m !== id)
        if (leaderId === id) setLeaderId(next[0] ?? '')
        if (mentorId === id) setMentorId(null)
        return next
      }
      if (prev.length >= 4) return prev
      if (prev.length === 0) setLeaderId(id)
      return [...prev, id]
    })
  }

  function submit() {
    if (!name.trim()) return setError('Give the team a name.')
    if (memberIds.length < 2) return setError('A team needs at least 2 members.')
    if (!leaderId) return setError('Choose a leader.')

    const result = editingTeamId
      ? reformTeam(editingTeamId, memberIds, leaderId, mentorId)
      : createTeam(name.trim(), memberIds, leaderId, mentorId)

    if (!result.ok) setError(result.reason ?? 'Could not save team.')
    else onDone()
  }

  return (
    <Panel title={editingTeamId ? 'Reorganise Team' : 'Create Team'}>
      <label className="field-label">
        Team Name
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ashgrove Vanguard" />
      </label>

      <h4>Members (2–4)</h4>
      <div className="member-picker">
        {availableWarriors.length === 0 && <p className="muted">No available operatives to assign.</p>}
        {availableWarriors.map((w) => (
          <button key={w.id} className={`member-chip ${memberIds.includes(w.id) ? 'member-chip-selected' : ''}`} onClick={() => toggleMember(w.id)}>
            <Avatar name={w.name} size={30} />
            {w.name}
          </button>
        ))}
      </div>

      {memberIds.length > 0 && (
        <>
          <h4>Leader</h4>
          <div className="member-picker">
            {memberIds.map((id) => {
              const w = game.warriors.find((x) => x.id === id)
              if (!w) return null
              return (
                <button key={id} className={`member-chip ${leaderId === id ? 'member-chip-selected' : ''}`} onClick={() => setLeaderId(id)}>
                  {w.name}
                </button>
              )
            })}
          </div>

          <h4>Mentor (optional)</h4>
          <div className="member-picker">
            <button className={`member-chip ${mentorId === null ? 'member-chip-selected' : ''}`} onClick={() => setMentorId(null)}>
              None
            </button>
            {memberIds
              .filter((id) => id !== leaderId)
              .map((id) => {
                const w = game.warriors.find((x) => x.id === id)
                if (!w) return null
                return (
                  <button key={id} className={`member-chip ${mentorId === id ? 'member-chip-selected' : ''}`} onClick={() => setMentorId(id)}>
                    {w.name}
                  </button>
                )
              })}
          </div>
        </>
      )}

      {error && <p className="form-error">{error}</p>}

      <div className="form-actions">
        <button className="btn-primary" onClick={submit}>
          {editingTeamId ? 'Save Changes' : 'Create Team'}
        </button>
        <button className="btn-secondary" onClick={onDone}>
          Cancel
        </button>
      </div>
    </Panel>
  )
}

export function TeamsScreen({ game, onSelectWarrior }: TeamsScreenProps) {
  const [mode, setMode] = useState<'list' | 'create' | { edit: string }>('list')
  const dissolveTeam = useGameStore((s) => s.dissolveTeam)

  return (
    <div className="screen teams-screen">
      <div className="teams-layout">
        <div className="teams-list">
          <Panel
            title="Teams"
            actions={
              <button className="btn-primary" onClick={() => setMode('create')}>
                + New Team
              </button>
            }
          >
            {game.teams.length === 0 && <p className="muted">No teams yet. Create one to start accepting contracts.</p>}
          </Panel>
          {game.teams.map((team) => {
            const members = team.memberIds.map((id) => game.warriors.find((w) => w.id === id)).filter((w): w is NonNullable<typeof w> => Boolean(w))
            return (
              <div key={team.id} className="team-card-wrapper">
                <TeamCard team={team} members={members} onClick={() => onSelectWarrior(team.leaderId)} />
                {team.status === 'idle' && (
                  <div className="team-card-actions">
                    <button className="btn-secondary" onClick={() => setMode({ edit: team.id })}>
                      Reorganise
                    </button>
                    <button className="btn-danger" onClick={() => dissolveTeam(team.id)}>
                      Dissolve
                    </button>
                  </div>
                )}
              </div>
            )
          })}

          <Panel title="Suggested Team Archetypes" className="team-suggestions">
            {defaultContentPack.teamArchetypeSuggestions.map((s) => (
              <div key={s.name} className="suggestion-row">
                <strong>{s.name}</strong>
                <p className="muted">{s.description}</p>
              </div>
            ))}
          </Panel>
        </div>

        <div className="teams-editor">
          {mode === 'create' && (
            <TeamBuilderForm
              game={game}
              initialMemberIds={[]}
              initialLeaderId=""
              initialMentorId={null}
              initialName=""
              editingTeamId={null}
              onDone={() => setMode('list')}
            />
          )}
          {typeof mode === 'object' &&
            (() => {
              const team = game.teams.find((t) => t.id === mode.edit)
              if (!team) return null
              return (
                <TeamBuilderForm
                  game={game}
                  initialMemberIds={team.memberIds}
                  initialLeaderId={team.leaderId}
                  initialMentorId={team.mentorId}
                  initialName={team.name}
                  editingTeamId={team.id}
                  onDone={() => setMode('list')}
                />
              )
            })()}
        </div>
      </div>
    </div>
  )
}
