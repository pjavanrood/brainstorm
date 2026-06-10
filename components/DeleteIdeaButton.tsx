"use client"

import { useRouter } from "next/navigation"

export function DeleteIdeaButton({ ideaId }: { ideaId: string }) {
  const router = useRouter()

  async function handleDelete() {
    if (!window.confirm("Delete this idea? This cannot be undone.")) return
    const res = await fetch(`/api/ideas/${ideaId}`, { method: "DELETE" })
    if (res.ok) router.push("/")
  }

  return (
    <button
      onClick={handleDelete}
      className="text-xs text-red-500 hover:text-red-700 transition-colors"
    >
      Delete idea
    </button>
  )
}
