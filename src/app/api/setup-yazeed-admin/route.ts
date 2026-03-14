import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    // التحقق من وجود الأدمن
    const existing = await db.admin.findUnique({
      where: { email: 'yazeed@yplus.ai' }
    })

    if (existing) {
      return NextResponse.json({
        exists: true,
        message: 'Admin already exists',
        admin: {
          id: existing.id,
          email: existing.email,
          name: existing.name,
          role: existing.role
        }
      })
    }

    // إنشاء أدمن جديد
    const hashedPassword = await bcrypt.hash('Yazeed@123', 10)
    const admin = await db.admin.create({
      data: {
        email: 'yazeed@yplus.ai',
        password: hashedPassword,
        name: 'Yazeed Admin',
        role: 'super_admin',
        permissions: '{"events":true,"members":true,"registrations":true,"sponsors":true,"settings":true,"export":true}'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Admin created successfully',
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      },
      password: 'Yazeed@123'
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Failed to create admin' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { password } = body

    console.log('POST setup-yazeed-admin, password:', password ? 'provided' : 'missing')

    // تحديث كلمة مرور الأدمن
    const hashedPassword = await bcrypt.hash(password || 'Yazeed@123', 10)
    console.log('Hashed password created')

    // محاولة العثور على الأدمن أولاً
    const existing = await db.admin.findUnique({
      where: { email: 'yazeed@yplus.ai' }
    })
    console.log('Existing admin:', existing ? 'found' : 'not found')

    let admin
    if (existing) {
      // تحديث الأدمن الموجود
      admin = await db.admin.update({
        where: { id: existing.id },
        data: { password: hashedPassword, role: 'super_admin' }
      })
      console.log('Admin updated:', admin.id)
    } else {
      // إنشاء أدمن جديد
      admin = await db.admin.create({
        data: {
          email: 'yazeed@yplus.ai',
          password: hashedPassword,
          name: 'Yazeed Admin',
          role: 'super_admin',
          permissions: '{"events":true,"members":true,"registrations":true,"sponsors":true,"settings":true,"export":true}'
        }
      })
      console.log('Admin created:', admin.id)
    }

    return NextResponse.json({
      success: true,
      message: 'Admin password updated',
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      }
    })
  } catch (error) {
    console.error('Error in setup-yazeed-admin POST:', error)
    return NextResponse.json({ 
      error: 'Failed to update admin',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
