import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import jsPDF from 'jspdf'

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
async function generateInvitationPDF(params: { name: string; event: any }): Promise<string> {
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
  
  return doc.output('base64')
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, eventId } = body

    const recipientEmail = email || 'yazeed@yah.sa'
    const recipientName = name || 'يزيد'

    const resendApiKey = process.env.RESEND_API_KEY
    
    if (!resendApiKey) {
      return NextResponse.json(
        { error: 'RESEND_API_KEY غير موجود في متغيرات البيئة' },
        { status: 500 }
      )
    }

    console.log('=== Sending test confirmation email ===')
    console.log('To:', recipientEmail)
    console.log('Name:', recipientName)

    // جلب فعالية للاختبار
    let event = null

    if (eventId) {
      event = await db.event.findUnique({
        where: { id: eventId }
      })
    }

    if (!event) {
      event = await db.event.findFirst({
        where: { isPublished: true },
        orderBy: { date: 'desc' }
      })
    }

    const eventTitle = event?.title || 'اللقاء الافتتاحي'
    const eventDate = event ? formatDateArabic(new Date(event.date)) : 'الجمعة 21 مارس 2025'
    const eventTime = event?.startTime 
      ? `${formatTime12(event.startTime)} - ${formatTime12(event.endTime)}`
      : '6:00 م - 10:00 م'
    const eventLocation = event?.location || 'الرياض'
    const guestName = event?.guestName
    const guestOrganization = event?.guestOrganization
    const guestPosition = event?.guestPosition

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'

    // إنشاء PDF الدعوة
    console.log('Generating PDF...')
    const pdfBase64 = await generateInvitationPDF({
      name: recipientName,
      event: event || { title: eventTitle, date: new Date(), location: eventLocation }
    })
    console.log('PDF generated, size:', pdfBase64.length)

    // بناء HTML لضيف الشرف
    const guestHtml = guestName ? `
      <div style="text-align: center; margin: 20px 0; padding: 16px; background-color: #fdf8f9; border-radius: 12px;">
        <p style="color: #a8556f; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">ضيف الشرف</p>
        <p style="color: #2d1f26; margin: 0; font-size: 18px; font-weight: 600;">${guestName}</p>
        ${guestOrganization ? `<p style="color: #6b5a60; margin: 4px 0 0 0; font-size: 14px;">${guestOrganization}</p>` : ''}
        ${guestPosition ? `<p style="color: #a8556f; margin: 4px 0 0 0; font-size: 14px;">${guestPosition}</p>` : ''}
      </div>
    ` : ''

    const html = `
      <div style="text-align: right; direction: rtl; font-family: Arial, Helvetica, sans-serif;">
        <h2 style="color: #2d1f26; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">
          مبارك ${recipientName}! تم تأكيد تسجيلك ✨
        </h2>
        
        <p style="color: #6b5a60; font-size: 16px; line-height: 1.8; margin: 0 0 16px 0;">
          يسعدنا إبلاغك بأنه <strong style="color: #3a7d44;">تم تأكيد تسجيلك</strong> في:
        </p>
        
        <div style="background-color: #fdf8f9; border-radius: 16px; padding: 24px; margin: 24px 0; border: 2px solid #f0e0e4;">
          <h3 style="color: #a8556f; margin: 0 0 16px 0; font-size: 22px; font-weight: 700; text-align: center;">
            ${eventTitle}
          </h3>
          
          ${guestHtml}
          
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top: 16px;">
            <tr>
              <td style="text-align: center; padding: 12px;">
                <p style="color: #a8556f; margin: 0 0 4px 0; font-size: 14px; font-weight: 600;">التاريخ</p>
                <p style="color: #2d1f26; margin: 0; font-size: 14px;">${eventDate}</p>
              </td>
              <td style="width: 1px; background-color: #f0e0e4;"></td>
              <td style="text-align: center; padding: 12px;">
                <p style="color: #a8556f; margin: 0 0 4px 0; font-size: 14px; font-weight: 600;">الوقت</p>
                <p style="color: #2d1f26; margin: 0; font-size: 14px;">${eventTime}</p>
              </td>
              <td style="width: 1px; background-color: #f0e0e4;"></td>
              <td style="text-align: center; padding: 12px;">
                <p style="color: #a8556f; margin: 0 0 4px 0; font-size: 14px; font-weight: 600;">الموقع</p>
                <p style="color: #2d1f26; margin: 0; font-size: 14px;">${eventLocation}</p>
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
      </head>
      <body style="direction: rtl; text-align: right; font-family: Arial, Helvetica, sans-serif; background-color: #f5f5f9; padding: 20px; margin: 0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="direction: rtl;">
          <tr>
            <td align="center" style="padding: 0;">
              <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
                <!-- Header -->
                <tr>
                  <td style="background-color: #fdf8f9; padding: 32px 24px; text-align: center;">
                    <h1 style="color: #2d1f26; margin: 0; font-size: 28px; font-weight: bold;">ملتقى ريادة</h1>
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
                  <td style="background-color: #fdf8f9; padding: 24px; text-align: center;">
                    <p style="color: #6b5a60; margin: 0; font-size: 14px;">ملتقى ريادة - تجمع سيدات الأعمال</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `

    // إنشاء اسم ملف آمن (إنجليزي)
    const safeFileName = `riyada-invitation-${Date.now()}.pdf`
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `ملتقى ريادة <${fromEmail}>`,
        to: [recipientEmail],
        subject: `تم تأكيد تسجيلك في ${eventTitle} 👑`,
        html: fullHtml,
        attachments: [
          {
            filename: safeFileName,
            content: pdfBase64,
            contentType: 'application/pdf'
          }
        ]
      }),
    })

    const responseText = await response.text()
    console.log('Resend response status:', response.status)
    console.log('Resend response:', responseText.substring(0, 500))

    if (response.ok) {
      return NextResponse.json({ 
        success: true, 
        message: `تم إرسال الإيميل بنجاح إلى ${recipientEmail}`,
        event: eventTitle,
        response: responseText
      })
    } else {
      let errorDetails = responseText
      try {
        const errorJson = JSON.parse(responseText)
        errorDetails = errorJson.message || errorJson.error?.message || responseText
      } catch {
        // Keep original text
      }
      return NextResponse.json(
        { error: 'فشل إرسال الإيميل', details: errorDetails },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error sending test email:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إرسال الإيميل', details: error instanceof Error ? error.message : 'خطأ غير معروف' },
      { status: 500 }
    )
  }
}
