'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  ArrowRight, Crown, UserPlus, Camera, Eye, EyeOff
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// Country codes with flags
const countryCodes = [
  { code: '+966', flag: '🇸🇦', name: 'السعودية' },
  { code: '+971', flag: '🇦🇪', name: 'الإمارات' },
  { code: '+965', flag: '🇰🇼', name: 'الكويت' },
  { code: '+974', flag: '🇶🇦', name: 'قطر' },
  { code: '+973', flag: '🇧🇭', name: 'البحرين' },
  { code: '+968', flag: '🇴🇲', name: 'عُمان' },
  { code: '+20', flag: '🇪🇬', name: 'مصر' },
  { code: '+962', flag: '🇯🇴', name: 'الأردن' },
  { code: '+961', flag: '🇱🇧', name: 'لبنان' },
  { code: '+970', flag: '🇵🇸', name: 'فلسطين' },
  { code: '+1', flag: '🇺🇸', name: 'أمريكا' },
]



export default function SignupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [form, setForm] = useState({
    name: '',
    email: '',
    phoneCode: '+966',
    phone: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    jobTitle: '',
    businessType: '',
    gender: 'female'
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('حجم الصورة يجب أن يكون أقل من 5 ميجابايت')
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // تحويل الأرقام العربية إلى إنجليزية
  const convertArabicToEnglishNumbers = (str: string) => {
    const arabicNumbers = '٠١٢٣٤٥٦٧٨٩'
    const englishNumbers = '0123456789'
    return str.replace(/[٠-٩]/g, (d) => englishNumbers[arabicNumbers.indexOf(d)])
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = convertArabicToEnglishNumbers(e.target.value)
    setForm(prev => ({ ...prev, phone: value.replace(/\D/g, '').slice(0, 9) }))
  }



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!form.name || !form.email || !form.password || !form.companyName || !form.jobTitle || !form.phone) {
      toast.error('يرجى ملء جميع الحقول المطلوبة')
      return
    }

    if (form.phone.length < 9) {
      toast.error('رقم الجوال يجب أن يكون 9 أرقام على الأقل')
      return
    }

    if (form.password !== form.confirmPassword) {
      toast.error('كلمة المرور غير متطابقة')
      return
    }

    if (form.password.length < 6) {
      toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
      return
    }

    setLoading(true)
    
    try {
      const response = await fetch('/api/member/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: `${form.phoneCode}${form.phone}`,
          password: form.password,
          companyName: form.companyName,
          jobTitle: form.jobTitle,
          businessType: form.businessType,
          gender: form.gender,
          imageBase64: imagePreview?.startsWith('data:') ? imagePreview : undefined
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('تم إنشاء الحساب بنجاح!')
        router.push('/')
        router.refresh()
      } else {
        toast.error(data.error || 'حدث خطأ أثناء إنشاء الحساب')
      }
    } catch {
      toast.error('حدث خطأ أثناء إنشاء الحساب')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col" dir="rtl" style={{ background: 'linear-gradient(180deg, #fdf8f9 0%, #ffffff 50%, #fdf8f9 100%)' }}>
      {/* Header with Logo */}
      <header className="sticky top-0 z-50 glass border-b" style={{ borderColor: 'rgba(240, 224, 228, 0.5)' }}>
        <div className="container mx-auto px-6">
          <div className="flex flex-row items-center justify-between h-20 w-full">
            <Link href="/" className="flex flex-row items-center gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ background: 'linear-gradient(135deg, #a8556f 0%, #9b7b9a 100%)' }}>
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <h1 className="text-xl font-bold" style={{ color: '#2d1f26' }}>ملتقى ريادة</h1>
                <p className="text-xs font-medium" style={{ color: '#6b5a60' }}>تجمع سيدات الأعمال</p>
              </div>
            </Link>
            <h2 className="text-2xl font-bold" style={{ color: '#2d1f26' }}>إنشاء حساب جديد</h2>
          </div>
        </div>
      </header>

      {/* Signup Form */}
      <div className="flex-1 flex items-start justify-center py-12">
        <div className="w-full max-w-3xl px-6">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg"
              style={{ background: 'linear-gradient(135deg, #a8556f 0%, #9b7b9a 100%)' }}>
              <UserPlus className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-2" style={{ color: '#2d1f26' }}>إنشاء حساب جديد</h2>
            <p className="text-base" style={{ color: '#6b5a60' }}>انضمي إلى مجتمع سيدات الأعمال</p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-3xl shadow-xl p-8 border" style={{ borderColor: '#f0e0e4' }}>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Image Upload - Optional */}
              <div>
                <Label className="text-base font-semibold" style={{ color: '#2d1f26' }}>الصورة الشخصية (اختياري)</Label>
                <div className="mt-3 flex items-center gap-6">
                  <div 
                    className="w-24 h-24 rounded-2xl border-2 border-dashed flex items-center justify-center cursor-pointer overflow-hidden transition-all hover:border-[#a8556f]"
                    style={{ borderColor: imagePreview ? '#a8556f' : '#f0e0e4', background: imagePreview ? 'transparent' : '#fdf8f9' }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-8 h-8" style={{ color: '#9a8a90' }} />
                    )}
                  </div>
                  <div className="flex-1">
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-full"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Camera className="w-4 h-4" />
                      اختيار صورة
                    </Button>
                    <p className="text-xs mt-2" style={{ color: '#9a8a90' }}>الحد الأقصى 5 ميجابايت</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </div>
              </div>

              {/* Name and Email */}
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <Label className="text-base font-semibold" style={{ color: '#2d1f26' }}>الاسم الكامل *</Label>
                  <Input 
                    value={form.name}
                    onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                    className="input mt-2 h-12"
                    placeholder="أدخلي اسمك الكامل"
                    required
                  />
                </div>
                <div>
                  <Label className="text-base font-semibold" style={{ color: '#2d1f26' }}>البريد الإلكتروني *</Label>
                  <Input 
                    type="email"
                    value={form.email}
                    onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                    className="input mt-2 h-12"
                    placeholder="example@email.com"
                    required
                  />
                </div>
              </div>

              {/* Gender Selection */}
              <div>
                <Label className="text-base font-semibold" style={{ color: '#2d1f26' }}>الجنس *</Label>
                <div className="flex gap-4 mt-3">
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, gender: 'female' }))}
                    className="flex-1 py-4 px-6 rounded-2xl font-medium transition-all flex flex-col items-center justify-center gap-2"
                    style={{ 
                      background: form.gender === 'female' ? 'linear-gradient(135deg, #fdf2f4 0%, #fff 100%)' : '#fafafa',
                      border: form.gender === 'female' ? '2px solid #a8556f' : '1px solid #e5e5e5',
                      color: form.gender === 'female' ? '#a8556f' : '#9a8a90',
                      boxShadow: form.gender === 'female' ? '0 4px 12px rgba(168, 85, 111, 0.15)' : 'none'
                    }}
                  >
                    <span className="text-3xl">👩</span>
                    <span className="text-sm">أنثى</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, gender: 'male' }))}
                    className="flex-1 py-4 px-6 rounded-2xl font-medium transition-all flex flex-col items-center justify-center gap-2"
                    style={{ 
                      background: form.gender === 'male' ? 'linear-gradient(135deg, #fdf2f4 0%, #fff 100%)' : '#fafafa',
                      border: form.gender === 'male' ? '2px solid #a8556f' : '1px solid #e5e5e5',
                      color: form.gender === 'male' ? '#a8556f' : '#9a8a90',
                      boxShadow: form.gender === 'male' ? '0 4px 12px rgba(168, 85, 111, 0.15)' : 'none'
                    }}
                  >
                    <span className="text-3xl">👨</span>
                    <span className="text-sm">ذكر</span>
                  </button>
                </div>
              </div>

              {/* Phone with Country Code on LEFT */}
              <div>
                <Label className="text-base font-semibold" style={{ color: '#2d1f26' }}>رقم الجوال *</Label>
                <div className="flex gap-2 mt-2" style={{ direction: 'ltr' }}>
                  <select 
                    value={form.phoneCode}
                    onChange={e => setForm(prev => ({ ...prev, phoneCode: e.target.value }))}
                    className="h-12 rounded-xl px-3 min-w-[120px] border cursor-pointer"
                    style={{ background: '#ffffff', borderColor: '#f0e0e4' }}
                  >
                    {countryCodes.map(country => (
                      <option key={country.code} value={country.code}>
                        {country.flag} {country.code}
                      </option>
                    ))}
                  </select>
                  <Input 
                    value={form.phone}
                    onChange={handlePhoneChange}
                    className="input h-12 flex-1"
                    placeholder="5xxxxxxxx"
                    maxLength={9}
                    style={{ direction: 'rtl', textAlign: 'right' }}
                  />
                </div>
                <p className="text-xs mt-1" style={{ color: '#9a8a90' }}>أدخلي رقم الجوال بدون صفر البداية</p>
              </div>

              {/* Company and Job Title */}
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <Label className="text-base font-semibold" style={{ color: '#2d1f26' }}>اسم الشركة *</Label>
                  <Input 
                    value={form.companyName}
                    onChange={e => setForm(prev => ({ ...prev, companyName: e.target.value }))}
                    className="input mt-2 h-12"
                    placeholder="اسم الشركة أو المؤسسة"
                    required
                  />
                </div>
                <div>
                  <Label className="text-base font-semibold" style={{ color: '#2d1f26' }}>المسمى الوظيفي *</Label>
                  <Input 
                    value={form.jobTitle}
                    onChange={e => setForm(prev => ({ ...prev, jobTitle: e.target.value }))}
                    className="input mt-2 h-12"
                    placeholder="مثال: مديرة تنفيذية"
                    required
                  />
                </div>
              </div>

              {/* Business Type */}
              <div>
                <Label className="text-base font-semibold" style={{ color: '#2d1f26' }}>نوع النشاط</Label>
                <Input 
                  value={form.businessType}
                  onChange={e => setForm(prev => ({ ...prev, businessType: e.target.value }))}
                  className="input mt-2 h-12"
                  placeholder="مثال: تقنية، تعليم، تجارة، استشارات"
                />
              </div>

              {/* Password */}
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <Label className="text-base font-semibold" style={{ color: '#2d1f26' }}>كلمة المرور *</Label>
                  <div className="relative mt-2">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))}
                      className="input h-12 pr-12"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity"
                      style={{ color: '#6b5a60' }}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <Label className="text-base font-semibold" style={{ color: '#2d1f26' }}>تأكيد كلمة المرور *</Label>
                  <div className="relative mt-2">
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={form.confirmPassword}
                      onChange={e => setForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="input h-12 pr-12"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity"
                      style={{ color: '#6b5a60' }}
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="btn btn-primary w-full md:w-auto md:px-20 py-6 rounded-full text-lg"
                disabled={loading}
              >
                <UserPlus className="w-5 h-5" />
                {loading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب جديد'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm" style={{ color: '#9a8a90' }}>
                لديك حساب بالفعل؟{' '}
                <Link href="/login" className="font-medium hover:underline" style={{ color: '#a8556f' }}>
                  تسجيل الدخول
                </Link>
              </p>
            </div>
          </div>

          {/* Back Link */}
          <div className="text-center mt-8">
            <Link href="/">
              <Button variant="ghost" className="gap-2 rounded-full" style={{ color: '#6b5a60' }}>
                <ArrowRight className="w-4 h-4" />
                العودة للصفحة الرئيسية
              </Button>
            </Link>
          </div>
        </div>
      </div>

    </div>
  )
}
