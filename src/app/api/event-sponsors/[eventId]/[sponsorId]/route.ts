import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// DELETE - Remove sponsor from event
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string; sponsorId: string }> }
) {
  try {
    const { eventId, sponsorId } = await params

    if (!eventId || !sponsorId) {
      return NextResponse.json(
        { error: 'الحدث والراعي مطلوبان' },
        { status: 400 }
      )
    }

    // Delete the event-sponsor link
    await db.eventSponsor.deleteMany({
      where: { 
        eventId,
        sponsorId 
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing sponsor from event:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إزالة الراعي من الحدث' },
      { status: 500 }
    )
  }
}
