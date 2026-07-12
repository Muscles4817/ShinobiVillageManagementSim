interface MeterProps {
  label: string
  value: number
  max?: number
  tone?: 'default' | 'good' | 'warning' | 'danger'
  suffix?: string
}

export function Meter({ label, value, max = 100, tone = 'default', suffix }: MeterProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div className="meter">
      <div className="meter-label">
        <span>{label}</span>
        <span>
          {Math.round(value)}
          {suffix ?? ''}
        </span>
      </div>
      <div className="meter-track">
        <div className={`meter-fill meter-${tone}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
