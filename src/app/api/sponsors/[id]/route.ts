import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - جلب معلومات الراعي العامة (للصفحة العامة)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const sponsor = await db.sponsorRequest.findUnique({
      where: { id },
      select: {
        id: true,
        companyName: true,
        contactName: true,
        logoUrl: true,
        websiteUrl: true,
        instagram: true,
        twitter: true,
        snapchat: true,
        tiktok: true,
        linkedin: true,
        // لا نرسل نوع الرعاية أو المبلغ أو البريد أو الهاتف
      }
    })

    if (!sponsor) {
      return NextResponse.json(
        { error: 'الراعي غير موجود' },
        { status: 404 }
      )
    }

    return NextResponse.json({ sponsor })
  } catch (error) {
    console.error('Error fetching sponsor:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب بيانات الراعي' },
      { status: 500 }
    )
  }
}

// PATCH - تحديث طلب الرعاية
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    console.log('Updating sponsor:', id, 'with data:', body)

    const sponsor = await db.sponsorRequest.update({
      where: { id },
      data: {
        ...(body.status !== undefined && { status: body.status }),
        ...(body.notes !== undefined && { notes: body.notes }),
        ...(body.companyName !== undefined && { companyName: body.companyName }),
        ...(body.contactName !== undefined && { contactName: body.contactName }),
        ...(body.email !== undefined && { email: body.email }),
        ...(body.phone !== undefined && { phone: body.phone }),
        ...(body.sponsorshipType !== undefined && { sponsorshipType: body.sponsorshipType }),
        ...(body.sponsorType !== undefined && { sponsorType: body.sponsorType }),
        ...(body.logoUrl !== undefined && { logoUrl: body.logoUrl }),
        ...(body.websiteUrl !== undefined && { websiteUrl: body.websiteUrl }),
        ...(body.profileUrl !== undefined && { profileUrl: body.profileUrl }),
        ...(body.amount !== undefined && { amount: body.amount ? parseFloat(body.amount) : null }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.instagram !== undefined && { instagram: body.instagram }),
        ...(body.twitter !== undefined && { twitter: body.twitter }),
        ...(body.snapchat !== undefined && { snapchat: body.snapchat }),
        ...(body.tiktok !== undefined && { tiktok: body.tiktok }),
        ...(body.linkedin !== undefined && { linkedin: body.linkedin }),
      }
    })

    return NextResponse.json({ sponsor })
  } catch (error) {
    console.error('Error updating sponsor request:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحديث طلب الرعاية' },
      { status: 500 }
    )
  }
}

// DELETE - حذف طلب الرعاية
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    await db.sponsorRequest.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting sponsor request:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء حذف طلب الرعاية' },
      { status: 500 }
    )
  }
}
