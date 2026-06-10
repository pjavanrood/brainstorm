import { NextRequest, NextResponse } from "next/server"
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
