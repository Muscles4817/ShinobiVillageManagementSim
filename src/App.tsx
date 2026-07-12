import { useState } from 'react'
import { useGameStore } from './state/gameStore'
import { NavBar } from './ui/components/NavBar'
import { StatBar } from './ui/components/StatBar'
import { NewGameScreen } from './ui/screens/NewGameScreen'
import { OnboardingOverlay } from './ui/screens/OnboardingOverlay'
import { OverviewScreen } from './ui/screens/OverviewScreen'
import { RosterScreen } from './ui/screens/RosterScreen'
import { TeamsScreen } from './ui/screens/TeamsScreen'
import { MissionsScreen } from './ui/screens/MissionsScreen'
import { VillageScreen } from './ui/screens/VillageScreen'
import { TrainingScreen } from './ui/screens/TrainingScreen'
import { IntelligenceScreen } from './ui/screens/IntelligenceScreen'
import { ReportsScreen } from './ui/screens/ReportsScreen'
import { CharacterDetailModal } from './ui/screens/CharacterDetailModal'
import type { ScreenId } from './ui/navigation'

function App() {
  const game = useGameStore((s) => s.game)
  const advanceDay = useGameStore((s) => s.advanceDay)
  const resetGame = useGameStore((s) => s.resetGame)

  const [screen, setScreen] = useState<ScreenId>('overview')
  const [selectedWarriorId, setSelectedWarriorId] = useState<string | null>(null)

  if (!game) {
    return <NewGameScreen />
  }

  return (
    <div className="app-shell">
      <NavBar active={screen} onSelect={setScreen} villageName={game.village.villageName} />
      <StatBar game={game} onAdvanceDay={advanceDay} />

      <main className="app-main">
        {screen === 'overview' && <OverviewScreen game={game} onNavigate={setScreen} />}
        {screen === 'roster' && <RosterScreen game={game} onSelectWarrior={setSelectedWarriorId} />}
        {screen === 'teams' && <TeamsScreen game={game} onSelectWarrior={setSelectedWarriorId} />}
        {screen === 'missions' && <MissionsScreen game={game} />}
        {screen === 'village' && <VillageScreen game={game} />}
        {screen === 'training' && <TrainingScreen game={game} />}
        {screen === 'intelligence' && <IntelligenceScreen game={game} />}
        {screen === 'reports' && <ReportsScreen game={game} />}
      </main>

      <footer className="app-footer">
        <button className="link-btn" onClick={resetGame}>
          Reset Game
        </button>
      </footer>

      {selectedWarriorId && <CharacterDetailModal game={game} warriorId={selectedWarriorId} onClose={() => setSelectedWarriorId(null)} />}
      {!game.onboardingComplete && <OnboardingOverlay />}
    </div>
  )
}

export default App
