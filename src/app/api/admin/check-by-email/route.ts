import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST - التحقق من وجود أدمن بهذا البريد
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { exists: false },
        { status: 400 }
      )
    }

    const admin = await db.admin.findUnique({
      where: { email },
      select: { id: true }
    })

    return NextResponse.json({ 
      exists: !!admin 
    })
  } catch (error) {
    console.error('Error checking admin:', error)
    return NextResponse.json(
      { exists: false },
      { status: 500 }
    )
  }
}
