import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST - Add sponsor to event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { eventId, sponsorId, tasks } = body

    if (!eventId || !sponsorId) {
      return NextResponse.json(
        { error: 'الحدث والراعي مطلوبان' },
        { status: 400 }
      )
    }

    // Check if already linked
    const existing = await db.eventSponsor.findFirst({
      where: { eventId, sponsorId }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'الراعي مرتبط بالفعل بهذا الحدث' },
        { status: 400 }
      )
    }

    // Create the event-sponsor link and update sponsor status to completed
    const [eventSponsor] = await Promise.all([
      db.eventSponsor.create({
        data: {
          eventId,
          sponsorId,
          tasks
        }
      }),
      // تحديث حالة الراعي إلى "تم الرعاية"
      db.sponsorRequest.update({
        where: { id: sponsorId },
        data: { status: 'completed' }
      })
    ])

    return NextResponse.json({ eventSponsor }, { status: 201 })
  } catch (error) {
    console.error('Error adding sponsor to event:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إضافة الراعي للحدث' },
      { status: 500 }
    )
  }
}
