import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

// جلب قائمة الأدمنز
export async function GET() {
  try {
    const cookieStore = await cookies()
    const adminSession = cookieStore.get('admin-session')?.value

    console.log('[API/super-admin/admins] Session:', adminSession ? 'exists' : 'missing')

    if (!adminSession) {
      console.log('[API/super-admin/admins] No session, returning 401')
      return NextResponse.json({ error: 'غير مصرح', admins: [] }, { status: 401 })
    }

    console.log('[API/super-admin/admins] Fetching admins from database...')
    const admins = await db.admin.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        permissions: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    })

    console.log('[API/super-admin/admins] Found', admins.length, 'admins')
    return NextResponse.json({ admins })
  } catch (error) {
    console.error('[API/super-admin/admins] Error:', error)
    return NextResponse.json({ error: 'حدث خطأ', admins: [] }, { status: 500 })
  }
}

// إضافة أدمن جديد
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const adminSession = cookieStore.get('admin-session')?.value

    if (!adminSession) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { name, email, password, role, permissions } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'البريد الإلكتروني وكلمة المرور مطلوبان' }, { status: 400 })
    }

    // التحقق من عدم وجود أدمن بنفس البريد
    const existingAdmin = await db.admin.findUnique({
      where: { email }
    })

    if (existingAdmin) {
      return NextResponse.json({ error: 'البريد الإلكتروني مستخدم بالفعل' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const newAdmin = await db.admin.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'admin',
        permissions: permissions ? JSON.stringify(permissions) : null
      }
    })

    return NextResponse.json({ 
      admin: {
        id: newAdmin.id,
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role,
        permissions: newAdmin.permissions,
        createdAt: newAdmin.createdAt
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating admin:', error)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}
