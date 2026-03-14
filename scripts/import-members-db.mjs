import { db } from '../src/lib/db/index.js'
import bcrypt from 'bcryptjs'
import fs from 'fs'

async function importMembers() {
  try {
    // قراءة ملف CSV
    const csvContent = fs.readFileSync('/home/z/my-project/upload/Member_rows (1).csv', 'utf-8')
    
    // تحويل CSV إلى JSON
    const lines = csvContent.trim().split('\n')
    const headers = lines[0].split(',')
    
    const members = []
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',')
      const member = {}
      headers.forEach((header, index) => {
        member[header.trim()] = values[index]?.trim() || ''
      })
      members.push(member)
    }
    
    console.log(`Found ${members.length} members in CSV`)
    
    let imported = 0
    let updated = 0
    let skipped = 0
    
    for (const member of members) {
      // تخطي إذا لم يكن هناك بريد إلكتروني صالح
      if (!member.email || member.email.includes('placeholder.com')) {
        member.email = `no-email-${Date.now()}-${Math.random().toString(36).slice(2)}@placeholder.com`
      }
      
      try {
        // التحقق من وجود العضو
        const existing = await db.member.findUnique({
          where: { email: member.email }
        })
        
        if (existing) {
          // تحديث العضو الموجود
          await db.member.update({
            where: { id: existing.id },
            data: {
              name: member.name || existing.name,
              phone: member.phone || existing.phone,
              companyName: member.companyName || existing.companyName,
              jobTitle: member.jobTitle || existing.jobTitle,
              businessType: member.businessType || existing.businessType,
              gender: member.gender || existing.gender,
              interests: member.interests || existing.interests,
              imageUrl: member.imageUrl || existing.imageUrl,
              isActive: true,
            }
          })
          updated++
          console.log(`Updated: ${member.name}`)
        } else {
          // إنشاء عضو جديد
          let hashedPassword = member.password
          if (!hashedPassword || hashedPassword.length < 20) {
            hashedPassword = await bcrypt.hash('member123', 10)
          }
          
          await db.member.create({
            data: {
              id: member.id || undefined,
              name: member.name,
              email: member.email,
              phone: member.phone || null,
              password: hashedPassword,
              companyName: member.companyName || null,
              jobTitle: member.jobTitle || null,
              businessType: member.businessType || null,
              gender: member.gender || 'female',
              interests: member.interests || null,
              imageUrl: member.imageUrl || null,
              wantsSponsorship: member.wantsSponsorship === 'true',
              sponsorshipTypes: member.sponsorshipTypes || null,
              twitter: member.twitter || null,
              instagram: member.instagram || null,
              linkedin: member.linkedin || null,
              snapchat: member.snapchat || null,
              isActive: true,
            }
          })
          imported++
          console.log(`Imported: ${member.name}`)
        }
      } catch (error) {
        console.error(`Error processing member ${member.email}:`, error.message)
        skipped++
      }
    }
    
    console.log('\n--- Summary ---')
    console.log(`Imported: ${imported}`)
    console.log(`Updated: ${updated}`)
    console.log(`Skipped: ${skipped}`)
    
    process.exit(0)
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

importMembers()
