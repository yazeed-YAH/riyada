import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Fetch email settings
export async function GET() {
  try {
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

    return NextResponse.json({ settings: emailSettings })
  } catch (error) {
    console.error('Error fetching email settings:', error)
    return NextResponse.json({ error: 'حدث خطأ في جلب الإعدادات' }, { status: 500 })
  }
}

// POST - Save email settings
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const settingsToSave = [
      { key: 'email_headerLogo', value: data.headerLogo || '' },
      { key: 'email_headerBackgroundColor', value: data.headerBackgroundColor || '#fdf8f9' },
      { key: 'email_headerTextColor', value: data.headerTextColor || '#2d1f26' },
      { key: 'email_footerText', value: data.footerText || 'ملتقى ريادة - تجمع سيدات الأعمال' },
      { key: 'email_footerBackgroundColor', value: data.footerBackgroundColor || '#fdf8f9' },
      { key: 'email_footerTextColor', value: data.footerTextColor || '#6b5a60' },
      { key: 'email_registrationSubject', value: data.registrationSubject || '' },
      { key: 'email_registrationBody', value: data.registrationBody || '' },
      { key: 'email_confirmationSubject', value: data.confirmationSubject || '' },
      { key: 'email_confirmationBody', value: data.confirmationBody || '' },
      { key: 'email_reminderSubject', value: data.reminderSubject || '' },
      { key: 'email_reminderBody', value: data.reminderBody || '' },
    ]

    // Use upsert to create or update each setting
    for (const setting of settingsToSave) {
      await db.siteSettings.upsert({
        where: { key: setting.key },
        create: { key: setting.key, value: setting.value },
        update: { value: setting.value }
      })
    }

    return NextResponse.json({ success: true, message: 'تم حفظ الإعدادات بنجاح' })
  } catch (error) {
    console.error('Error saving email settings:', error)
    return NextResponse.json({ error: 'حدث خطأ في حفظ الإعدادات' }, { status: 500 })
  }
}
