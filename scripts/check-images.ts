import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const members = await prisma.member.findMany({
    select: { id: true, name: true, imageUrl: true }
  })
  
  console.log(`Found ${members.length} members\n`)
  
  for (const member of members) {
    if (member.imageUrl) {
      const imgLen = member.imageUrl.length
      const imgPreview = member.imageUrl.substring(0, 50) + '...'
      console.log(`${member.name}:`)
      console.log(`  Length: ${imgLen} chars`)
      console.log(`  Preview: ${imgPreview}`)
      console.log(`  Type: ${member.imageUrl.startsWith('data:') ? 'Base64' : 'URL'}`)
      console.log()
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
