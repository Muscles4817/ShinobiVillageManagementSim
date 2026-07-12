import { NAV_ITEMS, type ScreenId } from '../navigation'
import { CrestIcon } from './CrestIcon'

interface NavBarProps {
  active: ScreenId
  onSelect: (screen: ScreenId) => void
  villageName: string
}

export function NavBar({ active, onSelect, villageName }: NavBarProps) {
  return (
    <nav className="nav-bar">
      <div className="nav-brand">
        <CrestIcon size={34} />
        <span>{villageName}</span>
      </div>
      <ul className="nav-list">
        {NAV_ITEMS.map((item) => (
          <li key={item.id}>
            <button className={`nav-item ${active === item.id ? 'nav-item-active' : ''}`} onClick={() => onSelect(item.id)}>
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
