import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/"

  if (code) {
    const response = NextResponse.redirect(`${origin}${next}`)

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      await prisma.user.upsert({
        where: { id: data.user.id },
        update: {
          name: data.user.user_metadata.full_name ?? null,
          email: data.user.email!,
          image: data.user.user_metadata.avatar_url ?? null,
        },
        create: {
          id: data.user.id,
          name: data.user.user_metadata.full_name ?? null,
          email: data.user.email!,
          image: data.user.user_metadata.avatar_url ?? null,
        },
      })
      return response
    }
  }

  return NextResponse.redirect(`${origin}/?error=auth`)
}
