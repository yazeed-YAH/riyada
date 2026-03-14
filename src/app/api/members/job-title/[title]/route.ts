import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// دالة لتنظيف النص العربي من "ال" التعريف للمقارنة
function normalizeArabicTitle(title: string): string {
  const lower = title.toLowerCase().trim()
  // إزالة "ال" من البداية
  if (lower.startsWith('ال')) {
    return lower.substring(2)
  }
  return lower
}

// دالة للتحقق من تطابق المسميات الوظيفية
function jobTitlesMatch(memberTitle: string | null, searchTitle: string): boolean {
  if (!memberTitle) return false
  
  const memberNormalized = normalizeArabicTitle(memberTitle)
  const searchNormalized = normalizeArabicTitle(searchTitle)
  
  // تطابق كامل بعد التنظيف
  if (memberNormalized === searchNormalized) return true
  
  // بحث جزئي - أي منهما يحتوي الآخر
  if (memberNormalized.includes(searchNormalized) || searchNormalized.includes(memberNormalized)) return true
  
  // البحث في النص الأصلي أيضاً
  if (memberTitle.toLowerCase().includes(searchTitle.toLowerCase())) return true
  
  return false
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ title: string }> }
) {
  try {
    const { title } = await params
    const decodedTitle = decodeURIComponent(title)

    // جلب جميع الأعضاء ثم فلترة
    const allRegisteredMembers = await db.member.findMany({
      include: {
        _count: {
          select: { EventRegistration: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // فلترة الأعضاء بنفس المسمى الوظيفي (بحث ذكي)
    const registeredMembers = allRegisteredMembers.filter(m => 
      jobTitlesMatch(m.jobTitle, decodedTitle)
    )

    // جلب جميع التسجيلات ثم فلترة
    const allVisitorRegistrations = await db.eventRegistration.findMany({
      where: {
        memberId: null // فقط الزوار (غير مرتبطين بعضو مسجل)
      },
      include: {
        Event: {
          select: { title: true, date: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // فلترة الزوار بنفس المسمى الوظيفي (بحث ذكي)
    const visitorRegistrations = allVisitorRegistrations.filter(r => 
      jobTitlesMatch(r.jobTitle, decodedTitle)
    )

    // دمج البيانات مع تمييز الأعضاء المسجلين عن الزوار
    const members = registeredMembers.map(m => ({
      id: m.id,
      name: m.name,
      email: m.email,
      phone: m.phone,
      companyName: m.companyName,
      jobTitle: m.jobTitle,
      gender: m.gender,
      imageUrl: m.imageUrl,
      isRegistered: true,
      eventsCount: m._count.EventRegistration,
      createdAt: m.createdAt.toISOString()
    }))

    // إضافة الزوار مع التأكد من عدم التكرار
    const uniqueVisitors = new Map<string, typeof members[0]>()
    visitorRegistrations.forEach(r => {
      const key = r.email.toLowerCase()
      if (!uniqueVisitors.has(key)) {
        uniqueVisitors.set(key, {
          id: r.id,
          name: r.name,
          email: r.email,
          phone: r.phone,
          companyName: r.companyName,
          jobTitle: r.jobTitle,
          gender: r.gender,
          imageUrl: r.imageUrl,
          isRegistered: false,
          eventsCount: 1,
          createdAt: r.createdAt.toISOString()
        })
      } else {
        // زيادة عدد الفعاليات للزائر المكرر
        const existing = uniqueVisitors.get(key)!
        existing.eventsCount += 1
      }
    })

    // دمج جميع الأعضاء
    const allMembers = [...members, ...Array.from(uniqueVisitors.values())]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json({ 
      jobTitle: decodedTitle,
      members: allMembers,
      count: allMembers.length 
    })
  } catch (error) {
    console.error('Error fetching members by job title:', error)
    return NextResponse.json({ error: 'حدث خطأ في جلب البيانات' }, { status: 500 })
  }
}
