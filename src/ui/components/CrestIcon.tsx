interface CrestIconProps {
  size?: number
}

export function CrestIcon({ size = 40 }: CrestIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className="crest-icon" aria-hidden="true">
      <path
        d="M32 4 L58 14 V32 C58 46 47 56 32 60 C17 56 6 46 6 32 V14 Z"
        fill="var(--crest-fill)"
        stroke="var(--crest-stroke)"
        strokeWidth="2.5"
      />
      <path d="M32 14 L48 21 V33 C48 42 41 49 32 52 C23 49 16 42 16 33 V21 Z" fill="none" stroke="var(--crest-stroke)" strokeWidth="1.5" />
      <path d="M32 22 L32 44 M22 33 L42 33" stroke="var(--crest-stroke)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
