import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

// اتصال مباشر بقاعدة البيانات
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    console.log('🔐 Direct login attempt:', email)

    if (!email || !password) {
      return NextResponse.json({ error: 'البريد وكلمة المرور مطلوبان' }, { status: 400 })
    }

    // البحث عن المدير
    const result = await pool.query(
      'SELECT id, email, password, name, role FROM "Admin" WHERE email = $1',
      [email.toLowerCase().trim()]
    )

    if (result.rows.length === 0) {
      console.log('❌ Admin not found')
      return NextResponse.json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' }, { status: 401 })
    }

    const admin = result.rows[0]
    console.log('✅ Admin found:', admin.email)

    // التحقق من كلمة المرور
    let isValid = false

    // مقارنة مباشرة
    if (admin.password === password) {
      isValid = true
      console.log('✅ Direct match')
    }
    // bcrypt
    else if (admin.password.startsWith('$2')) {
      try {
        isValid = await bcrypt.compare(password, admin.password)
        console.log('🔐 bcrypt result:', isValid)
      } catch (e) {
        console.log('❌ bcrypt error:', e)
      }
    }

    if (!isValid) {
      return NextResponse.json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' }, { status: 401 })
    }

    // إنشاء جلسة
    const cookieStore = await cookies()
    cookieStore.set('admin-session', admin.id, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      }
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({
      error: 'حدث خطأ',
      details: error instanceof Error ? error.message : 'unknown'
    }, { status: 500 })
  }
}
