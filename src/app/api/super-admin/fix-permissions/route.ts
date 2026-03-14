import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db } from '@/lib/db'

// New detailed permissions format
const defaultPermissions = {
  events: { view: true, create: true, edit: true, delete: true },
  members: { view: true, create: true, edit: true, delete: true },
  registrations: { view: true, create: true, edit: true, delete: true },
  sponsors: { view: true, create: true, edit: true, delete: true },
  settings: { view: false, create: false, edit: false, delete: false },
  export: { view: false, create: false, edit: false, delete: false }
}

export async function POST() {
  try {
    const cookieStore = await cookies()
    const adminSession = cookieStore.get('admin-session')?.value

    if (!adminSession) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    // التحقق من أن المستخدم سوبر أدمن
    const currentAdmin = await db.admin.findUnique({
      where: { id: adminSession }
    })

    if (!currentAdmin || currentAdmin.role !== 'super_admin') {
      return NextResponse.json({ error: 'يجب أن تكون سوبر أدمن' }, { status: 403 })
    }

    // جلب جميع المشرفين
    const admins = await db.admin.findMany()
    const updatedAdmins: string[] = []
    const errors: string[] = []

    for (const admin of admins) {
      try {
        // Parse old permissions
        let oldPerms = null
        if (admin.permissions) {
          try {
            oldPerms = JSON.parse(admin.permissions)
          } catch {
            // ignore parse errors
          }
        }

        // Convert to new format
        let newPerms = JSON.parse(JSON.stringify(defaultPermissions))

        if (oldPerms) {
          Object.keys(oldPerms).forEach(key => {
            if (newPerms[key as keyof typeof newPerms] && typeof oldPerms[key] === 'boolean') {
              if (oldPerms[key] === true) {
                newPerms[key as keyof typeof newPerms] = { view: true, create: true, edit: true, delete: true }
              } else {
                newPerms[key as keyof typeof newPerms] = { view: false, create: false, edit: false, delete: false }
              }
            } else if (newPerms[key as keyof typeof newPerms] && typeof oldPerms[key] === 'object') {
              newPerms[key as keyof typeof newPerms] = { ...newPerms[key as keyof typeof newPerms], ...oldPerms[key] }
            }
          })
        }

        // Update admin
        await db.admin.update({
          where: { id: admin.id },
          data: { permissions: JSON.stringify(newPerms) }
        })

        updatedAdmins.push(admin.email)
      } catch (updateError) {
        errors.push(`${admin.email}: ${updateError instanceof Error ? updateError.message : 'خطأ غير معروف'}`)
      }
    }

    return NextResponse.json({
      success: true,
      message: `تم تحديث ${updatedAdmins.length} مشرف`,
      updatedAdmins,
      errors: errors.length > 0 ? errors : undefined
    })
  } catch (error) {
    console.error('Error fixing permissions:', error)
    return NextResponse.json({
      error: 'حدث خطأ أثناء تحديث الصلاحيات',
      details: error instanceof Error ? error.message : 'خطأ غير معروف'
    }, { status: 500 })
  }
}
