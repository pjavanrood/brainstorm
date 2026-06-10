import { Suspense } from "react"
import { prisma } from "@/lib/prisma"
import { IdeaCard } from "@/components/IdeaCard"
import { Sidebar } from "@/components/Sidebar"

interface PageProps {
  searchParams: Promise<{ tag?: string }>
}

async function getFeed(tag?: string) {
  return prisma.idea.findMany({
    where: tag ? { tags: { some: { tag: { name: tag } } } } : undefined,
    include: {
      author: { select: { id: true, name: true } },
      tags: { include: { tag: true } },
      _count: { select: { comments: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

async function getTags() {
  return prisma.tag.findMany({
    include: { _count: { select: { ideas: true } } },
    orderBy: { name: "asc" },
  })
}

export default async function FeedPage({ searchParams }: PageProps) {
  const { tag } = await searchParams
  const [ideas, tags] = await Promise.all([getFeed(tag), getTags()])

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex gap-12">
        <Suspense>
          <Sidebar tags={tags} />
        </Suspense>

        <div className="flex-1 min-w-0">
          {tag && (
            <p className="text-sm text-muted mb-2">
              Showing ideas tagged{" "}
              <span className="text-accent font-medium">{tag}</span>
            </p>
          )}
          {ideas.length === 0 ? (
            <p className="text-sm text-muted py-8">No ideas yet. Be the first to post.</p>
          ) : (
            <div>
              {ideas.map((idea) => (
                <IdeaCard key={idea.id} idea={idea} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
