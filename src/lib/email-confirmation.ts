import { db } from '@/lib/db'
import jsPDF from 'jspdf'
import { Resend } from 'resend'

interface EventData {
  id: string
  title: string
  date: Date
  startTime: string | null
  endTime: string | null
  location: string | null
  guestName: string | null
  guestImage?: string | null
  guestOrganization: string | null
  guestPosition: string | null
}

interface SendConfirmationEmailParams {
  to: string
  name: string
  event: EventData
}

interface EmailResult {
  success: boolean
  error?: string
  details?: string
}

// Format time to 12-hour format with Arabic
function formatTime12(time: string | null): string {
  if (!time) return ''
  const [hours, minutes] = time.split(':').map(Number)
  const period = hours >= 12 ? 'م' : 'ص'
  const hour12 = hours % 12 || 12
  return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`
}

// Format date to Arabic
function formatDateArabic(date: Date): string {
  return date.toLocaleDateString('ar-SA', { 
    weekday: 'long',
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

// دالة لإنشاء PDF الدعوة
async function generateInvitationPDF(params: SendConfirmationEmailParams): Promise<Buffer> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  
  // Background
  doc.setFillColor(253, 248, 249)
  doc.rect(0, 0, pageWidth, pageHeight, 'F')
  
  // Header background
  doc.setFillColor(168, 85, 111)
  doc.rect(0, 0, pageWidth, 50, 'F')
  
  // Title
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(28)
  doc.text('Riyada Forum', pageWidth / 2, 25, { align: 'center' })
  doc.setFontSize(14)
  doc.text('Business Women Community', pageWidth / 2, 38, { align: 'center' })
  
  // Decorative line
  doc.setDrawColor(200, 180, 190)
  doc.setLineWidth(0.5)
  doc.line(20, 60, pageWidth - 20, 60)
  
  // Invitation text
  doc.setTextColor(45, 31, 38)
  doc.setFontSize(24)
  doc.text('Invitation', pageWidth / 2, 80, { align: 'center' })
  
  // Guest name
  doc.setTextColor(168, 85, 111)
  doc.setFontSize(22)
  doc.text(params.name, pageWidth / 2, 100, { align: 'center' })
  
  // Event title
  doc.setTextColor(45, 31, 38)
  doc.setFontSize(18)
  doc.text(params.event.title, pageWidth / 2, 125, { align: 'center' })
  
  // Event details box
  doc.setFillColor(253, 242, 244)
  doc.roundedRect(20, 140, pageWidth - 40, 70, 5, 5, 'F')
  
  doc.setFontSize(12)
  doc.setTextColor(107, 90, 96)
  
  const eventDateStr = formatDateArabic(new Date(params.event.date))
  doc.text('Date:', 30, 160)
  doc.setTextColor(45, 31, 38)
  doc.text(eventDateStr, 70, 160)
  
  doc.setTextColor(107, 90, 96)
  doc.text('Time:', 30, 175)
  doc.setTextColor(45, 31, 38)
  const eventTimeStr = params.event.startTime 
    ? `${formatTime12(params.event.startTime)} - ${formatTime12(params.event.endTime)}`
    : 'TBD'
  doc.text(eventTimeStr, 70, 175)
  
  doc.setTextColor(107, 90, 96)
  doc.text('Location:', 30, 190)
  doc.setTextColor(45, 31, 38)
  doc.text(params.event.location || 'TBD', 70, 190)
  
  if (params.event.guestName) {
    doc.setTextColor(107, 90, 96)
    doc.text('Guest of Honor:', 30, 205)
    doc.setTextColor(168, 85, 111)
    doc.text(params.event.guestName, 70, 205)
  }
  
  // Footer
  doc.setFillColor(168, 85, 111)
  doc.rect(0, pageHeight - 30, pageWidth, 30, 'F')
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(10)
  doc.text('riyada.yplus.ai', pageWidth / 2, pageHeight - 12, { align: 'center' })
  
  // Border
  doc.setDrawColor(168, 85, 111)
  doc.setLineWidth(1)
  doc.rect(5, 5, pageWidth - 10, pageHeight - 10)
  
  // Return as Buffer
  const pdfOutput = doc.output('arraybuffer')
  return Buffer.from(pdfOutput)
}

// دالة لإرسال إيميل تأكيد القبول
export async function sendConfirmationEmail(params: SendConfirmationEmailParams): Promise<EmailResult> {
  try {
    console.log('=== Starting sendConfirmationEmail ===')
    console.log('Recipient:', params.to)
    console.log('Name:', params.name)
    console.log('Event:', params.event.title)

    const resendApiKey = process.env.RESEND_API_KEY
    console.log('RESEND_API_KEY exists:', !!resendApiKey)
    
    if (!resendApiKey) {
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
    console.log('Email settings loaded:', Object.keys(emailSettings).length, 'settings')

    const eventDateStr = formatDateArabic(new Date(params.event.date))
    const eventTimeStr = params.event.startTime 
      ? `${formatTime12(params.event.startTime)} - ${formatTime12(params.event.endTime)}`
      : ''

    const subject = `تم تأكيد تسجيلك في ${params.event.title} 👑`

    // إنشاء PDF الدعوة
    console.log('Generating invitation PDF...')
    const pdfBuffer = await generateInvitationPDF(params)
    console.log('PDF generated successfully, size:', pdfBuffer.length, 'bytes')

    // بناء HTML لضيف الشرف
    const guestHtml = params.event.guestName ? `
      <div style="text-align: center; margin: 20px 0; padding: 16px; background-color: #fdf8f9; border-radius: 12px;">
        <p style="color: #a8556f; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">ضيف الشرف</p>
        <p style="color: #2d1f26; margin: 0; font-size: 18px; font-weight: 600;">${params.event.guestName}</p>
        ${params.event.guestOrganization ? `<p style="color: #6b5a60; margin: 4px 0 0 0; font-size: 14px;">${params.event.guestOrganization}</p>` : ''}
        ${params.event.guestPosition ? `<p style="color: #a8556f; margin: 4px 0 0 0; font-size: 14px;">${params.event.guestPosition}</p>` : ''}
      </div>
    ` : ''

    const html = `
      <div style="text-align: right; direction: rtl; font-family: Arial, Helvetica, sans-serif;">
        <h2 style="color: #2d1f26; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">
          مبارك ${params.name}! تم تأكيد تسجيلك ✨
        </h2>
        
        <p style="color: #6b5a60; font-size: 16px; line-height: 1.8; margin: 0 0 16px 0;">
          يسعدنا إبلاغك بأنه <strong style="color: #3a7d44;">تم تأكيد تسجيلك</strong> في:
        </p>
        
        <div style="background-color: #fdf8f9; border-radius: 16px; padding: 24px; margin: 24px 0; border: 2px solid #f0e0e4;">
          <h3 style="color: #a8556f; margin: 0 0 16px 0; font-size: 22px; font-weight: 700; text-align: center;">
            ${params.event.title}
          </h3>
          
          ${guestHtml}
          
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top: 16px;">
            <tr>
              <td style="text-align: center; padding: 12px;">
                <p style="color: #a8556f; margin: 0 0 4px 0; font-size: 14px; font-weight: 600;">التاريخ</p>
                <p style="color: #2d1f26; margin: 0; font-size: 14px;">${eventDateStr}</p>
              </td>
              <td style="width: 1px; background-color: #f0e0e4;"></td>
              <td style="text-align: center; padding: 12px;">
                <p style="color: #a8556f; margin: 0 0 4px 0; font-size: 14px; font-weight: 600;">الوقت</p>
                <p style="color: #2d1f26; margin: 0; font-size: 14px;">${eventTimeStr || 'غير محدد'}</p>
              </td>
              <td style="width: 1px; background-color: #f0e0e4;"></td>
              <td style="text-align: center; padding: 12px;">
                <p style="color: #a8556f; margin: 0 0 4px 0; font-size: 14px; font-weight: 600;">الموقع</p>
                <p style="color: #2d1f26; margin: 0; font-size: 14px;">${params.event.location || 'سيتم تحديده'}</p>
              </td>
            </tr>
          </table>
        </div>
        
        <div style="background-color: #e8f5e9; border-radius: 12px; padding: 16px; margin: 20px 0; border-right: 4px solid #3a7d44;">
          <p style="color: #2e7d32; margin: 0; font-size: 15px; font-weight: 600;">
            📎 مرفق مع هذا الإيميل دعوتك الخاصة بصيغة PDF
          </p>
          <p style="color: #558b2f; margin: 8px 0 0 0; font-size: 13px;">
            يرجى إحضار الدعوة أو عرضها على جوالك عند الحضور
          </p>
        </div>
        
        <p style="color: #6b5a60; font-size: 15px; line-height: 1.8; margin: 16px 0;">
          ننتظرك في هذا اللقاء المميز! 💜
        </p>
        
        <div style="text-align: center; margin-top: 24px;">
          <a href="https://riyada.yplus.ai" style="display: inline-block; padding: 14px 32px; background-color: #a8556f; color: white; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 16px;">
            زيارة الملتقى
          </a>
        </div>
      </div>
    `

    // بناء HTML الكامل
    const fullHtml = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
      </head>
      <body style="direction: rtl; text-align: right; font-family: Arial, Helvetica, sans-serif; background-color: #f5f5f9; padding: 20px; margin: 0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="direction: rtl;">
          <tr>
            <td align="center" style="padding: 0;">
              <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
                <!-- Header -->
                <tr>
                  <td style="background-color: ${emailSettings.headerBackgroundColor || '#fdf8f9'}; padding: 32px 24px; text-align: center;">
                    <h1 style="color: ${emailSettings.headerTextColor || '#2d1f26'}; margin: 0; font-size: 28px; font-weight: bold;">ملتقى ريادة</h1>
                    <p style="color: #a8556f; font-size: 16px; margin: 8px 0 0 0;">تجمع سيدات الأعمال</p>
                  </td>
                </tr>
                <!-- Content -->
                <tr>
                  <td style="background-color: #ffffff; padding: 32px 24px; direction: rtl; text-align: right;">
                    ${html}
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="background-color: ${emailSettings.footerBackgroundColor || '#fdf8f9'}; padding: 24px; text-align: center;">
                    <p style="color: ${emailSettings.footerTextColor || '#6b5a60'}; margin: 0; font-size: 14px;">${emailSettings.footerText || 'ملتقى ريادة - تجمع سيدات الأعمال'}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
    const fromName = 'ملتقى ريادة'
    
    console.log('From:', `${fromName} <${fromEmail}>`)

    // استخدام Resend SDK
    const resend = new Resend({ apiKey: resendApiKey })
    
    // اسم الملف: دعوة خاصة - اسم الضيف
    const fileName = `دعوة خاصة - ${params.name}.pdf`
    
    const { data, error } = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [params.to],
      subject: subject,
      html: fullHtml,
      attachments: [
        {
          filename: fileName,
          content: pdfBuffer,
        }
      ]
    })

    if (error) {
      console.error('Resend SDK error:', error)
      return { 
        success: false, 
        error: 'فشل إرسال الإيميل', 
        details: JSON.stringify(error)
      }
    }

    console.log('Confirmation email sent successfully:', data)
    return { success: true }
  } catch (error) {
    console.error('Error sending confirmation email:', error)
    return { 
      success: false, 
      error: 'خطأ في الاتصال', 
      details: error instanceof Error ? error.message : 'خطأ غير معروف'
    }
  }
}

// دالة لإرسال إيميل تأكيد القبول مع جلب البيانات من قاعدة البيانات
export async function sendConfirmationEmailForRegistration(registrationId: string): Promise<EmailResult> {
  try {
    const registration = await db.eventRegistration.findUnique({
      where: { id: registrationId },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            date: true,
            startTime: true,
            endTime: true,
            location: true,
            guestName: true,
            guestImage: true,
            guestOrganization: true,
            guestPosition: true,
          }
        }
      }
    })

    if (!registration) {
      return { success: false, error: 'التسجيل غير موجود' }
    }

    if (!registration.email || registration.email.includes('placeholder.com')) {
      return { success: false, error: 'لا يوجد بريد إلكتروني صالح' }
    }

    return await sendConfirmationEmail({
      to: registration.email,
      name: registration.name,
      event: registration.event,
    })
  } catch (error) {
    console.error('Error in sendConfirmationEmailForRegistration:', error)
    return { 
      success: false, 
      error: 'خطأ في جلب البيانات', 
      details: error instanceof Error ? error.message : 'خطأ غير معروف'
    }
  }
}
