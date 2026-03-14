import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - جلب الفعاليات التي رعاها الراعي
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const eventSponsors = await db.eventSponsor.findMany({
      where: { sponsorId: id },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            date: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const events = eventSponsors.map(es => ({
      id: es.event.id,
      title: es.event.title,
      date: es.event.date.toISOString(),
      tasks: es.tasks
    }))

    return NextResponse.json({ events })
  } catch (error) {
    console.error('Error fetching sponsor events:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب فعاليات الراعي' },
      { status: 500 }
    )
  }
}
