import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendConfirmationEmailForRegistration } from '@/lib/email-confirmation'

// PATCH - تحديث بيانات التسجيل
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, notes, name, email, phone, companyName, jobTitle, gender, imageUrl, sendEmail } = body

    // بناء كائن البيانات للتحديث
    const updateData: {
      status?: string
      notes?: string
      name?: string
      email?: string
      phone?: string | null
      companyName?: string | null
      jobTitle?: string | null
      gender?: string | null
      imageUrl?: string | null
    } = {}

    if (status !== undefined) updateData.status = status
    if (notes !== undefined) updateData.notes = notes
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

    const registration = await db.eventRegistration.update({
      where: { id },
      data: updateData
    })

    // إذا تم التأكيد، إرسال إيميل تلقائياً
    let emailResult = null
    if (status === 'confirmed' && sendEmail !== false) {
      console.log('Sending confirmation email for registration:', id)
      emailResult = await sendConfirmationEmailForRegistration(id)
      console.log('Email result:', emailResult)
    }

    return NextResponse.json({ 
      registration,
      emailSent: emailResult?.success || false,
      emailError: emailResult?.error
    })
  } catch (error) {
    console.error('Error updating registration:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحديث التسجيل' },
      { status: 500 }
    )
  }
}

// DELETE - حذف التسجيل
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    await db.eventRegistration.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting registration:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء حذف التسجيل' },
      { status: 500 }
    )
  }
}
