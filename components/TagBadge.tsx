interface TagBadgeProps {
  name: string
  active?: boolean
  variant?: "market" | "field"
}

export function TagBadge({ name, active, variant = "field" }: TagBadgeProps) {
  const color = active
    ? "text-accent"
    : variant === "market"
    ? "text-ink font-medium"
    : "text-muted"

  return (
    <span className={`text-xs tracking-wide uppercase ${color}`}>
      {name}
    </span>
  )
}
