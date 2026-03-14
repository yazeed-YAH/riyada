import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db } from '@/lib/db'

// Check admin authentication and permissions
export async function GET() {
  try {
    // التحقق من اتصال قاعدة البيانات
    if (!db) {
      console.error('[API/admin/check] Database client not initialized')
      return NextResponse.json({ isAdmin: false, admin: null })
    }

    const cookieStore = await cookies()
    const adminSession = cookieStore.get('admin-session')?.value

    if (!adminSession) {
      return NextResponse.json({ isAdmin: false, admin: null })
    }

    // جلب بيانات المسؤول
    const admin = await db.admin.findUnique({
      where: { id: adminSession },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        permissions: true
      }
    })

    if (!admin) {
      return NextResponse.json({ isAdmin: false, admin: null })
    }

    // تحويل الصلاحيات من JSON string إلى object
    let permissions = null
    if (admin.permissions) {
      try {
        permissions = JSON.parse(admin.permissions)
      } catch {
        permissions = null
      }
    }

    return NextResponse.json({ 
      isAdmin: true, 
      admin: {
        ...admin,
        permissions
      }
    })
  } catch (error) {
    console.error('[API/admin/check] Error checking admin:', error)
    
    // إرجاع خطأ مفصل في التطوير
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('[API/admin/check] Error details:', errorMessage)
    
    return NextResponse.json({ isAdmin: false, admin: null })
  }
}
