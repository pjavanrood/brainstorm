"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

export function Nav() {
  const [user, setUser] = useState<User | null>(null)
  const [authLoaded, setAuthLoaded] = useState(false)
  const supabase = createClient()

  useEffect(() => {
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

  function signOut() {
    supabase.auth.signOut()
  }

  return (
    <header className="sticky top-0 z-50 bg-base border-b border-hairline">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-baseline gap-1.5 no-underline">
          <span className="font-sans font-bold text-ink text-lg tracking-tight">
            Brainstorm
          </span>
          <span className="font-serif italic text-muted text-sm">
            ideas worth building
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {authLoaded && user ? (
            <>
              <span className="text-sm text-muted hidden sm:block">
                {user.user_metadata.full_name}
              </span>
              <Link
                href="/ideas/new"
                className="bg-ink text-base text-sm font-medium px-4 py-1.5 hover:bg-accent transition-colors"
              >
                Post an Idea
              </Link>
              <button
                onClick={signOut}
                className="text-sm text-muted hover:text-ink transition-colors"
              >
                Sign out
              </button>
            </>
          ) : authLoaded ? (
            <button
              onClick={signIn}
              className="text-sm text-muted hover:text-ink transition-colors"
            >
              Sign in
            </button>
          ) : null}
        </div>
      </div>
    </header>
  )
}
