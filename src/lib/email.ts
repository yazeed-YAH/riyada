import { db } from '@/lib/db'

interface SendEmailParams {
  to: string
  subject: string
  html: string
}

interface MemberInfo {
  name: string
  email: string
  companyName?: string | null
  jobTitle?: string | null
}

interface EmailResult {
  success: boolean
  error?: string
  details?: string
}

// دالة لإرسال الإيميل باستخدام Resend API
export async function sendEmail({ to, subject, html }: SendEmailParams): Promise<EmailResult> {
  try {
    const resendApiKey = process.env.RESEND_API_KEY
    
    if (!resendApiKey) {
      console.log('RESEND_API_KEY not configured, skipping email send')
      return { success: false, error: 'RESEND_API_KEY غير موجود', details: 'يجب إضافة مفتاح Resend API في متغيرات البيئة' }
    }

    // جلب إعدادات الإيميل
    const settings = await db.siteSettings.findMany({
      where: {
        key: {
          startsWith: 'email_'
        }
      }
    })
    
    const emailSettings: Record<string, string> = {}
    settings.forEach(setting => {
      const key = setting.key.replace('email_', '')
      emailSettings[key] = setting.value
    })

    // بناء HTML الكامل مع الهيدر والفوتر
    const fullHtml = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <!--[if mso]>
        <noscript>
          <xml>
            <o:OfficeDocumentSettings>
              <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
          </xml>
        </noscript>
        <![endif]-->
        <style type="text/css">
          body, table, td, p, a, li, blockquote {
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
          }
          table, td {
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
          }
          img {
            -ms-interpolation-mode: bicubic;
            border: 0;
            height: auto;
            line-height: 100%;
            outline: none;
            text-decoration: none;
          }
          body {
            margin: 0 !important;
            padding: 20px !important;
            width: 100% !important;
            direction: rtl !important;
            background: #f5f5f9 !important;
          }
        </style>
      </head>
      <body style="direction: rtl; text-align: right; background: #f5f5f9; padding: 20px; margin: 0; font-family: Arial, Helvetica, sans-serif;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="direction: rtl;">
          <tr>
            <td align="center" style="padding: 0;">
              <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
                <!-- Header -->
                <tr>
                  <td style="background: ${emailSettings.headerBackgroundColor || '#fdf8f9'}; padding: 32px 24px; text-align: center;">
                    ${emailSettings.headerLogo ? `<img src="${emailSettings.headerLogo}" alt="ملتقى ريادة" style="max-height: 80px; margin-bottom: 16px;" />` : ''}
                    <h1 style="color: ${emailSettings.headerTextColor || '#2d1f26'}; margin: 0; font-size: 28px; font-weight: bold; font-family: Arial, Helvetica, sans-serif;">ملتقى ريادة</h1>
                    <p style="color: #a8556f; font-size: 16px; margin: 8px 0 0 0; font-family: Arial, Helvetica, sans-serif;">تجمع سيدات الأعمال</p>
                  </td>
                </tr>
                <!-- Content -->
                <tr>
                  <td style="background: #ffffff; padding: 32px 24px; direction: rtl; text-align: right;">
                    ${html}
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="background: ${emailSettings.footerBackgroundColor || '#fdf8f9'}; padding: 24px; text-align: center;">
                    <p style="color: ${emailSettings.footerTextColor || '#6b5a60'}; margin: 0; font-size: 14px; font-family: Arial, Helvetica, sans-serif;">${emailSettings.footerText || 'ملتقى ريادة - تجمع سيدات الأعمال'}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `

    // استخدام عنوان المرسل - يمكن استخدام onboarding@resend.dev للتجربة
    // أو نطاق موثق مثل: noreply@yourdomain.com
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
    const fromName = 'ملتقى ريادة'
    
    console.log('Sending email with Resend API...')
    console.log('From:', `${fromName} <${fromEmail}>`)
    console.log('To:', to)
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${fromName} <${fromEmail}>`,
        to: [to],
        subject: subject,
        html: fullHtml,
      }),
    })

    const responseText = await response.text()
    
    if (response.ok) {
      console.log('Email sent successfully to:', to)
      console.log('Response:', responseText)
      return { success: true }
    } else {
      console.error('Failed to send email:', responseText)
      let errorDetails = responseText
      try {
        const errorJson = JSON.parse(responseText)
        errorDetails = errorJson.message || errorJson.error?.message || responseText
      } catch (e) {
        // Keep original text if not JSON
      }
      return { 
        success: false, 
        error: 'فشل إرسال الإيميل', 
        details: errorDetails
      }
    }
  } catch (error) {
    console.error('Error sending email:', error)
    return { 
      success: false, 
      error: 'خطأ في الاتصال', 
      details: error instanceof Error ? error.message : 'خطأ غير معروف'
    }
  }
}

