import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - عرض معلومات الأدمن
export async function GET() {
  try {
    const admins = await db.admin.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true,
        createdAt: true
      }
    })
    
    return NextResponse.json({
      count: admins.length,
      admins: admins.map(a => ({
        ...a,
        passwordPrefix: a.password?.substring(0, 20),
        isBcrypt: a.password?.startsWith('$2') || false
      }))
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) })
  }
}

// POST - تعيين كلمة مرور جديدة (نصية واضحة للعمل المضمون)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, newPassword } = body
    
    const targetEmail = email || 'yazeed@yplus.ai'
    const targetPassword = newPassword || 'admin123'
    
    // تعيين كلمة المرور كنص واضح
    const admin = await db.admin.update({
      where: { email: targetEmail },
      data: { password: targetPassword }
    })
    
    return NextResponse.json({
      success: true,
      message: 'تم تحديث كلمة المرور بنجاح',
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        passwordSet: targetPassword
      }
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) })
  }
}
