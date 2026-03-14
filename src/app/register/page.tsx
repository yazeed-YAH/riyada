'use client'

import { useState, useEffect, useMemo, Suspense, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  ArrowRight, Calendar, Users, Crown, CheckCircle, Camera, Sparkles, Eye, AlertCircle
} from 'lucide-react'
import { toast, Toaster } from 'sonner'
import Link from 'next/link'
import { toEnglishNumbers } from '@/lib/utils'

interface Event {
  id: string
  title: string
  date: string
  location: string | null
  capacity: number
  status: string
  startTime: string | null
  registrationDeadline: string | null
  showRegistrantCount: boolean
  isPublished: boolean
  _count?: { registrations: number }
}

interface Member {
  id: string
  name: string
  email: string
  phone: string | null
  companyName: string | null
  jobTitle: string | null
  imageUrl: string | null
  gender: string | null
}

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

// Sponsorship types
const sponsorshipTypes = [
  { id: 'financial', name: 'رعاية مالية' },
  { id: 'technical', name: 'رعاية تقنية' },
  { id: 'media', name: 'رعاية إعلامية' },
  { id: 'marketing', name: 'رعاية تسويقية' },
  { id: 'knowledge', name: 'رعاية معرفية' },
  { id: 'in_kind', name: 'رعاية عينية' },
]

