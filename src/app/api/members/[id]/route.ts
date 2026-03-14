import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

// GET - جلب بيانات عضو محدد
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const member = await db.member.findUnique({
      where: { id },
      include: {
        _count: {
          select: { EventRegistration: true }
        }
      }
    })

    if (!member) {
      return NextResponse.json(
        { error: 'العضو غير موجود' },
        { status: 404 }
      )
    }

    return NextResponse.json({ member })
  } catch (error) {
    console.error('Error fetching member:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب بيانات العضو' },
      { status: 500 }
    )
  }
}

// PATCH - تحديث بيانات العضو
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    const { 
      name, email, phone, companyName, jobTitle, gender, imageUrl,
      twitter, instagram, linkedin, snapchat 
    } = body

    // التحقق من وجود العضو
    const existingMember = await db.member.findUnique({
      where: { id }
    })

    if (!existingMember) {
      return NextResponse.json(
        { error: 'العضو غير موجود' },
        { status: 404 }
      )
    }

    // تحديث بيانات العضو
    const updateData: {
      name?: string
      email?: string
      phone?: string | null
      companyName?: string | null
      jobTitle?: string | null
      gender?: string | null
      imageUrl?: string | null
      twitter?: string | null
      instagram?: string | null
      linkedin?: string | null
      snapchat?: string | null
      password?: string | null
    } = {}

    if (name !== undefined) updateData.name = name
    if (email !== undefined) {
      // إذا كان البريد فارغ، استخدم بريد placeholder
      updateData.email = email && email.trim() !== '' 
        ? email 
        : `no-email-${Date.now()}@placeholder.com`
    }
    if (phone !== undefined) updateData.phone = phone || null
    if (companyName !== undefined) updateData.companyName = companyName || null
    if (jobTitle !== undefined) updateData.jobTitle = jobTitle || null
    if (gender !== undefined) updateData.gender = gender || null
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl || null
    if (twitter !== undefined) updateData.twitter = twitter || null
    if (instagram !== undefined) updateData.instagram = instagram || null
    if (linkedin !== undefined) updateData.linkedin = linkedin || null
    if (snapchat !== undefined) updateData.snapchat = snapchat || null

    // تحديث كلمة المرور إذا تم توفيرها وليست فارغة
    const { password } = body
    if (password && password.trim() !== '') {
      updateData.password = await bcrypt.hash(password, 10)
    }

    const member = await db.member.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({ member })
  } catch (error) {
    console.error('Error updating member:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحديث بيانات العضو' },
      { status: 500 }
    )
  }
}

// DELETE - حذف العضو
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // التحقق من وجود العضو
    const existingMember = await db.member.findUnique({
      where: { id }
    })

    if (!existingMember) {
      return NextResponse.json(
        { error: 'العضو غير موجود' },
        { status: 404 }
      )
    }

    // حذف العضو
    await db.member.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting member:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء حذف العضو' },
      { status: 500 }
    )
  }
}
