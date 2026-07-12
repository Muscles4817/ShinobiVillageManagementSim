import { useState } from 'react'
import { useGameStore } from '../../state/gameStore'
import { CrestIcon } from '../components/CrestIcon'

export function NewGameScreen() {
  const [villageName, setVillageName] = useState('Thornwatch Enclave')
  const newGame = useGameStore((s) => s.newGame)
  const continueGame = useGameStore((s) => s.continueGame)
  const hasExistingSave = useGameStore((s) => s.hasExistingSave)

  return (
    <div className="title-screen">
      <div className="title-card">
        <CrestIcon size={72} />
        <h1>Enclave</h1>
        <p className="muted">Build a hidden warrior enclave into a power of the Reach.</p>

        {hasExistingSave && (
          <button className="btn-primary title-btn" onClick={continueGame}>
            Continue
          </button>
        )}

        <div className="new-game-form">
          <label className="field-label">
            Name Your Enclave
            <input value={villageName} onChange={(e) => setVillageName(e.target.value)} maxLength={40} />
          </label>
          <button className="btn-primary title-btn" onClick={() => newGame(villageName)}>
            {hasExistingSave ? 'Start a New Game (overwrites save)' : 'Found Your Enclave'}
          </button>
        </div>
      </div>
    </div>
  )
}
