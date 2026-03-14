'use client'

// Main page component - force reload v4
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, MapPin, Clock, Users, Star, ArrowLeft,
  Mail, Globe, Instagram, Twitter, Linkedin, Menu, X,
  Handshake, Lightbulb, Target, Award, TrendingUp,
  Sparkles, Crown, Banknote, Monitor, Camera, Megaphone, BookOpen, Gift,
  User, Settings, LogOut, ChevronDown, ClipboardList
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { toEnglishNumbers } from '@/lib/utils'

interface Event {
  id: string
  title: string
  description: string | null
  date: string
  endTime: string | null
  location: string | null
  capacity: number
  imageUrl: string | null
  status: string
  showRegistrantCount: boolean
  registrationDeadline: string | null
  startTime: string | null
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

export default function Home() {
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [authLoading, setAuthLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [member, setMember] = useState<Member | null>(null)
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [countdown, setCountdown] = useState<{days: number, hours: number, minutes: number, seconds: number} | null>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchEvents()
    checkMemberAuth()
    checkAdminAuth()
  }, [])

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

  // Countdown timer for featured open event
  useEffect(() => {
    const featuredEvent = events.find(e => e.status === 'open' && e.registrationDeadline)
    if (!featuredEvent?.registrationDeadline) return
    
    const timer = setInterval(() => {
      const now = new Date().getTime()
      const deadline = new Date(featuredEvent.registrationDeadline!).getTime()
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
  }, [events])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])



  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events')
      const data = await response.json()
      setEvents(data.events || [])
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      // تسجيل خروج العضو
      await fetch('/api/member/logout', { method: 'POST' })
      // تسجيل خروج الأدمن
      await fetch('/api/admin/logout', { method: 'POST' })
      setMember(null)
      setAdmin(null)
      setUserMenuOpen(false)
      router.refresh()
    } catch {
      console.error('Error logging out')
    }
  }

  // تصنيف اللقاءات: القادمة = التاريخ في المستقبل والحالة ليست ملغاة أو منتهية
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()) // بداية اليوم
  
  const upcomingEvents = events.filter(e => {
    const eventDate = new Date(e.date)
    const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate())
    return eventDay >= today && e.status !== 'cancelled' && e.status !== 'ended'
  })
  
  const pastEvents = events.filter(e => {
    const eventDate = new Date(e.date)
    const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate())
    return eventDay < today || e.status === 'ended'
  })

  // اللقاء المفتوح للتسجيل
  const featuredOpenEvent = events.find(e => e.status === 'open' && new Date(e.date) >= today)

  // تنسيق التاريخ بالعربية مع أرقام إنجليزية
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    return toEnglishNumbers(date.toLocaleDateString('ar-SA', options))
  }

  const formatDateOnly = (dateString: string) => {
    const date = new Date(dateString)
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }
    return toEnglishNumbers(date.toLocaleDateString('ar-SA', options))
  }

  const getDayName = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ar-SA', { weekday: 'long' })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return toEnglishNumbers(date.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', hour12: true }))
  }

  const formatTimeOnly = (time: string) => {
    if (!time) return ''
    const [hours, minutes] = time.split(':').map(Number)
    const period = hours >= 12 ? 'م' : 'ص'
    const hour12 = hours % 12 || 12
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`
  }

  return (
    <div className="min-h-screen flex flex-col" dir="rtl" style={{ background: 'linear-gradient(180deg, #fdf8f9 0%, #ffffff 50%, #fdf8f9 100%)' }}>
      
      {/* Decorative Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="blob blob-1" style={{ top: '5%', right: '5%' }}></div>
        <div className="blob blob-2" style={{ top: '30%', left: '10%' }}></div>
        <div className="blob blob-3" style={{ bottom: '20%', right: '20%' }}></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b" style={{ borderColor: 'rgba(240, 224, 228, 0.5)' }}>
        <div className="container">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #a8556f 0%, #9b7b9a 100%)' }}>
                <Crown className="w-6 h-6 text-white relative z-10" />
                <div className="absolute inset-0 bg-white/20"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold" style={{ color: '#2d1f26' }}>ملتقى ريادة</h1>
                <p className="text-xs font-medium" style={{ color: '#6b5a60' }}>تجمع سيدات الأعمال</p>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-10">
              <a href="#events" className="nav-link text-sm">اللقاءات</a>
              <Link href="/sponsor" className="nav-link text-sm">طلب الرعاية</Link>
              
              {/* Admin Panel Link - Only for Admins */}
              {admin && (
                <>
                  <Link href="/admin" className="text-sm rounded-full px-6 py-2 font-medium transition-all hover:opacity-80" 
                    style={{ background: 'linear-gradient(135deg, #d4a0ac 0%, #c98b9a 100%)', color: 'white' }}>
                    لوحة التحكم
                  </Link>
                  {admin.role === 'super_admin' && (
                    <Link href="/super-admin" className="text-sm rounded-full px-6 py-2 font-medium transition-all hover:opacity-80" 
                      style={{ background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)', color: 'white' }}>
                      السوبر أدمن
                    </Link>
                  )}
                </>
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
                <div className="flex items-center gap-3">
                  <Link href="/login">
                    <span className="text-sm font-medium rounded-full px-5 py-2 cursor-pointer transition-all hover:bg-[#fdf2f4]" style={{ color: '#2d1f26' }}>
                      تسجيل الدخول
                    </span>
                  </Link>
                  <Link href="/signup">
                    <span className="text-sm font-medium rounded-full px-5 py-2 cursor-pointer transition-all" style={{ background: '#fdf2f4', color: '#a8556f', border: '1.5px solid #e8b4c4' }}>
                      إنشاء حساب
                    </span>
                  </Link>
                </div>
              )}
            </nav>

            {/* Mobile Menu */}
            <button className="md:hidden p-2" style={{ color: '#2d1f26' }} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-white/95 backdrop-blur-xl" style={{ borderColor: '#f0e0e4' }}>
            <nav className="container py-6 flex flex-col gap-4">
              <a href="#events" className="text-sm font-medium" style={{ color: '#2d1f26' }} onClick={() => setMobileMenuOpen(false)}>اللقاءات</a>
              <Link href="/sponsor" className="text-sm font-medium" style={{ color: '#2d1f26' }} onClick={() => setMobileMenuOpen(false)}>طلب الرعاية</Link>
              
              {/* Admin Panel Link for Mobile */}
              {admin && (
                <Link href="/admin" onClick={() => setMobileMenuOpen(false)}
                  className="text-sm rounded-full px-6 py-2 text-center font-medium transition-all hover:opacity-80"
                  style={{ background: 'linear-gradient(135deg, #d4a0ac 0%, #c98b9a 100%)', color: 'white' }}>
                  لوحة التحكم
                </Link>
              )}
              
              {member || admin ? (
                <>
                  <div className="h-px my-2" style={{ background: '#f0e0e4' }}></div>
                  <div className="flex items-center gap-3 py-2">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-md" 
                      style={{ background: 'linear-gradient(135deg, #d4a0ac 0%, #c98b9a 100%)' }}>
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold" style={{ color: '#2d1f26' }}>{member?.name || admin?.name || 'المستخدم'}</p>
                      <p className="text-xs" style={{ color: '#6b5a60' }}>{member?.email || admin?.email}</p>
                    </div>
                  </div>
                  <Link href="/my-registrations" onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 text-sm font-medium py-2" style={{ color: '#2d1f26' }}>
                    <ClipboardList className="w-5 h-5" style={{ color: '#a8556f' }} />
                    تسجيلاتي
                  </Link>
                  <Link href="/profile" onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 text-sm font-medium py-2" style={{ color: '#2d1f26' }}>
                    <Settings className="w-5 h-5" style={{ color: '#a8556f' }} />
                    الملف الشخصي
                  </Link>
                  <button onClick={handleLogout}
                    className="flex items-center gap-3 text-sm font-medium py-2 text-right w-full" style={{ color: '#c44' }}>
                    <LogOut className="w-5 h-5" />
                    تسجيل الخروج
                  </button>
                </>
              ) : authLoading ? (
                <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}
                    className="text-sm font-medium text-center rounded-full px-6 py-2" style={{ color: '#2d1f26' }}>
                    تسجيل الدخول
                  </Link>
                  <Link href="/signup" onClick={() => setMobileMenuOpen(false)}
                    className="text-sm font-medium text-center rounded-full px-6 py-2" style={{ background: '#fdf2f4', color: '#a8556f', border: '1.5px solid #e8b4c4' }}>
                    إنشاء حساب
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-display mb-6 animate-fade-in stagger-1" style={{ opacity: 0 }}>
              ملتقى ريادة
            </h1>
            
            <p className="text-subtitle mb-4 animate-fade-in stagger-2" style={{ color: '#6b5a60', opacity: 0 }}>
              تجمع تفاعلي يجمع سيدات الأعمال والقياديات
            </p>
            
            <p className="text-body max-w-2xl mx-auto mb-8 animate-fade-in stagger-3" style={{ color: '#9a8a90', opacity: 0 }}>
              لتبادل الخبرات وبناء علاقات مهنية قوية وتعزيز تمكين المرأة ودعم طموحاتها في عالم الأعمال
            </p>
            
            <div className="inline-flex flex-col items-center gap-2 px-6 py-4 rounded-2xl mb-12 animate-fade-in stagger-4" style={{ background: 'linear-gradient(135deg, #fdf2f4 0%, #fce8ec 100%)', border: '1px solid #f0d0d8', opacity: 0 }}>
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5" style={{ color: '#a8556f' }} />
                <span className="text-base font-bold" style={{ color: '#a8556f' }}>
                  30% من مستهدفات رؤية 2030
                </span>
              </div>
              <span className="text-sm" style={{ color: '#a8556f' }}>
                تتعلق بتمكين المرأة اقتصادياً
              </span>
            </div>
            
            <div className="flex flex-wrap justify-center gap-5 animate-fade-in stagger-4" style={{ opacity: 0 }}>
              <Link href="/register">
                <Button className="btn btn-primary px-10 py-7 text-lg rounded-full">
                  سجلي الآن
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              
              <Link href="/sponsor">
                <Button className="btn btn-secondary px-10 py-7 text-lg rounded-full">
                  طلب رعاية
                  <Handshake className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Open Event Section */}
      {featuredOpenEvent && (
        <section className="py-8 relative z-10">
          <div className="container">
            <div className="rounded-3xl shadow-2xl p-8 md:p-10 border-2" dir="rtl" style={{ background: 'linear-gradient(135deg, #fdf8f9 0%, #ffffff 50%, #fdf2f4 100%)', borderColor: '#e8b4c4' }}>
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex-1 text-center md:text-right">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4" style={{ background: '#fdf2f4', border: '1px solid #e8b4c4' }}>
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-sm font-bold" style={{ color: '#a8556f' }}>التسجيل مفتوح</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: '#2d1f26' }}>{featuredOpenEvent.title}</h2>
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-center md:justify-start gap-3 text-sm" style={{ color: '#6b5a60' }}>
                      <Sparkles className="w-4 h-4" style={{ color: '#a8556f' }} />
                      {getDayName(featuredOpenEvent.date)}
                    </div>
                    <div className="flex items-center justify-center md:justify-start gap-3 text-sm" style={{ color: '#6b5a60' }}>
                      <Calendar className="w-4 h-4" style={{ color: '#a8556f' }} />
                      {formatDate(featuredOpenEvent.date)}
                    </div>
                    <div className="flex items-center justify-center md:justify-start gap-3 text-sm" style={{ color: '#6b5a60' }}>
                      <Clock className="w-4 h-4" style={{ color: '#a8556f' }} />
                      {formatTimeOnly(featuredOpenEvent.startTime || '18:00')} - {formatTimeOnly(featuredOpenEvent.endTime || '22:00')}
                    </div>
                    {featuredOpenEvent.location && (
                      <a 
                        href={`https://www.google.com/maps/search/${encodeURIComponent(featuredOpenEvent.location + ' الرياض السعودية')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center md:justify-start gap-2 text-sm hover:underline"
                        style={{ color: '#0891b2' }}
                      >
                        <MapPin className="w-4 h-4" />
                        {featuredOpenEvent.location}
                      </a>
                    )}
                  </div>
                </div>
                
                {/* Countdown Timer */}
                {featuredOpenEvent.registrationDeadline && countdown && (
                  <div className="flex flex-col items-center">
                    <p className="text-sm font-medium mb-3" style={{ color: '#6b5a60' }}>الوقت المتبقي للتسجيل:</p>
                    <div className="flex gap-3" dir="rtl">
                      <div className="rounded-2xl p-4 min-w-[70px] text-center shadow-sm" style={{ background: '#fdf2f4', border: '1px solid #f0e0e4' }}>
                        <div className="text-3xl font-bold" style={{ color: '#a8556f' }}>{countdown.days}</div>
                        <div className="text-xs" style={{ color: '#9a8a90' }}>يوم</div>
                      </div>
                      <div className="rounded-2xl p-4 min-w-[70px] text-center shadow-sm" style={{ background: '#fdf2f4', border: '1px solid #f0e0e4' }}>
                        <div className="text-3xl font-bold" style={{ color: '#a8556f' }}>{countdown.hours}</div>
                        <div className="text-xs" style={{ color: '#9a8a90' }}>ساعة</div>
                      </div>
                      <div className="rounded-2xl p-4 min-w-[70px] text-center shadow-sm" style={{ background: '#fdf2f4', border: '1px solid #f0e0e4' }}>
                        <div className="text-3xl font-bold" style={{ color: '#a8556f' }}>{countdown.minutes}</div>
                        <div className="text-xs" style={{ color: '#9a8a90' }}>دقيقة</div>
                      </div>
                      <div className="rounded-2xl p-4 min-w-[70px] text-center shadow-sm" style={{ background: '#fdf2f4', border: '1px solid #f0e0e4' }}>
                        <div className="text-3xl font-bold" style={{ color: '#a8556f' }}>{countdown.seconds}</div>
                        <div className="text-xs" style={{ color: '#9a8a90' }}>ثانية</div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex-shrink-0">
                  <Link href="/register">
                    <Button className="btn btn-primary px-8 py-6 rounded-full text-lg font-bold shadow-lg">
                      سجلي الآن
                      <ArrowLeft className="w-5 h-5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Stats Section */}
      <section className="py-16 relative z-10">
        <div className="container">
          <div className="bg-white rounded-3xl shadow-xl p-10 border" style={{ borderColor: '#f0e0e4' }}>
            <div className="grid grid-cols-2 gap-10 max-w-2xl mx-auto">
              {[
                { value: '24', label: 'تجمع سنوياً', icon: Calendar },
                { value: '15', label: 'يوماً بين التجمعات', icon: Clock },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <stat.icon className="w-8 h-8 mx-auto mb-3" style={{ color: '#a8556f' }} />
                  <div className="stat-number">{stat.value}</div>
                  <div className="text-sm mt-2" style={{ color: '#6b5a60' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section id="events" className="section relative z-10">
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="text-headline mb-4">اللقاءات القادمة</h2>
            <p className="text-body max-w-xl mx-auto" style={{ color: '#6b5a60' }}>
              تجمعات دورية كل 15 يوم يوم الأحد
            </p>
          </div>

          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="grid w-full max-w-lg mx-auto grid-cols-2 mb-10 rounded-full p-1.5" style={{ background: '#fdf2f4' }}>
              <TabsTrigger value="upcoming" className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-full transition-all">
                القادمة ({upcomingEvents.length})
              </TabsTrigger>
              <TabsTrigger value="past" className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-full transition-all">
                السابقة ({pastEvents.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming">
              {loading ? (
                <div className="text-center py-16">
                  <div className="animate-spin rounded-full h-10 w-10 border-3 mx-auto" style={{ borderColor: '#e8b4c4', borderTopColor: '#a8556f' }}></div>
                  <p className="mt-4" style={{ color: '#6b5a60' }}>جاري التحميل...</p>
                </div>
              ) : upcomingEvents.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border" style={{ borderColor: '#f0e0e4' }}>
                  <Calendar className="w-16 h-16 mx-auto mb-4" style={{ color: '#e8b4c4' }} />
                  <h3 className="text-xl font-semibold mb-2" style={{ color: '#2d1f26' }}>لا توجد لقاءات قادمة</h3>
                  <p style={{ color: '#6b5a60' }}>ترقبوا الإعلان قريباً</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {upcomingEvents.map((event, i) => (
                    <Card key={event.id} className="card card-accent-top animate-fade-in group" style={{ animationDelay: `${i * 0.1}s`, opacity: 0 }} dir="rtl">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <Badge className="badge badge-primary">قادم</Badge>
                          {event.showRegistrantCount && (
                            <span className="text-sm font-medium" style={{ color: '#6b5a60' }}>
                              {event._count?.registrations || 0}/{event.capacity} مسجلة
                            </span>
                          )}
                        </div>
                        <CardTitle className="text-xl mt-4" style={{ color: '#2d1f26' }}>{event.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="mb-5 line-clamp-2" style={{ color: '#9a8a90' }}>
                          {event.description || 'لا يوجد وصف'}
                        </CardDescription>
                        <div className="space-y-3 mb-6">
                          <div className="flex items-center gap-3 text-sm" style={{ color: '#6b5a60' }}>
                            <Sparkles className="w-4 h-4" style={{ color: '#a8556f' }} />
                            {getDayName(event.date)}
                          </div>
                          <div className="flex items-center gap-3 text-sm" style={{ color: '#6b5a60' }}>
                            <Calendar className="w-4 h-4" style={{ color: '#a8556f' }} />
                            {formatDate(event.date)}
                          </div>
                          <div className="flex items-center gap-3 text-sm" style={{ color: '#6b5a60' }}>
                            <Clock className="w-4 h-4" style={{ color: '#a8556f' }} />
                            {formatTimeOnly(event.startTime || '18:00')} - {formatTimeOnly(event.endTime || '22:00')}
                          </div>
                          {event.location && (
                            <a 
                              href={`https://www.google.com/maps/search/${encodeURIComponent(event.location + ' الرياض السعودية')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm hover:underline underline-offset-2"
                              style={{ color: '#0891b2' }}
                            >
                              <MapPin className="w-4 h-4" />
                              <span>{event.location}</span>
                            </a>
                          )}
                        </div>
                        <Link href={`/register?event=${event.id}`}>
                          <Button className="btn btn-primary text-sm rounded-full px-5 py-2">
                            سجلي الآن
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="past">
              {pastEvents.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border" style={{ borderColor: '#f0e0e4' }}>
                  <Calendar className="w-16 h-16 mx-auto mb-4" style={{ color: '#e8dde8' }} />
                  <h3 className="text-xl font-semibold mb-2" style={{ color: '#2d1f26' }}>لا توجد لقاءات سابقة</h3>
                  <p style={{ color: '#6b5a60' }}>ستظهر هنا اللقاءات المنتهية</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {pastEvents.map(event => (
                    <Card key={event.id} className="opacity-70 rounded-3xl border-0" style={{ background: '#fdf8f9' }}>
                      <CardHeader>
                        <Badge className="badge w-fit" style={{ background: '#f0e0e4', color: '#6b5a60' }}>منتهي</Badge>
                        <CardTitle className="text-xl mt-3" style={{ color: '#2d1f26' }}>{event.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 text-sm" style={{ color: '#6b5a60' }}>
                            <Calendar className="w-4 h-4" />
                            {formatDate(event.date)}
                          </div>
                          <div className="flex items-center gap-3 text-sm" style={{ color: '#6b5a60' }}>
                            <Users className="w-4 h-4" />
                            {event._count?.registrations || 0} مشاركة
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #e8b4c4 0%, #d4a0ac 50%, #c98b9a 100%)' }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-20 w-40 h-40 border-2 border-white rounded-full"></div>
          <div className="absolute bottom-20 left-10 w-60 h-60 border border-white rounded-full"></div>
          <div className="absolute top-1/2 left-1/3 w-24 h-24 border border-white rounded-full"></div>
        </div>
        
        <div className="container relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-headline mb-4" style={{ color: '#2d1f26' }}>عن الملتقى</h2>
            <p className="text-body max-w-xl mx-auto" style={{ color: '#6b5a60' }}>نحو مجتمع متماسك يدعم سيدات الأعمال</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { icon: Award, title: 'التعاون والتميز', desc: 'نبني شراكات استراتيجية تدعم نمو الأعمال وتعزز التميز المهني' },
              { icon: Lightbulb, title: 'الابتكار والتمكين', desc: 'نشجع الأفكار الجديدة وندعم طموحات المرأة في تحقيق أهدافها' },
              { icon: Target, title: 'رؤية 2030', desc: 'مساهمة فعالة في تمكين المرأة وتحقيق مستهدفات الرؤية' },
            ].map((item, i) => (
              <div key={i} className="text-center p-8 rounded-3xl bg-white/80 backdrop-blur-sm border border-white/50 shadow-lg hover:bg-white/90 transition-all">
                <div className="feature-icon mx-auto mb-5">
                  <item.icon className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold mb-3" style={{ color: '#2d1f26' }}>{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#6b5a60' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative z-10" style={{ background: 'linear-gradient(180deg, #fdf8f9 0%, #ffffff 100%)' }}>
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-headline mb-4">برامجنا ومميزاتنا</h2>
            <p className="text-body max-w-xl mx-auto" style={{ color: '#6b5a60' }}>نقدم تجربة متكاملة لسيدات الأعمال</p>
          </div>

          <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto">
            <div className="bg-white rounded-3xl p-10 border shadow-lg text-center" style={{ borderColor: '#f0e0e4' }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: 'linear-gradient(135deg, #a8556f 0%, #9b7b9a 100%)' }}>
                <Star className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-6" style={{ color: '#2d1f26' }}>ما يميزنا</h3>
              <ul className="space-y-5 text-center">
                {[
                  { text: 'ورش عمل عملية ومتخصصة', icon: '🎯' },
                  { text: 'تواصل مباشر مع خبراء ومتخصصين', icon: '🤝' },
                  { text: 'فرص للتعاون والتوسع', icon: '📈' },
                  { text: 'استكشاف شراكات تجارية جديدة', icon: '💡' },
                ].map((item, i) => (
                  <li key={i} className="flex items-center justify-center gap-4">
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-base" style={{ color: '#2d1f26' }}>{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-white rounded-3xl p-10 border shadow-lg text-center" style={{ borderColor: '#f0e0e4' }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: 'linear-gradient(135deg, #c9a066 0%, #b89055 100%)' }}>
                <Target className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-6" style={{ color: '#2d1f26' }}>محاور البرنامج</h3>
              <ul className="space-y-5 text-center">
                {[
                  { text: 'القيادة والإدارة الفعالة', icon: '👑' },
                  { text: 'التمويل والاستثمار الذكي', icon: '💰' },
                  { text: 'التقنية والرقمنة', icon: '💻' },
                  { text: 'التطوير الذاتي والمهني', icon: '📚' },
                ].map((item, i) => (
                  <li key={i} className="flex items-center justify-center gap-4">
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-base" style={{ color: '#2d1f26' }}>{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Sponsorship Section */}
      <section id="sponsor" className="section relative z-10">
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="text-headline mb-4">فرص الرعاية</h2>
            <p className="text-body max-w-xl mx-auto" style={{ color: '#6b5a60' }}>انضمي إلى شركاء نجاحنا في دعم سيدات الأعمال</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5 max-w-5xl mx-auto">
            {[
              { icon: Banknote, title: 'مالية', desc: 'دعم مالي', color: '#a8556f' },
              { icon: Monitor, title: 'تقنية', desc: 'حلول تقنية', color: '#9b7b9a' },
              { icon: Camera, title: 'إعلامية', desc: 'تغطية إعلامية', color: '#c9a066' },
              { icon: Megaphone, title: 'تسويقية', desc: 'ترويج وإعلان', color: '#a8556f' },
              { icon: BookOpen, title: 'معرفية', desc: 'ورش تعليمية', color: '#9b7b9a' },
              { icon: Gift, title: 'عينية', desc: 'منتجات وخدمات', color: '#c9a066' },
            ].map((type, i) => (
              <div key={i} className="text-center p-6 rounded-2xl cursor-pointer group hover-lift bg-white border transition-all duration-300 hover:shadow-lg" style={{ borderColor: '#f0e0e4' }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-all duration-300" style={{ background: `linear-gradient(135deg, ${type.color}20 0%, ${type.color}10 100%)` }}>
                  <type.icon className="w-7 h-7" style={{ color: type.color }} />
                </div>
                <h3 className="font-bold text-sm mb-1" style={{ color: '#2d1f26' }}>{type.title}</h3>
                <p className="text-xs" style={{ color: '#9a8a90' }}>{type.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/sponsor">
              <Button className="btn btn-secondary px-10 py-6 rounded-full text-lg">
                طلب الرعاية
                <Handshake className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t relative z-10" style={{ background: 'linear-gradient(180deg, #fdf8f9 0%, #fdf2f4 100%)', borderColor: '#f0e0e4' }}>
        <div className="container">
          <div className="grid md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #a8556f 0%, #9b7b9a 100%)' }}>
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold" style={{ color: '#2d1f26' }}>ملتقى ريادة</h3>
                  <p className="text-xs" style={{ color: '#6b5a60' }}>تجمع سيدات الأعمال</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: '#6b5a60' }}>
                تجمع تفاعلي يجمع سيدات الأعمال والقياديات لتبادل الخبرات وبناء علاقات مهنية قوية
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-5" style={{ color: '#2d1f26' }}>روابط سريعة</h4>
              <ul className="space-y-3">
                <li><a href="#events" className="text-sm link">اللقاءات</a></li>
                <li><a href="#sponsor" className="text-sm link">طلب الرعاية</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-5" style={{ color: '#2d1f26' }}>تواصل معنا</h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-sm" style={{ color: '#6b5a60' }}>
                  <Globe className="w-4 h-4" style={{ color: '#a8556f' }} />
                  www.riyada.yplus.ai
                </li>
                <li className="flex items-center gap-2 text-sm" style={{ color: '#6b5a60' }}>
                  <Mail className="w-4 h-4" style={{ color: '#a8556f' }} />
                  info@riyada.yplus.ai
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-5" style={{ color: '#2d1f26' }}>تابعينا</h4>
              <div className="flex gap-3 mb-4">
                {[Twitter, Instagram, Linkedin].map((Icon, i) => (
                  <a key={i} href="#" className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-sm hover:shadow-md transition-all" style={{ border: '1px solid #f0e0e4' }}>
                    <Icon className="w-5 h-5" style={{ color: '#a8556f' }} />
                  </a>
                ))}
              </div>
              <p className="text-sm font-medium" style={{ color: '#a8556f' }}>نجاح • تميز • ريادة</p>
            </div>
          </div>
          
          <div className="divider my-10"></div>
          
          <p className="text-center text-sm" style={{ color: '#9a8a90' }}>
            Powered by Yplus
          </p>
        </div>
      </footer>
    </div>
  )
}
 
