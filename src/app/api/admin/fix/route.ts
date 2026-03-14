import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

// GET - إنشاء/إصلاح حساب الأدمن
export async function GET(request: NextRequest) {
  try {
    const email = 'yazeed@yplus.ai'
    const password = 'admin123'
    
    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // البحث عن الأدمن
    const existingAdmin = await db.admin.findUnique({
      where: { email }
    })
    
    if (existingAdmin) {
      // تحديث كلمة المرور
      await db.admin.update({
        where: { id: existingAdmin.id },
        data: { password: hashedPassword }
      })
      
      return NextResponse.json({ 
        success: true, 
        message: 'تم تحديث كلمة المرور',
        email,
        password
      })
    } else {
      // إنشاء أدمن جديد
      const newAdmin = await db.admin.create({
        data: {
          email,
          password: hashedPassword,
          name: 'مدير النظام',
          role: 'super_admin'
        }
      })
      
      return NextResponse.json({ 
        success: true, 
        message: 'تم إنشاء حساب الأدمن',
        email,
        password,
        admin: {
          id: newAdmin.id,
          email: newAdmin.email,
          name: newAdmin.name
        }
      })
    }
  } catch (error) {
    console.error('Error fixing admin:', error)
    return NextResponse.json({ 
      error: 'حدث خطأ: ' + (error instanceof Error ? error.message : 'خطأ غير معروف'),
      hint: 'تأكد من وجود جدول Admin في قاعدة البيانات'
    }, { status: 500 })
  }
}
