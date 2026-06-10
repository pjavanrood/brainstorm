import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET() {
  const tags = await prisma.tag.findMany({ where: { type: "FIELD" }, orderBy: { name: "asc" } })
  return NextResponse.json(tags)
}
