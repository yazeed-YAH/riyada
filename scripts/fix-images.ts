import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const members = await prisma.member.findMany({
    select: { id: true, name: true, imageUrl: true }
  })
  
  console.log(`Found ${members.length} members\n`)
  
  let fixed = 0
  
  for (const member of members) {
    if (!member.imageUrl) continue
    
    const img = member.imageUrl
    
    // Check if it's invalid data
    const isInvalid = 
      img.startsWith('"data:image') || // Quote at start
      img === 'female' ||
      img === 'male' ||
      img === '"female"' ||
      img === '"male"' ||
      img.length < 100 && !img.startsWith('http')
    
    if (isInvalid) {
      console.log(`Fixing ${member.name}: "${img.substring(0, 50)}..." -> null`)
      await prisma.member.update({
        where: { id: member.id },
        data: { imageUrl: null }
      })
      fixed++
    }
  }
  
  console.log(`\nFixed ${fixed} members`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
