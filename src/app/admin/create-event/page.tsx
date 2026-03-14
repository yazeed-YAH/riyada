'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import ReactCrop, { Crop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { 
  Calendar, Users, Handshake, Plus, Check, X, 
  Settings, Trash2, Globe, Eye, User, Camera, MapPin,
  ChevronDown, ChevronUp, Globe2, Lock, Clock, Play, Square, CheckCircle2,
  Building2, Mail
} from 'lucide-react'
import { toast } from 'sonner'

interface SponsorRequest {
  id: string
  companyName: string
  contactName: string
  logoUrl: string | null
  status: string
}

interface EventSponsorItem {
  sponsorId: string
  sponsorName: string
  tasks: string
}

// Accordion Card Component
function AccordionCard({ 
  title, 
  icon: Icon, 
  iconBg, 
  iconColor, 
  defaultOpen = false,
  children 
}: { 
  title: string
  icon: React.ElementType
  iconBg: string
  iconColor: string
  defaultOpen?: boolean
  children: React.ReactNode 
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  
  return (
    <Card className="rounded-2xl border overflow-hidden" style={{ borderColor: '#f0e0e4' }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
        dir="rtl"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: iconBg }}>
            <Icon className="w-5 h-5" style={{ color: iconColor }} />
          </div>
          <h3 className="text-lg font-bold" style={{ color: '#2d1f26' }}>{title}</h3>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5" style={{ color: '#9a8a90' }} />
        ) : (
          <ChevronDown className="w-5 h-5" style={{ color: '#9a8a90' }} />
        )}
      </button>
      {isOpen && (
        <CardContent className="p-6 pt-0 border-t" style={{ borderColor: '#f0e0e4' }}>
          {children}
        </CardContent>
      )}
    </Card>
  )
}

