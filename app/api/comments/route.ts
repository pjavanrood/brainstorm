import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { ideaId, content, parentId } = await req.json()

  if (!ideaId || !content?.trim()) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  if (parentId) {
    const parent = await prisma.comment.findUnique({ where: { id: parentId } })
    if (!parent || parent.ideaId !== ideaId || parent.parentId !== null) {
      return NextResponse.json(
        { error: "Invalid parent: replies only allowed one level deep" },
        { status: 400 }
      )
    }
  }

  const comment = await prisma.comment.create({
    data: {
      content: content.trim(),
      authorId: user.id,
      ideaId,
      parentId: parentId ?? null,
    },
    include: {
      author: { select: { id: true, name: true, image: true } },
      replies: { include: { author: { select: { id: true, name: true, image: true } } } },
    },
  })

  return NextResponse.json(comment, { status: 201 })
}
