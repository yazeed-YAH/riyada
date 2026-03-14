import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

// GET - فحص الأعضاء والتسجيلات
export async function GET() {
  try {
    // جلب جميع الأعضاء المسجلين
    const members = await db.member.findMany({
      select: { id: true, name: true, email: true, createdAt: true }
    })
    
    // جلب التسجيلات بدون memberId باستخدام raw query
    const registrations = await db.$queryRaw<Array<{
      id: string
      name: string
      email: string
      phone: string | null
      companyName: string | null
      jobTitle: string | null
      memberId: string | null
    }>>`
      SELECT id, name, email, phone, "companyName", "jobTitle", "memberId"
      FROM "EventRegistration"
      WHERE "memberId" IS NULL
    `
    
    // استخراج الإيميلات الفريدة
    const emailMap = new Map<string, typeof registrations[0]>()
    
    for (const reg of registrations) {
      const email = reg.email.toLowerCase().trim()
      if (!emailMap.has(email)) {
        emailMap.set(email, reg)
      }
    }

    // التحقق من الأعضاء المفقودين
    const missingMembers = []
    for (const [email, reg] of emailMap) {
      const existing = members.find(m => m.email.toLowerCase() === email)
      if (!existing) {
        missingMembers.push({
          email,
          name: reg.name,
          phone: reg.phone,
          companyName: reg.companyName,
          jobTitle: reg.jobTitle
        })
      }
    }

    return NextResponse.json({
      stats: {
        totalMembers: members.length,
        orphanRegistrations: registrations.length,
        missingMembersCount: missingMembers.length
      },
      missingMembers
    })
  } catch (error) {
    console.error('Error checking members:', error)
    return NextResponse.json({ 
      error: 'حدث خطأ: ' + (error instanceof Error ? error.message : 'خطأ غير معروف')
    }, { status: 500 })
  }
}

// POST - استعادة الأعضاء المفقودين
export async function POST() {
  try {
    console.log('Starting member restoration...')
    
    // جلب التسجيلات بدون عضو باستخدام raw query
    const registrations = await db.$queryRaw<Array<{
      id: string
      name: string
      email: string
      phone: string | null
      companyName: string | null
      jobTitle: string | null
      memberId: string | null
    }>>`
      SELECT id, name, email, phone, "companyName", "jobTitle", "memberId"
      FROM "EventRegistration"
      WHERE "memberId" IS NULL
    `
    
    console.log(`Found ${registrations.length} orphan registrations`)
    
    // استخراج الإيميلات الفريدة
    const emailMap = new Map<string, typeof registrations[0]>()
    
    for (const reg of registrations) {
      const email = reg.email.toLowerCase().trim()
      if (!emailMap.has(email)) {
        emailMap.set(email, reg)
      }
    }
    
    console.log(`Found ${emailMap.size} unique emails`)
    
    let restored = 0
    const restoredMembers: Array<{ id: string, name: string, email: string }> = []
    
    // إنشاء أعضاء جدد
    for (const [email, reg] of emailMap) {
      try {
        // التحقق من عدم وجود العضو
        const existing = await db.member.findUnique({
          where: { email }
        })
        
        if (!existing) {
          // إنشاء كلمة مرور عشوائية
          const tempPassword = Math.random().toString(36).slice(-8)
          const hashedPassword = await bcrypt.hash(tempPassword, 10)
          
          // إنشاء عضو جديد
          const newMember = await db.member.create({
            data: {
              name: reg.name,
              email: email,
              phone: reg.phone,
              companyName: reg.companyName,
              jobTitle: reg.jobTitle,
              gender: 'female',
              password: hashedPassword
            }
          })
          
          console.log(`Created member: ${newMember.name} (${newMember.email})`)
          
          // تحديث التسجيلات المرتبطة بهذا الإيميل باستخدام raw query
          await db.$executeRaw`
            UPDATE "EventRegistration"
            SET "memberId" = ${newMember.id}
            WHERE email = ${email}
          `
          
          restoredMembers.push({
            id: newMember.id,
            name: newMember.name,
            email: newMember.email
          })
          
          restored++
        } else {
          // ربط التسجيلات بالعضو الموجود
          await db.$executeRaw`
            UPDATE "EventRegistration"
            SET "memberId" = ${existing.id}
            WHERE email = ${email}
          `
          console.log(`Linked registrations to existing member: ${existing.email}`)
        }
      } catch (memberError) {
        console.error(`Error for ${email}:`, memberError)
      }
    }

    return NextResponse.json({
      success: true,
      message: `تم استعادة ${restored} عضو بنجاح`,
      restored,
      restoredMembers
    })
  } catch (error) {
    console.error('Error restoring members:', error)
    return NextResponse.json({ 
      error: 'حدث خطأ أثناء الاستعادة: ' + (error instanceof Error ? error.message : 'خطأ غير معروف')
    }, { status: 500 })
  }
}
