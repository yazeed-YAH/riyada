import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import crypto from 'crypto'

// إرسال بريد إلكتروني لاستعادة كلمة المرور
export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'البريد الإلكتروني مطلوب' }, { status: 400 })
    }

    // البحث عن المستخدم في جدول الأدمن أو الأعضاء
    let user = await db.admin.findUnique({ where: { email: email.toLowerCase() } })
    let userType = 'admin'

    if (!user) {
      user = await db.member.findUnique({ where: { email: email.toLowerCase() } }) as { id: string; email: string; name: string | null } | null
      userType = 'member'
    }

    // حتى لو لم نجد المستخدم، نرجع رسالة نجاح (لأسباب أمنية)
    if (!user) {
      return NextResponse.json({ success: true, message: 'إذا كان البريد موجوداً، سيتم إرسال رابط الاستعادة' })
    }

    // إنشاء token عشوائي (16 حرف فقط لرابط أقصر)
    const resetToken = crypto.randomBytes(8).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // ساعة واحدة

    // حفظ الـ token في قاعدة البيانات
    await db.siteSettings.upsert({
      where: { key: `reset_token_${resetToken}` },
      update: {
        value: JSON.stringify({
          email: email.toLowerCase(),
          userId: user.id,
          userType,
          expires: resetTokenExpiry.toISOString()
        })
      },
      create: {
        key: `reset_token_${resetToken}`,
        value: JSON.stringify({
          email: email.toLowerCase(),
          userId: user.id,
          userType,
          expires: resetTokenExpiry.toISOString()
        })
      }
    })

    // إنشاء رابط إعادة التعيين (رابط قصير - الـ token فقط)
    const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://riyada.yplus.ai'}/reset-password?token=${resetToken}`

    // إرسال البريد الإلكتروني
    try {
      const { Resend } = await import('resend')
      const resend = new Resend(process.env.RESEND_API_KEY)

      await resend.emails.send({
        from: 'ملتقى ريادة <noreply@riyada.yplus.ai>',
        to: email,
        subject: 'استعادة كلمة المرور - ملتقى ريادة',
        html: `
          <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 600px; margin: 0 auto; background: #fdf8f9; padding: 40px 20px;">
            <div style="background: white; border-radius: 20px; padding: 40px; box-shadow: 0 4px 20px rgba(168, 85, 111, 0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #a8556f 0%, #9b7b9a 100%); border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                  <span style="font-size: 28px;">🔐</span>
                </div>
                <h1 style="color: #2d1f26; font-size: 24px; margin: 0;">استعادة كلمة المرور</h1>
              </div>
              
              <p style="color: #6b5a60; font-size: 16px; line-height: 1.8; text-align: center; margin-bottom: 30px;">
                مرحباً ${user.name || 'عزيزتي'}،
                <br><br>
                تم طلب إعادة تعيين كلمة المرور الخاصة بحسابك. اضغطي على الزر أدناه لإنشاء كلمة مرور جديدة:
              </p>
              
              <div style="text-align: center; margin-bottom: 30px;">
                <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #a8556f 0%, #9b7b9a 100%); color: white; padding: 16px 40px; border-radius: 50px; text-decoration: none; font-size: 16px; font-weight: bold;">
                  إعادة تعيين كلمة المرور
                </a>
              </div>
              
              <p style="color: #9a8a90; font-size: 14px; text-align: center; margin-bottom: 20px;">
                هذا الرابط صالح لمدة ساعة واحدة فقط
                <br>
                إذا لم تطلبي هذا التغيير، يمكنك تجاهل هذا البريد
              </p>
              
              <div style="background: #fdf2f4; border-radius: 12px; padding: 20px; margin-top: 20px;">
                <p style="color: #6b5a60; font-size: 14px; text-align: center; margin: 0;">
                  إذا لم يعمل الزر، انسخي هذا الرابط:
                  <br>
                  <a href="${resetUrl}" style="color: #a8556f; word-break: break-all; font-size: 12px;">${resetUrl}</a>
                </p>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #9a8a90; font-size: 12px;">
                ملتقى ريادة - تجمع سيدات الأعمال
                <br>
                <a href="https://riyada.yplus.ai" style="color: #a8556f;">riyada.yplus.ai</a>
              </p>
            </div>
          </div>
        `
      })
    } catch (emailError) {
      console.error('Error sending email:', emailError)
      // نرجع الرابط للتطوير
      return NextResponse.json({ 
        success: true, 
        message: 'تم إنشاء رابط الاستعادة',
        // في وضع التطوير نرجع الرابط
        ...(process.env.NODE_ENV === 'development' && { resetUrl })
      })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني'
    })

  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}