// دالة لإرسال إيميل ترحيبي للعضو الجديد
export async function sendWelcomeEmail(member: MemberInfo): Promise<EmailResult> {
  try {
    // جلب إعدادات الإيميل
    const settings = await db.siteSettings.findMany({
      where: {
        key: {
          in: ['email_registrationSubject', 'email_registrationBody']
        }
      }
    })
    
    let subject = 'مرحباً بك في ملتقى ريادة! 👑'
    let body = `
      <h2 style="color: #2d1f26; margin: 0 0 20px 0; font-size: 22px; font-weight: 600; font-family: Arial, Helvetica, sans-serif; text-align: right;">أهلاً وسهلاً ${member.name} 👋</h2>
      <p style="color: #6b5a60; font-size: 16px; line-height: 1.8; margin: 0 0 16px 0; font-family: Arial, Helvetica, sans-serif; text-align: right;">
        نهنئك على انضمامك إلى <strong style="color: #a8556f;">ملتقى ريادة</strong>، تجمع سيدات الأعمال والقياديات!
      </p>
      <p style="color: #6b5a60; font-size: 16px; line-height: 1.8; margin: 0 0 16px 0; font-family: Arial, Helvetica, sans-serif; text-align: right;">
        أنتِ الآن جزء من مجتمع متميز يجمع سيدات الأعمال والقياديات لتبادل الخبرات وبناء علاقات مهنية قوية.
      </p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: #fdf8f9; border-radius: 12px; margin: 24px 0;">
        <tr>
          <td style="padding: 24px;">
            <h3 style="color: #2d1f26; margin: 0 0 16px 0; font-size: 18px; font-weight: 600; font-family: Arial, Helvetica, sans-serif; text-align: right;">معلومات حسابك:</h3>
            <p style="color: #6b5a60; margin: 8px 0; font-family: Arial, Helvetica, sans-serif; text-align: right;"><strong>الاسم:</strong> ${member.name}</p>
            <p style="color: #6b5a60; margin: 8px 0; font-family: Arial, Helvetica, sans-serif; text-align: right;"><strong>البريد الإلكتروني:</strong> ${member.email}</p>
            ${member.companyName ? `<p style="color: #6b5a60; margin: 8px 0; font-family: Arial, Helvetica, sans-serif; text-align: right;"><strong>الشركة:</strong> ${member.companyName}</p>` : ''}
            ${member.jobTitle ? `<p style="color: #6b5a60; margin: 8px 0; font-family: Arial, Helvetica, sans-serif; text-align: right;"><strong>المنصب:</strong> ${member.jobTitle}</p>` : ''}
          </td>
        </tr>
      </table>
      <p style="color: #6b5a60; font-size: 16px; line-height: 1.8; margin: 0 0 24px 0; font-family: Arial, Helvetica, sans-serif; text-align: right;">
        نتطلع إلى مشاركتك في لقاءاتنا القادمة ونأمل أن تستفيدي من هذا المجتمع الرائع.
      </p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" style="padding-top: 8px;">
            <a href="https://riyada.yplus.ai" style="display: inline-block; padding: 14px 32px; background: #a8556f; color: white; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 16px; font-family: Arial, Helvetica, sans-serif;">زيارة الموقع</a>
          </td>
        </tr>
      </table>
    `
    
    // استخدام الإعدادات المحفوظة إن وجدت
    settings.forEach(setting => {
      if (setting.key === 'email_registrationSubject' && setting.value) {
        subject = setting.value.replace(/{name}/g, member.name)
      }
      if (setting.key === 'email_registrationBody' && setting.value) {
        body = setting.value
          .replace(/{name}/g, member.name)
          .replace(/{email}/g, member.email)
          .replace(/{companyName}/g, member.companyName || '')
          .replace(/{jobTitle}/g, member.jobTitle || '')
      }
    })

    return await sendEmail({
      to: member.email,
      subject,
      html: body
    })
  } catch (error) {
    console.error('Error sending welcome email:', error)
    return { 
      success: false, 
      error: 'خطأ في إرسال الإيميل الترحيبي', 
      details: error instanceof Error ? error.message : 'خطأ غير معروف'
    }
  }
}
