"use client"

import { useRouter, useSearchParams } from "next/navigation"

interface SidebarProps {
  tags: { id: string; name: string; _count: { ideas: number } }[]
}

export function Sidebar({ tags }: SidebarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeTag = searchParams.get("tag")

  function handleTag(name: string) {
    if (activeTag === name) {
      router.push("/")
    } else {
      router.push(`/?tag=${encodeURIComponent(name)}`)
    }
  }

  return (
    <aside className="w-44 shrink-0">
      <p className="text-xs font-medium uppercase tracking-widest text-muted mb-4">
        Filter
      </p>
      <ul className="space-y-2.5">
        <li>
          <button
            onClick={() => router.push("/")}
            className={`text-sm w-full text-left transition-colors ${
              !activeTag ? "text-ink font-medium" : "text-muted hover:text-ink"
            }`}
          >
            All ideas
          </button>
        </li>
        {tags.map((tag) => (
          <li key={tag.id}>
            <button
              onClick={() => handleTag(tag.name)}
              className={`text-sm w-full text-left flex items-baseline justify-between transition-colors ${
                activeTag === tag.name
                  ? "text-accent font-medium"
                  : "text-muted hover:text-ink"
              }`}
            >
              <span>{tag.name}</span>
              <span className="tabular-nums text-xs">{tag._count.ideas}</span>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  )
}
