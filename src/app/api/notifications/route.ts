import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - جلب الإشعارات
export async function GET() {
  try {
    // التحقق من وجود جدول الإشعارات
    let notifications = []
    try {
      notifications = await db.notification.findMany({
        where: {
          isDismissed: false
        },
        include: {
          Event: {
            select: {
              id: true,
              title: true,
              date: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    } catch (dbError) {
      // إذا لم يكن الجدول موجوداً، نرجع مصفوفة فارغة
      console.log('Notifications table might not exist yet:', dbError)
      return NextResponse.json([])
    }

    return NextResponse.json(notifications)
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json([])
  }
}

// POST - إنشاء إشعار جديد
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, title, message, eventId } = body

    const notification = await db.notification.create({
      data: {
        type,
        title,
        message,
        eventId
      }
    })

    return NextResponse.json(notification)
  } catch (error) {
    console.error('Error creating notification:', error)
    return NextResponse.json({ error: 'حدث خطأ أثناء إنشاء الإشعار' }, { status: 500 })
  }
}

// PUT - تحديث إشعار
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, isRead, isDismissed } = body

    const notification = await db.notification.update({
      where: { id },
      data: {
        isRead,
        isDismissed
      }
    })

    return NextResponse.json(notification)
  } catch (error) {
    console.error('Error updating notification:', error)
    return NextResponse.json({ error: 'حدث خطأ أثناء تحديث الإشعار' }, { status: 500 })
  }
}
