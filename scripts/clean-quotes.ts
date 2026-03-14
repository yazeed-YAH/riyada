import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Get all members
  const members = await prisma.member.findMany()
  
  console.log(`Found ${members.length} members`)
  
  let updated = 0
  
  for (const member of members) {
    const cleanName = member.name?.replace(/^["']|["']$/g, '').trim()
    const cleanCompanyName = member.companyName?.replace(/^["']|["']$/g, '').trim()
    const cleanJobTitle = member.jobTitle?.replace(/^["']|["']$/g, '').trim()
    
    if (cleanName !== member.name || cleanCompanyName !== member.companyName || cleanJobTitle !== member.jobTitle) {
      await prisma.member.update({
        where: { id: member.id },
        data: {
          name: cleanName,
          companyName: cleanCompanyName,
          jobTitle: cleanJobTitle
        }
      })
      console.log(`Updated: ${member.name} -> ${cleanName}`)
      if (member.companyName !== cleanCompanyName) {
        console.log(`  Company: "${member.companyName}" -> "${cleanCompanyName}"`)
      }
      if (member.jobTitle !== cleanJobTitle) {
        console.log(`  Job: "${member.jobTitle}" -> "${cleanJobTitle}"`)
      }
      updated++
    }
  }
  
  console.log(`\nUpdated ${updated} members`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
