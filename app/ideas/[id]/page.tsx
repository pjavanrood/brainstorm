import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { TagBadge } from "@/components/TagBadge"
import { CommentThread } from "@/components/CommentThread"
import { MarkdownPreview } from "@/components/MarkdownPreview"

interface PageProps {
  params: Promise<{ id: string }>
}

function timeAgo(date: Date | string) {
  const d = new Date(date)
  const diff = Date.now() - d.getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return "Today"
  if (days === 1) return "Yesterday"
  if (days < 30) return `${days} days ago`
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
}

export default async function IdeaPage({ params }: PageProps) {
  const { id } = await params

  const [idea, comments] = await Promise.all([
    prisma.idea.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true } },
        tags: { include: { tag: true } },
      },
    }),
    prisma.comment.findMany({
      where: { ideaId: id, parentId: null },
      include: {
        author: { select: { id: true, name: true } },
        replies: {
          include: { author: { select: { id: true, name: true } } },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "asc" },
    }),
  ])

  if (!idea) notFound()

  const serializedComments = comments.map((c: typeof comments[number]) => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
    replies: c.replies.map((r: typeof c.replies[number]) => ({ ...r, createdAt: r.createdAt.toISOString() })),
  }))

  return (
    <div className="max-w-prose mx-auto px-6 py-12">
      <article>
        <header className="mb-8">
          <h1 className="font-sans font-bold text-2xl text-ink leading-snug mb-2">
            {idea.title}
          </h1>
          <p className="text-muted text-base mb-4">{idea.oneLiner}</p>
          <div className="flex items-center gap-4 text-xs text-muted">
            <span className="font-medium text-ink">{idea.author.name}</span>
            <span>{timeAgo(idea.createdAt)}</span>
          </div>
          {idea.tags.length > 0 && (
            <div className="flex gap-3 mt-3">
              {idea.tags.map(({ tag }: { tag: { id: string; name: string } }) => (
                <TagBadge key={tag.name} name={tag.name} />
              ))}
            </div>
          )}
        </header>

        <div className="border-t border-hairline pt-6 mb-10">
          <MarkdownPreview source={idea.explanation} />
        </div>
      </article>

      <section>
        <h2 className="font-sans font-semibold text-sm uppercase tracking-widest text-muted mb-6">
          Comments ({comments.length})
        </h2>
        <div className="border-t border-hairline">
          <CommentThread comments={serializedComments} ideaId={id} />
        </div>
      </section>
    </div>
  )
}
