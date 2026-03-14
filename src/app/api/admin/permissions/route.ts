import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db } from '@/lib/db'

interface Permissions {
  events: boolean
  members: boolean
  registrations: boolean
  sponsors: boolean
  settings: boolean
}

const defaultPermissions: Permissions = {
  events: true,
  members: true,
  registrations: true,
  sponsors: true,
  settings: false
}

export async function GET() {
  try {
    const cookieStore = await cookies()
    const adminSession = cookieStore.get('admin-session')?.value

    if (!adminSession) {
      return NextResponse.json({ hasPermission: false }, { status: 401 })
    }

    const admin = await db.admin.findUnique({
      where: { id: adminSession },
      select: {
        role: true,
        permissions: true
      }
    })

    if (!admin) {
      return NextResponse.json({ hasPermission: false }, { status: 401 })
    }

    // السوبر أدمن يملك جميع الصلاحيات
    if (admin.role === 'super_admin') {
      return NextResponse.json({
        isAdmin: true,
        role: admin.role,
        permissions: {
          events: true,
          members: true,
          registrations: true,
          sponsors: true,
          settings: true
        }
      })
    }

    // تحويل الصلاحيات من JSON string إلى object
    let permissions: Permissions = { ...defaultPermissions }
    if (admin.permissions) {
      try {
        permissions = { ...defaultPermissions, ...JSON.parse(admin.permissions) }
      } catch {
        permissions = { ...defaultPermissions }
      }
    }

    return NextResponse.json({
      isAdmin: true,
      role: admin.role,
      permissions
    })
  } catch (error) {
    console.error('Error checking permissions:', error)
    return NextResponse.json({ hasPermission: false }, { status: 500 })
  }
}
