import Link from "next/link"
import { TagBadge } from "./TagBadge"

interface IdeaCardProps {
  idea: {
    id: string
    title: string
    oneLiner: string
    createdAt: Date | string
    author: { name: string | null }
    tags: { tag: { name: string } }[]
    _count: { comments: number }
  }
}

function timeAgo(date: Date | string) {
  const d = new Date(date)
  const diff = Date.now() - d.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

export function IdeaCard({ idea }: IdeaCardProps) {
  return (
    <Link href={`/ideas/${idea.id}`} className="block no-underline group">
      <article className="py-5 border-b border-hairline flex items-start justify-between gap-6">
        <div className="flex-1 min-w-0">
          <h2 className="font-sans font-bold text-ink text-base leading-snug group-hover:text-accent transition-colors">
            {idea.title}
          </h2>
          <p className="text-muted text-sm mt-0.5 leading-snug">{idea.oneLiner}</p>
          {idea.tags.length > 0 && (
            <div className="flex gap-3 mt-2">
              {idea.tags.map(({ tag }) => (
                <TagBadge key={tag.name} name={tag.name} />
              ))}
            </div>
          )}
        </div>
        <div className="text-right text-xs text-muted tabular-nums shrink-0 pt-0.5 leading-relaxed">
          <div className="font-medium text-ink">{idea.author.name}</div>
          <div>{timeAgo(idea.createdAt)}</div>
          <div>{idea._count.comments} {idea._count.comments === 1 ? "comment" : "comments"}</div>
        </div>
      </article>
    </Link>
  )
}