// Event Image Upload Component
function ImageUpload({ 
  label, 
  value, 
  onChange 
}: { 
  label: string
  value: string
  onChange: (value: string) => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [showCropModal, setShowCropModal] = useState(false)
  const [imageToCrop, setImageToCrop] = useState<string | null>(null)
  const [cropError, setCropError] = useState<string | null>(null)
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    x: 5,
    y: 5,
    width: 90,
    height: 90,
  })
  const [completedCrop, setCompletedCrop] = useState<Crop | null>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  
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
        x: 5,
        y: 5,
        width: 90,
        height: 90,
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
      formData.append('file', croppedBlob, 'cropped-event-image.png')
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        const data = await response.json()
        onChange(data.url)
        toast.success('تم رفع الصورة بنجاح')
        setShowCropModal(false)
        setImageToCrop(null)
        setCompletedCrop(null)
      } else {
        toast.error('حدث خطأ أثناء رفع الصورة')
      }
    } catch {
      toast.error('حدث خطأ في الاتصال بالخادم')
    } finally {
      setUploading(false)
    }
  }

  const hasImage = value && value.length > 0
  
  return (
    <div>
      <Label className="text-sm font-medium mb-3 block" style={{ color: '#2d1f26' }}>{label}</Label>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      <div 
        className="relative w-full h-48 rounded-2xl border-2 border-dashed cursor-pointer overflow-hidden group"
        style={{ borderColor: hasImage ? '#a8556f' : '#e8d8dc', background: '#fdf8f9' }}
        onClick={() => fileInputRef.current?.click()}
      >
        {hasImage ? (
          <>
            <img 
              src={value} 
              alt="صورة اللقاء" 
              className="w-full h-full object-contain"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <Camera className="w-6 h-6 text-white" />
              <span className="text-white text-sm font-medium">تغيير الصورة</span>
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onChange(''); }}
              className="absolute top-3 left-3 w-8 h-8 rounded-full flex items-center justify-center shadow-md"
              style={{ background: '#fce8e8', color: '#8a3a3a' }}
            >
              <X className="w-4 h-4" />
            </button>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: '#f0e0e4' }}>
              {uploading ? (
                <div className="animate-spin rounded-full h-8 w-8 border-2" style={{ borderColor: '#e8d8dc', borderTopColor: '#a8556f' }}></div>
              ) : (
                <Camera className="w-8 h-8" style={{ color: '#a8556f' }} />
              )}
            </div>
            {uploading ? (
              <span className="text-sm font-medium" style={{ color: '#6b5a60' }}>جاري رفع الصورة...</span>
            ) : (
              <>
                <span className="text-sm font-medium" style={{ color: '#6b5a60' }}>اضغط لرفع صورة اللقاء</span>
                <span className="text-xs" style={{ color: '#9a8a90' }}>يُنصح بصورة عالية الجودة (1200×800 بكسل)</span>
              </>
            )}
          </div>
        )}
      </div>
      
      {showCropModal && imageToCrop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(168, 85, 111, 0.3)' }} onClick={(e) => e.stopPropagation()}>
          <div className="rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-auto" style={{ background: 'linear-gradient(135deg, #fdf8f9 0%, #fff 100%)' }} dir="rtl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold" style={{ color: '#2d1f26' }}>اقتصاص صورة اللقاء</h3>
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
                  style={{ maxHeight: '350px', maxWidth: '100%' }}
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
                style={{ background: '#e8d8dc', color: '#6b5a60' }}
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

// Guest Image Upload Component
function GuestImageUpload({ 
  value, 
  onChange 
}: { 
  value: string
  onChange: (value: string) => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
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
      formData.append('file', croppedBlob, 'cropped-guest-image.png')
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        const data = await response.json()
        onChange(data.url)
        toast.success('تم رفع الصورة بنجاح')
        setShowCropModal(false)
        setImageToCrop(null)
        setCompletedCrop(null)
      } else {
        toast.error('حدث خطأ أثناء رفع الصورة')
      }
    } catch {
      toast.error('حدث خطأ في الاتصال بالخادم')
    } finally {
      setUploading(false)
    }
  }

  const hasImage = value && value.length > 0
  
  return (
    <div className="flex flex-col items-center gap-3">
      <Label className="text-sm font-medium" style={{ color: '#2d1f26' }}>صورة الضيف</Label>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      <div 
        className="relative w-40 h-40 rounded-2xl border-2 border-dashed cursor-pointer overflow-hidden group"
        style={{ borderColor: hasImage ? '#a8556f' : '#e8d8dc', background: '#fdf8f9' }}
        onClick={() => fileInputRef.current?.click()}
      >
        {hasImage ? (
          <>
            <img 
              src={value} 
              alt="صورة الضيف" 
              className="w-full h-full object-contain"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Camera className="w-6 h-6 text-white" />
              <span className="text-white text-sm">تغيير</span>
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onChange(''); }}
              className="absolute -top-2 -left-2 w-6 h-6 rounded-full flex items-center justify-center shadow-md"
              style={{ background: '#fce8e8', color: '#8a3a3a' }}
            >
              <X className="w-4 h-4" />
            </button>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <svg viewBox="0 0 64 64" className="w-20 h-20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="32" cy="32" r="30" fill="#f5e6ea" stroke="#d8c0c8" strokeWidth="2"/>
              <ellipse cx="32" cy="24" rx="12" ry="13" fill="#c9a0b0"/>
              <path d="M16 56c0-8.837 7.163-16 16-16s16 7.163 16 16" fill="#c9a0b0"/>
              <ellipse cx="32" cy="18" rx="14" ry="10" fill="#b0889a"/>
            </svg>
            {uploading ? (
              <span className="text-xs" style={{ color: '#9a8a90' }}>جاري الرفع...</span>
            ) : (
              <span className="text-xs" style={{ color: '#9a8a90' }}>اضغط للرفع</span>
            )}
          </div>
        )}
      </div>
      
      {showCropModal && imageToCrop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(168, 85, 111, 0.3)' }} onClick={(e) => e.stopPropagation()}>
          <div className="rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-auto" style={{ background: 'linear-gradient(135deg, #fdf8f9 0%, #fff 100%)' }} dir="rtl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold" style={{ color: '#2d1f26' }}>اقتصاص صورة الضيف</h3>
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
                style={{ background: '#e8d8dc', color: '#6b5a60' }}
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

// Event Type Button Component
function EventTypeButton({ 
  type, 
  label, 
  icon: Icon, 
  selected, 
  onClick 
}: { 
  type: string
  label: string
  icon: React.ElementType
  selected: boolean
  onClick: () => void 
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
        selected ? 'border-[#a8556f] bg-[#fdf2f4]' : 'border-[#e8d8dc] bg-white hover:border-[#d8c8cc]'
      }`}
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
        selected ? 'bg-[#a8556f] text-white' : 'bg-[#fdf8f9] text-[#a8556f]'
      }`}>
        <Icon className="w-6 h-6" />
      </div>
      <span className={`font-medium ${selected ? 'text-[#a8556f]' : 'text-[#6b5a60]'}`}>{label}</span>
    </button>
  )
}

