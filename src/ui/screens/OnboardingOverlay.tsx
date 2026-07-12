import { useState } from 'react'
import { Modal } from '../components/Modal'
import { useGameStore } from '../../state/gameStore'

const STEPS: { title: string; body: string }[] = [
  {
    title: 'A Struggling Settlement',
    body: 'You have just taken leadership of a small, newly founded Enclave. It has little money, little reputation, and a handful of operatives willing to follow you.',
  },
  {
    title: 'Contracts Are Everything',
    body: 'Accepting and completing contracts is how the Enclave earns coin and standing in the Reach. Check the Missions screen often.',
  },
  {
    title: 'Every Operative Is Different',
    body: 'Warriors have different attributes, traits, and specialities. A well-matched team will outperform a stronger but poorly suited one.',
  },
  {
    title: 'Deployed Teams Are Unavailable',
    body: 'Once a team departs on a contract, its members cannot train, join another mission, or defend the village until they return.',
  },
  {
    title: 'Fatigue and Injury Matter',
    body: 'Tired or injured operatives perform worse and risk further harm. Rest and treatment are real strategic choices, not busywork.',
  },
  {
    title: 'Build for the Future',
    body: 'Facilities in the Village screen unlock new systems entirely — more contracts, faster healing, better recruits, and stronger defence.',
  },
]

export function OnboardingOverlay() {
  const completeOnboarding = useGameStore((s) => s.completeOnboarding)
  const [step, setStep] = useState(0)
  const isLast = step === STEPS.length - 1
  const current = STEPS[step]

  return (
    <Modal title={current.title} onClose={completeOnboarding}>
      <p>{current.body}</p>
      <div className="onboarding-footer">
        <span className="muted">
          {step + 1} / {STEPS.length}
        </span>
        <div className="form-actions">
          <button className="btn-secondary" onClick={completeOnboarding}>
            Skip
          </button>
          <button className="btn-primary" onClick={() => (isLast ? completeOnboarding() : setStep((s) => s + 1))}>
            {isLast ? 'Begin' : 'Next'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
