import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'riyada-secret-key-2024'
)

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('member-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    // التحقق من الـ token
    const { payload } = await jwtVerify(token, JWT_SECRET)

    if (payload.type !== 'member') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const body = await request.json()
    const { name, phone, companyName, jobTitle, interests, gender, imageBase64, wantsSponsorship, sponsorshipTypes } = body

    // حفظ الصورة إذا كانت موجودة
    let imageUrl: string | undefined = undefined
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

    // تحديث بيانات العضو
    const updatedMember = await db.member.update({
      where: { id: payload.id as string },
      data: {
        name,
        phone,
        companyName,
        jobTitle,
        interests,
        gender,
        ...(imageUrl && { imageUrl }),
        wantsSponsorship,
        sponsorshipTypes
      }
    })

    return NextResponse.json({ 
      success: true,
      member: {
        id: updatedMember.id,
        name: updatedMember.name,
        email: updatedMember.email,
        phone: updatedMember.phone,
        companyName: updatedMember.companyName,
        jobTitle: updatedMember.jobTitle,
        interests: updatedMember.interests,
        gender: updatedMember.gender,
        imageUrl: updatedMember.imageUrl,
        wantsSponsorship: updatedMember.wantsSponsorship,
        sponsorshipTypes: updatedMember.sponsorshipTypes
      }
    })
  } catch (error) {
    console.error('Error updating member:', error)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}
