'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, MapPin, Clock, Users, Crown, ArrowRight,
  Twitter, Instagram, Linkedin, User, Settings, LogOut, ChevronDown, ClipboardList
} from 'lucide-react'
import Link from 'next/link'
import { toEnglishNumbers } from '@/lib/utils'

interface Event {
  id: string
  title: string
  description: string | null
  date: string
  endTime: string | null
  location: string | null
  imageUrl: string | null
  status: string
  showRegistrantCount: boolean
  showGuestProfile: boolean
  showCountdown: boolean
  registrationDeadline: string | null
  startTime: string | null
  capacity: number
  guestName: string | null
  guestImage: string | null
  guestOrganization: string | null
  guestPosition: string | null
  guestTwitter: string | null
  guestInstagram: string | null
  guestLinkedIn: string | null
  guestSnapchat: string | null
  _count?: { registrations: number }
}

interface Member {
  id: string
  name: string
  email: string
  phone: string | null
  companyName: string | null
  jobTitle: string | null
}

interface Admin {
  id: string
  name: string | null
  email: string
  role: string
}

interface EventSponsor {
  id: string
  sponsorId: string
  tasks: string | null
  sponsor: {
    id: string
    companyName: string
    logoUrl: string | null
  }
}

export default function EventDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [authLoading, setAuthLoading] = useState(true)
  const [member, setMember] = useState<Member | null>(null)
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [countdown, setCountdown] = useState<{days: number, hours: number, minutes: number, seconds: number} | null>(null)
  const [sponsors, setSponsors] = useState<EventSponsor[]>([])
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (params.id) {
      fetchEvent(params.id as string)
      fetchSponsors(params.id as string)
    }
    checkMemberAuth()
    checkAdminAuth()
  }, [params.id])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Countdown timer
  useEffect(() => {
    if (!event?.registrationDeadline || !event?.showCountdown) return
    
    const timer = setInterval(() => {
      const now = new Date().getTime()
      const deadline = new Date(event.registrationDeadline!).getTime()
      const diff = deadline - now
      
      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        clearInterval(timer)
      } else {
        setCountdown({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000)
        })
      }
    }, 1000)
    
    return () => clearInterval(timer)
  }, [event])

  const fetchEvent = async (id: string) => {
    try {
      const response = await fetch(`/api/events/${id}`)
      const data = await response.json()
      setEvent(data.event)
    } catch (error) {
      console.error('Error fetching event:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSponsors = async (id: string) => {
    try {
      const response = await fetch(`/api/event-sponsors/${id}`)
      const data = await response.json()
      if (response.ok) {
        setSponsors(data.sponsors || [])
      }
    } catch (error) {
      console.error('Error fetching sponsors:', error)
    }
  }

  const checkMemberAuth = async () => {
    try {
      const response = await fetch('/api/member/me')
      const data = await response.json()
      setMember(data.member)
    } catch {
      setMember(null)
    } finally {
      setAuthLoading(false)
    }
  }

  const checkAdminAuth = async () => {
    try {
      const response = await fetch('/api/admin/check')
      const data = await response.json()
      setAdmin(data.isAdmin ? data.admin : null)
    } catch {
      setAdmin(null)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/member/logout', { method: 'POST' })
      await fetch('/api/admin/logout', { method: 'POST' })
      setMember(null)
      setAdmin(null)
      setUserMenuOpen(false)
      router.refresh()
    } catch {
      console.error('Error logging out')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const arabicDate = date.toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    return toEnglishNumbers(arabicDate)
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return toEnglishNumbers(date.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl" style={{ background: 'linear-gradient(180deg, #fdf8f9 0%, #ffffff 50%, #fdf8f9 100%)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-4" style={{ borderColor: '#e8b4c4', borderTopColor: '#a8556f' }}></div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl" style={{ background: 'linear-gradient(180deg, #fdf8f9 0%, #ffffff 50%, #fdf8f9 100%)' }}>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4" style={{ color: '#2d1f26' }}>اللقاء غير موجود</h1>
          <Link href="/">
            <Button className="btn btn-primary rounded-full px-8">
              العودة للرئيسية
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const isRegistrationOpen = event.status === 'open' && (!event.registrationDeadline || new Date(event.registrationDeadline) > new Date())

  return (
    <div className="min-h-screen flex flex-col" dir="rtl" style={{ background: 'linear-gradient(180deg, #fdf8f9 0%, #ffffff 50%, #fdf8f9 100%)' }}>
      
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b" style={{ borderColor: 'rgba(240, 224, 228, 0.5)' }}>
        <div className="container">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ background: 'linear-gradient(135deg, #a8556f 0%, #9b7b9a 100%)' }}>
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold" style={{ color: '#2d1f26' }}>ملتقى ريادة</h1>
                <p className="text-xs font-medium" style={{ color: '#6b5a60' }}>تجمع سيدات الأعمال</p>
              </div>
            </Link>
            
            <div className="flex items-center gap-4">
              {/* Admin Panel Link - Only for Admins */}
              {admin && (
                <Link href="/admin" className="text-sm rounded-full px-6 py-2 font-medium transition-all hover:opacity-80" 
                  style={{ background: 'linear-gradient(135deg, #d4a0ac 0%, #c98b9a 100%)', color: 'white' }}>
                  لوحة التحكم
                </Link>
              )}
              
              {member || admin ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-3 px-4 py-2 rounded-full transition-all hover:bg-white/50"
                    style={{ background: userMenuOpen ? 'white' : 'transparent' }}
                  >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-md" 
                      style={{ background: 'linear-gradient(135deg, #d4a0ac 0%, #c98b9a 100%)' }}>
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-sm font-medium" style={{ color: '#2d1f26' }}>{member?.name || admin?.name || 'المستخدم'}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} style={{ color: '#6b5a60' }} />
                  </button>
                  
                  {userMenuOpen && (
                    <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border overflow-hidden z-50" style={{ borderColor: '#f0e0e4' }}>
                      <div className="p-4 border-b" style={{ borderColor: '#f0e0e4', background: '#fdf8f9' }}>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-md" 
                            style={{ background: 'linear-gradient(135deg, #d4a0ac 0%, #c98b9a 100%)' }}>
                            <User className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="font-bold" style={{ color: '#2d1f26' }}>{member?.name || admin?.name || 'المستخدم'}</p>
                            <p className="text-xs mt-1" style={{ color: '#6b5a60' }}>{member?.email || admin?.email}</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-2">
                        <Link href="/my-registrations" onClick={() => setUserMenuOpen(false)} 
                          className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-gray-50" style={{ color: '#2d1f26' }}>
                          <ClipboardList className="w-5 h-5" style={{ color: '#a8556f' }} />
                          <span className="text-sm font-medium">تسجيلاتي</span>
                        </Link>
                        <Link href="/profile" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-gray-50" style={{ color: '#2d1f26' }}>
                          <Settings className="w-5 h-5" style={{ color: '#a8556f' }} />
                          <span className="text-sm font-medium">الملف الشخصي</span>
                        </Link>
                        <button onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-gray-50 w-full text-right" style={{ color: '#c44' }}>
                          <LogOut className="w-5 h-5" />
                          <span className="text-sm font-medium">تسجيل الخروج</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : authLoading ? (
                <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
              ) : (
                <Link href="/login">
                  <span className="btn btn-ghost text-sm rounded-full px-4 py-2 cursor-pointer">
                    تسجيل الدخول
                  </span>
                </Link>
              )}
              
              <Link href="/">
                <Button variant="ghost" className="gap-2 rounded-full">
                  <ArrowRight className="w-4 h-4" />
                  العودة للرئيسية
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container py-12">
        <div className="max-w-4xl mx-auto">
          {/* Event Header */}
          <div className="text-center mb-10">
            <Badge className={`mb-4 ${isRegistrationOpen ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
              {isRegistrationOpen ? 'التسجيل مفتوح' : event.status === 'ended' ? 'منتهي' : 'مغلق'}
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#2d1f26' }}>{event.title}</h1>
            {event.description && (
              <p className="text-lg" style={{ color: '#6b5a60' }}>{event.description}</p>
            )}
          </div>

          {/* Event Image */}
          {event.imageUrl && (
            <div className="mb-10 rounded-3xl overflow-hidden shadow-xl">
              <img src={event.imageUrl} alt={event.title} className="w-full h-64 md:h-80 object-cover" />
            </div>
          )}

          {/* Event Info Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-10">
            {/* Date & Time */}
            <Card className="rounded-3xl border-0 shadow-lg" style={{ background: 'white' }}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #a8556f 0%, #9b7b9a 100%)' }}>
                    <Calendar className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: '#9a8a90' }}>التاريخ</p>
                    <p className="font-bold text-lg" style={{ color: '#2d1f26' }}>{formatDate(event.date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #c9a066 0%, #b89055 100%)' }}>
                    <Clock className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: '#9a8a90' }}>الوقت</p>
                    <p className="font-bold text-lg" style={{ color: '#2d1f26' }}>{event.startTime || formatTime(event.date)} - {event.endTime || '22:00'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location & Capacity */}
            <Card className="rounded-3xl border-0 shadow-lg" style={{ background: 'white' }}>
              <CardContent className="p-6">
                {event.location && (
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)' }}>
                      <MapPin className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm" style={{ color: '#9a8a90' }}>الموقع</p>
                      <a 
                        href={`https://www.google.com/maps/search/${encodeURIComponent(event.location + ' الرياض السعودية')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-lg hover:underline"
                        style={{ color: '#0891b2' }}
                      >
                        {event.location}
                      </a>
                    </div>
                  </div>
                )}
                {event.showRegistrantCount && (
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #a8556f 0%, #9b7b9a 100%)' }}>
                      <Users className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <p className="text-sm" style={{ color: '#9a8a90' }}>المسجلين</p>
                      <p className="font-bold text-lg" style={{ color: '#2d1f26' }}>{toEnglishNumbers(event._count?.registrations || 0)} / {toEnglishNumbers(event.capacity)}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Countdown Timer */}
          {event.showCountdown && event.registrationDeadline && countdown && isRegistrationOpen && (
            <div className="mb-10 bg-gradient-to-l from-[#a8556f] to-[#9b7b9a] rounded-3xl p-8 text-white text-center">
              <p className="text-lg font-medium mb-4">الوقت المتبقي للتسجيل:</p>
              <div className="flex justify-center gap-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 min-w-[80px]">
                  <div className="text-3xl font-bold">{toEnglishNumbers(countdown.days)}</div>
                  <div className="text-sm text-white/70">يوم</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 min-w-[80px]">
                  <div className="text-3xl font-bold">{toEnglishNumbers(countdown.hours)}</div>
                  <div className="text-sm text-white/70">ساعة</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 min-w-[80px]">
                  <div className="text-3xl font-bold">{toEnglishNumbers(countdown.minutes)}</div>
                  <div className="text-sm text-white/70">دقيقة</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 min-w-[80px]">
                  <div className="text-3xl font-bold">{toEnglishNumbers(countdown.seconds)}</div>
                  <div className="text-sm text-white/70">ثانية</div>
                </div>
              </div>
            </div>
          )}

          {/* Guest Profile */}
          {event.showGuestProfile && event.guestName && (
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: '#2d1f26' }}>ضيفة اللقاء</h2>
              <Card className="rounded-3xl border-0 shadow-lg overflow-hidden" style={{ background: 'white' }}>
                <CardContent className="p-8">
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    {event.guestImage ? (
                      <img src={event.guestImage} alt={event.guestName} className="w-32 h-32 rounded-full object-cover shadow-lg" />
                    ) : (
                      <div className="w-32 h-32 rounded-full flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #a8556f 0%, #9b7b9a 100%)' }}>
                        <User className="w-16 h-16 text-white" />
                      </div>
                    )}
                    <div className="text-center md:text-right flex-1">
                      <h3 className="text-2xl font-bold mb-2" style={{ color: '#2d1f26' }}>{event.guestName}</h3>
                      {event.guestPosition && (
                        <p className="text-lg mb-1" style={{ color: '#a8556f' }}>{event.guestPosition}</p>
                      )}
                      {event.guestOrganization && (
                        <p className="text-base" style={{ color: '#6b5a60' }}>{event.guestOrganization}</p>
                      )}
                      
                      {/* Social Links */}
                      <div className="flex items-center justify-center md:justify-start gap-3 mt-4">
                        {event.guestTwitter && (
                          <a href={event.guestTwitter} target="_blank" rel="noopener noreferrer" 
                            className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
                            style={{ background: '#1da1f2' }}>
                            <Twitter className="w-5 h-5 text-white" />
                          </a>
                        )}
                        {event.guestInstagram && (
                          <a href={event.guestInstagram} target="_blank" rel="noopener noreferrer"
                            className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
                            style={{ background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' }}>
                            <Instagram className="w-5 h-5 text-white" />
                          </a>
                        )}
                        {event.guestLinkedIn && (
                          <a href={event.guestLinkedIn} target="_blank" rel="noopener noreferrer"
                            className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
                            style={{ background: '#0077b5' }}>
                            <Linkedin className="w-5 h-5 text-white" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Sponsors Section */}
          {sponsors.length > 0 && (
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: '#2d1f26' }}>الرعاة</h2>
              <Card className="rounded-3xl border-0 shadow-lg" style={{ background: 'white' }}>
                <CardContent className="p-6">
                  <div className="flex flex-wrap justify-center gap-6">
                    {sponsors.map((sponsor) => (
                      <a
                        key={sponsor.id}
                        href={`/sponsor/${sponsor.sponsorId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center gap-2 transition-transform hover:scale-105"
                      >
                        {sponsor.sponsor.logoUrl ? (
                          <img 
                            src={sponsor.sponsor.logoUrl} 
                            alt={sponsor.sponsor.companyName}
                            className="w-16 h-16 rounded-xl object-contain bg-white p-2 shadow-md"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-xl flex items-center justify-center bg-gray-100 shadow-md">
                            <span className="text-2xl">🏢</span>
                          </div>
                        )}
                        <span className="text-sm font-medium text-center max-w-[80px]" style={{ color: '#2d1f26' }}>
                          {sponsor.sponsor.companyName.substring(0, 15)}
                        </span>
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Registration Button */}
          <div className="text-center">
            {isRegistrationOpen ? (
              <Link href="/register">
                <Button className="btn btn-primary px-12 py-7 text-xl rounded-full">
                  سجلي الآن
                  <ArrowRight className="w-5 h-5 mr-2" />
                </Button>
              </Link>
            ) : (
              <div className="inline-flex items-center gap-2 px-8 py-4 rounded-full" style={{ background: '#f0e0e4' }}>
                <span className="text-lg font-medium" style={{ color: '#6b5a60' }}>
                  {event.status === 'ended' ? 'انتهى اللقاء' : 'التسجيل مغلق'}
                </span>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t" style={{ borderColor: '#f0e0e4', background: '#fdf8f9' }}>
        <div className="container text-center">
          <p className="text-sm" style={{ color: '#9a8a90' }}>
            Powered by Yplus
          </p>
        </div>
      </footer>
    </div>
  )
}
