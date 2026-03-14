import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - جلب ملاحظات الراعي
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const notes = await db.sponsorNote.findMany({
      where: { sponsorId: id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ notes })
  } catch (error) {
    console.error('Error fetching sponsor notes:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب الملاحظات' },
      { status: 500 }
    )
  }
}

// POST - إضافة ملاحظة جديدة
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    const { content, authorName } = body

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'محتوى الملاحظة مطلوب' },
        { status: 400 }
      )
    }

    const note = await db.sponsorNote.create({
      data: {
        sponsorId: id,
        content: content.trim(),
        authorName: authorName || 'مدير النظام'
      }
    })

    return NextResponse.json({ note })
  } catch (error) {
    console.error('Error creating sponsor note:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إضافة الملاحظة' },
      { status: 500 }
    )
  }
}

// DELETE - حذف ملاحظة
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const noteId = searchParams.get('noteId')

    if (!noteId) {
      return NextResponse.json(
        { error: 'معرف الملاحظة مطلوب' },
        { status: 400 }
      )
    }

    await db.sponsorNote.delete({
      where: { id: noteId, sponsorId: id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting sponsor note:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء حذف الملاحظة' },
      { status: 500 }
    )
  }
}
