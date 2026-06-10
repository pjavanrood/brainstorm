"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"
import "@uiw/react-md-editor/markdown-editor.css"

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false })

interface Tag {
  id: string
  name: string
}

const MARKET_OPTIONS = ["Consumer", "B2B", "B2B2C", "Enterprise"]

export default function NewIdeaPage() {
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const router = useRouter()
  const [fieldTags, setFieldTags] = useState<Tag[]>([])
  const [title, setTitle] = useState("")
  const [oneLiner, setOneLiner] = useState("")
  const [explanation, setExplanation] = useState("")
  const [marketType, setMarketType] = useState("")
  const [marketOtherText, setMarketOtherText] = useState("")
  const [selectedFieldIds, setSelectedFieldIds] = useState<string[]>([])
  const [fieldOtherActive, setFieldOtherActive] = useState(false)
  const [fieldOtherText, setFieldOtherText] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const supabase = createClient()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
      setAuthLoading(false)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    fetch("/api/tags").then((r) => r.json()).then(setFieldTags)
  }, [])

  function signIn() {
    supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback` },
    })
  }

  if (authLoading) return null

  if (!user) {
    return (
      <div className="max-w-prose mx-auto px-6 py-20 text-center">
        <p className="text-muted text-sm mb-4">You need to sign in to post an idea.</p>
        <button
          onClick={signIn}
          className="bg-ink text-base text-sm font-medium px-5 py-2 hover:bg-accent transition-colors"
        >
          Sign in with Google
        </button>
      </div>
    )
  }

  function toggleMarket(option: string) {
    if (marketType === option) {
      setMarketType("")
    } else {
      setMarketType(option)
      if (option !== "Other") setMarketOtherText("")
    }
  }

  function toggleField(id: string) {
    setSelectedFieldIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    )
  }

  function toggleFieldOther() {
    setFieldOtherActive((prev) => {
      if (prev) setFieldOtherText("")
      return !prev
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !oneLiner.trim() || !explanation.trim()) {
      setError("Please fill in all required fields.")
      return
    }
    const effectiveMarket = marketType === "Other" ? marketOtherText.trim() : marketType
    if (marketType === "Other" && !effectiveMarket) {
      setError("Please describe your market type.")
      return
    }
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          oneLiner,
          explanation,
          marketType: effectiveMarket || null,
          fieldTagIds: selectedFieldIds,
          customField: fieldOtherActive && fieldOtherText.trim() ? fieldOtherText.trim() : undefined,
        }),
      })
      if (!res.ok) throw new Error("Failed to post")
      const idea = await res.json()
      router.push(`/ideas/${idea.id}`)
    } catch {
      setError("Something went wrong. Please try again.")
      setLoading(false)
    }
  }

  const btnBase = "text-xs font-medium px-3 py-1 border transition-colors"
  const btnActive = "border-accent text-accent"
  const btnInactive = "border-hairline text-muted hover:border-ink hover:text-ink"

  return (
    <div className="max-w-prose mx-auto px-6 py-12">
      <h1 className="font-sans font-bold text-2xl text-ink mb-8">Post an idea</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-xs font-medium uppercase tracking-widest text-muted mb-2">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What's your idea called?"
            className="w-full text-sm text-ink bg-base border border-hairline px-3 py-2 focus:outline-none focus:border-accent transition-colors placeholder:text-muted"
          />
        </div>

        <div>
          <label className="block text-xs font-medium uppercase tracking-widest text-muted mb-2">
            One-liner{" "}
            <span className="normal-case tracking-normal font-normal">
              ({120 - oneLiner.length} chars left)
            </span>
          </label>
          <input
            type="text"
            value={oneLiner}
            onChange={(e) => setOneLiner(e.target.value.slice(0, 120))}
            placeholder="Describe your idea in one sentence"
            className="w-full text-sm text-ink bg-base border border-hairline px-3 py-2 focus:outline-none focus:border-accent transition-colors placeholder:text-muted"
          />
        </div>

        <div>
          <label className="block text-xs font-medium uppercase tracking-widest text-muted mb-2">
            Explanation
          </label>
          <div data-color-mode="light">
            <MDEditor
              value={explanation}
              onChange={(val) => setExplanation(val ?? "")}
              preview="live"
              height={320}
              textareaProps={{ placeholder: "Describe the problem, your solution, and who it's for…" }}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium uppercase tracking-widest text-muted mb-3">
            Market
          </label>
          <div className="flex flex-wrap gap-2">
            {MARKET_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => toggleMarket(option)}
                className={`${btnBase} ${marketType === option ? btnActive : btnInactive}`}
              >
                {option}
              </button>
            ))}
            <button
              type="button"
              onClick={() => toggleMarket("Other")}
              className={`${btnBase} ${marketType === "Other" ? btnActive : btnInactive}`}
            >
              Other
            </button>
          </div>
          {marketType === "Other" && (
            <input
              type="text"
              value={marketOtherText}
              onChange={(e) => setMarketOtherText(e.target.value.slice(0, 30))}
              placeholder="Describe your market (30 chars)"
              className="mt-2 w-full text-sm text-ink bg-base border border-hairline px-3 py-2 focus:outline-none focus:border-accent transition-colors placeholder:text-muted"
            />
          )}
        </div>

        {fieldTags.length > 0 && (
          <div>
            <label className="block text-xs font-medium uppercase tracking-widest text-muted mb-3">
              Field
            </label>
            <div className="flex flex-wrap gap-2">
              {fieldTags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleField(tag.id)}
                  className={`${btnBase} ${selectedFieldIds.includes(tag.id) ? btnActive : btnInactive}`}
                >
                  {tag.name}
                </button>
              ))}
              <button
                type="button"
                onClick={toggleFieldOther}
                className={`${btnBase} ${fieldOtherActive ? btnActive : btnInactive}`}
              >
                Other
              </button>
            </div>
            {fieldOtherActive && (
              <input
                type="text"
                value={fieldOtherText}
                onChange={(e) => setFieldOtherText(e.target.value.slice(0, 30))}
                placeholder="Describe your field (30 chars)"
                className="mt-2 w-full text-sm text-ink bg-base border border-hairline px-3 py-2 focus:outline-none focus:border-accent transition-colors placeholder:text-muted"
              />
            )}
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-ink text-base text-sm font-medium px-6 py-2 hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? "Posting…" : "Post idea"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="text-sm text-muted hover:text-ink transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
