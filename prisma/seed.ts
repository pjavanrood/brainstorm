import { PrismaClient } from "../app/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg(process.env.DATABASE_URL!)
const prisma = new PrismaClient({ adapter })

const TAGS = ["B2B", "SaaS", "Consumer", "FinTech", "DeepTech", "Marketplace", "Developer Tools"]

async function main() {
  for (const name of TAGS) {
    await prisma.tag.upsert({
      where: { name },
      update: {},
      create: { name },
    })
  }
  console.log(`Seeded ${TAGS.length} tags.`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
