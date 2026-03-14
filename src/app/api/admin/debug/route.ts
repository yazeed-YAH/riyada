import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

// صفحة إعادة تعيين كلمة المرور
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')
  const email = searchParams.get('email')
  const newPassword = searchParams.get('password')
  const key = searchParams.get('key')

  // التحقق من المفتاح
  if (key !== 'reset2026') {
    return new NextResponse(`
      <html dir="rtl">
      <body style="font-family: Arial; padding: 20px; background: #fdf8f9;">
        <h1 style="color: #a8556f;">🔑 إعادة تعيين كلمة المرور</h1>
        <p style="color: #666;">مفتاح غير صالح</p>
      </body>
      </html>
    `, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
  }

  try {
    // جلب جميع المدرين
    const admins = await db.admin.findMany({
      select: { id: true, email: true, name: true, role: true }
    })

    // إذا كان هناك طلب إعادة تعيين
    if (action === 'reset' && email && newPassword) {
      const admin = admins.find(a => a.email.toLowerCase() === email.toLowerCase())
      
      if (admin) {
        const hashedPassword = await bcrypt.hash(newPassword, 12)
        await db.admin.update({
          where: { id: admin.id },
          data: { password: hashedPassword, updatedAt: new Date() }
        })
        
        return new NextResponse(`
          <html dir="rtl">
          <body style="font-family: Arial; padding: 20px; background: #fdf8f9;">
            <h1 style="color: #2d6b3d;">✅ تم بنجاح!</h1>
            <p style="color: #333;">تم تحديث كلمة المرور لـ: <strong>${admin.email}</strong></p>
            <p style="color: #666;">كلمة المرور الجديدة: <strong>${newPassword}</strong></p>
            <hr>
            <a href="/api/admin/debug?key=reset2026" style="color: #a8556f;">العودة للقائمة</a>
          </body>
          </html>
        `, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
      } else {
        return new NextResponse(`
          <html dir="rtl">
          <body style="font-family: Arial; padding: 20px; background: #fdf8f9;">
            <h1 style="color: #dc2626;">❌ خطأ</h1>
            <p style="color: #333;">البريد غير موجود: ${email}</p>
            <hr>
            <a href="/api/admin/debug?key=reset2026" style="color: #a8556f;">العودة للقائمة</a>
          </body>
          </html>
        `, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
      }
    }

    // عرض قائمة المدرين
    const adminsList = admins.map(a => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${a.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${a.email}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${a.role}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          <form action="/api/admin/debug" method="get" style="display: flex; gap: 5px;">
            <input type="hidden" name="key" value="reset2026">
            <input type="hidden" name="action" value="reset">
            <input type="hidden" name="email" value="${a.email}">
            <input type="text" name="password" placeholder="كلمة المرور الجديدة" required 
              style="padding: 5px; border: 1px solid #ccc; border-radius: 5px;">
            <button type="submit" style="padding: 5px 15px; background: #a8556f; color: white; border: none; border-radius: 5px; cursor: pointer;">
              تحديث
            </button>
          </form>
        </td>
      </tr>
    `).join('')

    return new NextResponse(`
      <html dir="rtl">
      <body style="font-family: Arial; padding: 20px; background: #fdf8f9;">
        <h1 style="color: #a8556f;">🔑 إعادة تعيين كلمات المرور</h1>
        <p style="color: #666;">عدد المدرين: ${admins.length}</p>
        <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <thead>
            <tr style="background: #f5f5f5;">
              <th style="padding: 10px; text-align: right;">الاسم</th>
              <th style="padding: 10px; text-align: right;">البريد</th>
              <th style="padding: 10px; text-align: right;">الصلاحية</th>
              <th style="padding: 10px; text-align: right;">إعادة تعيين</th>
            </tr>
          </thead>
          <tbody>
            ${adminsList}
          </tbody>
        </table>
      </body>
      </html>
    `, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })

  } catch (error) {
    return new NextResponse(`
      <html dir="rtl">
      <body style="font-family: Arial; padding: 20px; background: #fdf8f9;">
        <h1 style="color: #dc2626;">❌ خطأ</h1>
        <pre style="background: #fff; padding: 10px; border-radius: 5px;">${error instanceof Error ? error.message : String(error)}</pre>
      </body>
      </html>
    `, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
  }
}
