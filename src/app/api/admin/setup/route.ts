import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

// GET - التحقق من حالة الأدمن
export async function GET() {
  try {
    const admins = await db.admin.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      success: true,
      count: admins.length,
      admins
    })
  } catch (error) {
    console.error('Error checking admins:', error)
    return NextResponse.json({
      success: false,
      error: String(error)
    }, { status: 500 })
  }
}

// POST - إنشاء أو تحديث سوبر أدمن
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, name } = body

    console.log('Setup request:', { email, password: '***', name })

    if (!email || !password) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني وكلمة المرور مطلوبان' },
        { status: 400 }
      )
    }

    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 12)
    console.log('Hashed password:', hashedPassword.substring(0, 20) + '...')

    // البحث عن أدمن موجود بنفس البريد
    const existingAdmin = await db.admin.findUnique({
      where: { email }
    })

    if (existingAdmin) {
      // تحديث الأدمن الموجود
      const updated = await db.admin.update({
        where: { id: existingAdmin.id },
        data: {
          password: hashedPassword,
          name: name || existingAdmin.name,
          role: 'super_admin',
          permissions: JSON.stringify({
            events: true,
            members: true,
            registrations: true,
            sponsors: true,
            settings: true,
            export: true
          })
        }
      })

      console.log('Updated admin:', updated.email)

      return NextResponse.json({
        success: true,
        message: 'تم تحديث بيانات المسؤول بنجاح',
        admin: {
          id: updated.id,
          email: updated.email,
          name: updated.name,
          role: updated.role
        }
      })
    } else {
      // إنشاء أدمن جديد
      const newAdmin = await db.admin.create({
        data: {
          email,
          password: hashedPassword,
          name: name || 'مدير النظام',
          role: 'super_admin',
          permissions: JSON.stringify({
            events: true,
            members: true,
            registrations: true,
            sponsors: true,
            settings: true,
            export: true
          })
        }
      })

      console.log('Created admin:', newAdmin.email)

      return NextResponse.json({
        success: true,
        message: 'تم إنشاء المسؤول بنجاح',
        admin: {
          id: newAdmin.id,
          email: newAdmin.email,
          name: newAdmin.name,
          role: newAdmin.role
        }
      })
    }
  } catch (error) {
    console.error('Error creating/updating admin:', error)
    return NextResponse.json({
      success: false,
      error: String(error)
    }, { status: 500 })
  }
}
