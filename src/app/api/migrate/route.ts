import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    // إضافة عمود businessType إذا لم يكن موجوداً
    await db.$executeRawUnsafe(`
      ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "businessType" TEXT;
    `)
    
    return NextResponse.json({ 
      success: true, 
      message: 'تم تحديث قاعدة البيانات بنجاح'
    })
  } catch (error: unknown) {
    console.error('Migration error:', error)
    const errorMessage = error instanceof Error ? error.message : 'حدث خطأ'
    return NextResponse.json({ 
      success: false, 
      error: errorMessage 
    }, { status: 500 })
  }
}

export async function GET() {
  return POST({} as NextRequest)
}
