import type { GameState } from '../../domain/types'

interface StatBarProps {
  game: GameState
  onAdvanceDay: () => void
}

export function StatBar({ game, onAdvanceDay }: StatBarProps) {
  const injuredCount = game.warriors.filter((w) => w.injuries.length > 0).length
  const pendingEventCount = game.pendingEvents.length

  return (
    <div className="stat-bar">
      <div className="stat-bar-item stat-day">Day {game.village.day}</div>
      <div className="stat-bar-item" title="Funds">
        🪙 {Math.round(game.village.funds)}
      </div>
      <div className="stat-bar-item" title="Reputation">
        ⚑ {Math.round(game.village.reputation)}
      </div>
      <div className="stat-bar-item" title="Supplies">
        📦 {Math.round(game.village.supplies)}
      </div>
      <div className="stat-bar-item" title="Intel">
        🔎 {Math.round(game.village.intel)}
      </div>
      <div className="stat-bar-item" title="Security">
        🛡 {Math.round(game.village.security)}
      </div>
      {injuredCount > 0 && <div className="stat-bar-item stat-alert">⚕ {injuredCount} injured</div>}
      {pendingEventCount > 0 && <div className="stat-bar-item stat-alert">❗ {pendingEventCount} event{pendingEventCount > 1 ? 's' : ''}</div>}
      <button className="advance-day-btn" onClick={onAdvanceDay}>
        Advance Day →
      </button>
    </div>
  )
}
