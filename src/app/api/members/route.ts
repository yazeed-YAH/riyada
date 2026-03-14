import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching members...')
    
    const members = await db.member.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { EventRegistration: true }
        }
      }
    })

    console.log(`Found ${members.length} members`)
    
    return NextResponse.json({ members })
  } catch (error) {
    console.error('Error fetching members:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب الأعضاء', members: [] },
      { status: 500 }
    )
  }
}
