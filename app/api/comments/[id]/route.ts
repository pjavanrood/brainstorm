import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const comment = await prisma.comment.findUnique({ where: { id } })
  if (!comment) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (comment.authorId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  if (comment.parentId === null) {
    await prisma.comment.deleteMany({ where: { parentId: id } })
  }
  await prisma.comment.delete({ where: { id } })

  return new NextResponse(null, { status: 204 })
}
