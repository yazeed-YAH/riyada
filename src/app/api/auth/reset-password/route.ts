import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

// إعادة تعيين كلمة المرور
export async function POST(request: Request) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json({ error: 'البيانات غير مكتملة' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' }, { status: 400 })
    }

    // البحث عن الـ token في قاعدة البيانات
    const resetData = await db.siteSettings.findUnique({
      where: { key: `reset_token_${token}` }
    })

    if (!resetData) {
      return NextResponse.json({ error: 'رابط غير صالح' }, { status: 400 })
    }

    const data = JSON.parse(resetData.value)

    // التحقق من انتهاء الصلاحية
    if (new Date(data.expires) < new Date()) {
      await db.siteSettings.delete({ where: { key: `reset_token_${token}` } })
      return NextResponse.json({ error: 'الرابط منتهي الصلاحية' }, { status: 400 })
    }

    // تشفير كلمة المرور الجديدة
    const hashedPassword = await bcrypt.hash(password, 10)

    // تحديث كلمة المرور
    if (data.userType === 'admin') {
      await db.admin.update({
        where: { id: data.userId },
        data: { password: hashedPassword }
      })
    } else {
      await db.member.update({
        where: { id: data.userId },
        data: { password: hashedPassword }
      })
    }

    // حذف الـ token بعد الاستخدام
    await db.siteSettings.delete({ where: { key: `reset_token_${token}` } })

    return NextResponse.json({ success: true, message: 'تم إعادة تعيين كلمة المرور بنجاح' })

  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}
