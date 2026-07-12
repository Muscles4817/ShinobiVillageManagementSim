import type { GameState } from '../../domain/types'
import { Panel } from '../components/Panel'
import { useGameStore } from '../../state/gameStore'
import { facilityDefinitionById } from '../../content/facilities'
import { canStartUpgrade, nextLevelDefinition } from '../../sim/construction'

interface VillageScreenProps {
  game: GameState
}

const TIER_ORDER = ['outpost', 'recognised_settlement', 'minor_hidden_village', 'regional_power']

export function VillageScreen({ game }: VillageScreenProps) {
  const startFacilityUpgrade = useGameStore((s) => s.startFacilityUpgrade)
  const tierIndex = TIER_ORDER.indexOf(game.village.tier)
  const nextTier = TIER_ORDER[tierIndex + 1]

  return (
    <div className="screen village-screen">
      <Panel title="Village Standing" className="village-tier-panel">
        <p>
          {game.village.villageName} is currently a <strong>{game.village.tier.replace(/_/g, ' ')}</strong>.
        </p>
        {nextTier ? (
          <p className="muted">Growing reputation and completing contracts will help the Enclave grow into a {nextTier.replace(/_/g, ' ')}.</p>
        ) : (
          <p className="muted">The Enclave has reached the highest tier modelled in this vertical slice.</p>
        )}
      </Panel>

      <div className="facility-grid">
        {game.facilities.map((facility) => {
          const def = facilityDefinitionById(facility.id)
          const currentLevelDef = def.levels.find((l) => l.level === facility.level)
          const next = nextLevelDefinition(def, facility.level)
          const check = canStartUpgrade(facility, def, game.village.funds)

          return (
            <Panel key={facility.id} title={def.name} className="facility-card">
              <p className="muted">{def.description}</p>
              <div className="facility-level-row">
                <span>Level {facility.level}</span>
                {facility.upgrading && <span className="muted">Upgrading — completes day {facility.constructionEndsDay}</span>}
              </div>
              {currentLevelDef && (
                <ul className="unlock-list">
                  {currentLevelDef.unlocks.map((u) => (
                    <li key={u}>{u}</li>
                  ))}
                </ul>
              )}
              {next && (
                <div className="facility-upgrade">
                  <h4>
                    Upgrade to Level {next.level} — {next.cost} coin, {next.buildDays}d
                  </h4>
                  <p className="muted">{next.description}</p>
                  <button className="btn-primary" disabled={!check.ok} onClick={() => startFacilityUpgrade(facility.id)}>
                    Start Upgrade
                  </button>
                  {!check.ok && check.reason && <p className="form-error">{check.reason}</p>}
                </div>
              )}
              {!next && <p className="muted">Already at maximum level.</p>}
            </Panel>
          )
        })}
      </div>
    </div>
  )
}
