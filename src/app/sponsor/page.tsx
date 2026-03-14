'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  ArrowRight, Handshake, Banknote, Monitor, Camera, Megaphone, BookOpen, Gift, Crown,
  CheckCircle, Building2, User, Upload, Link as LinkIcon, Instagram, Twitter, Linkedin,
  FileText, X, Settings, LogOut, ChevronDown, ClipboardList
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

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

export default function SponsorPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [uploadedFileName, setUploadedFileName] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const [member, setMember] = useState<Member | null>(null)
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    checkMemberAuth()
    checkAdminAuth()
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
  
  const [form, setForm] = useState({
    companyName: '', contactName: '', email: '', phoneCode: '+966', phone: '', 
    sponsorshipTypes: [] as string[], description: '', amount: '',
    sponsorType: '', logoUrl: '', instagram: '', twitter: '', snapchat: '', tiktok: '', websiteUrl: '', profilePdfUrl: ''
  })

  const countryCodes = [
    { code: '+966', country: 'السعودية', flag: '🇸🇦' },
    { code: '+971', country: 'الإمارات', flag: '🇦🇪' },
    { code: '+965', country: 'الكويت', flag: '🇰🇼' },
    { code: '+974', country: 'قطر', flag: '🇶🇦' },
    { code: '+973', country: 'البحرين', flag: '🇧🇭' },
    { code: '+968', country: 'عُمان', flag: '🇴🇲' },
    { code: '+20', country: 'مصر', flag: '🇪🇬' },
    { code: '+962', country: 'الأردن', flag: '🇯🇴' },
    { code: '+961', country: 'لبنان', flag: '🇱🇧' },
    { code: '+970', country: 'فلسطين', flag: '🇵🇸' },
    { code: '+1', country: 'أمريكا', flag: '🇺🇸' },
    { code: '+1', country: 'كندا', flag: '🇨🇦' },
    { code: '+61', country: 'أستراليا', flag: '🇦🇺' },
    { code: '+86', country: 'الصين', flag: '🇨🇳' },
    { code: '+81', country: 'اليابان', flag: '🇯🇵' },
  ]

  const toggleSponsorshipType = (type: string) => {
    setForm(prev => ({
      ...prev,
      sponsorshipTypes: prev.sponsorshipTypes.includes(type)
        ? prev.sponsorshipTypes.filter(t => t !== type)
        : [...prev.sponsorshipTypes, type],
      amount: type === 'financial' && !prev.sponsorshipTypes.includes(type) ? prev.amount : prev.sponsorshipTypes.includes('financial') && type !== 'financial' ? prev.amount : prev.amount
    }))
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // التحقق من نوع الملف
    if (file.type !== 'application/pdf') {
      toast.error('يُسمح فقط برفع ملفات PDF')
      return
    }

    // التحقق من حجم الملف (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('حجم الملف يجب أن يكون أقل من 10 ميجابايت')
      return
    }

    setUploadingFile(true)
    
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (response.ok && data.url) {
        setForm(prev => ({ ...prev, profilePdfUrl: data.url }))
        setUploadedFileName(file.name)
        toast.success('تم رفع الملف بنجاح')
      } else {
        toast.error(data.error || 'حدث خطأ أثناء رفع الملف')
      }
    } catch {
      toast.error('حدث خطأ أثناء رفع الملف')
    } finally {
      setUploadingFile(false)
    }
  }

  const handleRemoveFile = () => {
    setForm(prev => ({ ...prev, profilePdfUrl: '' }))
    setUploadedFileName('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.sponsorshipTypes.length === 0) {
      toast.error('الرجاء اختيار نوع واحد على الأقل من أنواع الرعاية')
      return
    }
    setLoading(true)
    try {
      const response = await fetch('/api/sponsors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          phone: `${form.phoneCode}${form.phone}`,
          sponsorshipType: form.sponsorshipTypes.join(','),
          socialLinks: [form.instagram, form.twitter, form.snapchat, form.tiktok].filter(Boolean).join(', '),
          profileUrl: form.profilePdfUrl,
          websiteUrl: form.websiteUrl
        })
      })
      if (response.ok) {
        setSubmitted(true)
        toast.success('تم إرسال طلبك بنجاح!')
      } else {
        const error = await response.json()
        toast.error(error.error || 'حدث خطأ')
      }
    } catch { 
      toast.error('حدث خطأ') 
    } finally {
      setLoading(false)
    }
  }

  const sponsorshipTypes = [
    { icon: Banknote, title: 'رعاية مالية', value: 'financial', color: '#a8556f', desc: 'دعم مالي مباشر' },
    { icon: Monitor, title: 'رعاية تقنية', value: 'technical', color: '#a8556f', desc: 'حلول تقنية' },
    { icon: Camera, title: 'رعاية إعلامية', value: 'media', color: '#a8556f', desc: 'تغطية إعلامية' },
    { icon: Megaphone, title: 'رعاية تسويقية', value: 'marketing', color: '#a8556f', desc: 'ترويج وإعلان' },
    { icon: BookOpen, title: 'رعاية معرفية', value: 'knowledge', color: '#a8556f', desc: 'ورش تعليمية' },
    { icon: Gift, title: 'رعاية عينية', value: 'in_kind', color: '#a8556f', desc: 'منتجات وخدمات' },
  ]

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl" style={{ background: 'linear-gradient(180deg, #fdf8f9 0%, #ffffff 50%, #fdf8f9 100%)' }}>
        <div className="text-center p-10">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8" style={{ background: 'linear-gradient(135deg, #a8556f 0%, #9b7b9a 100%)' }}>
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-4" style={{ color: '#2d1f26' }}>تم إرسال طلبك بنجاح!</h1>
          <p className="text-lg mb-8" style={{ color: '#6b5a60' }}>سنتواصل معك قريباً إن شاء الله</p>
          <Link href="/">
            <Button className="btn btn-primary px-10 py-6 rounded-full text-lg">
              العودة للرئيسية
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" dir="rtl" style={{ background: 'linear-gradient(180deg, #fdf8f9 0%, #ffffff 50%, #fdf8f9 100%)' }}>
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b" style={{ borderColor: 'rgba(240, 224, 228, 0.5)' }}>
        <div className="container">
          <div className="flex items-center justify-between h-20">
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
      <main className="container py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg"
              style={{ background: 'linear-gradient(135deg, #c9a066 0%, #b89055 100%)' }}>
              <Handshake className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4" style={{ color: '#2d1f26' }}>طلب رعاية الملتقى</h1>
            <p className="text-lg" style={{ color: '#6b5a60' }}>انضمي إلى شركاء نجاحنا في دعم سيدات الأعمال</p>
          </div>

          {/* Sponsorship Types - Multi Select */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-center mb-2" style={{ color: '#2d1f26' }}>أنواع الرعاية</h2>
            <p className="text-center text-xs mb-4" style={{ color: '#9a8a90' }}>يمكنك اختيار أكثر من نوع</p>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {sponsorshipTypes.map((type, i) => {
                const isSelected = form.sponsorshipTypes.includes(type.value)
                return (
                  <div 
                    key={i} 
                    className={`text-center p-3 rounded-xl cursor-pointer transition-all duration-300 ${
                      isSelected 
                        ? 'shadow-md' 
                        : 'hover:shadow-sm'
                    }`}
                    style={{ 
                      background: isSelected ? '#fdf2f4' : 'white',
                      border: isSelected ? '2px solid #a8556f' : '1px solid #f0e0e4'
                    }}
                    onClick={() => toggleSponsorshipType(type.value)}
                  >
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center mx-auto mb-2"
                      style={{ background: '#fdf2f4' }}>
                      <type.icon className="w-5 h-5" style={{ color: '#a8556f' }} />
                    </div>
                    <h3 className="font-semibold text-xs mb-0.5" style={{ color: '#2d1f26' }}>{type.title}</h3>
                    <p className="text-[10px]" style={{ color: '#9a8a90' }}>{type.desc}</p>
                    {isSelected && (
                      <div className="mt-1">
                        <CheckCircle className="w-4 h-4 mx-auto" style={{ color: '#a8556f' }} />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border" style={{ borderColor: '#f0e0e4' }}>
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Sponsor Type Selection */}
              <div>
                <Label className="text-sm font-semibold mb-2 block" style={{ color: '#2d1f26' }}>نوع الراعي *</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div 
                    className={`p-3 rounded-xl cursor-pointer transition-all duration-300 text-center ${
                      form.sponsorType === 'individual' 
                        ? 'shadow-sm' 
                        : 'hover:shadow-sm'
                    }`}
                    style={{ 
                      background: form.sponsorType === 'individual' ? '#fdf2f4' : 'white',
                      border: form.sponsorType === 'individual' ? '2px solid #a8556f' : '1px solid #f0e0e4'
                    }}
                    onClick={() => setForm(prev => ({ ...prev, sponsorType: 'individual' }))}
                  >
                    <User className="w-6 h-6 mx-auto mb-1" style={{ color: form.sponsorType === 'individual' ? '#a8556f' : '#9a8a90' }} />
                    <span className="font-medium text-sm" style={{ color: '#2d1f26' }}>فرد</span>
                  </div>
                  <div 
                    className={`p-3 rounded-xl cursor-pointer transition-all duration-300 text-center ${
                      form.sponsorType === 'company' 
                        ? 'shadow-sm' 
                        : 'hover:shadow-sm'
                    }`}
                    style={{ 
                      background: form.sponsorType === 'company' ? '#fdf2f4' : 'white',
                      border: form.sponsorType === 'company' ? '2px solid #a8556f' : '1px solid #f0e0e4'
                    }}
                    onClick={() => setForm(prev => ({ ...prev, sponsorType: 'company' }))}
                  >
                    <Building2 className="w-6 h-6 mx-auto mb-1" style={{ color: form.sponsorType === 'company' ? '#a8556f' : '#9a8a90' }} />
                    <span className="font-medium text-sm" style={{ color: '#2d1f26' }}>شركة</span>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-base font-semibold" style={{ color: '#2d1f26' }}>
                    {form.sponsorType === 'company' ? 'اسم الشركة *' : 'الاسم *'}
                  </Label>
                  <Input 
                    value={form.companyName} 
                    onChange={e => setForm(prev => ({ ...prev, companyName: e.target.value }))} 
                    required 
                    className="input mt-2 h-12" 
                    placeholder={form.sponsorType === 'company' ? 'أدخلي اسم الشركة' : 'أدخلي اسمك'}
                  />
                </div>
                <div>
                  <Label className="text-base font-semibold" style={{ color: '#2d1f26' }}>اسم المسؤول *</Label>
                  <Input 
                    value={form.contactName} 
                    onChange={e => setForm(prev => ({ ...prev, contactName: e.target.value }))} 
                    required 
                    className="input mt-2 h-12"
                    placeholder="أدخلي اسم المسؤول"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-base font-semibold" style={{ color: '#2d1f26' }}>البريد الإلكتروني *</Label>
                  <Input 
                    type="email" 
                    value={form.email} 
                    onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))} 
                    required 
                    className="input mt-2 h-12"
                    placeholder="example@company.com"
                  />
                </div>
                <div>
                  <Label className="text-base font-semibold" style={{ color: '#2d1f26' }}>رقم الجوال *</Label>
                  <div className="flex gap-2 mt-2">
                    <Input 
                      value={form.phone} 
                      onChange={e => setForm(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '').slice(0, 9) }))} 
                      required 
                      className="input h-12 flex-1"
                      placeholder="5xxxxxxxx"
                      maxLength={9}
                    />
                    <Select value={form.phoneCode} onValueChange={value => setForm(prev => ({ ...prev, phoneCode: value }))}>
                      <SelectTrigger className="h-12 rounded-xl min-w-[120px]" style={{ background: '#ffffff', border: '1px solid #f0e0e4' }}>
                        <SelectValue placeholder="+966" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {countryCodes.map((c, index) => (
                          <SelectItem key={`${c.code}-${c.country}`} value={c.code} className="rounded-lg">
                            <span className="flex items-center gap-2">
                              <span>{c.flag}</span>
                              <span>{c.code}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-xs mt-1" style={{ color: '#9a8a90' }}>أدخلي رقم الجوال بدون صفر البداية</p>
                </div>
              </div>

              {/* Company Specific Fields */}
              {form.sponsorType === 'company' && (
                <div className="space-y-6 p-6 rounded-2xl" style={{ background: '#fdf8f9', border: '1px solid #f0e0e4' }}>
                  <h3 className="font-bold text-lg flex items-center gap-2" style={{ color: '#2d1f26' }}>
                    <Building2 className="w-5 h-5" style={{ color: '#a8556f' }} />
                    معلومات إضافية للشركة
                  </h3>
                  
                  <div>
                    <Label className="text-base font-semibold" style={{ color: '#2d1f26' }}>شعار الشركة</Label>
                    <div className="mt-2">
                      <Input 
                        type="url"
                        value={form.logoUrl} 
                        onChange={e => setForm(prev => ({ ...prev, logoUrl: e.target.value }))} 
                        className="input h-12"
                        placeholder="رابط صورة الشعار (URL)"
                      />
                      <p className="text-xs mt-2 flex items-center gap-1" style={{ color: '#a8556f' }}>
                        <span>⚠️</span>
                        يرجى رفع شعار بخلفية شفافة (PNG أو SVG)
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-base font-semibold mb-3 block" style={{ color: '#2d1f26' }}>حسابات التواصل الاجتماعي</Label>
                    <div className="space-y-3">
                      {/* Instagram */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' }}>
                          <Instagram className="w-5 h-5 text-white" />
                        </div>
                        <Input 
                          value={form.instagram} 
                          onChange={e => setForm(prev => ({ ...prev, instagram: e.target.value }))} 
                          className="input h-12"
                          placeholder="@username"
                        />
                      </div>
                      
                      {/* Twitter/X */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#000000' }}>
                          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="white"/>
                          </svg>
                        </div>
                        <Input 
                          value={form.twitter} 
                          onChange={e => setForm(prev => ({ ...prev, twitter: e.target.value }))} 
                          className="input h-12"
                          placeholder="@username"
                        />
                      </div>
                      
                      {/* Snapchat */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-yellow-300">
                          <img src="/snapchat-logo.png" alt="Snapchat" className="w-7 h-7 object-contain" />
                        </div>
                        <Input 
                          value={form.snapchat} 
                          onChange={e => setForm(prev => ({ ...prev, snapchat: e.target.value }))} 
                          className="input h-12"
                          placeholder="@username"
                        />
                      </div>
                      
                      {/* TikTok */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#000000' }}>
                          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
                            <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" fill="#fff"/>
                          </svg>
                        </div>
                        <Input 
                          value={form.tiktok} 
                          onChange={e => setForm(prev => ({ ...prev, tiktok: e.target.value }))} 
                          className="input h-12"
                          placeholder="@username"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-base font-semibold" style={{ color: '#2d1f26' }}>الموقع الإلكتروني</Label>
                      <div className="mt-2">
                        <Input 
                          type="url"
                          value={form.websiteUrl} 
                          onChange={e => setForm(prev => ({ ...prev, websiteUrl: e.target.value }))} 
                          className="input h-12"
                          placeholder="https://company-website.com"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-base font-semibold" style={{ color: '#2d1f26' }}>بروفايل الشركة (PDF)</Label>
                      <div className="mt-2">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf"
                          onChange={handleFileUpload}
                          className="hidden"
                          id="profile-upload"
                        />
                        
                        {!form.profilePdfUrl ? (
                          <label 
                            htmlFor="profile-upload"
                            className={`flex items-center justify-center gap-3 h-12 px-4 rounded-xl cursor-pointer transition-all border-2 border-dashed ${
                              uploadingFile ? 'opacity-50 cursor-wait' : 'hover:border-pink-400 hover:bg-pink-50'
                            }`}
                            style={{ borderColor: '#f0e0e4' }}
                          >
                            {uploadingFile ? (
                              <>
                                <div className="w-5 h-5 border-2 border-pink-400 border-t-transparent rounded-full animate-spin"></div>
                                <span style={{ color: '#6b5a60' }}>جاري الرفع...</span>
                              </>
                            ) : (
                              <>
                                <Upload className="w-5 h-5" style={{ color: '#a8556f' }} />
                                <span style={{ color: '#6b5a60' }}>ارفعي ملف البروفايل</span>
                              </>
                            )}
                          </label>
                        ) : (
                          <div className="flex items-center justify-between h-12 px-4 rounded-xl bg-green-50 border border-green-200">
                            <div className="flex items-center gap-3">
                              <FileText className="w-5 h-5 text-green-600" />
                              <span className="text-sm text-green-700 truncate max-w-[150px]">{uploadedFileName || 'ملف البروفايل'}</span>
                            </div>
                            <button 
                              type="button"
                              onClick={handleRemoveFile}
                              className="p-1 rounded-full hover:bg-green-100 transition-colors"
                            >
                              <X className="w-4 h-4 text-green-600" />
                            </button>
                          </div>
                        )}
                        
                        <p className="text-xs mt-1" style={{ color: '#9a8a90' }}>أرفعي ملف PDF يحتوي على معلومات الشركة (الحد الأقصى 10MB)</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Financial Amount - Only show if financial is selected */}
              {form.sponsorshipTypes.includes('financial') && (
                <div>
                  <Label className="text-base font-semibold" style={{ color: '#2d1f26' }}>القيمة المالية</Label>
                  <Input 
                    type="number" 
                    value={form.amount} 
                    onChange={e => setForm(prev => ({ ...prev, amount: e.target.value }))} 
                    placeholder="بالريال السعودي" 
                    className="input mt-2 h-12" 
                  />
                </div>
              )}

              <div>
                <Label className="text-base font-semibold" style={{ color: '#2d1f26' }}>وصف الرعاية</Label>
                <Textarea 
                  value={form.description} 
                  onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} 
                  rows={4} 
                  className="input mt-2 resize-none"
                  placeholder="أدخلي تفاصيل الرعاية المقدمة..."
                />
              </div>

              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="btn btn-accent w-full py-7 rounded-full text-lg"
                  disabled={loading}
                >
                  {loading ? 'جاري الإرسال...' : 'إرسال الطلب'}
                  <Handshake className="w-5 h-5" />
                </Button>
              </div>
            </form>
          </div>

          {/* Contact Info */}
          <div className="mt-12 text-center">
            <p className="text-base mb-4" style={{ color: '#6b5a60' }}>للاستفسارات، تواصلي معنا:</p>
            <p className="font-semibold" style={{ color: '#a8556f' }}>info@riyada-women.com</p>
          </div>
        </div>
      </main>
    </div>
  )
}
