import type { GameState, TrainingCategory } from '../../domain/types'
import { Panel } from '../components/Panel'
import { Avatar } from '../components/Avatar'
import { Meter } from '../components/Meter'
import { useGameStore } from '../../state/gameStore'
import { trainingCategoryLabel } from '../../sim/training'
import { injuryById } from '../../content/injuries'

interface TrainingScreenProps {
  game: GameState
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

export function TrainingScreen({ game }: TrainingScreenProps) {
  const setTraining = useGameStore((s) => s.setTraining)
  const setMedicalPriority = useGameStore((s) => s.setMedicalPriority)

  const trainable = game.warriors.filter((w) => w.status === 'available' || w.status === 'training')
  const injured = game.warriors.filter((w) => w.injuries.length > 0)
  const trainingGrounds = game.facilities.find((f) => f.id === 'training_grounds')

  const priorityOrder = [...game.medicalPriority.filter((id) => injured.some((w) => w.id === id)), ...injured.filter((w) => !game.medicalPriority.includes(w.id)).map((w) => w.id)]

  function moveInPriority(id: string, direction: -1 | 1) {
    const idx = priorityOrder.indexOf(id)
    const swapWith = idx + direction
    if (swapWith < 0 || swapWith >= priorityOrder.length) return
    const next = [...priorityOrder]
    ;[next[idx], next[swapWith]] = [next[swapWith], next[idx]]
    setMedicalPriority(next)
  }

  return (
    <div className="screen training-screen">
      <Panel title={`Training Grounds (Level ${trainingGrounds?.level ?? 1})`}>
        <p className="muted">Assign available operatives to a training focus. Training consumes the day and builds fatigue.</p>
        <table className="training-table">
          <thead>
            <tr>
              <th>Operative</th>
              <th>Fatigue</th>
              <th>Assignment</th>
            </tr>
          </thead>
          <tbody>
            {trainable.map((w) => (
              <tr key={w.id}>
                <td>
                  <div className="training-row-name">
                    <Avatar name={w.name} size={30} />
                    {w.name}
                  </div>
                </td>
                <td style={{ minWidth: 140 }}>
                  <Meter label="" value={w.fatigue} tone={w.fatigue > 70 ? 'danger' : w.fatigue > 40 ? 'warning' : 'good'} />
                </td>
                <td>
                  <select
                    value={game.trainingAssignments[w.id] ?? ''}
                    onChange={(e) => setTraining(w.id, (e.target.value || null) as TrainingCategory | null)}
                  >
                    <option value="">None</option>
                    {TRAINING_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {trainingCategoryLabel(cat)}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>

      <Panel title="Medical Treatment Priority">
        <p className="muted">Set who gets treated first when the Medical Ward is over capacity.</p>
        {injured.length === 0 && <p className="muted">No one currently needs medical attention.</p>}
        <ol className="priority-list">
          {priorityOrder.map((id) => {
            const w = injured.find((x) => x.id === id)
            if (!w) return null
            const worst = w.injuries.reduce((a, b) => (a.daysRemaining > b.daysRemaining ? a : b))
            return (
              <li key={id} className="priority-row">
                <Avatar name={w.name} size={28} />
                <span>{w.name}</span>
                <span className="muted">{injuryById(worst.injuryId).name} — {worst.daysRemaining}d</span>
                <div className="priority-controls">
                  <button onClick={() => moveInPriority(id, -1)}>↑</button>
                  <button onClick={() => moveInPriority(id, 1)}>↓</button>
                </div>
              </li>
            )
          })}
        </ol>
      </Panel>
    </div>
  )
}
