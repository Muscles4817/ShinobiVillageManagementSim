function hashString(seed: string): number {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash)
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/)
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')
}

interface AvatarProps {
  name: string
  size?: number
  dimmed?: boolean
}

export function Avatar({ name, size = 48, dimmed = false }: AvatarProps) {
  const hash = hashString(name)
  const hue = hash % 360
  const background = `hsl(${hue}, 38%, ${dimmed ? 28 : 34}%)`
  const ring = `hsl(${hue}, 50%, ${dimmed ? 40 : 58}%)`

  return (
    <div
      className="avatar"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        background,
        borderColor: ring,
        opacity: dimmed ? 0.55 : 1,
      }}
    >
      {initialsOf(name)}
    </div>
  )
}
