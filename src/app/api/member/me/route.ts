import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'riyada-secret-key-2024'
)

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('member-token')?.value

    if (!token) {
      return NextResponse.json({ member: null })
    }

    // التحقق من الـ token
    const { payload } = await jwtVerify(token, JWT_SECRET)

    if (payload.type !== 'member') {
      return NextResponse.json({ member: null })
    }

    // جلب بيانات العضو من جدول Member
    const member = await db.member.findUnique({
      where: { id: payload.id as string }
    })

    if (!member) {
      return NextResponse.json({ member: null })
    }

    // جلب كل تسجيلات العضو
    const registrations = await db.eventRegistration.findMany({
      where: {
        OR: [
          { email: member.email },
          { phone: member.phone }
        ]
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            date: true,
            startTime: true,
            location: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      member: {
        id: member.id,
        name: member.name,
        email: member.email,
        phone: member.phone,
        companyName: member.companyName,
        jobTitle: member.jobTitle,
        interests: member.interests,
        gender: member.gender,
        imageUrl: member.imageUrl,
        wantsSponsorship: member.wantsSponsorship,
        sponsorshipTypes: member.sponsorshipTypes,
        registrations: registrations.map(r => ({
          id: r.id,
          status: r.status,
          createdAt: r.createdAt,
          event: r.event
        }))
      }
    })
  } catch (error) {
    console.error('Error getting member:', error)
    return NextResponse.json({ member: null })
  }
}