// Preview Banner Component
function PreviewBanner() {
  const searchParams = useSearchParams()
  const isPreview = searchParams.get('preview') === 'true'
  const previewEventId = searchParams.get('event')
  const [previewEvent, setPreviewEvent] = useState<Event | null>(null)

  useEffect(() => {
    if (isPreview && previewEventId) {
      fetch(`/api/events?id=${previewEventId}&preview=true`)
        .then(res => res.json())
        .then(data => {
          if (data.event) {
            setPreviewEvent(data.event)
          }
        })
        .catch(console.error)
    }
  }, [isPreview, previewEventId])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    return toEnglishNumbers(date.toLocaleDateString('ar-SA', options))
  }

  if (!isPreview) return null

  return (
    <>
      {/* Preview Mode Banner */}
      <div className="mb-6 p-4 rounded-2xl border-2 flex items-center gap-3" style={{ background: 'linear-gradient(135deg, #fff3cd 0%, #ffe69c 100%)', borderColor: '#f0ad4e' }}>
        <AlertCircle className="w-6 h-6 flex-shrink-0" style={{ color: '#856404' }} />
        <div>
          <p className="font-bold text-lg" style={{ color: '#856404' }}>⚠️ هذه صفحة معاينة</p>
          <p className="text-sm" style={{ color: '#6b5a60' }}>الصفحة الحالية غير منشورة. هذا العرض للمعاينة فقط ولا يمكن التسجيل منه.</p>
        </div>
      </div>

      {/* Preview Event Info */}
      {previewEvent && (
        <div className="mb-10 p-6 rounded-3xl border-2" style={{ background: 'linear-gradient(135deg, #fdf2f4 0%, #fff 100%)', borderColor: '#a8556f' }}>
          <div className="flex items-center gap-2 mb-4">
            <span className="px-4 py-1 rounded-full text-sm font-bold text-white flex items-center gap-1" style={{ background: '#f0ad4e' }}>
              <Eye className="w-4 h-4" />
              معاينة اللقاء
            </span>
            {!previewEvent.isPublished && (
              <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: '#fce8e8', color: '#dc2626' }}>غير منشور</span>
            )}
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#2d1f26' }}>{previewEvent.title}</h2>
          <p className="text-sm mb-4" style={{ color: '#6b5a60' }}>{formatDate(previewEvent.date)}</p>
          
          {previewEvent.location && (
            <a 
              href={`https://www.google.com/maps/search/${encodeURIComponent(previewEvent.location + ' الرياض السعودية')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium mb-4 hover:underline"
              style={{ color: '#a8556f' }}
            >
              📍 {previewEvent.location}
            </a>
          )}
        </div>
      )}
    </>
  )
}

function RegisterForm() {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [events, setEvents] = useState<Event[]>([])
  const [loadingEvents, setLoadingEvents] = useState(true)
  const [member, setMember] = useState<Member | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isPreview = searchParams.get('preview') === 'true'
  const previewEventId = searchParams.get('event')
  
  const [form, setForm] = useState({
    name: '', 
    email: '', 
    phoneCode: '+966', 
    phone: '', 
    companyName: '', 
    jobTitle: '', 
    eventId: '', 
    interests: '', 
    expectations: '',
    gender: 'female',
    wantsSponsorship: false,
    selectedSponsorshipTypes: [] as string[]
  })

  useEffect(() => {
    if (isPreview && previewEventId) {
      fetchPreviewEvent()
    } else {
      fetchEvents()
    }
    checkMemberAuth()
  }, [isPreview, previewEventId])

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = toEnglishNumbers(e.target.value)
    setForm(prev => ({ ...prev, phone: value.replace(/\D/g, '').slice(0, 9) }))
  }

  const checkMemberAuth = async () => {
    try {
      const response = await fetch('/api/member/me')
      const data = await response.json()
      if (data.member) {
        setMember(data.member)
        // ملء البيانات تلقائياً من حساب العضو
        const phoneMatch = data.member.phone?.match(/^(\+\d+)(.+)$/)
        setForm(prev => ({
          ...prev,
          name: data.member.name || '',
          email: data.member.email || '',
          phoneCode: phoneMatch ? phoneMatch[1] : '+966',
          phone: phoneMatch ? phoneMatch[2] : (data.member.phone?.replace(/\D/g, '').slice(-9) || ''),
          companyName: data.member.companyName || '',
          jobTitle: data.member.jobTitle || '',
          gender: data.member.gender || 'female',
        }))
        if (data.member.imageUrl) {
          setImagePreview(data.member.imageUrl)
        }
      }
    } catch {
      setMember(null)
    }
  }

  const fetchPreviewEvent = async () => {
    try {
      const response = await fetch(`/api/events?id=${previewEventId}&preview=true`)
      const data = await response.json()
      if (data.event) {
        setForm(prev => ({ ...prev, eventId: data.event.id }))
      } else {
        toast.error('الحدث غير موجود')
      }
    } catch (error) {
      console.error('Error fetching preview event:', error)
      toast.error('حدث خطأ في جلب بيانات اللقاء')
    } finally {
      setLoadingEvents(false)
    }
  }

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events')
      const data = await response.json()
      const upcomingEvents = (data.events || []).filter((e: Event) => 
        new Date(e.date) >= new Date() && e.status !== 'cancelled'
      )
      setEvents(upcomingEvents)
      
      // التحقق من وجود معرف اللقاء في الـ URL
      const eventIdFromUrl = searchParams.get('event')
      if (eventIdFromUrl) {
        const eventExists = upcomingEvents.find((e: Event) => e.id === eventIdFromUrl)
        if (eventExists) {
          setForm(prev => ({ ...prev, eventId: eventIdFromUrl }))
          setLoadingEvents(false)
          return
        }
      }
      
      // إذا لم يوجد في الـ URL، اختر اللقاء المفتوح الوحيد تلقائياً
      const openEvents = upcomingEvents.filter((e: Event) => e.status === 'open')
      if (openEvents.length === 1) {
        setForm(prev => ({ ...prev, eventId: openEvents[0].id }))
      }
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoadingEvents(false)
    }
  }

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

  const handleSponsorshipTypeToggle = (typeId: string) => {
    setForm(prev => ({
      ...prev,
      selectedSponsorshipTypes: prev.selectedSponsorshipTypes.includes(typeId)
        ? prev.selectedSponsorshipTypes.filter(t => t !== typeId)
        : [...prev.selectedSponsorshipTypes, typeId]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // منع الإرسال في وضع المعاينة
    if (isPreview) {
      toast.info('هذه صفحة معاينة فقط ولا يمكن التسجيل منها')
      return
    }
    
    if (!form.eventId) {
      toast.error('الرجاء اختيار اللقاء')
      return
    }
    setLoading(true)
    try {
      const response = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          memberId: member?.id,
          phone: `${form.phoneCode}${form.phone}`,
          imageBase64: imagePreview?.startsWith('data:') ? imagePreview : undefined,
          wantsSponsorship: form.wantsSponsorship,
          sponsorshipTypes: form.selectedSponsorshipTypes.join(',')
        })
      })
      if (response.ok) {
        setSubmitted(true)
        toast.success('تم التسجيل بنجاح!')
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    return date.toLocaleDateString('en-US', options)
  }

  // Get the first open event
  const featuredEvent = useMemo(() => events.find(e => e.status === 'open'), [events])
  
  // Check if there's only one open event
  const hasSingleOpenEvent = useMemo(() => {
    const openEvents = events.filter(e => e.status === 'open')
    return openEvents.length === 1
  }, [events])

  // Countdown timer for registration deadline
  const [countdown, setCountdown] = useState<{days: number, hours: number, minutes: number, seconds: number} | null>(null)

  useEffect(() => {
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
  }, [featuredEvent])

  // Get selected country info
  const selectedCountry = countryCodes.find(c => c.code === form.phoneCode) || countryCodes[0]

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl" style={{ background: 'linear-gradient(180deg, #fdf8f9 0%, #ffffff 50%, #fdf8f9 100%)' }}>
        <div className="text-center p-10">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8" style={{ background: 'linear-gradient(135deg, #a8556f 0%, #9b7b9a 100%)' }}>
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-4" style={{ color: '#2d1f26' }}>تم التسجيل بنجاح!</h1>
          <p className="text-lg mb-8" style={{ color: '#6b5a60' }}>نتطلع للقائك في الملتقى</p>
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
    <>
      {/* Featured Open Event with Countdown */}
      {!isPreview && featuredEvent && (
        <div className="mb-10 p-6 rounded-3xl border-2" style={{ background: 'linear-gradient(135deg, #fdf2f4 0%, #fff 100%)', borderColor: '#a8556f' }}>
          <div className="flex items-center gap-2 mb-4">
            <span className="px-4 py-1 rounded-full text-sm font-bold text-white" style={{ background: '#a8556f' }}>اللقاء المفتوح للتسجيل</span>
            {hasSingleOpenEvent && (
              <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: '#e0f0e4', color: '#2d6b3d' }}>تم اختياره تلقائياً</span>
            )}
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#2d1f26' }}>{featuredEvent.title}</h2>
          <p className="text-sm mb-4" style={{ color: '#6b5a60' }}>{formatDate(featuredEvent.date)}</p>
          
          {featuredEvent.location && (
            <a 
              href={`https://www.google.com/maps/search/${encodeURIComponent(featuredEvent.location + ' الرياض السعودية')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium mb-4 hover:underline"
              style={{ color: '#a8556f' }}
            >
              📍 {featuredEvent.location}
            </a>
          )}
          
          {featuredEvent.registrationDeadline && countdown && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-3" style={{ color: '#6b5a60' }}>الوقت المتبقي للتسجيل:</p>
              <div className="flex gap-3 justify-center">
                <div className="text-center px-4 py-3 rounded-xl" style={{ background: 'white' }}>
                  <div className="text-2xl font-bold" style={{ color: '#a8556f' }}>{toEnglishNumbers(countdown.days)}</div>
                  <div className="text-xs" style={{ color: '#9a8a90' }}>يوم</div>
                </div>
                <div className="text-center px-4 py-3 rounded-xl" style={{ background: 'white' }}>
                  <div className="text-2xl font-bold" style={{ color: '#a8556f' }}>{toEnglishNumbers(countdown.hours)}</div>
                  <div className="text-xs" style={{ color: '#9a8a90' }}>ساعة</div>
                </div>
                <div className="text-center px-4 py-3 rounded-xl" style={{ background: 'white' }}>
                  <div className="text-2xl font-bold" style={{ color: '#a8556f' }}>{toEnglishNumbers(countdown.minutes)}</div>
                  <div className="text-xs" style={{ color: '#9a8a90' }}>دقيقة</div>
                </div>
                <div className="text-center px-4 py-3 rounded-xl" style={{ background: 'white' }}>
                  <div className="text-2xl font-bold" style={{ color: '#a8556f' }}>{toEnglishNumbers(countdown.seconds)}</div>
                  <div className="text-xs" style={{ color: '#9a8a90' }}>ثانية</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border" style={{ borderColor: '#f0e0e4' }}>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Event Selection - Only show if multiple events */}
          {!isPreview && !hasSingleOpenEvent && events.length > 0 && (
            <div>
              <Label className="text-base font-semibold" style={{ color: '#2d1f26' }}>اختر اللقاء *</Label>
              <div className="grid md:grid-cols-2 gap-4 mt-3">
                {events.filter(e => e.status === 'open').map((event) => (
                  <div 
                    key={event.id}
                    className={`p-5 rounded-2xl cursor-pointer transition-all duration-300 ${
                      form.eventId === event.id 
                        ? 'shadow-lg scale-[1.02]' 
                        : 'hover:shadow-md'
                    }`}
                    style={{ 
                      background: form.eventId === event.id ? '#fdf2f4' : 'white',
                      border: form.eventId === event.id ? '2px solid #a8556f' : '1px solid #f0e0e4'
                    }}
                    onClick={() => setForm(prev => ({ ...prev, eventId: event.id }))}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #a8556f20 0%, #a8556f10 100%)' }}>
                        <Calendar className="w-6 h-6" style={{ color: '#a8556f' }} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold mb-1" style={{ color: '#2d1f26' }}>{event.title}</h3>
                        <p className="text-sm" style={{ color: '#6b5a60' }}>{formatDate(event.date)}</p>
                        {event.showRegistrantCount && (
                          <div className="flex items-center gap-2 text-xs mt-2" style={{ color: '#9a8a90' }}>
                            <Users className="w-4 h-4" />
                            <span>{toEnglishNumbers(event._count?.registrations || 0)}/{toEnglishNumbers(event.capacity)} مسجلة</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label className="text-base font-semibold" style={{ color: '#2d1f26' }}>الاسم الكامل *</Label>
              <Input 
                value={form.name} 
                onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} 
                required 
                className="input mt-2 h-12" 
                placeholder="أدخلي اسمك الكامل"
              />
            </div>
            <div>
              <Label className="text-base font-semibold" style={{ color: '#2d1f26' }}>البريد الإلكتروني *</Label>
              <Input 
                type="email" 
                value={form.email} 
                onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))} 
                required 
                className="input mt-2 h-12"
                placeholder="example@email.com"
              />
            </div>
          </div>

          {/* Gender Selection */}
          <div>
            <Label className="text-base font-semibold" style={{ color: '#2d1f26' }}>الجنس</Label>
            <div className="flex gap-4 mt-3">
              <button
                type="button"
                onClick={() => setForm(prev => ({ ...prev, gender: 'female' }))}
                className="flex-1 py-3 px-6 rounded-xl font-medium transition-all flex items-center justify-center gap-3"
                style={{ 
                  background: form.gender === 'female' ? '#fdf2f4' : '#f5f5f5',
                  border: form.gender === 'female' ? '2px solid #d4a5b5' : '1px solid #e8e8e8',
                  color: form.gender === 'female' ? '#a8556f' : '#6b5a60'
                }}
              >
                <span className="text-2xl">👩</span>
                <span>أنثى</span>
              </button>
              <button
                type="button"
                onClick={() => setForm(prev => ({ ...prev, gender: 'male' }))}
                className="flex-1 py-3 px-6 rounded-xl font-medium transition-all flex items-center justify-center gap-3"
                style={{ 
                  background: form.gender === 'male' ? '#fdf2f4' : '#f5f5f5',
                  border: form.gender === 'male' ? '2px solid #d4a5b5' : '1px solid #e8e8e8',
                  color: form.gender === 'male' ? '#a8556f' : '#6b5a60'
                }}
              >
                <span className="text-2xl">👨</span>
                <span>ذكر</span>
              </button>
            </div>
          </div>

          {/* Phone with Country Code on LEFT */}
          <div>
            <Label className="text-base font-semibold" style={{ color: '#2d1f26' }}>رقم الجوال</Label>
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

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label className="text-base font-semibold" style={{ color: '#2d1f26' }}>اسم الشركة</Label>
              <Input 
                value={form.companyName} 
                onChange={e => setForm(prev => ({ ...prev, companyName: e.target.value }))} 
                className="input mt-2 h-12"
                placeholder="اسم الشركة أو المؤسسة"
              />
            </div>
            <div>
              <Label className="text-base font-semibold" style={{ color: '#2d1f26' }}>المسمى الوظيفي</Label>
              <Input 
                value={form.jobTitle} 
                onChange={e => setForm(prev => ({ ...prev, jobTitle: e.target.value }))} 
                className="input mt-2 h-12"
                placeholder="مثال: مديرة تنفيذية، رائدة أعمال"
              />
            </div>
          </div>

          <div>
            <Label className="text-base font-semibold" style={{ color: '#2d1f26' }}>مجالات الاهتمام</Label>
            <Input 
              value={form.interests} 
              onChange={e => setForm(prev => ({ ...prev, interests: e.target.value }))} 
              className="input mt-2 h-12"
              placeholder="ريادة الأعمال، التسويق، التقنية..."
            />
          </div>

          <div>
            <Label className="text-base font-semibold" style={{ color: '#2d1f26' }}>التوقعات من الملتقى</Label>
            <Textarea 
              value={form.expectations} 
              onChange={e => setForm(prev => ({ ...prev, expectations: e.target.value }))} 
              rows={4} 
              className="input mt-2 resize-none"
              placeholder="ما الذي تتوقعين من المشاركة في الملتقى؟"
            />
          </div>

          <div className="pt-4">
            <Button 
              type="submit" 
              className="btn btn-primary w-full md:w-auto md:px-16 py-6 rounded-full text-lg"
              disabled={loading || isPreview}
              style={isPreview ? { background: '#e8d8dc', color: '#6b5a60', cursor: 'not-allowed' } : {}}
            >
              {isPreview ? (
                <>
                  <Eye className="w-5 h-5" />
                  صفحة معاينة - لا يمكن التسجيل
                </>
              ) : (
                <>
                  <Users className="w-5 h-5" />
                  {loading ? 'جاري التسجيل...' : 'تأكيد التسجيل'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Contact Info */}
      <div className="mt-12 text-center">
        <p className="text-base mb-4" style={{ color: '#6b5a60' }}>للاستفسارات، تواصلي معنا:</p>
        <p className="font-semibold" style={{ color: '#a8556f' }}>info@riyada-women.com</p>
      </div>
    </>
  )
}

function RegisterLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border" style={{ borderColor: '#f0e0e4' }}>
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="h-6 w-32 bg-gray-200 rounded mb-2"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
            <div>
              <div className="h-6 w-32 bg-gray-200 rounded mb-2"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="h-6 w-32 bg-gray-200 rounded mb-2"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
            <div>
              <div className="h-6 w-32 bg-gray-200 rounded mb-2"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
          </div>
          <div className="h-14 bg-gray-200 rounded-full w-64"></div>
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  const [member, setMember] = useState<Member | null>(null)

  useEffect(() => {
    const checkMemberAuth = async () => {
      try {
        const response = await fetch('/api/member/me')
        const data = await response.json()
        if (data.member) {
          setMember(data.member)
        }
      } catch {
        setMember(null)
      }
    }
    checkMemberAuth()
  }, [])

  return (
    <div className="min-h-screen" dir="rtl" style={{ background: 'linear-gradient(180deg, #fdf8f9 0%, #ffffff 50%, #fdf8f9 100%)' }}>
      {/* Header */}
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
            <h2 className="text-2xl font-bold" style={{ color: '#2d1f26' }}>التسجيل في الملتقى</h2>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-12">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg"
              style={{ background: 'linear-gradient(135deg, #a8556f 0%, #9b7b9a 100%)' }}>
              <Users className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4" style={{ color: '#2d1f26' }}>التسجيل في الملتقى</h1>
            <p className="text-lg" style={{ color: '#6b5a60' }}>انضمي إلى مجتمع سيدات الأعمال</p>
            {member && (
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: '#e0f0e4', color: '#2d6b3d' }}>
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">مرحباً {member.name}، تم ملء بياناتك تلقائياً</span>
              </div>
            )}
          </div>

          {/* Preview Banner - Separate Suspense boundary */}
          <Suspense fallback={null}>
            <PreviewBanner />
          </Suspense>

          {/* Form with Suspense */}
          <Suspense fallback={<RegisterLoading />}>
            <RegisterForm />
          </Suspense>
        </div>
      </main>
      <Toaster position="top-center" />
    </div>
  )
}
