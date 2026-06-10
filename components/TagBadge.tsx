interface TagBadgeProps {
  name: string
  active?: boolean
}

export function TagBadge({ name, active }: TagBadgeProps) {
  return (
    <span
      className={`text-xs font-medium tracking-wide uppercase ${
        active ? "text-accent" : "text-muted"
      }`}
    >
      {name}
    </span>
  )
}
