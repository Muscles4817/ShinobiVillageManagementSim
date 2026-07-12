import type { GameState, TrainingCategory } from '../../domain/types'
import { Modal } from '../components/Modal'
import { Avatar } from '../components/Avatar'
import { Meter } from '../components/Meter'
import { rankById } from '../../content/ranks'
import { traitById } from '../../content/traits'
import { techniqueById } from '../../content/techniques'
import { injuryById } from '../../content/injuries'
import { missionTemplateById } from '../../content/missionTemplates'
import { effectiveAttributes } from '../../sim/warriorSim'
import { useGameStore } from '../../state/gameStore'
import { trainingCategoryLabel } from '../../sim/training'

const ATTRIBUTE_LABELS: Record<string, string> = {
  combat: 'Combat',
  technique: 'Technique',
  control: 'Control',
  intelligence: 'Intelligence',
  mobility: 'Mobility',
  presence: 'Presence',
  resilience: 'Resilience',
}

const TRAINING_CATEGORIES: TrainingCategory[] = [
  'combat_drills',
  'technique_practice',
  'mobility_training',
  'leadership_development',
  'medical_training',
  'investigation_training',
  'team_exercises',
  'recovery_conditioning',
]
const TRAINING_OPTIONS: { id: TrainingCategory; label: string }[] = TRAINING_CATEGORIES.map((id) => ({ id, label: trainingCategoryLabel(id) }))

interface CharacterDetailModalProps {
  game: GameState
  warriorId: string
  onClose: () => void
}

export function CharacterDetailModal({ game, warriorId, onClose }: CharacterDetailModalProps) {
  const warrior = game.warriors.find((w) => w.id === warriorId)
  const setTraining = useGameStore((s) => s.setTraining)
  if (!warrior) return null

  const attrs = effectiveAttributes(warrior)
  const team = game.teams.find((t) => t.id === warrior.teamId)
  const rank = rankById(warrior.rank)

  return (
    <Modal title={warrior.name} onClose={onClose} wide>
      <div className="character-detail">
        <div className="character-detail-header">
          <Avatar name={warrior.name} size={80} />
          <div>
            <div className="character-detail-title">
              {rank.name} · {warrior.archetype}
            </div>
            <div className="muted">Age {warrior.age} · Joined day {warrior.joinedDay}</div>
            {team && <div className="muted">Team: {team.name}</div>}
            {warrior.background && <p className="character-background">{warrior.background}</p>}
            {warrior.hiddenLoyaltyNote && <p className="character-warning">{warrior.hiddenLoyaltyNote}</p>}
          </div>
        </div>

        <div className="character-detail-columns">
          <div>
            <h4>Attributes</h4>
            {Object.entries(attrs).map(([key, value]) => (
              <Meter key={key} label={ATTRIBUTE_LABELS[key]} value={value} />
            ))}
          </div>
          <div>
            <h4>Condition</h4>
            <Meter label="Health" value={warrior.health} tone={warrior.health > 60 ? 'good' : 'warning'} />
            <Meter label="Fatigue" value={warrior.fatigue} tone={warrior.fatigue > 70 ? 'danger' : warrior.fatigue > 40 ? 'warning' : 'good'} />
            <Meter label="Morale" value={warrior.morale} tone={warrior.morale > 50 ? 'good' : 'warning'} />
            <Meter label="Loyalty" value={warrior.loyalty} tone={warrior.loyalty > 50 ? 'good' : 'warning'} />
            <div className="muted">Experience: {warrior.experience}</div>

            {warrior.injuries.length > 0 && (
              <div className="injury-list">
                <h4>Injuries</h4>
                {warrior.injuries.map((inj, idx) => {
                  const def = injuryById(inj.injuryId)
                  return (
                    <div key={idx} className="injury-row">
                      {def.name} — {inj.daysRemaining}d remaining
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <div className="character-detail-columns">
          <div>
            <h4>Traits</h4>
            <ul className="trait-list">
              {warrior.traitIds.map((id) => {
                const trait = traitById(id)
                return (
                  <li key={id}>
                    <strong>{trait.name}</strong> — {trait.description}
                  </li>
                )
              })}
            </ul>
          </div>
          <div>
            <h4>Techniques</h4>
            {warrior.techniqueIds.length === 0 && <p className="muted">No techniques learned yet.</p>}
            <ul className="trait-list">
              {warrior.techniqueIds.map((id) => {
                const tech = techniqueById(id)
                return (
                  <li key={id}>
                    <strong>{tech.name}</strong> — {tech.description}
                  </li>
                )
              })}
            </ul>
          </div>
        </div>

        <div>
          <h4>Training Assignment</h4>
          <div className="training-controls">
            <button
              className={`training-option ${!game.trainingAssignments[warrior.id] ? 'training-option-active' : ''}`}
              disabled={warrior.status !== 'available' && warrior.status !== 'training'}
              onClick={() => setTraining(warrior.id, null)}
            >
              None
            </button>
            {TRAINING_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                className={`training-option ${game.trainingAssignments[warrior.id] === opt.id ? 'training-option-active' : ''}`}
                disabled={warrior.status !== 'available' && warrior.status !== 'training'}
                onClick={() => setTraining(warrior.id, opt.id)}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {warrior.status !== 'available' && warrior.status !== 'training' && (
            <p className="muted">This operative must be available at the Enclave to train.</p>
          )}
        </div>

        <div>
          <h4>Mission History</h4>
          {warrior.missionHistory.length === 0 && <p className="muted">No contracts completed yet.</p>}
          <ul className="history-list">
            {[...warrior.missionHistory]
              .reverse()
              .slice(0, 8)
              .map((h, idx) => (
                <li key={idx}>
                  Day {h.day}: {missionTemplateById(h.templateId).title} — {h.outcome.replace(/_/g, ' ')}
                </li>
              ))}
          </ul>
        </div>
      </div>
    </Modal>
  )
}
