'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Crown, User, Settings, LogOut, ChevronDown, Menu, X,
  Mail, Phone, Building2, Briefcase, Heart, Sparkles, Save
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
  expectations: string | null
}

export default function AccountSettingsPage() {
  const router = useRouter()
  const [member, setMember] = useState<Member | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    companyName: '',
    jobTitle: '',
    interests: '',
    expectations: ''
  })

  useEffect(() => {
    fetchMemberData()
  }, [])

  const fetchMemberData = async () => {
    try {
      const response = await fetch('/api/member/me')
      const data = await response.json()
      if (data.member) {
        setMember(data.member)
        setForm({
          name: data.member.name || '',
          email: data.member.email || '',
          phone: data.member.phone || '',
          companyName: data.member.companyName || '',
          jobTitle: data.member.jobTitle || '',
          interests: data.member.interests || '',
          expectations: data.member.expectations || ''
        })
      } else {
        router.push('/login')
      }
    } catch {
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/member/logout', { method: 'POST' })
      router.push('/')
    } catch {
      console.error('Error logging out')
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const response = await fetch('/api/member/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      
      if (response.ok) {
        toast.success('تم حفظ التغييرات بنجاح')
        fetchMemberData()
      } else {
        const error = await response.json()
        toast.error(error.error || 'حدث خطأ أثناء الحفظ')
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

  if (!member) {
    return null
  }

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
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="hidden md:flex items-center gap-3 px-4 py-2 rounded-full transition-all hover:bg-white/50"
                style={{ background: userMenuOpen ? 'white' : 'transparent' }}
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-md" 
                  style={{ background: 'linear-gradient(135deg, #a8556f 0%, #9b7b9a 100%)' }}>
                  <User className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium" style={{ color: '#2d1f26' }}>{member.name}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} style={{ color: '#6b5a60' }} />
              </button>
              
              {userMenuOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border overflow-hidden z-50" style={{ borderColor: '#f0e0e4' }}>
                  <div className="p-4 border-b" style={{ borderColor: '#f0e0e4', background: '#fdf8f9' }}>
                    <p className="font-bold" style={{ color: '#2d1f26' }}>{member.name}</p>
                    <p className="text-xs mt-1" style={{ color: '#6b5a60' }}>{member.email}</p>
                    {member.companyName && (
                      <p className="text-xs mt-1" style={{ color: '#9a8a90' }}>{member.companyName}</p>
                    )}
                  </div>
                  <div className="p-2">
                    <Link href="/my-registrations" onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-gray-50" style={{ color: '#2d1f26' }}>
                      <Mail className="w-5 h-5" style={{ color: '#a8556f' }} />
                      <span className="text-sm font-medium">تسجيلاتي</span>
                    </Link>
                    <Link href="/account-settings" onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all" style={{ background: '#fdf2f4', color: '#a8556f' }}>
                      <Settings className="w-5 h-5" />
                      <span className="text-sm font-medium">إعدادات الحساب</span>
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
              <Link href="/account-settings" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium" style={{ color: '#a8556f' }}>إعدادات الحساب</Link>
              <button onClick={handleLogout} className="text-sm font-medium text-right" style={{ color: '#c44' }}>تسجيل الخروج</button>
            </nav>
          </div>
        )}
      </header>

      {/* Content */}
      <main className="flex-1 py-12">
        <div className="container max-w-3xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(135deg, #a8556f 0%, #9b7b9a 100%)' }}>
              <Settings className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: '#2d1f26' }}>إعدادات الحساب</h1>
              <p className="text-sm mt-1" style={{ color: '#6b5a60' }}>تعديل بياناتك الشخصية</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            {/* Personal Information */}
            <Card className="rounded-2xl border" style={{ borderColor: '#f0e0e4' }}>
              <CardHeader className="border-b" style={{ borderColor: '#f0e0e4', background: '#fdf8f9' }}>
                <CardTitle className="text-lg flex items-center gap-2" style={{ color: '#2d1f26' }}>
                  <User className="w-5 h-5" style={{ color: '#a8556f' }} />
                  المعلومات الشخصية
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <Label className="text-sm font-semibold flex items-center gap-2" style={{ color: '#2d1f26' }}>
                      <User className="w-4 h-4" style={{ color: '#a8556f' }} />
                      الاسم الكامل
                    </Label>
                    <Input 
                      value={form.name}
                      onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                      className="input mt-2 h-12"
                      placeholder="الاسم الكامل"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold flex items-center gap-2" style={{ color: '#2d1f26' }}>
                      <Mail className="w-4 h-4" style={{ color: '#a8556f' }} />
                      البريد الإلكتروني
                    </Label>
                    <Input 
                      type="email"
                      value={form.email}
                      onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                      className="input mt-2 h-12"
                      placeholder="البريد الإلكتروني"
                      dir="ltr"
                    />
                  </div>
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
                    dir="ltr"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Work Information */}
            <Card className="rounded-2xl border" style={{ borderColor: '#f0e0e4' }}>
              <CardHeader className="border-b" style={{ borderColor: '#f0e0e4', background: '#fdf8f9' }}>
                <CardTitle className="text-lg flex items-center gap-2" style={{ color: '#2d1f26' }}>
                  <Building2 className="w-5 h-5" style={{ color: '#a8556f' }} />
                  معلومات العمل
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <Label className="text-sm font-semibold flex items-center gap-2" style={{ color: '#2d1f26' }}>
                      <Building2 className="w-4 h-4" style={{ color: '#a8556f' }} />
                      اسم الشركة / المنشأة
                    </Label>
                    <Input 
                      value={form.companyName}
                      onChange={e => setForm(prev => ({ ...prev, companyName: e.target.value }))}
                      className="input mt-2 h-12"
                      placeholder="اسم الشركة أو المنشأة"
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
                      placeholder="المسمى الوظيفي"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Interests & Expectations */}
            <Card className="rounded-2xl border" style={{ borderColor: '#f0e0e4' }}>
              <CardHeader className="border-b" style={{ borderColor: '#f0e0e4', background: '#fdf8f9' }}>
                <CardTitle className="text-lg flex items-center gap-2" style={{ color: '#2d1f26' }}>
                  <Heart className="w-5 h-5" style={{ color: '#a8556f' }} />
                  الاهتمامات والتوقعات
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div>
                  <Label className="text-sm font-semibold flex items-center gap-2" style={{ color: '#2d1f26' }}>
                    <Heart className="w-4 h-4" style={{ color: '#a8556f' }} />
                    مجالات الاهتمام
                  </Label>
                  <Textarea 
                    value={form.interests}
                    onChange={e => setForm(prev => ({ ...prev, interests: e.target.value }))}
                    className="input mt-2 resize-none"
                    rows={3}
                    placeholder="مجالات الاهتمام (مثل: ريادة الأعمال، التقنية، التسويق...)"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold flex items-center gap-2" style={{ color: '#2d1f26' }}>
                    <Sparkles className="w-4 h-4" style={{ color: '#a8556f' }} />
                    التوقعات من الملتقى
                  </Label>
                  <Textarea 
                    value={form.expectations}
                    onChange={e => setForm(prev => ({ ...prev, expectations: e.target.value }))}
                    className="input mt-2 resize-none"
                    rows={3}
                    placeholder="ماذا تتوقعين من الملتقى؟"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex gap-4">
              <Button 
                type="submit" 
                className="btn btn-primary px-10 py-6 rounded-full text-lg flex-1"
                disabled={saving}
              >
                {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                <Save className="w-5 h-5" />
              </Button>
              <Link href="/my-registrations" className="flex-1">
                <Button 
                  type="button"
                  variant="outline"
                  className="w-full py-6 rounded-full text-lg"
                  style={{ borderColor: '#f0e0e4', color: '#6b5a60' }}
                >
                  إلغاء
                </Button>
              </Link>
            </div>
          </form>
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
