"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"

interface CommentFormProps {
  ideaId: string
  parentId?: string
  onSuccess?: () => void
  placeholder?: string
  autoFocus?: boolean
}

export function CommentForm({
  ideaId,
  parentId,
  onSuccess,
  placeholder = "Share your thoughts…",
  autoFocus = false,
}: CommentFormProps) {
  const [user, setUser] = useState<User | null>(null)
  const [authLoaded, setAuthLoaded] = useState(false)
  const router = useRouter()
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setAuthLoaded(true)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
      setAuthLoaded(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  function signIn() {
    supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback` },
    })
  }

  if (!authLoaded) {
    return null
  }

  if (!user) {
    return (
      <p className="text-sm text-muted">
        <button
          onClick={signIn}
          className="text-accent hover:underline"
        >
          Sign in
        </button>{" "}
        to leave a comment.
      </p>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim() || loading) return
    setLoading(true)

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ideaId, content, parentId }),
      })
      if (!res.ok) throw new Error("Failed to post comment")
      setContent("")
      router.refresh()
      onSuccess?.()
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        rows={3}
        className="w-full text-sm text-ink bg-base border border-hairline px-3 py-2 resize-none focus:outline-none focus:border-accent transition-colors placeholder:text-muted"
      />
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!content.trim() || loading}
          className="text-sm font-medium bg-ink text-base px-4 py-1.5 hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? "Posting…" : "Post"}
        </button>
      </div>
    </form>
  )
}
