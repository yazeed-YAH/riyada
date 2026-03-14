import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

// صفحة إصلاح كلمة مرور المدير
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const key = searchParams.get('key')
  const email = searchParams.get('email')
  const newPassword = searchParams.get('password')

  // التحقق من المفتاح
  if (key !== 'fix2026') {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  try {
    // إذا طُلب تحديث كلمة مرور معينة
    if (email && newPassword) {
      const admin = await db.admin.findUnique({
        where: { email: email.toLowerCase() }
      })

      if (!admin) {
        return NextResponse.json({ error: 'المدير غير موجود', email })
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12)
      await db.admin.update({
        where: { id: admin.id },
        data: { password: hashedPassword, updatedAt: new Date() }
      })

      return NextResponse.json({
        success: true,
        message: 'تم تحديث كلمة المرور',
        admin: { email: admin.email, name: admin.name }
      })
    }

    // عرض قائمة المدرين
    const admins = await db.admin.findMany({
      select: { id: true, email: true, name: true, role: true }
    })

    return NextResponse.json({
      admins,
      message: 'أضف &email=XXX&password=YYY لتحديث كلمة المرور'
    })

  } catch (error) {
    return NextResponse.json({
      error: 'خطأ',
      details: error instanceof Error ? error.message : 'unknown'
    }, { status: 500 })
  }
}
