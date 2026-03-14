'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Crown, User, Settings, LogOut, ChevronDown, Menu, X, Save,
  ClipboardList, Building2, Briefcase, Heart, Mail, Phone
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface Member {
  id: string
  name: string
  email: string
  phone: string | null
  companyName: string | null
  jobTitle: string | null
  interests: string | null
}

interface Admin {
  id: string
  name: string | null
  email: string
  role: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [member, setMember] = useState<Member | null>(null)
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  
  const [form, setForm] = useState({
    name: '',
    phone: '',
    companyName: '',
    jobTitle: '',
    interests: ''
  })

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
        setForm({
          name: data.member.name || '',
          phone: data.member.phone || '',
          companyName: data.member.companyName || '',
          jobTitle: data.member.jobTitle || '',
          interests: data.member.interests || ''
        })
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      const response = await fetch('/api/member/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      
      if (response.ok) {
        toast.success('تم حفظ التغييرات بنجاح')
        fetchMemberData()
      } else {
        toast.error('حدث خطأ أثناء الحفظ')
      }
    } catch {
      toast.error('حدث خطأ')
    } finally {
      setSaving(false)
    }
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
                  </div>
                  <div className="p-2">
                    <Link href="/my-registrations" onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-gray-50" style={{ color: '#2d1f26' }}>
                      <ClipboardList className="w-5 h-5" style={{ color: '#a8556f' }} />
                      <span className="text-sm font-medium">تسجيلاتي</span>
                    </Link>
                    <Link href="/profile" onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all" style={{ background: '#fdf2f4', color: '#a8556f' }}>
                      <Settings className="w-5 h-5" />
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
              <Link href="/my-registrations" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium" style={{ color: '#2d1f26' }}>تسجيلاتي</Link>
              <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium" style={{ color: '#a8556f' }}>الملف الشخصي</Link>
              <button onClick={handleLogout} className="text-sm font-medium text-right" style={{ color: '#c44' }}>تسجيل الخروج</button>
            </nav>
          </div>
        )}
      </header>

      {/* Content */}
      <main className="flex-1 py-12">
        <div className="container max-w-2xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(135deg, #a8556f 0%, #9b7b9a 100%)' }}>
              <User className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: '#2d1f26' }}>الملف الشخصي</h1>
              <p className="text-sm mt-1" style={{ color: '#6b5a60' }}>إدارة معلومات حسابك</p>
            </div>
          </div>

          {admin && !member ? (
            <Card className="rounded-2xl border" style={{ borderColor: '#f0e0e4' }}>
              <CardContent className="p-8 text-center">
                <p className="font-medium mb-4" style={{ color: '#6b5a60' }}>أنت مسجل كمشرف</p>
                <Link href="/admin">
                  <Button className="rounded-full" style={{ background: '#a8556f', color: 'white' }}>
                    الذهاب للوحة التحكم
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <Card className="rounded-2xl border" style={{ borderColor: '#f0e0e4' }}>
              <CardHeader className="border-b" style={{ borderColor: '#f0e0e4' }}>
                <CardTitle className="text-lg" style={{ color: '#2d1f26' }}>معلوماتك الشخصية</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm font-semibold flex items-center gap-2" style={{ color: '#2d1f26' }}>
                        <User className="w-4 h-4" style={{ color: '#a8556f' }} />
                        الاسم الكامل
                      </Label>
                      <Input 
                        value={form.name}
                        onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                        className="input mt-2 h-12"
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-semibold flex items-center gap-2" style={{ color: '#2d1f26' }}>
                        <Phone className="w-4 h-4" style={{ color: '#a8556f' }} />
                        رقم الجوال
                      </Label>
                      <Input 
                        value={form.phone}
                        onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))}
                        className="input mt-2 h-12"
                        placeholder="05xxxxxxxx"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-semibold flex items-center gap-2" style={{ color: '#2d1f26' }}>
                      <Mail className="w-4 h-4" style={{ color: '#a8556f' }} />
                      البريد الإلكتروني
                    </Label>
                    <Input 
                      value={member?.email || ''}
                      disabled
                      className="input mt-2 h-12 bg-gray-50"
                    />
                    <p className="text-xs mt-1" style={{ color: '#9a8a90' }}>لا يمكن تغيير البريد الإلكتروني</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm font-semibold flex items-center gap-2" style={{ color: '#2d1f26' }}>
                        <Building2 className="w-4 h-4" style={{ color: '#a8556f' }} />
                        اسم الشركة / المؤسسة
                      </Label>
                      <Input 
                        value={form.companyName}
                        onChange={e => setForm(prev => ({ ...prev, companyName: e.target.value }))}
                        className="input mt-2 h-12"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-semibold flex items-center gap-2" style={{ color: '#2d1f26' }}>
                        <Briefcase className="w-4 h-4" style={{ color: '#a8556f' }} />
                        المسمى الوظيفي
                      </Label>
                      <Input 
                        value={form.jobTitle}
                        onChange={e => setForm(prev => ({ ...prev, jobTitle: e.target.value }))}
                        className="input mt-2 h-12"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-semibold flex items-center gap-2" style={{ color: '#2d1f26' }}>
                      <Heart className="w-4 h-4" style={{ color: '#a8556f' }} />
                      الاهتمامات
                    </Label>
                    <Input 
                      value={form.interests}
                      onChange={e => setForm(prev => ({ ...prev, interests: e.target.value }))}
                      className="input mt-2 h-12"
                      placeholder="مثال: التقنية، ريادة الأعمال، التسويق"
                    />
                  </div>

                  <div className="pt-4">
                    <Button 
                      type="submit" 
                      className="btn btn-primary w-full py-7 rounded-full text-lg"
                      disabled={saving}
                    >
                      {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                      <Save className="w-5 h-5" />
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
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
