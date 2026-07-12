import type { GameState } from '../../domain/types'
import { Panel } from '../components/Panel'
import { missionTemplateById } from '../../content/missionTemplates'
import { facilityDefinitionById } from '../../content/facilities'
import type { ScreenId } from '../navigation'

interface OverviewScreenProps {
  game: GameState
  onNavigate: (screen: ScreenId) => void
}

export function OverviewScreen({ game, onNavigate }: OverviewScreenProps) {
  const injured = game.warriors.filter((w) => w.injuries.length > 0)
  const availableCount = game.warriors.filter((w) => w.status === 'available').length
  const trainingCount = game.warriors.filter((w) => w.status === 'training').length
  const constructing = game.facilities.filter((f) => f.upgrading)
  const acceptedContracts = game.contracts.filter((c) => c.status === 'accepted')

  return (
    <div className="screen overview-screen">
      <div className="overview-grid">
        <Panel title="The Enclave" className="overview-summary">
          <p className="lede">
            {game.village.villageName} stands as a <strong>{game.village.tier.replace(/_/g, ' ')}</strong> on day {game.village.day}.
          </p>
          <div className="overview-quick-stats">
            <div>
              <strong>{game.warriors.length}</strong>
              <span>Warriors</span>
            </div>
            <div>
              <strong>{availableCount}</strong>
              <span>Available</span>
            </div>
            <div>
              <strong>{trainingCount}</strong>
              <span>Training</span>
            </div>
            <div>
              <strong>{game.teams.length}</strong>
              <span>Teams</span>
            </div>
          </div>
        </Panel>

        <Panel title="Alerts">
          {injured.length === 0 && game.pendingEvents.length === 0 && game.activeMissions.length === 0 && (
            <p className="muted">Nothing urgent needs your attention.</p>
          )}
          {injured.length > 0 && (
            <button className="alert-row" onClick={() => onNavigate('roster')}>
              ⚕ {injured.length} operative{injured.length > 1 ? 's' : ''} recovering from injury
            </button>
          )}
          {game.pendingEvents.length > 0 && (
            <button className="alert-row" onClick={() => onNavigate('intelligence')}>
              ❗ {game.pendingEvents.length} situation{game.pendingEvents.length > 1 ? 's' : ''} awaiting your decision
            </button>
          )}
          {game.village.security < 35 && (
            <button className="alert-row" onClick={() => onNavigate('village')}>
              🛡 Village security is low ({game.village.security})
            </button>
          )}
          {acceptedContracts.length > 0 && (
            <button className="alert-row" onClick={() => onNavigate('missions')}>
              📜 {acceptedContracts.length} accepted contract{acceptedContracts.length > 1 ? 's' : ''} awaiting a team
            </button>
          )}
        </Panel>

        <Panel title="Active Missions">
          {game.activeMissions.length === 0 && <p className="muted">No teams are currently in the field.</p>}
          {game.activeMissions.map((m) => {
            const team = game.teams.find((t) => t.id === m.teamId)
            const template = missionTemplateById(m.templateId)
            const phase = m.travelDaysRemaining > 0 ? 'Travelling to site' : m.missionDaysRemaining > 0 ? 'On contract' : 'Returning home'
            return (
              <div key={m.id} className="active-mission-row">
                <div>
                  <strong>{team?.name ?? 'Unknown team'}</strong> — {template.title}
                </div>
                <div className="muted">
                  {phase} · returns day {m.expectedReturnDay}
                </div>
              </div>
            )
          })}
        </Panel>

        <Panel title="Construction">
          {constructing.length === 0 && <p className="muted">No facilities are currently under construction.</p>}
          {constructing.map((f) => {
            const def = facilityDefinitionById(f.id)
            return (
              <div key={f.id} className="active-mission-row">
                <strong>{def.name}</strong>
                <div className="muted">Completes day {f.constructionEndsDay}</div>
              </div>
            )
          })}
        </Panel>

        <Panel title="Rival: Ironvale Enclave">
          <div className="rival-stats">
            <span>Relationship: {game.rival.relationship}</span>
            <span>Strength: {game.rival.strength}</span>
            <span>Hostility: {game.rival.hostility}</span>
          </div>
          <ul className="rival-actions">
            {game.rival.recentActions
              .slice(-3)
              .reverse()
              .map((action, idx) => (
                <li key={idx}>{action}</li>
              ))}
          </ul>
        </Panel>
      </div>
    </div>
  )
}
