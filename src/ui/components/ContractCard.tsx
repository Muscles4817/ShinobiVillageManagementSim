import type { ReactNode } from 'react'
import type { Contract } from '../../domain/types'
import { clientById } from '../../content/clients'
import { missionTemplateById } from '../../content/missionTemplates'

const DANGER_LABEL: Record<string, string> = { low: 'Low', moderate: 'Moderate', high: 'High', unknown: 'Unknown' }
const CONFIDENCE_LABEL: Record<string, string> = { poor: 'Poor', fair: 'Fair', good: 'Good' }

interface ContractCardProps {
  contract: Contract
  onClick?: () => void
  actions?: ReactNode
}

export function ContractCard({ contract, onClick, actions }: ContractCardProps) {
  const client = clientById(contract.clientId)
  const template = missionTemplateById(contract.templateId)

  return (
    <div className="contract-card" onClick={onClick}>
      <div className="contract-card-header">
        <h4>{contract.title}</h4>
        <span className={`danger-badge danger-${contract.dangerEstimate}`}>{DANGER_LABEL[contract.dangerEstimate]} danger</span>
      </div>
      <div className="contract-card-client">{client.name}</div>
      <p className="contract-card-summary">{contract.summary}</p>
      <div className="contract-card-stats">
        <span>💰 {contract.reward} coin</span>
        <span>⚑ +{contract.reputationReward} rep</span>
        <span>🕒 {contract.travelTime + contract.duration + contract.travelTime}d round trip</span>
        <span>Confidence: {CONFIDENCE_LABEL[contract.infoConfidence]}</span>
        {contract.sensitivity && <span className="sensitivity-tag">Politically Sensitive</span>}
      </div>
      <div className="contract-card-requirements">
        {template.stages.map((s) => (
          <span key={s.id} className="stage-pill">
            {s.label}
          </span>
        ))}
      </div>
      <div className="contract-card-footer">
        <span>Expires day {contract.expiryDay}</span>
        {actions}
      </div>
    </div>
  )
}
