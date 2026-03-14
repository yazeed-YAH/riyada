import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

// تعديل أدمن
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies()
    const adminSession = cookieStore.get('admin-session')?.value

    if (!adminSession) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { id } = await params
    const { name, email, password, role, permissions } = await request.json()

    const updateData: { name?: string; email?: string; password?: string; role?: string; permissions?: string | null } = {}
    
    if (name !== undefined) updateData.name = name
    if (email !== undefined) updateData.email = email
    if (role !== undefined) updateData.role = role
    if (password) updateData.password = await bcrypt.hash(password, 12)
    if (permissions !== undefined) {
      updateData.permissions = permissions ? JSON.stringify(permissions) : null
    }

    const updatedAdmin = await db.admin.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({ 
      admin: {
        id: updatedAdmin.id,
        name: updatedAdmin.name,
        email: updatedAdmin.email,
        role: updatedAdmin.role,
        permissions: updatedAdmin.permissions,
        createdAt: updatedAdmin.createdAt
      }
    })
  } catch (error) {
    console.error('Error updating admin:', error)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}

// حذف أدمن
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies()
    const adminSession = cookieStore.get('admin-session')?.value

    if (!adminSession) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { id } = await params

    // منع حذف النفس
    if (id === adminSession) {
      return NextResponse.json({ error: 'لا يمكنك حذف حسابك' }, { status: 400 })
    }

    const targetAdmin = await db.admin.findUnique({ where: { id } })
    if (targetAdmin?.role === 'super_admin') {
      return NextResponse.json({ error: 'لا يمكن حذف السوبر أدمن' }, { status: 400 })
    }

    await db.admin.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting admin:', error)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}
