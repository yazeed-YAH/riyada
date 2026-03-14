import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// PUT - تحديث حالة اللقاء
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { eventId, status, archiveNotification, dismissNotification } = body

    // تحديث حالة اللقاء
    if (status) {
      await db.event.update({
        where: { id: eventId },
        data: { status }
      })
    }

    // إذا طُلب أرشفة الإشعار
    if (archiveNotification) {
      try {
        await db.notification.updateMany({
          where: { eventId, type: 'ended_event' },
          data: { isDismissed: true }
        })
      } catch (notifError) {
        // جدول الإشعارات قد لا يكون موجوداً بعد
        console.log('Could not archive notification:', notifError)
      }
    }

    // إذا طُلب تجاهل الإشعار (نقله للإشعارات)
    if (dismissNotification) {
      // الإشعار موجود بالفعل، فقط نتركه كما هو
      // سيظهر في قائمة الإشعارات
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating event status:', error)
    return NextResponse.json({ error: 'حدث خطأ أثناء تحديث حالة اللقاء' }, { status: 500 })
  }
}
