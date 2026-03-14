import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Fetch sponsors for a specific event
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params

    const eventSponsors = await db.eventSponsor.findMany({
      where: { eventId },
      include: {
        sponsor: {
          select: {
            id: true,
            companyName: true,
            logoUrl: true,
          }
        }
      }
    })

    return NextResponse.json({ sponsors: eventSponsors })
  } catch (error) {
    console.error('Error fetching event sponsors:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب رعاة الحدث' },
      { status: 500 }
    )
  }
}
