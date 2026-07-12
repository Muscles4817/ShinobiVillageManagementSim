import { useState } from 'react'
import type { GameState } from '../../domain/types'
import { Panel } from '../components/Panel'
import { ContractCard } from '../components/ContractCard'
import { useGameStore } from '../../state/gameStore'
import { missionTemplateById } from '../../content/missionTemplates'
import { assessStage, STAGE_ASSESSMENT_LABEL } from '../missionAssessment'

interface MissionsScreenProps {
  game: GameState
}

function AssignmentPanel({ game, contractId, onDone }: { game: GameState; contractId: string; onDone: () => void }) {
  const contract = game.contracts.find((c) => c.id === contractId)
  const assignTeamToMission = useGameStore((s) => s.assignTeamToMission)
  const [selectedTeamId, setSelectedTeamId] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  if (!contract) return null

  const template = missionTemplateById(contract.templateId)
  const idleTeams = game.teams.filter((t) => t.status === 'idle')
  const selectedTeam = idleTeams.find((t) => t.id === selectedTeamId)

  function submit() {
    if (!selectedTeamId) return setError('Choose a team to assign.')
    const result = assignTeamToMission(contractId, selectedTeamId)
    if (!result.ok) setError(result.reason ?? 'Could not assign team.')
    else onDone()
  }

  return (
    <Panel title={`Assign a Team: ${contract.title}`}>
      {idleTeams.length === 0 && <p className="muted">No teams are currently available at the Enclave.</p>}
      <div className="member-picker">
        {idleTeams.map((t) => (
          <button key={t.id} className={`member-chip ${selectedTeamId === t.id ? 'member-chip-selected' : ''}`} onClick={() => setSelectedTeamId(t.id)}>
            {t.name}
          </button>
        ))}
      </div>

      {selectedTeam && (
        <div className="stage-assessment">
          <h4>Estimated Capability</h4>
          {template.stages.map((stage) => {
            const assessment = assessStage(selectedTeam, game.warriors, template, stage.id)
            return (
              <div key={stage.id} className="stage-assessment-row">
                <span>{stage.label}</span>
                <span className={`assessment-badge assessment-${assessment}`}>{STAGE_ASSESSMENT_LABEL[assessment]}</span>
              </div>
            )
          })}
          <p className="muted">This estimate is based on known information only — real outcomes can still surprise you.</p>
        </div>
      )}

      {error && <p className="form-error">{error}</p>}

      <div className="form-actions">
        <button className="btn-primary" onClick={submit}>
          Deploy Team
        </button>
        <button className="btn-secondary" onClick={onDone}>
          Cancel
        </button>
      </div>
    </Panel>
  )
}

export function MissionsScreen({ game }: MissionsScreenProps) {
  const acceptContract = useGameStore((s) => s.acceptContract)
  const [assigning, setAssigning] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const available = game.contracts.filter((c) => c.status === 'available')
  const accepted = game.contracts.filter((c) => c.status === 'accepted')
  const active = game.contracts.filter((c) => c.status === 'active')

  function handleAccept(id: string) {
    const result = acceptContract(id)
    if (!result.ok) setError(result.reason ?? 'Could not accept contract.')
    else setError(null)
  }

  return (
    <div className="screen missions-screen">
      {error && <p className="form-error">{error}</p>}

      {assigning && (
        <AssignmentPanel
          game={game}
          contractId={assigning}
          onDone={() => setAssigning(null)}
        />
      )}

      <Panel title={`Accepted Contracts Awaiting Assignment (${accepted.length})`}>
        {accepted.length === 0 && <p className="muted">Nothing waiting on a team right now.</p>}
        <div className="contract-grid">
          {accepted.map((c) => (
            <ContractCard
              key={c.id}
              contract={c}
              actions={
                <button className="btn-primary" onClick={() => setAssigning(c.id)}>
                  Assign Team
                </button>
              }
            />
          ))}
        </div>
      </Panel>

      <Panel title={`Active Missions (${active.length})`}>
        {active.length === 0 && <p className="muted">No missions currently underway.</p>}
        <div className="contract-grid">
          {active.map((c) => {
            const mission = game.activeMissions.find((m) => m.contractId === c.id)
            const team = game.teams.find((t) => t.id === mission?.teamId)
            return (
              <ContractCard
                key={c.id}
                contract={c}
                actions={<span className="muted">{team?.name ?? 'Team'} — returns day {mission?.expectedReturnDay}</span>}
              />
            )
          })}
        </div>
      </Panel>

      <Panel title={`Available Contracts (${available.length})`}>
        {available.length === 0 && <p className="muted">No new contracts have come in today.</p>}
        <div className="contract-grid">
          {available.map((c) => (
            <ContractCard
              key={c.id}
              contract={c}
              actions={
                <button className="btn-primary" onClick={() => handleAccept(c.id)}>
                  Accept
                </button>
              }
            />
          ))}
        </div>
      </Panel>
    </div>
  )
}
