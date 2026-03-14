import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

// API لإعادة تعيين كلمة مرور المدير

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { secretKey, email, newPassword } = body

    console.log('🔄 Reset password request:', { email, hasKey: !!secretKey })

    // التحقق من المفتاح السري
    const validKey = 'RiyadaReset2026!@Secure'
    
    if (secretKey !== validKey) {
      console.log('❌ Invalid secret key')
      return NextResponse.json(
        { error: 'مفتاح غير صالح' },
        { status: 401 }
      )
    }

    if (!email || !newPassword) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني وكلمة المرور الجديدة مطلوبان' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()
    console.log('🔍 Looking for admin:', normalizedEmail)

    // البحث عن المدير
    let admin
    try {
      admin = await db.admin.findUnique({
        where: { email: normalizedEmail }
      })
      console.log('📊 Admin query result:', admin ? 'found' : 'not found')
    } catch (dbError) {
      console.error('❌ Database error:', dbError)
      return NextResponse.json(
        { error: 'خطأ في قاعدة البيانات: ' + (dbError instanceof Error ? dbError.message : 'unknown') },
        { status: 500 }
      )
    }

    if (!admin) {
      // جلب جميع المدرين لمعرفة الموجودين
      const allAdmins = await db.admin.findMany({
        select: { email: true, name: true }
      })
      console.log('📋 All admins:', allAdmins)
      
      return NextResponse.json(
        { 
          error: 'المدير غير موجود',
          availableAdmins: allAdmins.map(a => a.email)
        },
        { status: 404 }
      )
    }

    // تشفير كلمة المرور الجديدة
    const hashedPassword = await bcrypt.hash(newPassword, 12)
    console.log('🔐 Password hashed')

    // تحديث كلمة المرور
    try {
      await db.admin.update({
        where: { id: admin.id },
        data: { 
          password: hashedPassword,
          updatedAt: new Date()
        }
      })
      console.log('✅ Password updated')
    } catch (updateError) {
      console.error('❌ Update error:', updateError)
      return NextResponse.json(
        { error: 'خطأ في التحديث: ' + (updateError instanceof Error ? updateError.message : 'unknown') },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true,
      message: `تم تحديث كلمة المرور لـ: ${admin.email}`,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      }
    })

  } catch (error) {
    console.error('❌ Error resetting password:', error)
    return NextResponse.json(
      { error: 'حدث خطأ: ' + (error instanceof Error ? error.message : 'unknown') },
      { status: 500 }
    )
  }
}

// GET لعرض قائمة المدرين
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const secretKey = searchParams.get('key')

    const validKey = 'RiyadaReset2026!@Secure'
    
    if (secretKey !== validKey) {
      return NextResponse.json({ error: 'مفتاح غير صالح' }, { status: 401 })
    }

    console.log('📋 Fetching all admins...')

    // جلب قائمة المدرين
    let admins
    try {
      admins = await db.admin.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true
        }
      })
      console.log('✅ Found admins:', admins.length)
    } catch (dbError) {
      console.error('❌ Database error:', dbError)
      return NextResponse.json(
        { error: 'خطأ في قاعدة البيانات: ' + (dbError instanceof Error ? dbError.message : 'unknown') },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      admins,
      count: admins.length,
      message: 'استخدم POST لإعادة تعيين كلمة المرور'
    })

  } catch (error) {
    console.error('❌ Error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ: ' + (error instanceof Error ? error.message : 'unknown') },
      { status: 500 }
    )
  }
}
