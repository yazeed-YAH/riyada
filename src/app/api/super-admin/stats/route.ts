import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // التحقق من اتصال قاعدة البيانات
    if (!db) {
      console.error('[API/super-admin/stats] Database client not initialized')
      return NextResponse.json({ 
        error: 'قاعدة البيانات غير متاحة',
        totalMembers: 0,
        totalEvents: 0,
        totalSponsors: 0,
        totalAdmins: 0,
        totalSuperAdmins: 0
      }, { status: 503 })
    }

    const cookieStore = await cookies()
    const adminSession = cookieStore.get('admin-session')?.value

    if (!adminSession) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const admin = await db.admin.findUnique({
      where: { id: adminSession }
    })

    if (!admin) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    }

    // حساب عدد الأعضاء من جدول الأعضاء
    let totalMembers = 0
    try {
      totalMembers = await db.member.count()
    } catch (dbError) {
      console.error('[API/super-admin/stats] Error counting members:', dbError)
    }

    // جلب الإحصائيات الأخرى
    let totalEvents = 0
    let totalSponsors = 0
    let totalAdmins = 0
    let totalSuperAdmins = 0

    try {
      const results = await Promise.all([
        db.event.count().catch(e => { console.error('[API/super-admin/stats] Error counting events:', e); return 0 }),
        db.sponsorRequest.count().catch(e => { console.error('[API/super-admin/stats] Error counting sponsors:', e); return 0 }),
        db.admin.count({ where: { role: 'admin' } }).catch(e => { console.error('[API/super-admin/stats] Error counting admins:', e); return 0 }),
        db.admin.count({ where: { role: 'super_admin' } }).catch(e => { console.error('[API/super-admin/stats] Error counting super admins:', e); return 0 })
      ])
      
      totalEvents = results[0]
      totalSponsors = results[1]
      totalAdmins = results[2]
      totalSuperAdmins = results[3]
    } catch (countError) {
      console.error('[API/super-admin/stats] Error in Promise.all:', countError)
    }

    return NextResponse.json({
      totalMembers,
      totalEvents,
      totalSponsors,
      totalAdmins,
      totalSuperAdmins
    })
  } catch (error) {
    console.error('[API/super-admin/stats] Error fetching stats:', error)
    
    // إرجاع رسالة خطأ مفصلة
    const errorMessage = error instanceof Error ? error.message : 'حدث خطأ'
    
    return NextResponse.json(
      { 
        error: 'حدث خطأ',
        details: errorMessage,
        totalMembers: 0,
        totalEvents: 0,
        totalSponsors: 0,
        totalAdmins: 0,
        totalSuperAdmins: 0
      }, 
      { status: 500 }
    )
  }
}
