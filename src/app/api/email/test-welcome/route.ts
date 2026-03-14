import { NextRequest, NextResponse } from 'next/server'
import { sendWelcomeEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, companyName, jobTitle } = body

    if (!email) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني مطلوب' },
        { status: 400 }
      )
    }

    // التحقق من وجود مفتاح API
    const resendApiKey = process.env.RESEND_API_KEY
    if (!resendApiKey) {
      return NextResponse.json({
        success: false,
        error: 'مفتاح Resend API غير موجود',
        details: 'يجب إضافة RESEND_API_KEY في متغيرات البيئة في Vercel',
        envCheck: {
          hasApiKey: false,
          fromEmail: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
        }
      }, { status: 500 })
    }

    // إرسال البريد الترحيبي
    const result = await sendWelcomeEmail({
      name: name || 'عضو تجريبي',
      email,
      companyName: companyName || null,
      jobTitle: jobTitle || null
    })

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: 'تم إرسال البريد الترحيبي بنجاح',
        details: `تم الإرسال إلى: ${email}`
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || 'حدث خطأ أثناء إرسال البريد',
        details: result.details,
        envCheck: {
          hasApiKey: true,
          apiKeyPrefix: resendApiKey.substring(0, 10) + '...',
          fromEmail: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
        }
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Error sending test welcome email:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'حدث خطأ في الاتصال بالخادم',
        details: error instanceof Error ? error.message : 'خطأ غير معروف'
      },
      { status: 500 }
    )
  }
}

// GET endpoint للتحقق من الإعدادات
export async function GET() {
  const resendApiKey = process.env.RESEND_API_KEY
  
  return NextResponse.json({
    configured: !!resendApiKey,
    apiKeyPrefix: resendApiKey ? resendApiKey.substring(0, 10) + '...' : null,
    fromEmail: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
    message: resendApiKey 
      ? 'مفتاح Resend API موجود ومُعد' 
      : 'مفتاح Resend API غير موجود - أضفه في Vercel Environment Variables'
  })
}
