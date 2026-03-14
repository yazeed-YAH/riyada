import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function main() {
  // Read CSV file
  const csvPath = path.join(__dirname, '../upload/Member_rows (1).csv')
  const csvContent = fs.readFileSync(csvPath, 'utf-8')
  
  // Parse CSV
  const lines = csvContent.split('\n').filter(line => line.trim())
  const headers = lines[0].split(',')
  
  console.log(`Found ${lines.length - 1} members to import`)
  
  let imported = 0
  let skipped = 0
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',')
    
    // Skip if not enough values
    if (values.length < 10) {
      skipped++
      continue
    }
    
    const memberData = {
      id: values[0],
      name: values[1],
      email: values[2],
      phone: values[3]?.replace('+', '') || null,
      password: values[4] || null,
      companyName: values[5] || null,
      jobTitle: values[6] || null,
      interests: values[7] || null,
      businessType: values[10] || null,
      gender: values[11] || 'female',
      imageUrl: values[12] || null,
      wantsSponsorship: values[13] === 'true',
      sponsorshipTypes: values[14] || null,
      twitter: values[15] || null,
      instagram: values[16] || null,
      linkedin: values[17] || null,
      snapchat: values[18] || null,
    }
    
    try {
      // Check if member exists
      const existing = await prisma.member.findUnique({
        where: { id: memberData.id }
      })
      
      if (existing) {
        // Update
        await prisma.member.update({
          where: { id: memberData.id },
          data: memberData
        })
      } else {
        // Create
        await prisma.member.create({
          data: memberData
        })
      }
      imported++
    } catch (error) {
      console.error(`Error importing member ${memberData.name}:`, error)
      skipped++
    }
  }
  
  console.log(`Imported: ${imported}, Skipped: ${skipped}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
