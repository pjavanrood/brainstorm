import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const idea = await prisma.idea.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true, image: true } },
      tags: { include: { tag: true } },
    },
  })

  if (!idea) return NextResponse.json({ error: "Not found" }, { status: 404 })

  return NextResponse.json(idea)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const idea = await prisma.idea.findUnique({ where: { id } })
  if (!idea) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (idea.authorId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  await prisma.idea.delete({ where: { id } })

  return new NextResponse(null, { status: 204 })
}
