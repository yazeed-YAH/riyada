import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db } from '@/lib/db'

// Helper function to check if user is super admin
async function isSuperAdmin() {
  try {
    const cookieStore = await cookies()
    const adminSession = cookieStore.get('admin-session')?.value

    if (!adminSession) {
      return false
    }

    const admin = await db.admin.findUnique({
      where: { id: adminSession },
      select: { role: true }
    })

    return admin?.role === 'super_admin'
  } catch {
    return false
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const event = await db.event.findUnique({
      where: { id },
      include: {
        _count: {
          select: { EventRegistration: true }
        }
      }
    })

    if (!event) {
      return NextResponse.json({ error: 'اللقاء غير موجود' }, { status: 404 })
    }

    // Only show published events to non-admins
    if (!event.isPublished) {
      return NextResponse.json({ error: 'اللقاء غير متاح' }, { status: 404 })
    }

    return NextResponse.json({ event })
  } catch (error) {
    console.error('Error fetching event:', error)
    return NextResponse.json({ error: 'حدث خطأ في جلب البيانات' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()

    const event = await db.event.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        date: data.date ? new Date(data.date) : undefined,
        startTime: data.startTime,
        endTime: data.endTime,
        location: data.location,
        imageUrl: data.imageUrl,
        status: data.status,
        eventType: data.eventType,
        isPublished: data.isPublished,
        registrationDeadline: data.registrationDeadline ? new Date(data.registrationDeadline) : null,
        guestName: data.guestName,
        guestImage: data.guestImage,
        guestOrganization: data.guestOrganization,
        guestPosition: data.guestPosition,
        guestTwitter: data.guestTwitter,
        guestInstagram: data.guestInstagram,
        guestLinkedIn: data.guestLinkedIn,
        guestSnapchat: data.guestSnapchat,
        capacity: data.capacity ? parseInt(data.capacity) : undefined,
        maxCompanions: data.maxCompanions ? parseInt(data.maxCompanions) : undefined,
        registrationType: data.registrationType,
        sendQR: data.sendQR,
        showCountdown: data.showCountdown,
        showRegistrantCount: data.showRegistrantCount,
        showGuestProfile: data.showGuestProfile,
        showHospitalityPreference: data.showHospitalityPreference,
        valetServiceEnabled: data.valetServiceEnabled,
        parkingCapacity: data.parkingCapacity ? parseInt(data.parkingCapacity) : null,
        carRetrievalTime: data.carRetrievalTime,
      }
    })

    return NextResponse.json({ event })
  } catch (error) {
    console.error('Error updating event:', error)
    return NextResponse.json({ error: 'حدث خطأ في تحديث اللقاء' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()

    const event = await db.event.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        date: data.date ? new Date(data.date) : undefined,
        startTime: data.startTime,
        endTime: data.endTime,
        location: data.location,
        imageUrl: data.imageUrl,
        status: data.status,
        eventType: data.eventType,
        isPublished: data.isPublished,
        registrationDeadline: data.registrationDeadline ? new Date(data.registrationDeadline) : null,
        guestName: data.guestName,
        guestImage: data.guestImage,
        guestOrganization: data.guestOrganization,
        guestPosition: data.guestPosition,
        guestTwitter: data.guestTwitter,
        guestInstagram: data.guestInstagram,
        guestLinkedIn: data.guestLinkedIn,
        guestSnapchat: data.guestSnapchat,
        capacity: data.capacity ? parseInt(data.capacity) : undefined,
        maxCompanions: data.maxCompanions ? parseInt(data.maxCompanions) : undefined,
        registrationType: data.registrationType,
        sendQR: data.sendQR,
        showCountdown: data.showCountdown,
        showRegistrantCount: data.showRegistrantCount,
        showGuestProfile: data.showGuestProfile,
        showHospitalityPreference: data.showHospitalityPreference,
        valetServiceEnabled: data.valetServiceEnabled,
        parkingCapacity: data.parkingCapacity ? parseInt(data.parkingCapacity) : null,
        carRetrievalTime: data.carRetrievalTime,
      }
    })

    return NextResponse.json({ event })
  } catch (error) {
    console.error('Error updating event:', error)
    return NextResponse.json({ error: 'حدث خطأ في تحديث اللقاء' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // التحقق من صلاحية المشرف العام
    if (!await isSuperAdmin()) {
      return NextResponse.json({ error: 'غير مصرح لك بحذف اللقاءات. هذه الميزة متاحة فقط للمشرف العام' }, { status: 403 })
    }

    const { id } = await params

    await db.event.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting event:', error)
    return NextResponse.json({ error: 'حدث خطأ في حذف اللقاء' }, { status: 500 })
  }
}
