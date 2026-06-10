import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const tag = req.nextUrl.searchParams.get("tag")

  const ideas = await prisma.idea.findMany({
    where: tag
      ? { tags: { some: { tag: { name: tag } } } }
      : undefined,
    include: {
      author: { select: { id: true, name: true, image: true } },
      tags: { include: { tag: true } },
      _count: { select: { comments: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(ideas)
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { title, oneLiner, explanation, tags } = await req.json()

  if (!title?.trim() || !oneLiner?.trim() || !explanation?.trim()) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const idea = await prisma.idea.create({
    data: {
      title: title.trim(),
      oneLiner: oneLiner.trim(),
      explanation: explanation.trim(),
      authorId: user.id,
      tags: tags?.length
        ? {
            create: tags.map((tagId: string) => ({
              tag: { connect: { id: tagId } },
            })),
          }
        : undefined,
    },
  })

  return NextResponse.json(idea, { status: 201 })
}
