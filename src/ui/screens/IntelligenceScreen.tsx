import type { GameState } from '../../domain/types'
import { Panel } from '../components/Panel'
import { useGameStore } from '../../state/gameStore'
import { eventTemplateById } from '../../content/events'

interface IntelligenceScreenProps {
  game: GameState
}

export function IntelligenceScreen({ game }: IntelligenceScreenProps) {
  const resolveEventChoice = useGameStore((s) => s.resolveEventChoice)
  const intelOffice = game.facilities.find((f) => f.id === 'intel_office')

  return (
    <div className="screen intelligence-screen">
      <Panel title={`Intelligence Office (Level ${intelOffice?.level ?? 0})`}>
        <p className="muted">
          Current intel: <strong>{Math.round(game.village.intel)}</strong>. Higher intel improves contract information and reveals more about
          rival activity.
        </p>
        {(intelOffice?.level ?? 0) === 0 && <p className="muted">Build the Intelligence Office in the Village screen to unlock deeper visibility.</p>}
      </Panel>

      <Panel title="Situations Requiring a Decision">
        {game.pendingEvents.length === 0 && <p className="muted">Nothing currently requires a decision.</p>}
        {game.pendingEvents.map((instance) => {
          const template = eventTemplateById(instance.templateId)
          return (
            <div key={instance.id} className="event-card">
              <h4>{template.title}</h4>
              <p>{template.prompt}</p>
              <div className="event-choices">
                {template.choices.map((choice) => (
                  <button key={choice.id} className="btn-primary" onClick={() => resolveEventChoice(instance.id, choice.id)}>
                    {choice.label}
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </Panel>

      <Panel title="Ironvale Enclave Dossier">
        <div className="rival-stats">
          <span>Relationship: {game.rival.relationship}</span>
          <span>Strength: {game.rival.strength}</span>
          <span>Reputation: {game.rival.reputation}</span>
          <span>Hostility: {game.rival.hostility}</span>
        </div>
        <h4>Recent Activity</h4>
        <ul className="rival-actions">
          {[...game.rival.recentActions].reverse().map((action, idx) => (
            <li key={idx}>{action}</li>
          ))}
        </ul>
      </Panel>
    </div>
  )
}
