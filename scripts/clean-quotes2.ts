import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Get all members
  const members = await prisma.member.findMany()
  
  console.log(`Found ${members.length} members`)
  
  let updated = 0
  
  for (const member of members) {
    // Clean all types of quotes and null/undefined strings
    const cleanName = member.name?.replace(/^["']|["']$/g, '').replace(/^"+|"+$/g, '').trim()
    let cleanCompanyName = member.companyName?.replace(/^["']|["']$/g, '').replace(/^"+|"+$/g, '').trim()
    let cleanJobTitle = member.jobTitle?.replace(/^["']|["']$/g, '').replace(/^"+|"+$/g, '').trim()
    
    // Convert "null", "undefined", empty strings to null
    if (cleanCompanyName === 'null' || cleanCompanyName === 'undefined' || cleanCompanyName === '') {
      cleanCompanyName = null
    }
    if (cleanJobTitle === 'null' || cleanJobTitle === 'undefined' || cleanJobTitle === '') {
      cleanJobTitle = null
    }
    
    if (cleanName !== member.name || cleanCompanyName !== member.companyName || cleanJobTitle !== member.jobTitle) {
      await prisma.member.update({
        where: { id: member.id },
        data: {
          name: cleanName,
          companyName: cleanCompanyName,
          jobTitle: cleanJobTitle
        }
      })
      console.log(`Updated: ${member.name}`)
      updated++
    }
  }
  
  console.log(`\nUpdated ${updated} members`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
