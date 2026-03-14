'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  ArrowRight, Crown, User, Mail, Phone, Building2, Briefcase, 
  Calendar, Edit, MessageCircle, Users, 
  ClipboardList, CheckCircle, HandHeart, List, Twitter, Instagram, Linkedin,
  X
} from 'lucide-react'
import { toast } from 'sonner'
import { toEnglishNumbers } from '@/lib/utils'

interface Registration {
  id: string
  eventId: string
  status: string
  createdAt: string
  event: {
    id: string
    title: string
    date: string
  }
}

interface MemberData {
  id: string
  name: string
  email: string
  phone: string | null
  companyName: string | null
  jobTitle: string | null
  businessType: string | null
  gender: string | null
  imageUrl: string | null
  twitter: string | null
  instagram: string | null
  linkedin: string | null
  snapchat: string | null
  createdAt: string
  isRegistered: boolean
  registrationsCount: number
  attendedCount: number
  companionsCount: number
  sponsorshipCount: number
  registrations: Registration[]
}

export default function MemberProfilePage() {
  const router = useRouter()
  const params = useParams()
  const memberId = params.id as string
  
  const [member, setMember] = useState<MemberData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMemberData()
  }, [memberId])

  const fetchMemberData = async () => {
    try {
      const membersRes = await fetch('/api/members')
      const membersData = await membersRes.json()
      
      const regsRes = await fetch('/api/registrations')
      const regsData = await regsRes.json()
      
      const sponsorsRes = await fetch('/api/sponsors')
      const sponsorsData = await sponsorsRes.json()
      
      const memberData = membersData.members?.find((m: {id: string}) => m.id === memberId)
      
      if (memberData) {
        const memberRegs = regsData.registrations?.filter((r: {memberId: string | null, email: string}) => 
          r.memberId === memberId || r.email === memberData.email
        ) || []
        
        const registrationsCount = memberRegs.length
        const attendedCount = memberRegs.filter((r: {status: string}) => 
          r.status === 'attended'
        ).length
        
        const memberSponsors = sponsorsData.sponsors?.filter((s: {email: string}) => 
          s.email === memberData.email
        ) || []
        
        setMember({
          ...memberData,
          isRegistered: true,
          registrationsCount,
          attendedCount,
          companionsCount: 0,
          sponsorshipCount: memberSponsors.length,
          registrations: memberRegs
        })
      } else {
        const regData = regsData.registrations?.find((r: {id: string}) => r.id === memberId)
        if (regData) {
          const visitorRegs = regsData.registrations?.filter((r: {email: string}) => 
            r.email === regData.email
          ) || []
          
          const visitorSponsors = sponsorsData.sponsors?.filter((s: {email: string}) => 
            s.email === regData.email
          ) || []
          
          const attendedCount = visitorRegs.filter((r: {status: string}) => 
            r.status === 'attended'
          ).length
          
          setMember({
            id: regData.id,
            name: regData.name,
            email: regData.email,
            phone: regData.phone,
            companyName: regData.companyName,
            jobTitle: regData.jobTitle,
            businessType: null,
            gender: regData.gender || null,
            imageUrl: regData.imageUrl || null,
            twitter: null,
            instagram: null,
            linkedin: null,
            snapchat: null,
            createdAt: regData.createdAt,
            isRegistered: false,
            registrationsCount: visitorRegs.length,
            attendedCount,
            companionsCount: 0,
            sponsorshipCount: visitorSponsors.length,
            registrations: visitorRegs
          })
        } else {
          toast.error('العضو غير موجود')
          router.push('/admin')
        }
      }
    } catch (error) {
      console.error('Error fetching member:', error)
      toast.error('حدث خطأ أثناء جلب البيانات')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const day = date.getDate()
    const month = toEnglishNumbers(date.toLocaleDateString('ar-SA', { month: 'long' }))
    const year = date.getFullYear()
    return `${day} ${month} ${year}`
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; color: string; label: string }> = {
      pending: { bg: '#fef3e0', color: '#9a6b1a', label: 'قيد الانتظار' },
      confirmed: { bg: '#e8d8dc', color: '#6b5a60', label: 'مؤكد' },
      attended: { bg: '#d4edda', color: '#3a7d44', label: 'حضر' },
      cancelled: { bg: '#fce8e8', color: '#8a3a3a', label: 'ملغي' }
    }
    const config = statusConfig[status] || statusConfig.pending
    return (
      <span 
        className="px-3 py-1 rounded-full text-xs font-medium"
        style={{ background: config.bg, color: config.color }}
      >
        {config.label}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl" style={{ background: 'linear-gradient(180deg, #fdf8f9 0%, #ffffff 100%)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 mx-auto" style={{ borderColor: '#e8b4c4', borderTopColor: '#a8556f' }}></div>
          <p className="mt-4 font-medium" style={{ color: '#6b5a60' }}>جاري التحميل...</p>
        </div>
      </div>
    )
  }

  if (!member) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl" style={{ background: 'linear-gradient(180deg, #fdf8f9 0%, #ffffff 100%)' }}>
        <p style={{ color: '#6b5a60' }}>العضو غير موجود</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen" dir="rtl" style={{ background: 'linear-gradient(180deg, #fdf8f9 0%, #ffffff 100%)' }}>
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b" style={{ borderColor: 'rgba(240, 224, 228, 0.5)' }}>
        <div className="container">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-1 shadow-md rounded-full text-xs sm:text-sm px-4 py-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                style={{ background: '#fdf2f4', color: '#6b5a60' }}
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
                رجوع
              </button>
              {/* Logo - نفس ستايل لوحة التحكم */}
              <div className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: '#e8d8dc' }}>
                <Crown className="w-6 h-6" style={{ color: '#6b5a60' }} />
              </div>
              <div>
                <h1 className="text-lg font-bold" style={{ color: '#2d1f26' }}>ملتقى ريادة</h1>
                <p className="text-xs" style={{ color: '#6b5a60' }}>تجمع سيدات الأعمال</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* اسم العضو */}
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-sm font-bold" style={{ color: '#2d1f26' }}>{member.name}</span>
                <Badge 
                  className="rounded-full px-2 py-0.5 text-xs"
                  style={{ 
                    background: member.isRegistered ? '#d4edda' : '#fef3e0', 
                    color: member.isRegistered ? '#3a7d44' : '#9a6b1a' 
                  }}
                >
                  {member.isRegistered ? 'عضو مسجل' : 'زائر'}
                </Badge>
              </div>
              {member.phone && (
                <Button 
                  size="sm"
                  className="rounded-full gap-2"
                  style={{ background: '#25d366', color: 'white' }}
                  onClick={() => {
                    const phone = member.phone?.replace(/\D/g, '') || '';
                    const waLink = phone.startsWith('966') ? `https://wa.me/${phone}` : `https://wa.me/966${phone.replace(/^0/, '')}`;
                    window.open(waLink, '_blank');
                  }}
                >
                  <MessageCircle className="w-4 h-4" />
                  واتساب
                </Button>
              )}
              {member.isRegistered && (
                <Button 
                  variant="outline"
                  size="sm"
                  className="rounded-full gap-2"
                  style={{ borderColor: '#e8d8dc', color: '#6b5a60' }}
                  onClick={() => router.push(`/admin/member/${member.id}/edit`)}
                >
                  <Edit className="w-4 h-4" />
                  تعديل بيانات العضو
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        {/* العنوان والصورة */}
        <div className="flex items-center gap-4 mb-8">
          {member.imageUrl ? (
            <img 
              src={member.imageUrl} 
              alt={member.name} 
              className="w-20 h-20 rounded-2xl object-cover border-2"
              style={{ borderColor: '#e8d8dc' }}
            />
          ) : (
            <div 
              className="w-20 h-20 rounded-2xl border-2 flex items-center justify-center"
              style={{ borderColor: '#e8d8dc', background: 'linear-gradient(135deg, #a8556f 0%, #9b7b9a 100%)' }}
            >
              <User className="w-10 h-10 text-white" />
            </div>
          )}
          <div>
            <h2 className="text-2xl font-bold" style={{ color: '#2d1f26' }}>{member.name}</h2>
            <div className="flex items-center gap-3 mt-1 text-sm" style={{ color: '#6b5a60' }}>
              {member.companyName && (
                <Link
                  href={`/admin/company/${encodeURIComponent(member.companyName)}`}
                  className="hover:underline flex items-center gap-1"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  {member.companyName}
                </Link>
              )}
              {member.jobTitle && (
                <Link
                  href={`/admin/job-title/${encodeURIComponent(member.jobTitle)}`}
                  className="hover:underline flex items-center gap-1"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  {member.jobTitle}
                </Link>
              )}
            </div>
            {member.gender && (
              <Badge 
                className="rounded-full px-3 py-0.5 text-xs mt-2"
                style={{ 
                  background: member.gender === 'female' ? '#fdf2f4' : '#e8f4fd', 
                  color: member.gender === 'female' ? '#a8556f' : '#2563eb' 
                }}
              >
                {member.gender === 'female' ? '👩 سيدة' : '👨 رجل'}
              </Badge>
            )}
          </div>
        </div>

        {/* بطاقات الإحصائيات - نفس ستايل نظرة عامة */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* التسجيلات */}
          <Card className="rounded-2xl border bg-transparent" style={{ borderColor: '#f0e0e4' }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between pb-2">
                <span className="text-lg font-bold" style={{ color: '#2d1f26' }}>التسجيلات</span>
                <div className="flex items-center gap-2">
                  <ClipboardList className="w-5 h-5" style={{ color: '#a8556f' }} />
                  <div className="text-3xl font-bold" style={{ color: '#2d1f26' }}>{toEnglishNumbers(member.registrationsCount)}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-3">
                <span className="text-sm" style={{ color: '#6b5a60' }}>حضرت</span>
                <span className="text-sm" style={{ color: '#6b5a60' }}>{toEnglishNumbers(member.attendedCount)}</span>
                <span className="text-sm" style={{ color: '#6b5a60' }}>قيد الانتظار</span>
                <span className="text-sm" style={{ color: '#6b5a60' }}>{toEnglishNumbers(member.registrations.filter(r => r.status === 'pending').length)}</span>
                <span className="text-sm" style={{ color: '#6b5a60' }}>مؤكدة</span>
                <span className="text-sm" style={{ color: '#6b5a60' }}>{toEnglishNumbers(member.registrations.filter(r => r.status === 'confirmed').length)}</span>
                <span className="text-sm" style={{ color: '#6b5a60' }}>ملغية</span>
                <span className="text-sm" style={{ color: '#6b5a60' }}>{toEnglishNumbers(member.registrations.filter(r => r.status === 'cancelled').length)}</span>
              </div>
              {member.registrationsCount > 0 && (
                <div className="mt-3 pt-3 border-t" style={{ borderColor: '#f0e0e4' }}>
                  <span className="text-sm font-bold block mb-2" style={{ color: '#a8556f' }}>نسبة الحضور</span>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 rounded-full" style={{ background: '#f0e0e4' }}>
                      <div 
                        className="h-2 rounded-full" 
                        style={{ 
                          width: `${Math.round((member.attendedCount / member.registrationsCount) * 100)}%`,
                          background: '#d4edda'
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold" style={{ color: '#3a7d44' }}>
                      {toEnglishNumbers(Math.round((member.attendedCount / member.registrationsCount) * 100))}%
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* معلومات التواصل */}
          <Card className="rounded-2xl border bg-transparent" style={{ borderColor: '#f0e0e4' }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between pb-2">
                <span className="text-lg font-bold" style={{ color: '#2d1f26' }}>التواصل</span>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#fdf2f4' }}>
                  <Mail className="w-5 h-5" style={{ color: '#a8556f' }} />
                </div>
              </div>
              <div className="space-y-3 mt-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4" style={{ color: '#a8556f' }} />
                  <span className="text-sm" style={{ color: '#6b5a60', direction: 'ltr', unicodeBidi: 'embed' }}>{member.email}</span>
                </div>
                {member.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4" style={{ color: '#3a7d44' }} />
                    <span className="text-sm" style={{ color: '#6b5a60', direction: 'ltr', unicodeBidi: 'embed' }}>{member.phone}</span>
                  </div>
                )}
                {member.companyName && (
                  <div className="flex items-center gap-3">
                    <Building2 className="w-4 h-4" style={{ color: '#2563eb' }} />
                    <span className="text-sm" style={{ color: '#6b5a60' }}>{member.companyName}</span>
                  </div>
                )}
                {member.jobTitle && (
                  <div className="flex items-center gap-3">
                    <Briefcase className="w-4 h-4" style={{ color: '#9a6b1a' }} />
                    <span className="text-sm" style={{ color: '#6b5a60' }}>{member.jobTitle}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* معلومات إضافية */}
          <Card className="rounded-2xl border bg-transparent" style={{ borderColor: '#f0e0e4' }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between pb-2">
                <span className="text-lg font-bold" style={{ color: '#2d1f26' }}>معلومات</span>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#fdf2f4' }}>
                  <Calendar className="w-5 h-5" style={{ color: '#a8556f' }} />
                </div>
              </div>
              <div className="space-y-3 mt-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: '#6b5a60' }}>تاريخ الانضمام</span>
                  <span className="text-sm font-bold" style={{ color: '#2d1f26' }}>{toEnglishNumbers(formatDate(member.createdAt))}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: '#6b5a60' }}>طلبات الرعاية</span>
                  <span className="text-sm font-bold" style={{ color: '#2d1f26' }}>{toEnglishNumbers(member.sponsorshipCount)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: '#6b5a60' }}>نوع العضوية</span>
                  <Badge 
                    className="rounded-full text-xs"
                    style={{ 
                      background: member.isRegistered ? '#d4edda' : '#fef3e0', 
                      color: member.isRegistered ? '#3a7d44' : '#9a6b1a' 
                    }}
                  >
                    {member.isRegistered ? 'مسجل' : 'زائر'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* السوشل ميديا */}
        {(member.twitter || member.instagram || member.linkedin || member.snapchat) && (
          <Card className="rounded-2xl border bg-transparent mb-8" style={{ borderColor: '#f0e0e4' }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: '#f0e0e4' }}>
                <span className="text-lg font-bold" style={{ color: '#2d1f26' }}>السوشل ميديا</span>
                <Users className="w-5 h-5" style={{ color: '#a8556f' }} />
              </div>
              <div className="flex flex-wrap gap-3 mt-4">
                {member.twitter && (
                  <a 
                    href={member.twitter.startsWith('http') ? member.twitter : `https://twitter.com/${member.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-full transition-all hover:scale-105"
                    style={{ background: '#e8f4fd', color: '#1da1f2' }}
                  >
                    <Twitter className="w-4 h-4" />
                    <span className="text-sm">تويتر</span>
                  </a>
                )}
                {member.instagram && (
                  <a 
                    href={member.instagram.startsWith('http') ? member.instagram : `https://instagram.com/${member.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-full transition-all hover:scale-105"
                    style={{ background: '#fce4ec', color: '#e1306c' }}
                  >
                    <Instagram className="w-4 h-4" />
                    <span className="text-sm">انستغرام</span>
                  </a>
                )}
                {member.linkedin && (
                  <a 
                    href={member.linkedin.startsWith('http') ? member.linkedin : `https://linkedin.com/in/${member.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-full transition-all hover:scale-105"
                    style={{ background: '#e8f4fd', color: '#0077b5' }}
                  >
                    <Linkedin className="w-4 h-4" />
                    <span className="text-sm">لينكد إن</span>
                  </a>
                )}
                {member.snapchat && (
                  <a 
                    href={member.snapchat.startsWith('http') ? member.snapchat : `https://snapchat.com/add/${member.snapchat}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-full transition-all hover:scale-105"
                    style={{ background: '#fff9e6', color: '#fffc00' }}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301.165-.088.344-.104.464-.104.182 0 .359.029.509.09.45.149.734.479.734.838.015.449-.39.839-1.213 1.168-.089.029-.209.075-.344.119-.45.135-1.139.36-1.333.81-.09.224-.061.524.12.868l.015.015c.06.136 1.526 3.475 4.791 4.014.255.044.435.27.42.509 0 .075-.015.149-.045.225-.24.569-1.273.988-3.146 1.271-.059.091-.12.375-.164.57-.029.179-.074.36-.134.553-.076.271-.27.405-.555.405h-.03c-.135 0-.313-.031-.538-.074-.36-.075-.765-.135-1.273-.135-.3 0-.599.015-.913.074-.6.104-1.123.464-1.723.884-.853.599-1.826 1.288-3.294 1.288-.06 0-.119-.015-.18-.015h-.149c-1.468 0-2.427-.675-3.279-1.288-.599-.42-1.107-.779-1.707-.884-.314-.045-.629-.074-.928-.074-.54 0-.958.089-1.272.149-.211.043-.391.074-.54.074-.374 0-.523-.224-.583-.42-.061-.192-.09-.389-.135-.567-.046-.181-.105-.494-.166-.57-1.918-.222-2.95-.642-3.189-1.226-.031-.063-.052-.15-.055-.225-.015-.243.165-.465.42-.509 3.264-.54 4.73-3.879 4.791-4.02l.016-.029c.18-.345.224-.645.119-.869-.195-.434-.884-.658-1.332-.809-.121-.029-.24-.074-.346-.119-.809-.329-1.228-.72-1.228-1.153 0-.359.256-.704.704-.854.166-.059.346-.089.54-.089.121 0 .239.015.389.045.36.104.674.179.928.179.209 0 .314-.045.39-.09-.007-.166-.017-.331-.028-.51l-.003-.059c-.104-1.629-.23-3.654.3-4.848 1.58-3.545 4.94-3.82 5.93-3.82z"/>
                    </svg>
                    <span className="text-sm">سناب شات</span>
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* سجل التسجيلات */}
        <Card className="rounded-2xl border bg-transparent" style={{ borderColor: '#f0e0e4' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: '#f0e0e4' }}>
              <span className="text-lg font-bold" style={{ color: '#2d1f26' }}>سجل التسجيلات</span>
              <Badge 
                className="rounded-full"
                style={{ background: '#fdf2f4', color: '#a8556f' }}
              >
                {toEnglishNumbers(member.registrations.length)} تسجيل
              </Badge>
            </div>
            
            {member.registrations.length > 0 ? (
              <div className="space-y-3 mt-4 max-h-80 overflow-y-auto">
                {member.registrations.map((reg, index) => (
                  <div 
                    key={reg.id}
                    className="flex items-center justify-between p-4 rounded-xl border hover:shadow-md transition-shadow"
                    style={{ background: '#fdf8f9', borderColor: '#f0e0e4' }}
                  >
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                        style={{ background: 'linear-gradient(135deg, #a8556f 0%, #9b7b9a 100%)', color: 'white' }}
                      >
                        {toEnglishNumbers(index + 1)}
                      </div>
                      <div>
                        <p className="font-medium" style={{ color: '#2d1f26' }}>{reg.event?.title || 'فعالية محذوفة'}</p>
                        <p className="text-sm" style={{ color: '#9a8a90' }}>
                          {toEnglishNumbers(formatDate(reg.event?.date || reg.createdAt))}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(reg.status)}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 mt-4">
                <ClipboardList className="w-12 h-12 mx-auto mb-3" style={{ color: '#e8d8dc' }} />
                <p style={{ color: '#9a8a90' }}>لا توجد تسجيلات</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
