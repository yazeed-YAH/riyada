import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// الحصول على جميع الإعدادات
export async function GET() {
  try {
    const settings = await db.siteSettings.findMany()
    
    // تحويل الإعدادات إلى كائن
    const settingsObj: Record<string, string> = {}
    settings.forEach(setting => {
      settingsObj[setting.key] = setting.value
    })
    
    // القيم الافتراضية
    const defaultSettings = {
      siteName: settingsObj.siteName || 'ملتقى ريادة',
      siteDescription: settingsObj.siteDescription || 'تجمع سيدات الأعمال',
      logoUrl: settingsObj.logoUrl || '',
      email: settingsObj.email || 'info@riyada-women.com',
      phone: settingsObj.phone || '',
      website: settingsObj.website || 'www.riyada-women.com',
      twitter: settingsObj.twitter || '',
      instagram: settingsObj.instagram || '',
      linkedin: settingsObj.linkedin || '',
      snapchat: settingsObj.snapchat || '',
      tiktok: settingsObj.tiktok || '',
    }
    
    return NextResponse.json({ settings: defaultSettings })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'حدث خطأ في جلب الإعدادات' }, { status: 500 })
  }
}

// تحديث الإعدادات
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // تحديث كل إعداد
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && value !== null) {
        await db.siteSettings.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value) }
        })
      }
    }
    
    return NextResponse.json({ success: true, message: 'تم حفظ الإعدادات بنجاح' })
  } catch (error) {
    console.error('Error saving settings:', error)
    return NextResponse.json({ error: 'حدث خطأ في حفظ الإعدادات' }, { status: 500 })
  }
}