// Event Status Button Component
function EventStatusButton({ 
  status, 
  label, 
  icon: Icon, 
  color, 
  selected, 
  onClick 
}: { 
  status: string
  label: string
  icon: React.ElementType
  color: string
  selected: boolean
  onClick: () => void 
}) {
  const colors: Record<string, { bg: string; border: string; iconBg: string }> = {
    open: { bg: '#e0f0e4', border: '#2d6b3d', iconBg: '#2d6b3d' },
    closed: { bg: '#fce8e8', border: '#dc2626', iconBg: '#dc2626' },
    ended: { bg: '#f5f5f5', border: '#666', iconBg: '#666' }
  }
  
  const c = colors[color] || colors.open
  
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
        selected ? '' : 'border-[#e8d8dc] bg-white hover:border-[#d8c8cc]'
      }`}
      style={selected ? { borderColor: c.border, background: c.bg } : {}}
    >
      <div 
        className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
        style={{ background: selected ? c.iconBg : '#e8d8dc', color: selected ? 'white' : '#6b5a60' }}
      >
        <Icon className="w-6 h-6" />
      </div>
      <span 
        className="font-medium"
        style={{ color: selected ? c.border : '#6b5a60' }}
      >
        {label}
      </span>
    </button>
  )
}

export default function CreateEventPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [sponsors, setSponsors] = useState<SponsorRequest[]>([])
  
  const [eventForm, setEventForm] = useState({
    title: '', 
    description: '', 
    date: '', 
    startTime: '18:00',
    endTime: '22:00', 
    location: '', 
    imageUrl: '',
    status: 'open',
    eventType: 'public',
    isPublished: false,
    registrationDeadline: '',
    guestName: '',
    guestImage: '',
    guestOrganization: '',
    guestPosition: '',
    guestTwitter: '',
    guestInstagram: '',
    guestLinkedIn: '',
    guestSnapchat: '',
    capacity: 50,
    maxCompanions: 0,
    registrationType: 'registration',
    sendQR: false,
    showCountdown: true,
    showRegistrantCount: true,
    showGuestProfile: true,
    showHospitalityPreference: true,
    valetServiceEnabled: false,
    parkingCapacity: 0,
    carRetrievalTime: ''
  })
  
  const [selectedSponsors, setSelectedSponsors] = useState<EventSponsorItem[]>([])
  const [whatsappEnabled, setWhatsappEnabled] = useState(true)
  const [emailEnabled, setEmailEnabled] = useState(true)

  useEffect(() => {
    fetchSponsors()
  }, [])

  const fetchSponsors = async () => {
    try {
      const response = await fetch('/api/sponsors')
      if (response.ok) {
        const data = await response.json()
        setSponsors(data.sponsors || [])
      }
    } catch (error) {
      console.error('Error fetching sponsors:', error)
    }
  }

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...eventForm,
          sponsors: selectedSponsors
        })
      })
      if (response.ok) {
        toast.success('تم إنشاء اللقاء بنجاح')
        router.push('/admin')
      } else {
        const data = await response.json()
        toast.error(data.error || 'حدث خطأ')
      }
    } catch { 
      toast.error('حدث خطأ') 
    } finally {
      setLoading(false)
    }
  }

  const approvedSponsors = sponsors.filter(s => s.status === 'approved')

  return (
    <div className="min-h-screen" style={{ background: '#fdf8f9' }} dir="rtl">
      {/* Header */}
      <header className="border-b" style={{ borderColor: '#f0e0e4', background: 'white' }}>
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => router.push('/admin')}
              className="rounded-full"
              style={{ color: '#6b5a60' }}
            >
              <X className="w-5 h-5" />
              إلغاء
            </Button>
            <h1 className="text-xl font-bold" style={{ color: '#2d1f26' }}>إنشاء لقاء جديد</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleCreateEvent} className="space-y-4">
            {/* Basic Info */}
            <AccordionCard 
              title="المعلومات الأساسية" 
              icon={Calendar} 
              iconBg="#fdf2f4" 
              iconColor="#a8556f"
              defaultOpen={true}
            >
              <div className="space-y-4 pt-4">
                <div>
                  <Label className="text-sm font-medium" style={{ color: '#2d1f26' }}>عنوان اللقاء *</Label>
                  <Input 
                    value={eventForm.title} 
                    onChange={e => setEventForm(prev => ({ ...prev, title: e.target.value }))} 
                    required 
                    className="mt-2 h-12 rounded-xl" 
                    style={{ borderColor: '#e8d8dc' }} 
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium" style={{ color: '#2d1f26' }}>الوصف</Label>
                  <Textarea 
                    value={eventForm.description} 
                    onChange={e => setEventForm(prev => ({ ...prev, description: e.target.value }))} 
                    rows={3} 
                    className="mt-2 resize-none rounded-xl" 
                    style={{ borderColor: '#e8d8dc' }} 
                  />
                </div>
                
                {/* Event Type */}
                <div>
                  <Label className="text-sm font-medium mb-3 block" style={{ color: '#2d1f26' }}>نوع اللقاء *</Label>
                  <div className="flex gap-4">
                    <EventTypeButton 
                      type="public" 
                      label="لقاء عام" 
                      icon={Globe2} 
                      selected={eventForm.eventType === 'public'} 
                      onClick={() => setEventForm(prev => ({ ...prev, eventType: 'public' }))} 
                    />
                    <EventTypeButton 
                      type="private" 
                      label="لقاء خاص" 
                      icon={Lock} 
                      selected={eventForm.eventType === 'private'} 
                      onClick={() => setEventForm(prev => ({ ...prev, eventType: 'private' }))} 
                    />
                  </div>
                </div>
                
                {/* Event Status */}
                <div>
                  <Label className="text-sm font-medium mb-3 block" style={{ color: '#2d1f26' }}>حالة اللقاء *</Label>
                  <div className="flex gap-4">
                    <EventStatusButton 
                      status="open" 
                      label="مفتوح" 
                      icon={Play} 
                      color="open"
                      selected={eventForm.status === 'open'} 
                      onClick={() => setEventForm(prev => ({ ...prev, status: 'open' }))} 
                    />
                    <EventStatusButton 
                      status="closed" 
                      label="مغلق" 
                      icon={Square} 
                      color="closed"
                      selected={eventForm.status === 'closed'} 
                      onClick={() => setEventForm(prev => ({ ...prev, status: 'closed' }))} 
                    />
                  </div>
                </div>
                
                {/* Event Image */}
                <ImageUpload 
                  label="صورة اللقاء" 
                  value={eventForm.imageUrl} 
                  onChange={v => setEventForm(prev => ({ ...prev, imageUrl: v }))} 
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium" style={{ color: '#2d1f26' }}>تاريخ اللقاء *</Label>
                    <Input 
                      type="date" 
                      value={eventForm.date} 
                      onChange={e => setEventForm(prev => ({ ...prev, date: e.target.value }))} 
                      required 
                      className="mt-2 h-12 rounded-xl" 
                      style={{ borderColor: '#e8d8dc' }} 
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium" style={{ color: '#2d1f26' }}>الموقع</Label>
                    <div className="flex gap-2 mt-2">
                      <Input 
                        value={eventForm.location} 
                        onChange={e => setEventForm(prev => ({ ...prev, location: e.target.value }))} 
                        placeholder="مثال: المقلط، الرياض"
                        className="h-12 rounded-xl flex-1" 
                        style={{ borderColor: '#e8d8dc' }} 
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          if (eventForm.location) {
                            window.open(`https://www.google.com/maps/search/${encodeURIComponent(eventForm.location + ' الرياض السعودية')}`, '_blank')
                          } else {
                            toast.error('الرجاء إدخال الموقع أولاً')
                          }
                        }}
                        className="h-12 w-12 rounded-xl p-0"
                        style={{ borderColor: '#a8556f', color: '#a8556f', background: '#fdf2f4' }}
                        title="فتح في الخريطة"
                      >
                        <Globe className="w-5 h-5" />
                      </Button>
                    </div>
                    <p className="text-xs mt-1" style={{ color: '#9a8a90' }}>اضغط على زر الخريطة لمعاينة الموقع</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium" style={{ color: '#2d1f26' }}>وقت البداية</Label>
                    <Input 
                      type="time" 
                      value={eventForm.startTime} 
                      onChange={e => setEventForm(prev => ({ ...prev, startTime: e.target.value }))} 
                      className="mt-2 h-12 rounded-xl" 
                      style={{ borderColor: '#e8d8dc' }} 
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium" style={{ color: '#2d1f26' }}>وقت الانتهاء</Label>
                    <Input 
                      type="time" 
                      value={eventForm.endTime} 
                      onChange={e => setEventForm(prev => ({ ...prev, endTime: e.target.value }))} 
                      className="mt-2 h-12 rounded-xl" 
                      style={{ borderColor: '#e8d8dc' }} 
                    />
                  </div>
                </div>
              </div>
            </AccordionCard>

            {/* Guest Section */}
            <AccordionCard 
              title="ضيف اللقاء" 
              icon={User} 
              iconBg="#fdf2f4" 
              iconColor="#a8556f"
            >
              <div className="space-y-4 pt-4">
                <div className="flex justify-center">
                  <GuestImageUpload 
                    value={eventForm.guestImage} 
                    onChange={v => setEventForm(prev => ({ ...prev, guestImage: v }))} 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium" style={{ color: '#2d1f26' }}>اسم الضيف</Label>
                    <Input 
                      value={eventForm.guestName} 
                      onChange={e => setEventForm(prev => ({ ...prev, guestName: e.target.value }))} 
                      className="mt-2 h-12 rounded-xl" 
                      style={{ borderColor: '#e8d8dc' }} 
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium" style={{ color: '#2d1f26' }}>الجهة</Label>
                    <Input 
                      value={eventForm.guestOrganization} 
                      onChange={e => setEventForm(prev => ({ ...prev, guestOrganization: e.target.value }))} 
                      className="mt-2 h-12 rounded-xl" 
                      style={{ borderColor: '#e8d8dc' }} 
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium" style={{ color: '#2d1f26' }}>المنصب</Label>
                  <Input 
                    value={eventForm.guestPosition} 
                    onChange={e => setEventForm(prev => ({ ...prev, guestPosition: e.target.value }))} 
                    className="mt-2 h-12 rounded-xl" 
                    style={{ borderColor: '#e8d8dc' }} 
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium" style={{ color: '#2d1f26' }}>حسابات التواصل الاجتماعي</Label>
                  <div className="grid grid-cols-4 gap-4 mt-2">
                    <Input 
                      value={eventForm.guestTwitter} 
                      onChange={e => setEventForm(prev => ({ ...prev, guestTwitter: e.target.value }))} 
                      placeholder="تويتر X" 
                      className="h-12 rounded-xl" 
                      style={{ borderColor: '#e8d8dc' }} 
                    />
                    <Input 
                      value={eventForm.guestInstagram} 
                      onChange={e => setEventForm(prev => ({ ...prev, guestInstagram: e.target.value }))} 
                      placeholder="انستغرام" 
                      className="h-12 rounded-xl" 
                      style={{ borderColor: '#e8d8dc' }} 
                    />
                    <Input 
                      value={eventForm.guestLinkedIn} 
                      onChange={e => setEventForm(prev => ({ ...prev, guestLinkedIn: e.target.value }))} 
                      placeholder="لينكد إن" 
                      className="h-12 rounded-xl" 
                      style={{ borderColor: '#e8d8dc' }} 
                    />
                    <Input 
                      value={eventForm.guestSnapchat} 
                      onChange={e => setEventForm(prev => ({ ...prev, guestSnapchat: e.target.value }))} 
                      placeholder="سناب شات" 
                      className="h-12 rounded-xl" 
                      style={{ borderColor: '#e8d8dc' }} 
                    />
                  </div>
                </div>
              </div>
            </AccordionCard>

            {/* Registration Settings */}
            <AccordionCard 
              title="إعدادات التسجيل" 
              icon={Settings} 
              iconBg="#e0f0f4" 
              iconColor="#1a6b8a"
            >
              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium" style={{ color: '#2d1f26' }}>موعد إغلاق التسجيل</Label>
                    <Input 
                      type="datetime-local" 
                      value={eventForm.registrationDeadline} 
                      onChange={e => setEventForm(prev => ({ ...prev, registrationDeadline: e.target.value }))} 
                      className="mt-2 h-12 rounded-xl" 
                      style={{ borderColor: '#e8d8dc' }} 
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium" style={{ color: '#2d1f26' }}>نوع التسجيل *</Label>
                    <Select 
                      value={eventForm.registrationType} 
                      onValueChange={v => setEventForm(prev => ({ ...prev, registrationType: v }))}
                    >
                      <SelectTrigger className="mt-2 h-12 rounded-xl" style={{ borderColor: '#e8d8dc' }}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="registration">تسجيل</SelectItem>
                        <SelectItem value="invitation">دعوة</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium" style={{ color: '#2d1f26' }}>السعة القصوى *</Label>
                    <Input 
                      type="number" 
                      value={eventForm.capacity} 
                      onChange={e => setEventForm(prev => ({ ...prev, capacity: parseInt(e.target.value) || 0 }))} 
                      required 
                      className="mt-2 h-12 rounded-xl" 
                      style={{ borderColor: '#e8d8dc' }} 
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium" style={{ color: '#2d1f26' }}>الحد الأقصى للمرافقين</Label>
                    <Input 
                      type="number" 
                      value={eventForm.maxCompanions} 
                      onChange={e => setEventForm(prev => ({ ...prev, maxCompanions: parseInt(e.target.value) || 0 }))} 
                      className="mt-2 h-12 rounded-xl" 
                      style={{ borderColor: '#e8d8dc' }} 
                    />
                  </div>
                </div>
                
                {/* QR Code Toggle */}
                <div className="p-4 rounded-2xl border-2" style={{ background: '#fdf8f9', borderColor: '#e8d8dc' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: eventForm.sendQR ? '#a8556f' : '#e8d8dc' }}>
                      {eventForm.sendQR ? (
                        <Check className="w-5 h-5 text-white" />
                      ) : (
                        <X className="w-5 h-5" style={{ color: '#6b5a60' }} />
                      )}
                    </div>
                    <div>
                      <p className="font-bold" style={{ color: '#2d1f26' }}>إرسال QR Code للمدعوين</p>
                      <p className="text-sm" style={{ color: '#9a8a90' }}>إرسال رمز QR للمسجلين تلقائياً</p>
                    </div>
                  </div>
                  <div className="flex rounded-xl overflow-hidden border" style={{ borderColor: '#e8d8dc' }}>
                    <button
                      type="button"
                      onClick={() => setEventForm(prev => ({ ...prev, sendQR: true }))}
                      className="flex-1 py-3 px-4 font-medium transition-all flex items-center justify-center gap-2"
                      style={{ 
                        background: eventForm.sendQR ? '#a8556f' : 'white',
                        color: eventForm.sendQR ? 'white' : '#6b5a60'
                      }}
                    >
                      <Check className="w-5 h-5" />
                      مفعّل
                    </button>
                    <button
                      type="button"
                      onClick={() => setEventForm(prev => ({ ...prev, sendQR: false }))}
                      className="flex-1 py-3 px-4 font-medium transition-all flex items-center justify-center gap-2"
                      style={{ 
                        background: !eventForm.sendQR ? '#6b5a60' : 'white',
                        color: !eventForm.sendQR ? 'white' : '#6b5a60'
                      }}
                    >
                      <X className="w-5 h-5" />
                      ملغي
                    </button>
                  </div>
                </div>
              </div>
            </AccordionCard>

            {/* Visibility Settings */}
            <AccordionCard 
              title="إعدادات العرض للزوار" 
              icon={Eye} 
              iconBg="#e0f0e4" 
              iconColor="#2d6b3d"
            >
              <div className="grid grid-cols-2 gap-4 pt-4">
                {[
                  { key: 'showCountdown', label: 'العد التنازلي', desc: 'عرض العد التنازلي لبداية اللقاء' },
                  { key: 'showRegistrantCount', label: 'عدد المسجلين', desc: 'عرض عدد المسجلين في اللقاء' },
                  { key: 'showGuestProfile', label: 'ملف الضيف', desc: 'عرض معلومات ضيف اللقاء' },
                  { key: 'showHospitalityPreference', label: 'الرغبة في الضيافة', desc: 'عرض خيار الرغبة في الضيافة' },
                ].map(item => {
                  const isEnabled = eventForm[item.key as keyof typeof eventForm] as boolean
                  return (
                    <div key={item.key} className="p-4 rounded-2xl border-2" style={{ background: '#fdf8f9', borderColor: '#e8d8dc' }}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: isEnabled ? '#2d6b3d' : '#e8d8dc' }}>
                          {isEnabled ? (
                            <Check className="w-4 h-4 text-white" />
                          ) : (
                            <X className="w-4 h-4" style={{ color: '#6b5a60' }} />
                          )}
                        </div>
                        <div>
                          <p className="font-medium" style={{ color: '#2d1f26' }}>{item.label}</p>
                          <p className="text-xs" style={{ color: '#9a8a90' }}>{item.desc}</p>
                        </div>
                      </div>
                      <div className="flex rounded-xl overflow-hidden border" style={{ borderColor: '#e8d8dc' }}>
                        <button
                          type="button"
                          onClick={() => setEventForm(prev => ({ ...prev, [item.key]: true }))}
                          className="flex-1 py-2.5 px-3 text-sm font-medium transition-all flex items-center justify-center gap-1.5"
                          style={{ 
                            background: isEnabled ? '#a8556f' : 'white',
                            color: isEnabled ? 'white' : '#6b5a60'
                          }}
                        >
                          <Check className="w-4 h-4" />
                          مفعّل
                        </button>
                        <button
                          type="button"
                          onClick={() => setEventForm(prev => ({ ...prev, [item.key]: false }))}
                          className="flex-1 py-2.5 px-3 text-sm font-medium transition-all flex items-center justify-center gap-1.5"
                          style={{ 
                            background: !isEnabled ? '#6b5a60' : 'white',
                            color: !isEnabled ? 'white' : '#6b5a60'
                          }}
                        >
                          <X className="w-4 h-4" />
                          ملغي
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </AccordionCard>

            {/* Valet Service - One Card */}
            <AccordionCard 
              title="خدمة الفالية" 
              icon={MapPin} 
              iconBg="#e8f4fd" 
              iconColor="#1e6bb8"
            >
              <div className="space-y-4 pt-4">
                {/* Toggle + Fields in one section */}
                <div className="p-4 rounded-2xl border-2" style={{ background: '#fdf8f9', borderColor: '#e8d8dc' }}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: eventForm.valetServiceEnabled ? '#1e6bb8' : '#e8d8dc' }}>
                        {eventForm.valetServiceEnabled ? (
                          <Check className="w-5 h-5 text-white" />
                        ) : (
                          <X className="w-5 h-5" style={{ color: '#6b5a60' }} />
                        )}
                      </div>
                      <div>
                        <p className="font-bold" style={{ color: '#2d1f26' }}>تفعيل خدمة الفالية</p>
                        <p className="text-sm" style={{ color: '#9a8a90' }}>توفير خدمة صف السيارات للضيوف</p>
                      </div>
                    </div>
                    <div className="flex rounded-xl overflow-hidden border" style={{ borderColor: '#e8d8dc' }}>
                      <button
                        type="button"
                        onClick={() => setEventForm(prev => ({ ...prev, valetServiceEnabled: true }))}
                        className="py-2 px-4 font-medium transition-all flex items-center justify-center gap-2"
                        style={{ 
                          background: eventForm.valetServiceEnabled ? '#1e6bb8' : 'white',
                          color: eventForm.valetServiceEnabled ? 'white' : '#6b5a60'
                        }}
                      >
                        <Check className="w-4 h-4" />
                        مفعّل
                      </button>
                      <button
                        type="button"
                        onClick={() => setEventForm(prev => ({ ...prev, valetServiceEnabled: false }))}
                        className="py-2 px-4 font-medium transition-all flex items-center justify-center gap-2"
                        style={{ 
                          background: !eventForm.valetServiceEnabled ? '#6b5a60' : 'white',
                          color: !eventForm.valetServiceEnabled ? 'white' : '#6b5a60'
                        }}
                      >
                        <X className="w-4 h-4" />
                        ملغي
                      </button>
                    </div>
                  </div>
                  
                  {/* Parking Fields - shown when enabled */}
                  {eventForm.valetServiceEnabled && (
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t" style={{ borderColor: '#e8d8dc' }}>
                      <div>
                        <Label className="text-sm font-medium mb-2 block" style={{ color: '#2d1f26' }}>سعة مواقف السيارات</Label>
                        <Input 
                          type="number"
                          value={eventForm.parkingCapacity || ''} 
                          onChange={e => setEventForm(prev => ({ ...prev, parkingCapacity: parseInt(e.target.value) || 0 }))} 
                          placeholder="عدد المواقف"
                          className="h-11 rounded-xl" 
                          style={{ borderColor: '#e8d8dc' }} 
                        />
                        <p className="text-xs mt-1" style={{ color: '#9a8a90' }}>الحد الأقصى لعدد السيارات</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium mb-2 block" style={{ color: '#2d1f26' }}>وقت إحضار السيارة</Label>
                        <Input 
                          type="text"
                          value={eventForm.carRetrievalTime || ''} 
                          onChange={e => setEventForm(prev => ({ ...prev, carRetrievalTime: e.target.value }))} 
                          placeholder="مثال: 10 دقائق"
                          className="h-11 rounded-xl" 
                          style={{ borderColor: '#e8d8dc' }} 
                        />
                        <p className="text-xs mt-1" style={{ color: '#9a8a90' }}>متوسط الوقت المتوقع</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </AccordionCard>

            {/* Invitation Settings */}
            <AccordionCard 
              title="إعدادات الدعوة" 
              icon={Mail} 
              iconBg="#fdf2f4" 
              iconColor="#a8556f"
            >
              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* WhatsApp */}
                  <div className="p-4 rounded-2xl border-2" style={{ background: '#fdf8f9', borderColor: '#e8d8dc' }}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#d4edda' }}>
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#3a7d44">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium" style={{ color: '#2d1f26' }}>واتساب</p>
                        <p className="text-xs" style={{ color: '#9a8a90' }}>إرسال عبر واتساب</p>
                      </div>
                    </div>
                    <div className="flex rounded-xl overflow-hidden border" style={{ borderColor: '#e8d8dc' }}>
                      <button 
                        type="button" 
                        onClick={() => setWhatsappEnabled(true)}
                        className="flex-1 py-2.5 px-3 text-sm font-medium flex items-center justify-center gap-1.5" 
                        style={{ background: whatsappEnabled ? '#d4edda' : 'white', color: whatsappEnabled ? '#3a7d44' : '#6b5a60' }}
                      >
                        <Check className="w-4 h-4" />مفعّل
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setWhatsappEnabled(false)}
                        className="flex-1 py-2.5 px-3 text-sm font-medium flex items-center justify-center gap-1.5" 
                        style={{ background: !whatsappEnabled ? '#6b5a60' : 'white', color: !whatsappEnabled ? 'white' : '#6b5a60' }}
                      >
                        <X className="w-4 h-4" />ملغي
                      </button>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="p-4 rounded-2xl border-2" style={{ background: '#fdf8f9', borderColor: '#e8d8dc' }}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: emailEnabled ? '#a8556f' : '#e8d8dc' }}>
                        <Mail className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium" style={{ color: '#2d1f26' }}>البريد الإلكتروني</p>
                        <p className="text-xs" style={{ color: '#9a8a90' }}>إرسال عبر الإيميل</p>
                      </div>
                    </div>
                    <div className="flex rounded-xl overflow-hidden border" style={{ borderColor: '#e8d8dc' }}>
                      <button 
                        type="button" 
                        onClick={() => setEmailEnabled(true)}
                        className="flex-1 py-2.5 px-3 text-sm font-medium flex items-center justify-center gap-1.5" 
                        style={{ background: emailEnabled ? '#a8556f' : 'white', color: emailEnabled ? 'white' : '#6b5a60' }}
                      >
                        <Check className="w-4 h-4" />مفعّل
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setEmailEnabled(false)}
                        className="flex-1 py-2.5 px-3 text-sm font-medium flex items-center justify-center gap-1.5" 
                        style={{ background: !emailEnabled ? '#6b5a60' : 'white', color: !emailEnabled ? 'white' : '#6b5a60' }}
                      >
                        <X className="w-4 h-4" />ملغي
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </AccordionCard>

            {/* Sponsors Card */}
            <AccordionCard 
              title="رعاة اللقاء" 
              icon={Handshake} 
              iconBg="#fdf2f4" 
              iconColor="#c9a066"
            >
              <div className="space-y-4 pt-4">
                {approvedSponsors.length === 0 ? (
                  <div className="text-center py-8 rounded-2xl" style={{ background: '#fdf8f9' }}>
                    <Handshake className="w-12 h-12 mx-auto mb-3" style={{ color: '#e8d8dc' }} />
                    <p className="font-medium" style={{ color: '#6b5a60' }}>لا يوجد رعاة معتمدين</p>
                    <p className="text-sm mt-1" style={{ color: '#9a8a90' }}>يمكنك إضافة رعاة من قسم الرعاة</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {approvedSponsors.map(sponsor => {
                      const isSelected = selectedSponsors.some(s => s.sponsorId === sponsor.id)
                      const selectedSponsor = selectedSponsors.find(s => s.sponsorId === sponsor.id)
                      
                      return (
                        <div 
                          key={sponsor.id} 
                          className="p-4 rounded-2xl border-2 transition-all"
                          style={{ 
                            background: isSelected ? '#fdf2f4' : '#fdf8f9', 
                            borderColor: isSelected ? '#a8556f' : '#e8d8dc' 
                          }}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              {sponsor.logoUrl ? (
                                <img 
                                  src={sponsor.logoUrl} 
                                  alt={sponsor.companyName} 
                                  className="w-12 h-12 rounded-md object-contain" 
                                  style={{ background: "#fdf8f9" }} 
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-md flex items-center justify-center" style={{ background: '#e8d8dc' }}>
                                  <Building2 className="w-6 h-6" style={{ color: '#6b5a60' }} />
                                </div>
                              )}
                              <div>
                                <p className="font-bold" style={{ color: '#2d1f26' }}>{sponsor.companyName}</p>
                                <p className="text-sm" style={{ color: '#9a8a90' }}>{sponsor.contactName}</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedSponsors(prev => prev.filter(s => s.sponsorId !== sponsor.id))
                                } else {
                                  setSelectedSponsors(prev => [...prev, { sponsorId: sponsor.id, sponsorName: sponsor.companyName, tasks: '' }])
                                }
                              }}
                              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
                              style={{ 
                                background: isSelected ? '#a8556f' : '#e8d8dc',
                                color: isSelected ? 'white' : '#6b5a60'
                              }}
                            >
                              {isSelected ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                            </button>
                          </div>
                          
                          {isSelected && (
                            <div className="mt-3 pt-3 border-t" style={{ borderColor: '#e8d8dc' }}>
                              <Label className="text-sm font-medium mb-2 block" style={{ color: '#2d1f26' }}>مهام الرعاية</Label>
                              <Textarea 
                                value={selectedSponsor?.tasks || ''}
                                onChange={e => {
                                  setSelectedSponsors(prev => 
                                    prev.map(s => s.sponsorId === sponsor.id ? { ...s, tasks: e.target.value } : s)
                                  )
                                }}
                                placeholder="مثال: تغطية تكاليف الضيافة، طباعة البطاقات..."
                                rows={2}
                                className="resize-none rounded-xl"
                                style={{ borderColor: '#e8d8dc' }}
                              />
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
                
                {selectedSponsors.length > 0 && (
                  <div className="mt-4 p-4 rounded-2xl" style={{ background: '#fdf2f4' }}>
                    <p className="text-sm font-medium mb-2" style={{ color: '#a8556f' }}>
                      تم اختيار {selectedSponsors.length} راعي
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedSponsors.map(s => (
                        <Badge key={s.sponsorId} className="rounded-full" style={{ background: '#e8d8dc', color: '#6b5a60' }}>
                          {s.sponsorName}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </AccordionCard>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-6 justify-center">
              <Button 
                type="submit" 
                className="flex-1 rounded-full py-6 text-lg" 
                style={{ background: '#a8556f', color: 'white' }}
                disabled={loading}
              >
                {loading ? 'جاري الإنشاء...' : 'إنشاء اللقاء'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.push('/admin')} 
                className="flex-1 rounded-full py-6 text-lg"
                disabled={loading}
              >
                إلغاء
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
