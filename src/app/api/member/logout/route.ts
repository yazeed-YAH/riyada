import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  try {
    const cookieStore = await cookies()
    
    // حذف جميع الكوكيز
    cookieStore.delete('member-token')
    cookieStore.delete('admin-session')
    cookieStore.delete('auth-token')
    
    // إنشاء response مع حذف الكوكيز من headers
    const response = NextResponse.json({ success: true })
    
    // حذف الكوكيز عن طريق تعيين تاريخ انتهاء صلاحية قديم
    response.cookies.set('member-token', '', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 0
    })
    
    response.cookies.set('admin-session', '', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 0
    })
    
    return response
  } catch (error) {
    console.error('Error logging out member:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تسجيل الخروج' },
      { status: 500 }
    )
  }
}
