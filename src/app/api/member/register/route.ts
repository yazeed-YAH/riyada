import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { SignJWT } from 'jose'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { Prisma } from '@prisma/client'
import { sendWelcomeEmail } from '@/lib/email'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'riyada-secret-key-2024'
)

// دالة لإضافة الأعمدة المفقودة
async function ensureColumnsExist() {
  try {
    await db.$executeRawUnsafe(`
      ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "businessType" TEXT;
    `)
    console.log('Added businessType column')
  } catch {
    // العمود قد يكون موجوداً بالفعل
    console.log('Column businessType may already exist')
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Registration request body:', JSON.stringify(body, null, 2))
    
    const { 
      name, email, phone, password, companyName, jobTitle, businessType, interests,
      gender, imageBase64, wantsSponsorship, sponsorshipTypes
    } = body

    console.log('Extracted fields:', { name, email, phone, companyName, jobTitle, businessType, gender })

    if (!name || !email || !password || !companyName || !jobTitle) {
      console.log('Validation failed - missing required fields')
      return NextResponse.json(
        { error: 'جميع الحقول المطلوبة يجب ملؤها' },
        { status: 400 }
      )
    }

    // التحقق من عدم وجود العضو مسبقاً
    let existingMember
    try {
      existingMember = await db.member.findUnique({
        where: { email }
      })
    } catch (findError: unknown) {
      // إذا كان الخطأ بسبب عمود مفقود، أضف العمود وأعد المحاولة
      if (findError instanceof Prisma.PrismaClientKnownRequestError && findError.code === 'P2022') {
        console.log('Column missing, attempting to add it...')
        await ensureColumnsExist()
        existingMember = await db.member.findUnique({
          where: { email }
        })
      } else {
        throw findError
      }
    }

    if (existingMember) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني مسجل مسبقاً' },
        { status: 400 }
      )
    }

    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 10)

    // حفظ الصورة إذا كانت موجودة
    let imageUrl: string | null = null
    if (imageBase64 && imageBase64.startsWith('data:')) {
      try {
        // استخراج البيانات من base64
        const matches = imageBase64.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/)
        if (matches && matches[2]) {
          const ext = matches[1] === 'png' ? 'png' : 'jpg'
          const buffer = Buffer.from(matches[2], 'base64')
          const fileName = `member_${Date.now()}.${ext}`
          const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'profiles')
          
          // إنشاء المجلد إذا لم يكن موجوداً
          await mkdir(uploadDir, { recursive: true })
          
          const filePath = path.join(uploadDir, fileName)
          await writeFile(filePath, buffer)
          imageUrl = `/uploads/profiles/${fileName}`
        }
      } catch (err) {
        console.error('Error saving image:', err)
      }
    }

    // إنشاء العضو الجديد
    const member = await db.member.create({
      data: {
        name,
        email,
        phone: phone || null,
        password: hashedPassword,
        companyName,
        jobTitle,
        businessType: businessType || null,
        interests: interests || null,
        gender: gender || 'female',
        imageUrl: imageUrl,
        wantsSponsorship: wantsSponsorship || false,
        sponsorshipTypes: sponsorshipTypes || null
      }
    })

    // إرسال إيميل ترحيبي للعضو الجديد
    try {
      await sendWelcomeEmail({
        name: member.name,
        email: member.email,
        companyName: member.companyName,
        jobTitle: member.jobTitle
      })
      console.log('Welcome email sent to:', member.email)
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError)
      // لا نوقف التسجيل إذا فشل الإيميل
    }

    // إنشاء token
    const token = await new SignJWT({
      id: member.id,
      name: member.name,
      email: member.email,
      type: 'member'
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('30d')
      .setIssuedAt()
      .sign(JWT_SECRET)

    // حفظ في cookies
    try {
      const cookieStore = await cookies()
      const isProduction = process.env.NODE_ENV === 'production'
      
      cookieStore.set('member-token', token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 يوم
        path: '/',
        domain: isProduction ? '.yplus.ai' : undefined
      })
    } catch (cookieError) {
      console.error('Error setting cookie:', cookieError)
      // Continue even if cookie setting fails
    }

    return NextResponse.json({
      member: {
        id: member.id,
        name: member.name,
        email: member.email,
        phone: member.phone,
        companyName: member.companyName,
        jobTitle: member.jobTitle,
        businessType: member.businessType,
        gender: member.gender,
        imageUrl: member.imageUrl,
        wantsSponsorship: member.wantsSponsorship
      }
    })
  } catch (error: unknown) {
    console.error('Error registering member:', error)
    const errorMessage = error instanceof Error ? error.message : 'حدث خطأ أثناء التسجيل'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
