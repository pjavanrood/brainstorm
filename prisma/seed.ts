import { PrismaClient } from "../app/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg(process.env.DATABASE_URL!)
const prisma = new PrismaClient({ adapter })

const FIELD_TAGS = ["AI", "Fintech", "Health", "EdTech", "Climate", "Gaming"]

async function main() {
  await prisma.tag.deleteMany()
  for (const name of FIELD_TAGS) {
    await prisma.tag.upsert({
      where: { name },
      update: { type: "FIELD" },
      create: { name, type: "FIELD" },
    })
  }
  console.log(`Seeded ${FIELD_TAGS.length} field tags.`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
