import type { GameState } from '../../domain/types'
import { WarriorCard } from '../components/WarriorCard'
import { Panel } from '../components/Panel'
import { Avatar } from '../components/Avatar'
import { rankById } from '../../content/ranks'
import { traitById } from '../../content/traits'
import { useGameStore } from '../../state/gameStore'

interface RosterScreenProps {
  game: GameState
  onSelectWarrior: (id: string) => void
}

export function RosterScreen({ game, onSelectWarrior }: RosterScreenProps) {
  const hireRecruit = useGameStore((s) => s.hireRecruit)
  const sorted = [...game.warriors].sort((a, b) => rankById(b.rank).order - rankById(a.rank).order || a.name.localeCompare(b.name))

  return (
    <div className="screen roster-screen">
      <p className="screen-intro">
        {game.warriors.length} operatives currently belong to the Enclave. Select any of them to inspect their full record.
      </p>
      <div className="warrior-grid">
        {sorted.map((w) => {
          const team = game.teams.find((t) => t.id === w.teamId)
          return <WarriorCard key={w.id} warrior={w} teamName={team?.name} onClick={() => onSelectWarrior(w.id)} />
        })}
      </div>

      <Panel title={`Recruitment Pool (${game.recruitPool.length})`} className="recruit-panel">
        <p className="muted">Candidates interested in joining the Enclave. Offers expire after a number of days.</p>
        <div className="recruit-grid">
          {game.recruitPool.map((r) => (
            <div key={r.id} className="recruit-card">
              <div className="recruit-card-header">
                <Avatar name={r.name} size={40} />
                <div>
                  <div className="warrior-card-name">{r.name}</div>
                  <div className="warrior-card-meta">
                    {rankById(r.rank).name} · {r.archetype}
                  </div>
                </div>
              </div>
              <p className="muted">{r.background}</p>
              {r.hiddenLoyaltyNote && <p className="character-warning">{r.hiddenLoyaltyNote}</p>}
              <div className="warrior-card-attrs">
                {r.traitIds.map((id) => (
                  <span key={id} className="attr-pill">
                    {traitById(id).name}
                  </span>
                ))}
              </div>
              <div className="recruit-card-footer">
                <span>💰 {r.signingCost} to sign · {r.wage}/day wage</span>
                <span className="muted">Offer expires day {r.expiresDay}</span>
              </div>
              <button
                className="btn-primary"
                disabled={game.village.funds < r.signingCost}
                onClick={() => hireRecruit(r.id)}
              >
                Sign Recruit
              </button>
            </div>
          ))}
          {game.recruitPool.length === 0 && <p className="muted">No recruits currently available. Check back after advancing the day.</p>}
        </div>
      </Panel>
    </div>
  )
}
