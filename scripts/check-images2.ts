import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const members = await prisma.member.findMany({
    select: { id: true, name: true, imageUrl: true }
  })
  
  console.log(`Found ${members.length} members\n`)
  
  for (const member of members) {
    if (member.imageUrl) {
      const img = member.imageUrl
      // Check if it's a proper base64 image
      if (img.startsWith('data:image')) {
        // It's a base64 image - check if it's complete
        const base64Part = img.split(',')[1]
        if (base64Part && base64Part.length > 100) {
          console.log(`✅ ${member.name}: Valid base64 image (${img.length} chars)`)
        } else {
          console.log(`❌ ${member.name}: Incomplete base64 image (${img.length} chars)`)
          console.log(`   Preview: ${img.substring(0, 100)}...`)
        }
      } else if (img.startsWith('http')) {
        console.log(`✅ ${member.name}: URL image`)
      } else {
        console.log(`❌ ${member.name}: Invalid image data - "${img.substring(0, 50)}..."`)
      }
    } else {
      console.log(`⚪ ${member.name}: No image`)
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
