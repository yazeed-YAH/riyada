import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - جلب جميع طلبات الرعاية (للإدارة)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    
    const where: Record<string, unknown> = {}
    if (status) where.status = status

    const sponsors = await db.sponsorRequest.findMany({
      where,
      include: {
        Event: {
          select: {
            title: true,
            date: true
          }
        },
        EventSponsor: {
          select: {
            id: true,
            createdAt: true,
            Event: {
              select: {
                title: true,
                date: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // إضافة عدد الرعايات وآخر تاريخ لكل راعي
    const sponsorsWithStats = sponsors.map(sponsor => ({
      ...sponsor,
      sponsorshipsCount: sponsor.EventSponsor.length,
      lastSponsorshipDate: sponsor.EventSponsor.length > 0 
        ? sponsor.EventSponsor[0].createdAt 
        : null
    }))

    return NextResponse.json({ sponsors: sponsorsWithStats })
  } catch (error) {
    console.error('Error fetching sponsor requests:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب طلبات الرعاية' },
      { status: 500 }
    )
  }
}

// POST - طلب رعاية جديد
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      eventId, companyName, contactName, email, phone, sponsorshipType, 
      sponsorType, description, amount, logoUrl, instagram, twitter, 
      snapchat, tiktok, websiteUrl, profileUrl, socialLinks, status 
    } = body

    if (!companyName || !contactName || !email || !phone || !sponsorshipType) {
      return NextResponse.json(
        { error: 'جميع الحقول المطلوبة يجب ملؤها' },
        { status: 400 }
      )
    }

    const sponsorRequest = await db.sponsorRequest.create({
      data: {
        eventId: eventId || null,
        companyName,
        contactName,
        email,
        phone,
        sponsorshipType,
        sponsorType: sponsorType || null,
        description,
        amount: amount ? parseFloat(amount) : null,
        logoUrl: logoUrl || null,
        instagram: instagram || null,
        twitter: twitter || null,
        snapchat: snapchat || null,
        tiktok: tiktok || null,
        websiteUrl: websiteUrl || null,
        profileUrl: profileUrl || null,
        socialLinks: socialLinks || null,
        status: status || 'pending'
      }
    })

    return NextResponse.json({ sponsorRequest }, { status: 201 })
  } catch (error) {
    console.error('Error creating sponsor request:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إرسال طلب الرعاية' },
      { status: 500 }
    )
  }
}
