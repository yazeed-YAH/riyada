import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - جلب جميع الأحداث أو حدث واحد
export async function GET(request: NextRequest) {
  try {
    // التحقق من اتصال قاعدة البيانات
    if (!db) {
      console.error('[API/events] Database client not initialized')
      return NextResponse.json(
        { error: 'قاعدة البيانات غير متاحة', events: [] },
        { status: 503 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const eventType = searchParams.get('eventType')
    const adminView = searchParams.get('admin') // للإدارة فقط
    const eventId = searchParams.get('id') // لجلب حدث محدد
    const preview = searchParams.get('preview') // لمعاينة حدث غير منشور
    
    // إذا تم تحديد ID، نرجع الحدث المحدد فقط
    if (eventId) {
      const event = await db.event.findUnique({
        where: { id: eventId },
        include: {
          _count: {
            select: { EventRegistration: true }
          },
          sponsors: {
            include: {
              sponsor: true
            }
          }
        }
      })
      
      if (!event) {
        return NextResponse.json(
          { error: 'الحدث غير موجود' },
          { status: 404 }
        )
      }
      
      // إذا كان الحدث غير منشور وليس طلب إدارة أو معاينة
      if (!event.isPublished && adminView !== 'true' && preview !== 'true') {
        return NextResponse.json(
          { error: 'الحدث غير متاح' },
          { status: 404 }
        )
      }
      
      return NextResponse.json({ event })
    }
    
    const where: Record<string, unknown> = {}
    
    // إذا لم يكن طلب الإدارة، نعرض فقط الأحداث المنشورة
    if (adminView !== 'true') {
      where.isPublished = true
    }
    
    if (status) {
      where.status = status
    }
    if (eventType) {
      where.eventType = eventType
    }

    const events = await db.event.findMany({
      where,
      include: {
        _count: {
          select: { EventRegistration: true }
        }
      },
      orderBy: {
        date: 'asc'
      }
    })

    return NextResponse.json({ events })
  } catch (error) {
    console.error('[API/events] Error fetching events:', error)
    
    // إرجاع رسالة خطأ مفصلة
    const errorMessage = error instanceof Error ? error.message : 'حدث خطأ أثناء جلب الأحداث'
    
    return NextResponse.json(
      { error: errorMessage, events: [] },
      { status: 500 }
    )
  }
}

// POST - إنشاء حدث جديد (للإدارة)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      title, description, date, startTime, endTime, location, imageUrl,
      status, eventType, isPublished, registrationDeadline,
      guestName, guestImage, guestOrganization, guestPosition,
      guestTwitter, guestInstagram, guestLinkedIn, guestSnapchat,
      capacity, maxCompanions, registrationType, sendQR,
      showCountdown, showRegistrantCount, showGuestProfile, showHospitalityPreference,
      valetServiceEnabled, parkingCapacity, carRetrievalTime
    } = body

    if (!title || !date) {
      return NextResponse.json(
        { error: 'العنوان والتاريخ مطلوبان' },
        { status: 400 }
      )
    }

    const event = await db.event.create({
      data: {
        title,
        description,
        date: new Date(date),
        startTime: startTime || null,
        endTime: endTime || null,
        location,
        imageUrl,
        status: status || 'open',
        eventType: eventType || 'public',
        isPublished: isPublished || false,
        registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : null,
        guestName,
        guestImage,
        guestOrganization,
        guestPosition,
        guestTwitter,
        guestInstagram,
        guestLinkedIn,
        guestSnapchat,
        capacity: capacity || 50,
        maxCompanions: maxCompanions || 0,
        registrationType: registrationType || 'registration',
        sendQR: sendQR || false,
        showCountdown: showCountdown ?? true,
        showRegistrantCount: showRegistrantCount ?? true,
        showGuestProfile: showGuestProfile ?? true,
        showHospitalityPreference: showHospitalityPreference ?? true,
        valetServiceEnabled: valetServiceEnabled || false,
        parkingCapacity: parkingCapacity || null,
        carRetrievalTime: carRetrievalTime || null
      }
    })

    return NextResponse.json({ event }, { status: 201 })
  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إنشاء الحدث' },
      { status: 500 }
    )
  }
}
