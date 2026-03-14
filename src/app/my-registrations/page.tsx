'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Crown, Calendar, Clock, MapPin, Users, ClipboardList,
  User, Settings, LogOut, ChevronDown, Menu, X, CheckCircle, XCircle, AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { toEnglishNumbers } from '@/lib/utils'

interface Registration {
  id: string
  status: string
  createdAt: string
  event: {
    id: string
    title: string
    date: string
    startTime: string | null
    location: string | null
  }
}

interface Member {
  id: string
  name: string
  email: string
  phone: string | null
  companyName: string | null
  jobTitle: string | null
  registrations: Registration[]
}

interface Admin {
  id: string
  name: string | null
  email: string
  role: string
}

export default function MyRegistrationsPage() {
  const router = useRouter()
  const [member, setMember] = useState<Member | null>(null)
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [loading, setLoading] = useState(true)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchMemberData()
    fetchAdminData()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchMemberData = async () => {
    try {
      const response = await fetch('/api/member/me')
      const data = await response.json()
      if (data.member) {
        setMember(data.member)
      }
    } catch {
      setMember(null)
    } finally {
      setLoading(false)
    }
  }

  const fetchAdminData = async () => {
    try {
      const response = await fetch('/api/admin/check')
      const data = await response.json()
      if (data.isAdmin) {
        setAdmin(data.admin)
      }
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
      router.push('/')
    } catch {
      console.error('Error logging out')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return toEnglishNumbers(date.toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }))
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; style: React.CSSProperties; icon: React.ElementType }> = {
      confirmed: { 
        label: 'مؤكد', 
        style: { background: '#d4edda', color: '#3a7d44' },
        icon: CheckCircle
      },
      pending: { 
        label: 'قيد المراجعة', 
        style: { background: '#fff3cd', color: '#856404' },
        icon: AlertCircle
      },
      attended: { 
        label: 'تم الحضور', 
        style: { background: '#cce5ff', color: '#004085' },
        icon: CheckCircle
      },
      cancelled: { 
        label: 'ملغي', 
        style: { background: '#f8d7da', color: '#721c24' },
        icon: XCircle
      }
    }
    
    const config = statusConfig[status] || { label: status, style: { background: '#f0e0e4', color: '#6b5a60' }, icon: AlertCircle }
    const Icon = config.icon
    
    return (
      <Badge className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full" style={config.style}>
        <Icon className="w-3.5 h-3.5" />
        {config.label}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl" style={{ background: '#fdf8f9' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-3 mx-auto" style={{ borderColor: '#e8b4c4', borderTopColor: '#a8556f' }}></div>
          <p className="mt-4" style={{ color: '#6b5a60' }}>جاري التحميل...</p>
        </div>
      </div>
    )
  }

  if (!member && !admin) {
    router.push('/login')
    return null
  }

  // الحصول على التسجيلات من العضو أو مصفوفة فارغة للأدمن
  const registrations = member?.registrations || []

  // تقسيم التسجيلات إلى قادمة وسابقة
  const now = new Date()
  const upcomingRegistrations = registrations.filter(r => new Date(r.event.date) >= now && r.status !== 'cancelled')
  const pastRegistrations = registrations.filter(r => new Date(r.event.date) < now || r.status === 'cancelled')

  // معلومات المستخدم الحالي
  const currentUserName = member?.name || admin?.name || 'المستخدم'
  const currentUserEmail = member?.email || admin?.email || ''

  return (
    <div className="min-h-screen flex flex-col" dir="rtl" style={{ background: 'linear-gradient(180deg, #fdf8f9 0%, #ffffff 50%, #fdf8f9 100%)' }}>
      
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b" style={{ borderColor: 'rgba(240, 224, 228, 0.5)' }}>
        <div className="container">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #a8556f 0%, #9b7b9a 100%)' }}>
                <Crown className="w-6 h-6 text-white relative z-10" />
                <div className="absolute inset-0 bg-white/20"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold" style={{ color: '#2d1f26' }}>ملتقى ريادة</h1>
                <p className="text-xs font-medium" style={{ color: '#6b5a60' }}>تجمع سيدات الأعمال</p>
              </div>
            </Link>
            
            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="hidden md:flex items-center gap-3 px-4 py-2 rounded-full transition-all hover:bg-white/50"
                style={{ background: userMenuOpen ? 'white' : 'transparent' }}
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-md" 
                  style={{ background: 'linear-gradient(135deg, #a8556f 0%, #9b7b9a 100%)' }}>
                  <User className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium" style={{ color: '#2d1f26' }}>{currentUserName}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} style={{ color: '#6b5a60' }} />
              </button>
              
              {userMenuOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border overflow-hidden z-50" style={{ borderColor: '#f0e0e4' }}>
                  <div className="p-4 border-b" style={{ borderColor: '#f0e0e4', background: '#fdf8f9' }}>
                    <p className="font-bold" style={{ color: '#2d1f26' }}>{currentUserName}</p>
                    <p className="text-xs mt-1" style={{ color: '#6b5a60' }}>{currentUserEmail}</p>
                    {member?.companyName && (
                      <p className="text-xs mt-1" style={{ color: '#9a8a90' }}>{member.companyName}</p>
                    )}
                  </div>
                  <div className="p-2">
                    <Link href="/my-registrations" onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all" style={{ background: '#fdf2f4', color: '#a8556f' }}>
                      <ClipboardList className="w-5 h-5" />
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

              {/* Mobile Menu Button */}
              <button className="md:hidden p-2" style={{ color: '#2d1f26' }} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-white/95 backdrop-blur-xl" style={{ borderColor: '#f0e0e4' }}>
            <nav className="container py-6 flex flex-col gap-4">
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium" style={{ color: '#2d1f26' }}>الرئيسية</Link>
              <Link href="/my-registrations" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium" style={{ color: '#a8556f' }}>تسجيلاتي</Link>
              <Link href="/account-settings" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium" style={{ color: '#2d1f26' }}>إعدادات الحساب</Link>
              <button onClick={handleLogout} className="text-sm font-medium text-right" style={{ color: '#c44' }}>تسجيل الخروج</button>
            </nav>
          </div>
        )}
      </header>

      {/* Content */}
      <main className="flex-1 py-12">
        <div className="container max-w-4xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(135deg, #a8556f 0%, #9b7b9a 100%)' }}>
              <ClipboardList className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: '#2d1f26' }}>تسجيلاتي</h1>
              <p className="text-sm mt-1" style={{ color: '#6b5a60' }}>جميع اللقاءات التي سجلتي بها</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <Card className="rounded-2xl border" style={{ borderColor: '#f0e0e4' }}>
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold" style={{ color: '#a8556f' }}>{toEnglishNumbers(registrations.length)}</p>
                <p className="text-xs mt-1" style={{ color: '#6b5a60' }}>إجمالي التسجيلات</p>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border" style={{ borderColor: '#f0e0e4' }}>
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold" style={{ color: '#3a7d44' }}>{toEnglishNumbers(upcomingRegistrations.length)}</p>
                <p className="text-xs mt-1" style={{ color: '#6b5a60' }}>لقاءات قادمة</p>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border" style={{ borderColor: '#f0e0e4' }}>
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold" style={{ color: '#004085' }}>{toEnglishNumbers(registrations.filter(r => r.status === 'attended').length)}</p>
                <p className="text-xs mt-1" style={{ color: '#6b5a60' }}>تم الحضور</p>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Registrations */}
          <section className="mb-10">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: '#2d1f26' }}>
              <Calendar className="w-5 h-5" style={{ color: '#a8556f' }} />
              اللقاءات القادمة
            </h2>
            
            {upcomingRegistrations.length === 0 ? (
              <Card className="rounded-2xl border" style={{ borderColor: '#f0e0e4', background: '#fdf8f9' }}>
                <CardContent className="p-8 text-center">
                  <Calendar className="w-12 h-12 mx-auto mb-3" style={{ color: '#e8b4c4' }} />
                  <p className="font-medium" style={{ color: '#6b5a60' }}>لا توجد لقاءات قادمة مسجل بها</p>
                  <Link href="/#events">
                    <Button className="mt-4 rounded-full" style={{ background: '#a8556f', color: 'white' }}>
                      تصفحي اللقاءات
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {upcomingRegistrations.map(reg => (
                  <Card key={reg.id} className="rounded-2xl border overflow-hidden" style={{ borderColor: '#f0e0e4' }}>
                    <div className="h-1" style={{ background: 'linear-gradient(90deg, #a8556f 0%, #9b7b9a 100%)' }}></div>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            {getStatusBadge(reg.status)}
                          </div>
                          <h3 className="text-lg font-bold mb-3" style={{ color: '#2d1f26' }}>{reg.event.title}</h3>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm" style={{ color: '#6b5a60' }}>
                              <Calendar className="w-4 h-4" style={{ color: '#a8556f' }} />
                              {formatDate(reg.event.date)}
                            </div>
                            {reg.event.startTime && (
                              <div className="flex items-center gap-2 text-sm" style={{ color: '#6b5a60' }}>
                                <Clock className="w-4 h-4" style={{ color: '#a8556f' }} />
                                {reg.event.startTime}
                              </div>
                            )}
                            {reg.event.location && (
                              <div className="flex items-center gap-2 text-sm" style={{ color: '#6b5a60' }}>
                                <MapPin className="w-4 h-4" style={{ color: '#a8556f' }} />
                                {reg.event.location}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* Past Registrations */}
          <section>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: '#2d1f26' }}>
              <Users className="w-5 h-5" style={{ color: '#9a8a90' }} />
              اللقاءات السابقة
            </h2>
            
            {pastRegistrations.length === 0 ? (
              <Card className="rounded-2xl border" style={{ borderColor: '#f0e0e4', background: '#fdf8f9' }}>
                <CardContent className="p-8 text-center">
                  <p className="text-sm" style={{ color: '#9a8a90' }}>لا توجد لقاءات سابقة</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {pastRegistrations.map(reg => (
                  <Card key={reg.id} className="rounded-2xl border opacity-75" style={{ borderColor: '#f0e0e4' }}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            {getStatusBadge(reg.status)}
                          </div>
                          <h3 className="text-lg font-bold mb-2" style={{ color: '#2d1f26' }}>{reg.event.title}</h3>
                          <div className="flex items-center gap-2 text-sm" style={{ color: '#6b5a60' }}>
                            <Calendar className="w-4 h-4" />
                            {formatDate(reg.event.date)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t" style={{ borderColor: '#f0e0e4', background: '#fdf8f9' }}>
        <div className="container text-center">
          <p className="text-sm" style={{ color: '#9a8a90' }}>
            Powered by Yplus
          </p>
        </div>
      </footer>
    </div>
  )
}
