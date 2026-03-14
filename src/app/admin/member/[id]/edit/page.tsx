'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  ArrowRight, Crown, Save, X, Camera, User, Mail, Phone, Building2, Briefcase,
  Twitter, Instagram, Linkedin
} from 'lucide-react'
import { toast } from 'sonner'
import ReactCrop, { Crop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

interface MemberData {
  id: string
  name: string
  email: string
  phone: string | null
  companyName: string | null
  jobTitle: string | null
  gender: string | null
  imageUrl: string | null
  createdAt: string
  isRegistered: boolean
}

export default function EditMemberPage() {
  const router = useRouter()
  const params = useParams()
  const memberId = params.id as string
  
  const [member, setMember] = useState<MemberData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  
  // Crop states
  const [showCropModal, setShowCropModal] = useState(false)
  const [imageToCrop, setImageToCrop] = useState<string | null>(null)
  const [cropError, setCropError] = useState<string | null>(null)
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    x: 10,
    y: 10,
    width: 80,
    height: 80,
  })
  const [completedCrop, setCompletedCrop] = useState<Crop | null>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    companyName: '',
    jobTitle: '',
    gender: 'female',
    imageUrl: '',
    twitter: '',
    instagram: '',
    linkedin: '',
    snapchat: ''
  })

  useEffect(() => {
    fetchMemberData()
  }, [memberId])

  const fetchMemberData = async () => {
    try {
      const membersRes = await fetch('/api/members')
      const membersData = await membersRes.json()
      
      const memberData = membersData.members?.find((m: {id: string}) => m.id === memberId)
      
      if (memberData) {
        setMember({
          ...memberData,
          isRegistered: true
        })
        setForm({
          name: memberData.name || '',
          email: memberData.email || '',
          phone: memberData.phone || '',
          companyName: memberData.companyName || '',
          jobTitle: memberData.jobTitle || '',
          gender: memberData.gender || 'female',
          imageUrl: memberData.imageUrl || '',
          twitter: memberData.twitter || '',
          instagram: memberData.instagram || '',
          linkedin: memberData.linkedin || '',
          snapchat: memberData.snapchat || ''
        })
      } else {
        const regsRes = await fetch('/api/registrations')
        const regsData = await regsRes.json()
        const regData = regsData.registrations?.find((r: {id: string}) => r.id === memberId)

        if (regData) {
          setMember({
            id: regData.id,
            name: regData.name,
            email: regData.email,
            phone: regData.phone,
            companyName: regData.companyName,
            jobTitle: regData.jobTitle,
            gender: regData.gender || null,
            imageUrl: regData.imageUrl || null,
            createdAt: regData.createdAt,
            isRegistered: false
          })
          setForm({
            name: regData.name || '',
            email: regData.email || '',
            phone: regData.phone || '',
            companyName: regData.companyName || '',
            jobTitle: regData.jobTitle || '',
            gender: regData.gender || 'female',
            imageUrl: regData.imageUrl || '',
            twitter: '',
            instagram: '',
            linkedin: '',
            snapchat: ''
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setCropError(null)
    
    if (!file.type.startsWith('image/')) {
      toast.error('يرجى اختيار ملف صورة صالح')
      return
    }
    
    if (file.size > 10 * 1024 * 1024) {
      toast.error('حجم الصورة كبير جداً. الحد الأقصى 10 ميجابايت')
      return
    }
    
    const reader = new FileReader()
    reader.onload = () => {
      setImageToCrop(reader.result as string)
      setShowCropModal(true)
      setCrop({
        unit: '%',
        x: 10,
        y: 10,
        width: 80,
        height: 80,
      })
      setCompletedCrop(null)
    }
    reader.onerror = () => {
      toast.error('حدث خطأ أثناء قراءة الصورة')
    }
    reader.readAsDataURL(file)
  }

  const getCroppedImg = async (): Promise<Blob | null> => {
    if (!completedCrop) {
      setCropError('يرجى تحديد منطقة الاقتصاص')
      return null
    }
    
    if (!imgRef.current || !imageToCrop) {
      setCropError('حدث خطأ في تحميل الصورة')
      return null
    }
    
    if (completedCrop.width! < 50 || completedCrop.height! < 50) {
      setCropError('منطقة الاقتصاص صغيرة جداً. يرجى تكبير المنطقة المحددة')
      return null
    }

    const image = imgRef.current
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      setCropError('حدث خطأ في إنشاء الصورة')
      return null
    }

    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height

    canvas.width = completedCrop.width!
    canvas.height = completedCrop.height!

    ctx.fillStyle = '#fdf8f9'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.drawImage(
      image,
      completedCrop.x! * scaleX,
      completedCrop.y! * scaleY,
      completedCrop.width! * scaleX,
      completedCrop.height! * scaleY,
      0,
      0,
      completedCrop.width!,
      completedCrop.height!
    )

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob)
        } else {
          setCropError('حدث خطأ في معالجة الصورة')
          resolve(null)
        }
      }, 'image/png', 1)
    })
  }

  const handleCropConfirm = async () => {
    setCropError(null)
    const croppedBlob = await getCroppedImg()
    if (!croppedBlob) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', croppedBlob, 'cropped-member-image.png')
      formData.append('type', 'member')
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      const data = await response.json()
      
      if (response.ok && data.success) {
        setForm(prev => ({ ...prev, imageUrl: data.url }))
        toast.success('تم رفع الصورة بنجاح')
        setShowCropModal(false)
        setImageToCrop(null)
        setCompletedCrop(null)
      } else {
        toast.error(data.error || 'حدث خطأ أثناء رفع الصورة')
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('حدث خطأ في الاتصال بالخادم')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!form.name.trim()) {
      toast.error('الاسم مطلوب')
      return
    }

    setSaving(true)
    try {
      const memberResponse = await fetch(`/api/members/${member?.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          companyName: form.companyName,
          jobTitle: form.jobTitle,
          gender: form.gender,
          imageUrl: form.imageUrl,
          twitter: form.twitter,
          instagram: form.instagram,
          linkedin: form.linkedin,
          snapchat: form.snapchat
        })
      })
      
      if (memberResponse.ok) {
        toast.success('تم تحديث البيانات بنجاح')
        router.push(`/admin/member/${member?.id}`)
      } else {
        const regResponse = await fetch(`/api/registrations/${member?.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            phone: form.phone,
            companyName: form.companyName,
            jobTitle: form.jobTitle,
            gender: form.gender,
            imageUrl: form.imageUrl
          })
        })

        if (regResponse.ok) {
          toast.success('تم تحديث البيانات بنجاح')
          router.push(`/admin/member/${member?.id}`)
        } else {
          const error = await regResponse.json()
          toast.error(error.error || 'حدث خطأ أثناء التحديث')
        }
      }
    } catch (error) {
      console.error('Error saving:', error)
      toast.error('حدث خطأ أثناء الحفظ')
    } finally {
      setSaving(false)
    }
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

  const hasImage = form.imageUrl && form.imageUrl.length > 0

  return (
    <div className="min-h-screen" dir="rtl" style={{ background: 'linear-gradient(180deg, #fdf8f9 0%, #ffffff 100%)' }}>
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b" style={{ borderColor: 'rgba(240, 224, 228, 0.5)' }}>
        <div className="container">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push(`/admin/member/${member.id}`)}
                className="flex items-center gap-1 shadow-md rounded-full text-xs sm:text-sm px-4 py-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                style={{ background: '#fdf2f4', color: '#6b5a60' }}
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
                رجوع
              </button>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: '#e8d8dc' }}>
                <Crown className="w-5 h-5" style={{ color: '#6b5a60' }} />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold" style={{ color: '#2d1f26' }}>تعديل البيانات</h1>
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
                <p className="text-xs" style={{ color: '#6b5a60' }}>{member.name}</p>
              </div>
            </div>
            
            <Button 
              onClick={handleSubmit}
              disabled={saving}
              className="rounded-full gap-2"
              style={{ background: 'linear-gradient(135deg, #a8556f 0%, #9b7b9a 100%)', color: 'white' }}
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  حفظ...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  حفظ التعديلات
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        {/* العنوان */}
        <div className="flex items-center gap-4 mb-8">
          {/* صورة العضو */}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            id="member-image-upload"
            onChange={handleFileChange}
            disabled={uploading}
          />
          <label 
            htmlFor="member-image-upload"
            className="relative w-20 h-20 rounded-2xl border-2 border-dashed cursor-pointer overflow-hidden group flex items-center justify-center"
            style={{ borderColor: hasImage ? '#a8556f' : '#e8d8dc', background: '#fdf8f9' }}
          >
            {hasImage ? (
              <>
                <img 
                  src={form.imageUrl} 
                  alt={form.name} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                  <Camera className="w-4 h-4 text-white" />
                </div>
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                {uploading ? (
                  <div className="w-6 h-6 border-2 border-[#a8556f] border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Camera className="w-6 h-6" style={{ color: '#a8556f' }} />
                )}
              </div>
            )}
          </label>
          <div>
            <h2 className="text-2xl font-bold" style={{ color: '#2d1f26' }}>تعديل بيانات العضو</h2>
            <p className="text-sm mt-1" style={{ color: '#6b5a60' }}>قم بتعديل البيانات ثم اضغط حفظ</p>
          </div>
        </div>

        {/* بطاقات التعديل - نفس ستايل نظرة عامة */}
        <form onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* البيانات الأساسية */}
            <Card className="rounded-2xl border bg-transparent" style={{ borderColor: '#f0e0e4' }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: '#f0e0e4' }}>
                  <span className="text-lg font-bold" style={{ color: '#2d1f26' }}>البيانات الأساسية</span>
                  <User className="w-5 h-5" style={{ color: '#a8556f' }} />
                </div>
                <div className="space-y-4 mt-4">
                  {/* الاسم */}
                  <div>
                    <label className="block text-sm mb-1.5" style={{ color: '#6b5a60' }}>الاسم *</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 text-sm"
                      style={{ borderColor: '#e8d8dc', background: '#fdf8f9' }}
                      placeholder="أدخل الاسم"
                      required
                    />
                  </div>
                  
                  {/* الجنس */}
                  <div>
                    <label className="block text-sm mb-1.5" style={{ color: '#6b5a60' }}>الجنس</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, gender: 'female' }))}
                        className="flex-1 py-2 px-3 rounded-xl border-2 transition-all text-sm"
                        style={{
                          background: form.gender === 'female' ? '#fdf2f4' : '#fdf8f9',
                          borderColor: form.gender === 'female' ? '#a8556f' : '#e8d8dc',
                          color: form.gender === 'female' ? '#a8556f' : '#6b5a60'
                        }}
                      >
                        👩 أنثى
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, gender: 'male' }))}
                        className="flex-1 py-2 px-3 rounded-xl border-2 transition-all text-sm"
                        style={{
                          background: form.gender === 'male' ? '#e8f4fd' : '#fdf8f9',
                          borderColor: form.gender === 'male' ? '#2563eb' : '#e8d8dc',
                          color: form.gender === 'male' ? '#2563eb' : '#6b5a60'
                        }}
                      >
                        👨 ذكر
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* معلومات التواصل */}
            <Card className="rounded-2xl border bg-transparent" style={{ borderColor: '#f0e0e4' }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: '#f0e0e4' }}>
                  <span className="text-lg font-bold" style={{ color: '#2d1f26' }}>معلومات التواصل</span>
                  <Mail className="w-5 h-5" style={{ color: '#a8556f' }} />
                </div>
                <div className="space-y-4 mt-4">
                  {/* البريد */}
                  <div>
                    <label className="flex items-center gap-1 text-sm mb-1.5" style={{ color: '#6b5a60' }}>
                      <Mail className="w-3.5 h-3.5" />
                      البريد الإلكتروني
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 text-sm"
                      style={{ borderColor: '#e8d8dc', background: '#fdf8f9' }}
                      placeholder="example@email.com"
                      dir="ltr"
                    />
                  </div>
                  
                  {/* الجوال */}
                  <div>
                    <label className="flex items-center gap-1 text-sm mb-1.5" style={{ color: '#6b5a60' }}>
                      <Phone className="w-3.5 h-3.5" />
                      رقم الجوال
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 text-sm"
                      style={{ borderColor: '#e8d8dc', background: '#fdf8f9' }}
                      placeholder="05xxxxxxxx"
                      dir="ltr"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* معلومات العمل */}
            <Card className="rounded-2xl border bg-transparent" style={{ borderColor: '#f0e0e4' }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: '#f0e0e4' }}>
                  <span className="text-lg font-bold" style={{ color: '#2d1f26' }}>معلومات العمل</span>
                  <Building2 className="w-5 h-5" style={{ color: '#a8556f' }} />
                </div>
                <div className="space-y-4 mt-4">
                  {/* الشركة */}
                  <div>
                    <label className="flex items-center gap-1 text-sm mb-1.5" style={{ color: '#6b5a60' }}>
                      <Building2 className="w-3.5 h-3.5" />
                      اسم الشركة
                    </label>
                    <input
                      type="text"
                      value={form.companyName}
                      onChange={(e) => setForm(prev => ({ ...prev, companyName: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 text-sm"
                      style={{ borderColor: '#e8d8dc', background: '#fdf8f9' }}
                      placeholder="أدخل اسم الشركة"
                    />
                  </div>
                  
                  {/* المسمى الوظيفي */}
                  <div>
                    <label className="flex items-center gap-1 text-sm mb-1.5" style={{ color: '#6b5a60' }}>
                      <Briefcase className="w-3.5 h-3.5" />
                      المسمى الوظيفي
                    </label>
                    <input
                      type="text"
                      value={form.jobTitle}
                      onChange={(e) => setForm(prev => ({ ...prev, jobTitle: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 text-sm"
                      style={{ borderColor: '#e8d8dc', background: '#fdf8f9' }}
                      placeholder="أدخل المسمى الوظيفي"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* السوشل ميديا */}
          <Card className="rounded-2xl border bg-transparent mb-8" style={{ borderColor: '#f0e0e4' }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: '#f0e0e4' }}>
                <span className="text-lg font-bold" style={{ color: '#2d1f26' }}>السوشل ميديا</span>
                <div className="flex items-center gap-2">
                  <Twitter className="w-4 h-4" style={{ color: '#1da1f2' }} />
                  <Instagram className="w-4 h-4" style={{ color: '#e1306c' }} />
                  <Linkedin className="w-4 h-4" style={{ color: '#0077b5' }} />
                </div>
              </div>
              <div className="grid md:grid-cols-4 gap-4 mt-4">
                {/* تويتر */}
                <div>
                  <label className="flex items-center gap-1.5 text-sm mb-1.5" style={{ color: '#6b5a60' }}>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#1da1f2">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    تويتر (X)
                  </label>
                  <input
                    type="text"
                    value={form.twitter}
                    onChange={(e) => setForm(prev => ({ ...prev, twitter: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 text-sm"
                    style={{ borderColor: '#e8d8dc', background: '#fdf8f9' }}
                    placeholder="@username"
                    dir="ltr"
                  />
                </div>

                {/* انستغرام */}
                <div>
                  <label className="flex items-center gap-1.5 text-sm mb-1.5" style={{ color: '#6b5a60' }}>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#e1306c">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                    انستغرام
                  </label>
                  <input
                    type="text"
                    value={form.instagram}
                    onChange={(e) => setForm(prev => ({ ...prev, instagram: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 text-sm"
                    style={{ borderColor: '#e8d8dc', background: '#fdf8f9' }}
                    placeholder="@username"
                    dir="ltr"
                  />
                </div>

                {/* لينكد إن */}
                <div>
                  <label className="flex items-center gap-1.5 text-sm mb-1.5" style={{ color: '#6b5a60' }}>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#0077b5">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    لينكد إن
                  </label>
                  <input
                    type="text"
                    value={form.linkedin}
                    onChange={(e) => setForm(prev => ({ ...prev, linkedin: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 text-sm"
                    style={{ borderColor: '#e8d8dc', background: '#fdf8f9' }}
                    placeholder="username"
                    dir="ltr"
                  />
                </div>

                {/* سناب شات */}
                <div>
                  <label className="flex items-center gap-1.5 text-sm mb-1.5" style={{ color: '#6b5a60' }}>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#fffc00">
                      <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301.165-.088.344-.104.464-.104.182 0 .359.029.509.09.45.149.734.479.734.838.015.449-.39.839-1.213 1.168-.089.029-.209.075-.344.119-.45.135-1.139.36-1.333.81-.09.224-.061.524.12.868l.015.015c.06.136 1.526 3.475 4.791 4.014.255.044.435.27.42.509 0 .075-.015.149-.045.225-.24.569-1.273.988-3.146 1.271-.059.091-.12.375-.164.57-.029.179-.074.36-.134.553-.076.271-.27.405-.555.405h-.03c-.135 0-.313-.031-.538-.074-.36-.075-.765-.135-1.273-.135-.3 0-.599.015-.913.074-.6.104-1.123.464-1.723.884-.853.599-1.826 1.288-3.294 1.288-.06 0-.119-.015-.18-.015h-.149c-1.468 0-2.427-.675-3.279-1.288-.599-.42-1.107-.779-1.707-.884-.314-.045-.629-.074-.928-.074-.54 0-.958.089-1.272.149-.211.043-.391.074-.54.074-.374 0-.523-.224-.583-.42-.061-.192-.09-.389-.135-.567-.046-.181-.105-.494-.166-.57-1.918-.222-2.95-.642-3.189-1.226-.031-.063-.052-.15-.055-.225-.015-.243.165-.465.42-.509 3.264-.54 4.73-3.879 4.791-4.02l.016-.029c.18-.345.224-.645.119-.869-.195-.434-.884-.658-1.332-.809-.121-.029-.24-.074-.346-.119-.809-.329-1.228-.72-1.228-1.153 0-.359.256-.704.704-.854.166-.059.346-.089.54-.089.121 0 .239.015.389.045.36.104.674.179.928.179.209 0 .314-.045.39-.09-.007-.166-.017-.331-.028-.51l-.003-.059c-.104-1.629-.23-3.654.3-4.848 1.58-3.545 4.94-3.82 5.93-3.82z"/>
                    </svg>
                    سناب شات
                  </label>
                  <input
                    type="text"
                    value={form.snapchat}
                    onChange={(e) => setForm(prev => ({ ...prev, snapchat: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 text-sm"
                    style={{ borderColor: '#e8d8dc', background: '#fdf8f9' }}
                    placeholder="username"
                    dir="ltr"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* أزرار التحكم */}
          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/admin/member/${member.id}`)}
              className="rounded-full gap-2 px-8"
              style={{ borderColor: '#e8d8dc', color: '#6b5a60' }}
            >
              <X className="w-4 h-4" />
              إلغاء
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="rounded-full gap-2 px-8"
              style={{ background: 'linear-gradient(135deg, #a8556f 0%, #9b7b9a 100%)', color: 'white' }}
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  حفظ التعديلات
                </>
              )}
            </Button>
          </div>
        </form>
      </main>

      {/* Crop Modal */}
      {showCropModal && imageToCrop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(168, 85, 111, 0.3)' }} onClick={(e) => e.stopPropagation()}>
          <div className="rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-auto" style={{ background: 'linear-gradient(135deg, #fdf8f9 0%, #fff 100%)' }} dir="rtl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold" style={{ color: '#2d1f26' }}>اقتصاص صورة العضو</h3>
              <button type="button" onClick={() => { setShowCropModal(false); setImageToCrop(null); setCropError(null); }}>
                <X className="w-6 h-6" style={{ color: '#6b5a60' }} />
              </button>
            </div>
            
            {cropError && (
              <div className="mb-4 p-3 rounded-xl" style={{ background: '#fce8e8', color: '#8a3a3a', border: '1px solid #f0c0c0' }}>
                <p className="text-sm font-medium">⚠️ {cropError}</p>
              </div>
            )}
            
            <div className="flex justify-center mb-4" style={{ background: '#fdf8f9', borderRadius: '12px', padding: '8px' }}>
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
              >
                <img
                  ref={imgRef}
                  src={imageToCrop}
                  alt="صورة للقص"
                  style={{ maxHeight: '400px', maxWidth: '100%' }}
                />
              </ReactCrop>
            </div>
            
            <p className="text-xs text-center mb-4" style={{ color: '#9a8a90' }}>
              اسحب أطراف المربع لتحديد المنطقة المراد اقتصاصها
            </p>
            
            <div className="flex justify-center gap-3">
              <Button
                type="button"
                onClick={handleCropConfirm}
                disabled={uploading}
                className="rounded-full gap-2 px-8"
                style={{ background: '#a8556f', color: 'white' }}
              >
                {uploading ? 'جاري الرفع...' : 'تأكيد القص'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => { setShowCropModal(false); setImageToCrop(null); setCropError(null); }}
                className="rounded-full px-8"
                disabled={uploading}
              >
                إلغاء
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
