import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { SignJWT } from 'jose'
import { cookies } from 'next/headers'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'riyada-secret-key-2024'
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, phone } = body

    if (!email && !phone) {
      return NextResponse.json(
        { error: 'يرجى إدخال البريد الإلكتروني أو رقم الجوال' },
        { status: 400 }
      )
    }

    // البحث عن العضو بالبريد أو الجوال
    const member = await db.eventRegistration.findFirst({
      where: {
        OR: [
          { email: email || '' },
          { phone: phone || '' }
        ]
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            date: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (!member) {
      return NextResponse.json(
        { error: 'لم يتم العثور على حساب بهذا البريد أو الرقم' },
        { status: 401 }
      )
    }

    // إنشاء token
    const token = await new SignJWT({
      id: member.id,
      name: member.name,
      email: member.email,
      phone: member.phone,
      type: 'member'
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('30d')
      .setIssuedAt()
      .sign(JWT_SECRET)

    // حفظ في cookies
    const cookieStore = await cookies()
    cookieStore.set('member-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30 // 30 يوم
    })

    return NextResponse.json({
      member: {
        id: member.id,
        name: member.name,
        email: member.email,
        phone: member.phone,
        companyName: member.companyName,
        jobTitle: member.jobTitle
      }
    })
  } catch (error) {
    console.error('Error logging in member:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تسجيل الدخول' },
      { status: 500 }
    )
  }
}
