import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// التحقق من صلاحية token إعادة تعيين كلمة المرور
export async function POST(request: Request) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ valid: false, error: 'البيانات غير مكتملة' }, { status: 400 })
    }

    // البحث عن الـ token في قاعدة البيانات
    const resetData = await db.siteSettings.findUnique({
      where: { key: `reset_token_${token}` }
    })

    if (!resetData) {
      return NextResponse.json({ valid: false })
    }

    const data = JSON.parse(resetData.value)

    // التحقق من انتهاء الصلاحية
    if (new Date(data.expires) < new Date()) {
      // حذف الـ token المنتهي
      await db.siteSettings.delete({ where: { key: `reset_token_${token}` } })
      return NextResponse.json({ valid: false })
    }

    return NextResponse.json({ valid: true, email: data.email })

  } catch (error) {
    console.error('Verify token error:', error)
    return NextResponse.json({ valid: false }, { status: 500 })
  }
}
