'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { QRCodeSVG } from 'qrcode.react'
import ReactCrop, { Crop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { 
  Calendar, Users, Handshake, Plus, Check, X, LogOut, Crown, Bell,
  UserCheck, Settings, Trash2, Edit, Download,
  Building2, Mail, Phone, Globe, Eye, User, Camera, MapPin,
  ChevronDown, ChevronUp, Globe2, Lock, Clock, Play, Square, CheckCircle2,
  Crop as CropIcon, ZoomIn, RotateCw, Upload, Instagram, Twitter, Youtube, Search, Filter, Linkedin, Archive, Car, Briefcase,
  CheckCheck, UserPlus, ArrowRight
} from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import SiteSettingsTab from '@/components/admin/SiteSettingsTab'
import { toEnglishNumbers } from '@/lib/utils'

interface Event {
  id: string
  title: string
  description: string | null
  date: string
  startTime: string | null
  endTime: string | null
  location: string | null
  imageUrl: string | null
  status: string
  eventType: string
  isPublished: boolean
  registrationDeadline: string | null
  guestName: string | null
  guestImage: string | null
  guestOrganization: string | null
  guestPosition: string | null
  guestTwitter: string | null
  guestInstagram: string | null
  guestLinkedIn: string | null
  guestSnapchat: string | null
  capacity: number
  maxCompanions: number
  registrationType: string
  sendQR: boolean
  showCountdown: boolean
  showRegistrantCount: boolean
  showGuestProfile: boolean
  showHospitalityPreference: boolean
  valetServiceEnabled: boolean
  parkingCapacity: number | null
  carRetrievalTime: string | null
  _count?: { registrations: number }
}

interface Registration {
  id: string
  eventId: string
  memberId?: string | null
  name: string
  email: string
  phone: string | null
  companyName: string | null
  jobTitle: string | null
  gender: string | null
  imageUrl: string | null
  status: string
  createdAt: string
  event?: { title: string; date: string }
}

interface Member {
  id: string
  name: string
  email: string
  phone: string | null
  companyName: string | null
  jobTitle: string | null
  businessType: string | null
  gender: string | null
  imageUrl: string | null
  createdAt: string
  isRegistered?: boolean
  eventsList?: string | null
  eventsCount?: number
  _count?: { registrations: number }
}

interface SponsorRequest {
  id: string
  companyName: string
  contactName: string
  email: string
  phone: string
  sponsorshipType: string
  amount: number | null
  status: string
  description: string | null
  logoUrl: string | null
  websiteUrl: string | null
  profileUrl: string | null
  sponsorType: string | null
  createdAt: string
  instagram?: string | null
  twitter?: string | null
  snapchat?: string | null
  tiktok?: string | null
  linkedin?: string | null
  sponsorshipsCount?: number
  lastSponsorshipDate?: string | null
  eventSponsors?: Array<{
    id: string
    createdAt: string
    event: { title: string; date: string }
  }>
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

// Event Image Upload Component - With Cropping
function ImageUpload({ 
  label, 
  value, 
  onChange,
  previewUrl 
}: { 
  label: string
  value: string
  onChange: (value: string) => void
  previewUrl?: string
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
    
    // التحقق من نوع الملف
    if (!file.type.startsWith('image/')) {
      toast.error('يرجى اختيار ملف صورة صالح')
      return
    }
    
    // التحقق من حجم الملف (أقصى 10 ميجابايت)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('حجم الصورة كبير جداً. الحد الأقصى 10 ميجابايت')
      return
    }
    
    // Read the file and show crop modal
    const reader = new FileReader()
    reader.onload = () => {
      setImageToCrop(reader.result as string)
      setShowCropModal(true)
      // Reset crop
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

    // رسم خلفية بلون الدعوة أولاً
    ctx.fillStyle = '#fdf8f9'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // ثم رسم الصورة فوق الخلفية
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
            <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full text-xs font-medium" style={{ background: 'rgba(168, 85, 111, 0.9)', color: 'white' }}>
              صورة اللقاء
            </div>
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
      {value && <Input type="hidden" value={value} />}
      
      {/* Crop Modal */}
      {showCropModal && imageToCrop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(168, 85, 111, 0.3)' }} onClick={(e) => e.stopPropagation()}>
          <div className="rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-auto" style={{ background: 'linear-gradient(135deg, #fdf8f9 0%, #fff 100%)' }} dir="rtl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold" style={{ color: '#2d1f26' }}>اقتصاص صورة اللقاء</h3>
              <button type="button" onClick={() => { setShowCropModal(false); setImageToCrop(null); setCropError(null); }}>
                <X className="w-6 h-6" style={{ color: '#6b5a60' }} />
              </button>
            </div>
            
            {/* Error Message */}
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

// Guest Image Upload Component - With Cropping
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
    
    // التحقق من نوع الملف
    if (!file.type.startsWith('image/')) {
      toast.error('يرجى اختيار ملف صورة صالح')
      return
    }
    
    // التحقق من حجم الملف (أقصى 10 ميجابايت)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('حجم الصورة كبير جداً. الحد الأقصى 10 ميجابايت')
      return
    }
    
    // Read the file and show crop modal
    const reader = new FileReader()
    reader.onload = () => {
      setImageToCrop(reader.result as string)
      setShowCropModal(true)
      // Reset crop
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

    // رسم خلفية بلون الدعوة أولاً
    ctx.fillStyle = '#fdf8f9'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // ثم رسم الصورة فوق الخلفية
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
      <label 
        className="relative w-40 h-40 rounded-2xl border-2 border-dashed cursor-pointer overflow-hidden group flex items-center justify-center"
        style={{ borderColor: hasImage ? '#a8556f' : '#e8d8dc', background: '#fdf8f9' }}
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
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onChange(''); }}
              className="absolute -top-2 -left-2 w-6 h-6 rounded-full flex items-center justify-center shadow-md z-10"
              style={{ background: '#fce8e8', color: '#8a3a3a' }}
            >
              <X className="w-4 h-4" />
            </button>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            {/* Faceless woman avatar SVG */}
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
      </label>
      {value && <Input type="hidden" value={value} />}
      <p className="text-xs" style={{ color: '#9a8a90' }}>PNG, JPG, GIF, WebP (الحد الأقصى 10 ميجابايت)</p>
      
      {/* Crop Modal */}
      {showCropModal && imageToCrop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(168, 85, 111, 0.3)' }} onClick={(e) => e.stopPropagation()}>
          <div className="rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-auto" style={{ background: 'linear-gradient(135deg, #fdf8f9 0%, #fff 100%)' }} dir="rtl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold" style={{ color: '#2d1f26' }}>اقتصاص صورة الضيف</h3>
              <button type="button" onClick={() => { setShowCropModal(false); setImageToCrop(null); setCropError(null); }}>
                <X className="w-6 h-6" style={{ color: '#6b5a60' }} />
              </button>
            </div>
            
            {/* Error Message */}
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

// Sponsor Logo Upload Component - With Cropping
function SponsorLogoUpload({ 
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
    
    // التحقق من نوع الملف
    if (!file.type.startsWith('image/')) {
      toast.error('يرجى اختيار ملف صورة صالح')
      return
    }
    
    // التحقق من حجم الملف (أقصى 10 ميجابايت)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('حجم الصورة كبير جداً. الحد الأقصى 10 ميجابايت')
      return
    }
    
    // Read the file and show crop modal
    const reader = new FileReader()
    reader.onload = () => {
      setImageToCrop(reader.result as string)
      setShowCropModal(true)
      // Reset crop
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

    // رسم خلفية بلون الدعوة أولاً
    ctx.fillStyle = '#fdf8f9'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // ثم رسم الصورة فوق الخلفية
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
      formData.append('file', croppedBlob, 'cropped-sponsor-logo.png')
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        const data = await response.json()
        onChange(data.url)
        toast.success('تم رفع الشعار بنجاح')
        setShowCropModal(false)
        setImageToCrop(null)
        setCompletedCrop(null)
      } else {
        toast.error('حدث خطأ أثناء رفع الشعار')
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
      <Label className="text-sm font-medium" style={{ color: '#2d1f26' }}>شعار الراعي</Label>
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
              alt="شعار الراعي" 
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
            {/* Company/Building icon */}
            <svg viewBox="0 0 64 64" className="w-20 h-20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="12" y="16" width="40" height="38" rx="4" fill="#f5e6ea" stroke="#d8c0c8" strokeWidth="2"/>
              <rect x="22" y="38" width="8" height="16" fill="#c9a0b0"/>
              <rect x="36" y="24" width="6" height="6" rx="1" fill="#c9a0b0"/>
              <rect x="46" y="24" width="6" height="6" rx="1" fill="#c9a0b0"/>
              <rect x="36" y="34" width="6" height="6" rx="1" fill="#c9a0b0"/>
              <rect x="46" y="34" width="6" height="6" rx="1" fill="#c9a0b0"/>
              <rect x="18" y="24" width="6" height="6" rx="1" fill="#c9a0b0"/>
              <rect x="18" y="34" width="6" height="6" rx="1" fill="#c9a0b0"/>
            </svg>
            {uploading ? (
              <span className="text-xs" style={{ color: '#9a8a90' }}>جاري الرفع...</span>
            ) : (
              <span className="text-xs" style={{ color: '#9a8a90' }}>اضغط للرفع</span>
            )}
          </div>
        )}
      </div>
      {value && <Input type="hidden" value={value} />}
      
      {/* Crop Modal */}
      {showCropModal && imageToCrop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(168, 85, 111, 0.3)' }} onClick={(e) => e.stopPropagation()}>
          <div className="rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-auto" style={{ background: 'linear-gradient(135deg, #fdf8f9 0%, #fff 100%)' }} dir="rtl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold" style={{ color: '#2d1f26' }}>اقتصاص شعار الراعي</h3>
              <button type="button" onClick={() => { setShowCropModal(false); setImageToCrop(null); setCropError(null); }}>
                <X className="w-6 h-6" style={{ color: '#6b5a60' }} />
              </button>
            </div>
            
            {/* Error Message */}
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

export default function AdminDashboard() {
  const router = useRouter()
  const [currentTab, setCurrentTab] = useState('overview')

  // قراءة التبويب من URL عند التحميل
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const tab = params.get('tab') || 'overview'
      setCurrentTab(tab)
    }
  }, [])

  const handleTabChange = (value: string) => {
    setCurrentTab(value)
    // إخفاء زر الرجوع ومسح الفلاتر عند الانتقال لأي تبويب
    setCameFromOverview(false)
    setEventStatusFilter(null)
    setEventPublishFilter(null)
    setMemberFilter('all')
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      params.set('tab', value)
      window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`)
    }
  }

  const [events, setEvents] = useState<Event[]>([])
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [sponsorRequests, setSponsorRequests] = useState<SponsorRequest[]>([])
  const [sponsorEvents, setSponsorEvents] = useState<{id: string, title: string, date: string, tasks: string | null}[]>([])
  const [loading, setLoading] = useState(true)
  
  // الإشعارات
  const [notifications, setNotifications] = useState<Array<{
    id: string
    type: string
    title: string
    message: string
    eventId: string | null
    isRead: boolean
    isDismissed: boolean
    createdAt: string
    Event?: { id: string; title: string; date: Date } | null
  }>>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [endedEventAlert, setEndedEventAlert] = useState<{
    show: boolean
    eventId: string | null
    eventTitle: string
  }>({ show: false, eventId: null, eventTitle: '' })

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
  const [createEventOpen, setCreateEventOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [viewingEventRegistrations, setViewingEventRegistrations] = useState<Event | null>(null)
  const [viewingSponsor, setViewingSponsor] = useState<SponsorRequest | null>(null)
  const [whatsappEnabled, setWhatsappEnabled] = useState(true)
  const [emailEnabled, setEmailEnabled] = useState(true)
  const [selectedSponsors, setSelectedSponsors] = useState<EventSponsorItem[]>([])
  const [showAddSponsorModal, setShowAddSponsorModal] = useState(false)
  const [sponsorForm, setSponsorForm] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    sponsorshipType: 'financial',
    sponsorType: 'company',
    logoUrl: '',
    websiteUrl: '',
    amount: 0,
    description: '',
  })
  const [memberSearch, setMemberSearch] = useState('')
  const [sponsorSearch, setSponsorSearch] = useState('')
  const [sponsorFilter, setSponsorFilter] = useState<'all' | 'active' | 'disabled' | 'archived'>('all')
  const [sponsorStatusFilter, setSponsorStatusFilter] = useState<string>('all')
  const [showAddMemberModal, setShowAddMemberModal] = useState(false)
  const [memberForm, setMemberForm] = useState({
    name: '',
    email: '',
    phone: '',
    companyName: '',
    jobTitle: '',
    interests: '',
    password: '',
  })
  const [editingMember, setEditingMember] = useState<Member | null>(null)
  const [editMemberForm, setEditMemberForm] = useState({
    name: '',
    email: '',
    phone: '',
    companyName: '',
    jobTitle: '',
    gender: '',
    password: '',
  })
  const [showEditSponsorModal, setShowEditSponsorModal] = useState(false)
  const [showAddToEventModal, setShowAddToEventModal] = useState(false)
  const [showLinkToMemberModal, setShowLinkToMemberModal] = useState(false)
  const [registrationGenderFilter, setRegistrationGenderFilter] = useState<'all' | 'male' | 'female'>('all')
  const [showAddGuestModal, setShowAddGuestModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [selectedRegistrationsForCancel, setSelectedRegistrationsForCancel] = useState<string[]>([])
  const [showImportModal, setShowImportModal] = useState(false)
  const [importMode, setImportMode] = useState<'file' | 'url' | 'text'>('file')
  const [guestForms, setGuestForms] = useState<Array<{
    name: string
    email: string
    phone: string
    companyName: string
    jobTitle: string
    gender: string
  }>>([{ name: '', email: '', phone: '', companyName: '', jobTitle: '', gender: 'female' }])
  const [importText, setImportText] = useState('')
  const [importUrl, setImportUrl] = useState('')
  const [importLoading, setImportLoading] = useState(false)
  const [registrationSearch, setRegistrationSearch] = useState('')
  const [editSponsorForm, setEditSponsorForm] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    sponsorshipType: 'financial',
    sponsorType: 'company',
    logoUrl: '',
    websiteUrl: '',
    profileUrl: '',
    amount: 0,
    description: '',
    instagram: '',
    twitter: '',
    snapchat: '',
    tiktok: '',
    linkedin: '',
    status: 'new',
  })
  const [sponsorNotesList, setSponsorNotesList] = useState<Array<{id: string, content: string, authorName: string, createdAt: string}>>([])
  const [newNoteContent, setNewNoteContent] = useState('')
  const [eventSearch, setEventSearch] = useState('')
  const [memberLinkSearch, setMemberLinkSearch] = useState('')
  const [selectedEventForSponsor, setSelectedEventForSponsor] = useState<string | null>(null)
  const [sponsorTasks, setSponsorTasks] = useState('')
  const [showDeleteEventDialog, setShowDeleteEventDialog] = useState<string | null>(null)
  
  // Event filters for navigation
  const [eventStatusFilter, setEventStatusFilter] = useState<string | null>(null)
  const [eventPublishFilter, setEventPublishFilter] = useState<string | null>(null)
  
  // حالة تتبع القدوم من نظرة عامة
  const [cameFromOverview, setCameFromOverview] = useState(false)
  
  // فلترة الأعضاء
  const [memberFilter, setMemberFilter] = useState<'all' | 'registered' | 'visitors' | 'female' | 'male'>('all')
  
  // Navigate to events with filter
  const navigateToEventsWithFilter = (filterType: 'status' | 'publish', value: string) => {
    setCameFromOverview(true) // تعيين الحالة عند القدوم من نظرة عامة
    if (filterType === 'status') {
      // إذا كانت القيمة 'all'، امسح الفلتر
      setEventStatusFilter(value === 'all' ? null : value)
      setEventPublishFilter(null)
    } else {
      // إذا كانت القيمة 'all'، امسح الفلتر
      setEventPublishFilter(value === 'all' ? null : value)
      setEventStatusFilter(null)
    }
    setCurrentTab('events')
  }
  
  // Navigate to members with filter
  const navigateToMembersWithFilter = (filter: 'all' | 'registered' | 'visitors' | 'female' | 'male') => {
    setCameFromOverview(true)
    setMemberFilter(filter)
    setCurrentTab('members')
  }

  // Admin permissions
  const [adminPermissions, setAdminPermissions] = useState<{
    events: boolean
    members: boolean
    registrations: boolean
    sponsors: boolean
    settings: boolean
    export: boolean
  } | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)

  // Export options
  const [showExportModal, setShowExportModal] = useState<'members' | 'sponsors' | null>(null)
  const [memberExportFields, setMemberExportFields] = useState({
    name: true,
    companyName: true,
    jobTitle: true,
    phone: true,
    email: true,
  })
  const [sponsorExportFields, setSponsorExportFields] = useState({
    companyName: true,
    contactName: true,
    phone: true,
    email: true,
  })

  // Email settings
  const [emailSettings, setEmailSettings] = useState({
    headerLogo: '',
    headerBackgroundColor: '#fdf8f9',
    headerTextColor: '#2d1f26',
    footerText: 'ملتقى ريادة - تجمع سيدات الأعمال',
    footerBackgroundColor: '#fdf8f9',
    footerTextColor: '#6b5a60',
    registrationSubject: 'تأكيد التسجيل في لقاء {eventName}',
    registrationBody: 'مرحباً {name}،\n\nتم تسجيلك بنجاح في لقاء "{eventName}" الذي سيقام بتاريخ {date} في {location}.\n\nنتطلع للقائك!',
    confirmationSubject: 'تأكيد الحضور - {eventName}',
    confirmationBody: 'مرحباً {name}،\n\nنؤكد حضورك في لقاء "{eventName}".\n\nالتاريخ: {date}\nالوقت: {time}\nالمكان: {location}\n\nنرحب بك!',
    reminderSubject: 'تذكير: لقاء {eventName} غداً',
    reminderBody: 'مرحباً {name}،\n\nنذكرك بلقاء "{eventName}" الذي سيقام غداً.\n\nالتاريخ: {date}\nالوقت: {time}\nالمكان: {location}\n\nننتظرك!',
  })
  const [emailSettingsLoading, setEmailSettingsLoading] = useState(false)

  // دمج الأعضاء والمسجلين في قائمة واحدة
  // الأعضاء الذين لديهم حساب + المسجلين في اللقاءات بدون حساب (كلهم أعضاء)
  const memberEmails = new Set(members.map(m => m.email.toLowerCase()))
  const registrantsWithoutAccount = registrations.filter(reg => 
    !memberEmails.has(reg.email.toLowerCase()) && reg.status !== 'cancelled'
  )

  // تجميع اللقاءات لكل عضو
  const memberEventsMap = new Map<string, string[]>()
  registrations.forEach(reg => {
    if (reg.status !== 'cancelled' && reg.event?.title) {
      const email = reg.email.toLowerCase()
      const existing = memberEventsMap.get(email)
      if (existing) {
        if (!existing.includes(reg.event.title)) {
          memberEventsMap.set(email, [...existing, reg.event.title])
        }
      } else {
        memberEventsMap.set(email, [reg.event.title])
      }
    }
  })

  // قائمة موحدة من جميع الأعضاء
  const allMembersList = [
    ...members.map(m => ({
      ...m,
      isRegistered: true,
      eventsList: memberEventsMap.get(m.email.toLowerCase())?.join('، ') || null,
      eventsCount: memberEventsMap.get(m.email.toLowerCase())?.length || 0
    })),
    ...registrantsWithoutAccount.map(reg => ({
      id: reg.id,
      name: reg.name,
      email: reg.email,
      phone: reg.phone,
      companyName: reg.companyName,
      jobTitle: reg.jobTitle,
      businessType: null,
      gender: reg.gender || null,
      imageUrl: reg.imageUrl || null,
      createdAt: reg.createdAt,
      isRegistered: false,
      eventsList: reg.event?.title || null,
      eventsCount: 1
    }))
  ]

  // Filtered members
  const filteredMembers = allMembersList.filter(member => {
    const matchesSearch = memberSearch === '' || 
      member.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
      (member.companyName?.toLowerCase().includes(memberSearch.toLowerCase())) ||
      (member.email.toLowerCase().includes(memberSearch.toLowerCase()))
    
    // فلترة حسب النوع المحدد
    let matchesFilter = true
    if (memberFilter === 'female') {
      matchesFilter = member.gender === 'female'
    } else if (memberFilter === 'male') {
      matchesFilter = member.gender === 'male'
    } else if (memberFilter === 'registered') {
      matchesFilter = member.isRegistered === true
    } else if (memberFilter === 'visitors') {
      matchesFilter = member.isRegistered === false
    }
    
    return matchesSearch && matchesFilter
  })

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // التحقق من وجود البريد الإلكتروني وكلمة المرور
    if (!memberForm.email || !memberForm.password) {
      toast.error('البريد الإلكتروني وكلمة المرور مطلوبان')
      return
    }
    
    // التحقق من وجود لقاءات
    if (events.length === 0) {
      toast.error('لا توجد لقاءات. يرجى إنشاء لقاء أولاً')
      return
    }
    
    try {
      const response = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...memberForm,
          eventId: events[0].id, // Use first event as default
          status: 'confirmed',
          createMemberWithPassword: true,
        })
      })
      if (response.ok) {
        toast.success('تم إضافة العضو بنجاح')
        setShowAddMemberModal(false)
        setMemberForm({
          name: '',
          email: '',
          phone: '',
          companyName: '',
          jobTitle: '',
          interests: '',
          password: '',
        })
        fetchData()
      } else {
        const data = await response.json()
        toast.error(data.error || 'حدث خطأ أثناء إضافة العضو')
      }
    } catch {
      toast.error('حدث خطأ أثناء إضافة العضو')
    }
  }

  // فتح نافذة تعديل بيانات العضو
  const openEditMember = (member: Member) => {
    setEditingMember(member)
    setEditMemberForm({
      name: member.name,
      email: member.email,
      phone: member.phone || '',
      companyName: member.companyName || '',
      jobTitle: member.jobTitle || '',
      gender: member.gender || '',
      password: '',
    })
  }

  // تحديث بيانات العضو
  const handleUpdateMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingMember) return
    
    try {
      console.log('Updating member:', editingMember.id, 'isRegistered:', editingMember.isRegistered)
      
      // التحقق من نوع العضو (مسجل أو زائر)
      if (editingMember.isRegistered) {
        // عضو مسجل - تحديث عبر API members
        const updateData: Record<string, string | null | undefined> = {
          name: editMemberForm.name,
          email: editMemberForm.email,
          phone: editMemberForm.phone,
          companyName: editMemberForm.companyName,
          jobTitle: editMemberForm.jobTitle,
          gender: editMemberForm.gender,
        }
        // فقط أرسل كلمة المرور إذا كانت غير فارغة
        if (editMemberForm.password && editMemberForm.password.trim() !== '') {
          updateData.password = editMemberForm.password
        }
        
        const response = await fetch(`/api/members/${editingMember.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData)
        })
        
        console.log('Member API response:', response.status)
        
        if (response.ok) {
          toast.success('تم تحديث بيانات العضو بنجاح')
          setEditingMember(null)
          await fetchData()
          router.refresh()
        } else {
          const data = await response.json()
          toast.error(data.error || 'حدث خطأ أثناء تحديث البيانات')
        }
      } else {
        // زائر - تحديث عبر API registrations
        const response = await fetch(`/api/registrations/${editingMember.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: editMemberForm.name,
            email: editMemberForm.email,
            phone: editMemberForm.phone,
            companyName: editMemberForm.companyName,
            jobTitle: editMemberForm.jobTitle,
            gender: editMemberForm.gender
          })
        })
        
        console.log('Registration API response:', response.status)
        
        if (response.ok) {
          toast.success('تم تحديث بيانات العضو بنجاح')
          setEditingMember(null)
          await fetchData()
          router.refresh()
        } else {
          const data = await response.json()
          toast.error(data.error || 'حدث خطأ أثناء تحديث البيانات')
        }
      }
    } catch (error) {
      console.error('Update error:', error)
      toast.error('حدث خطأ أثناء تحديث البيانات')
    }
  }

  // حذف عضو
  const handleDeleteMember = async (member: Member) => {
    // تأكيد الحذف
    if (!confirm(`هل أنت متأكد من حذف العضو "${member.name}"؟`)) {
      return
    }

    try {
      // التحقق من نوع العضو (مسجل أو زائر)
      if (member.isRegistered) {
        // عضو مسجل - حذف عبر API members
        const response = await fetch(`/api/members/${member.id}`, {
          method: 'DELETE'
        })
        
        if (response.ok) {
          toast.success('تم حذف العضو بنجاح')
          await fetchData()
        } else {
          const data = await response.json()
          toast.error(data.error || 'حدث خطأ أثناء حذف العضو')
        }
      } else {
        // زائر - حذف عبر API registrations
        const response = await fetch(`/api/registrations/${member.id}`, {
          method: 'DELETE'
        })
        
        if (response.ok) {
          toast.success('تم حذف العضو بنجاح')
          await fetchData()
        } else {
          const data = await response.json()
          toast.error(data.error || 'حدث خطأ أثناء حذف العضو')
        }
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('حدث خطأ أثناء حذف العضو')
    }
  }

  // Filtered sponsors
  const filteredSponsors = sponsorRequests.filter(sponsor => {
    const matchesSearch = sponsorSearch === '' || 
      sponsor.companyName.toLowerCase().includes(sponsorSearch.toLowerCase()) ||
      sponsor.contactName.toLowerCase().includes(sponsorSearch.toLowerCase()) ||
      sponsor.phone.includes(sponsorSearch)
    
    // إخفاء المؤرشفين إلا إذا كان الفلتر على "أرشفة"
    const matchesFilter = sponsorFilter === 'all' 
      ? sponsor.status !== 'archived' // إخفاء المؤرشفين من "الكل"
      : sponsorFilter === 'active' 
        ? (sponsor.status !== 'cancelled' && sponsor.status !== 'rejected' && sponsor.status !== 'archived')
        : sponsorFilter === 'disabled'
          ? (sponsor.status === 'cancelled' || sponsor.status === 'rejected')
          : sponsorFilter === 'archived'
            ? sponsor.status === 'archived'
            : true
    
    const matchesStatus = sponsorStatusFilter === 'all' || sponsor.status === sponsorStatusFilter
    return matchesSearch && matchesFilter && matchesStatus
  })

  useEffect(() => {
    checkAdminPermissions()
    fetchData()
    fetchEmailSettings()
  }, [])

  const checkAdminPermissions = async () => {
    try {
      const response = await fetch('/api/admin/check')
      const data = await response.json()
      if (data.isAdmin && data.admin) {
        setIsAdmin(true)
        // إذا كان super_admin، أعطه جميع الصلاحيات
        if (data.admin.role === 'super_admin') {
          setIsSuperAdmin(true)
          setAdminPermissions({
            events: true,
            members: true,
            registrations: true,
            sponsors: true,
            settings: true,
            export: true
          })
        } else if (data.admin.permissions) {
          // إذا كان أدمن عادي، استخدم صلاحياته
          setAdminPermissions({
            events: data.admin.permissions.events ?? true,
            members: data.admin.permissions.members ?? true,
            registrations: data.admin.permissions.registrations ?? true,
            sponsors: data.admin.permissions.sponsors ?? true,
            settings: data.admin.permissions.settings ?? false,
            export: data.admin.permissions.export ?? false
          })
        } else {
          // صلاحيات افتراضية بدون تصدير
          setAdminPermissions({
            events: true,
            members: true,
            registrations: true,
            sponsors: true,
            settings: false,
            export: false
          })
        }
      }
    } catch (error) {
      console.error('Error checking admin permissions:', error)
    }
  }

  const fetchEmailSettings = async () => {
    try {
      const response = await fetch('/api/email-settings')
      if (response.ok) {
        const data = await response.json()
        if (data.settings) {
          setEmailSettings(prev => ({ ...prev, ...data.settings }))
        }
      }
    } catch (error) {
      console.error('Error fetching email settings:', error)
    }
  }

  useEffect(() => {
    if (viewingSponsor) {
      fetchSponsorNotes(viewingSponsor.id)
    }
  }, [viewingSponsor])

  const fetchData = async () => {
    try {
      // جلب البيانات بشكل مستقل لتجنب فشل الكل إذا فشل واحد
      const eventsRes = await fetch('/api/events?admin=true')
      const regsRes = await fetch('/api/registrations')
      const sponsorsRes = await fetch('/api/sponsors')
      const membersRes = await fetch('/api/members')
      const notificationsRes = await fetch('/api/notifications')
      
      const eventsData = await eventsRes.json()
      const regsData = await regsRes.json()
      const sponsorsData = await sponsorsRes.json()
      const membersData = await membersRes.json()
      const notificationsData = await notificationsRes.json()
      
      console.log('Members API response:', membersData)
      
      setEvents(eventsData.events || [])
      setRegistrations(regsData.registrations || [])
      setSponsorRequests(sponsorsData.sponsors || [])
      setMembers(membersData.members || [])
      setNotifications(notificationsData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSponsorEvents = async (sponsorId: string) => {
    try {
      const response = await fetch(`/api/sponsors/${sponsorId}/events`)
      if (response.ok) {
        const data = await response.json()
        setSponsorEvents(data.events || [])
      }
    } catch (error) {
      console.error('Error fetching sponsor events:', error)
      setSponsorEvents([])
    }
  }

  const fetchSponsorNotes = async (sponsorId: string) => {
    try {
      const response = await fetch(`/api/sponsors/${sponsorId}/notes`)
      if (response.ok) {
        const data = await response.json()
        setSponsorNotesList(data.notes || [])
      }
    } catch (error) {
      console.error('Error fetching sponsor notes:', error)
      setSponsorNotesList([])
    }
  }

  // إنشاء إشعارات للقاءات المنتهية
  const createEndedEventNotifications = async () => {
    const today = new Date(new Date().toDateString())
    
    // البحث عن اللقاءات المنتهية (غير منشورة وتاريخها انتهى)
    const endedEvents = events.filter(event => {
      const eventDate = new Date(event.date)
      return event.isPublished && eventDate < today
    })

    // إنشاء إشعار لكل لقاء منتهي
    for (const event of endedEvents) {
      // التحقق من عدم وجود إشعار سابق لهذا اللقاء
      const existingNotification = notifications.find(
        n => n.eventId === event.id && n.type === 'ended_event' && !n.isDismissed
      )

      if (!existingNotification) {
        try {
          await fetch('/api/notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'ended_event',
              title: 'لقاء منتهي',
              message: `اللقاء "${event.title}" انتهى تاريخه. هل تريد تحديثه أو أرشفته؟`,
              eventId: event.id
            })
          })
        } catch (error) {
          console.error('Error creating notification:', error)
        }
      }
    }
  }

  // تحديث حالة اللقاء (حدث/أرشف)
  const handleUpdateEventStatus = async (eventId: string, status: string, archiveNotification: boolean = false) => {
    try {
      const response = await fetch('/api/events/status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, status, archiveNotification })
      })
      
      if (response.ok) {
        toast.success(status === 'ended' ? 'تم تحديث حالة اللقاء' : 'تم أرشفة اللقاء')
        fetchData()
      } else {
        toast.error('حدث خطأ أثناء تحديث الحالة')
      }
    } catch (error) {
      toast.error('حدث خطأ')
    }
  }

  // تجاهل الإشعار (إبقاؤه في القائمة بشكل دائم)
  const handleDismissNotification = async (notificationId: string) => {
    try {
      // نضع علامة مقروء ولكن لا نضع isDismissed = true
      // هذا يبقي الإشعار في القائمة بشكل دائم
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: notificationId, isRead: true, isDismissed: false })
      })
      fetchData()
    } catch (error) {
      console.error('Error dismissing notification:', error)
    }
  }

  // التحقق من اللقاءات المنتهية وعرض تنبيه
  const checkAndShowEndedEventAlert = () => {
    const today = new Date(new Date().toDateString())
    
    // البحث عن اللقاءات المنتهية (منشورة وتاريخها انتهى)
    const endedEvents = events.filter(event => {
      const eventDate = new Date(event.date)
      return event.isPublished && eventDate < today
    })

    if (endedEvents.length > 0 && !endedEventAlert.show) {
      // عرض أول لقاء منتهي
      const firstEndedEvent = endedEvents[0]
      setEndedEventAlert({
        show: true,
        eventId: firstEndedEvent.id,
        eventTitle: firstEndedEvent.title
      })
    }
  }

  // عند الانتقال لتبويب اللقاءات، التحقق من اللقاءات المنتهية
  useEffect(() => {
    if (currentTab === 'events' && events.length > 0) {
      // تأخير قصير للسماح بتحميل البيانات
      const timer = setTimeout(() => {
        checkAndShowEndedEventAlert()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [currentTab, events])

  // إغلاق تنبيه اللقاء المنتهي
  const closeEndedEventAlert = () => {
    setEndedEventAlert({ show: false, eventId: null, eventTitle: '' })
  }

  // معالجة أرشفة اللقاء المنتهي
  const handleArchiveEndedEvent = async () => {
    if (!endedEventAlert.eventId) return
    await handleUpdateEventStatus(endedEventAlert.eventId, 'archived', true)
    closeEndedEventAlert()
    // التحقق من وجود لقاءات منتهية أخرى
    setTimeout(() => checkAndShowEndedEventAlert(), 500)
  }

  // تجاهل اللقاء المنتهي (إبقاء الإشعار دائم في الجرس)
  const handleIgnoreEndedEvent = async () => {
    if (!endedEventAlert.eventId) return
    // البحث عن الإشعار المرتبط بهذا اللقاء
    const relatedNotification = notifications.find(n => n.eventId === endedEventAlert.eventId && n.type === 'ended_event')
    if (relatedNotification) {
      // وضع علامة مقروء وإبقاء الإشعار
      await handleDismissNotification(relatedNotification.id)
    }
    closeEndedEventAlert()
    // التحقق من وجود لقاءات منتهية أخرى
    setTimeout(() => checkAndShowEndedEventAlert(), 500)
  }

  // عند تحميل اللقاءات، إنشاء إشعارات للمنتهية
  useEffect(() => {
    if (events.length > 0) {
      createEndedEventNotifications()
    }
  }, [events])

  const handleAddNote = async () => {
    if (!viewingSponsor || !newNoteContent.trim()) return
    try {
      const response = await fetch(`/api/sponsors/${viewingSponsor.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newNoteContent.trim(),
          authorName: 'مدير النظام'
        })
      })
      if (response.ok) {
        toast.success('تم إضافة الملاحظة')
        setNewNoteContent('')
        fetchSponsorNotes(viewingSponsor.id)
      } else {
        toast.error('حدث خطأ أثناء إضافة الملاحظة')
      }
    } catch {
      toast.error('حدث خطأ')
    }
  }

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventForm)
      })
      if (response.ok) {
        toast.success('تم إنشاء اللقاء بنجاح')
        setCreateEventOpen(false)
        setSelectedSponsors([])
        setEventForm({ 
          title: '', description: '', date: '', startTime: '18:00', endTime: '22:00', location: '', imageUrl: '',
          status: 'open', eventType: 'public', isPublished: false, registrationDeadline: '',
          guestName: '', guestImage: '', guestOrganization: '', guestPosition: '',
          guestTwitter: '', guestInstagram: '', guestLinkedIn: '', guestSnapchat: '',
          capacity: 50, maxCompanions: 0, registrationType: 'registration', sendQR: false,
          showCountdown: true, showRegistrantCount: true, showGuestProfile: true, showHospitalityPreference: true,
          valetServiceEnabled: false, parkingCapacity: 0, carRetrievalTime: ''
        })
        fetchData()
      } else {
        toast.error('حدث خطأ')
      }
    } catch { toast.error('حدث خطأ') }
  }

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingEvent) return
    try {
      const response = await fetch(`/api/events/${editingEvent.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventForm)
      })
      if (response.ok) {
        toast.success('تم تحديث اللقاء بنجاح')
        setEditingEvent(null)
        setSelectedSponsors([])
        setEventForm({ 
          title: '', description: '', date: '', startTime: '18:00', endTime: '22:00', location: '', imageUrl: '',
          status: 'open', eventType: 'public', isPublished: false, registrationDeadline: '',
          guestName: '', guestImage: '', guestOrganization: '', guestPosition: '',
          guestTwitter: '', guestInstagram: '', guestLinkedIn: '', guestSnapchat: '',
          capacity: 50, maxCompanions: 0, registrationType: 'registration', sendQR: false,
          showCountdown: true, showRegistrantCount: true, showGuestProfile: true, showHospitalityPreference: true,
          valetServiceEnabled: false, parkingCapacity: 0, carRetrievalTime: ''
        })
        fetchData()
      } else {
        toast.error('حدث خطأ')
      }
    } catch { toast.error('حدث خطأ') }
  }

  const handleCreateSponsor = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/sponsors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...sponsorForm,
          status: 'new', // الحالة الافتراضية للرعاة الجدد
        })
      })
      if (response.ok) {
        toast.success('تم إضافة الراعي بنجاح')
        setShowAddSponsorModal(false)
        setSponsorForm({
          companyName: '',
          contactName: '',
          email: '',
          phone: '',
          sponsorshipType: 'financial',
          sponsorType: 'company',
          logoUrl: '',
          websiteUrl: '',
          amount: 0,
          description: '',
        })
        fetchData()
      } else {
        toast.error('حدث خطأ أثناء إضافة الراعي')
      }
    } catch {
      toast.error('حدث خطأ أثناء إضافة الراعي')
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا اللقاء؟')) return
    try {
      const response = await fetch(`/api/events/${eventId}`, { method: 'DELETE' })
      if (response.ok) {
        toast.success('تم حذف اللقاء بنجاح')
        fetchData()
      } else {
        toast.error('حدث خطأ')
      }
    } catch { toast.error('حدث خطأ') }
  }

  const toggleEventPublish = async (eventId: string, isPublished: boolean) => {
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished })
      })
      if (response.ok) {
        toast.success(isPublished ? 'تم نشر اللقاء' : 'تم إلغاء نشر اللقاء')
        fetchData()
      } else {
        toast.error('حدث خطأ')
      }
    } catch { toast.error('حدث خطأ') }
  }

  const archiveEvent = async (eventId: string, archive: boolean) => {
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: archive ? 'archived' : 'open' })
      })
      if (response.ok) {
        toast.success(archive ? 'تم أرشفة اللقاء' : 'تم إلغاء أرشفة اللقاء')
        fetchData()
      } else {
        toast.error('حدث خطأ')
      }
    } catch { toast.error('حدث خطأ') }
  }

  const openEditEvent = (event: Event) => {
    setEditingEvent(event)
    setEventForm({
      title: event.title,
      description: event.description || '',
      date: new Date(event.date).toISOString().slice(0, 10),
      startTime: event.startTime || '18:00',
      endTime: event.endTime || '22:00',
      location: event.location || '',
      imageUrl: event.imageUrl || '',
      status: event.status || 'open',
      eventType: event.eventType || 'public',
      isPublished: event.isPublished ?? false,
      registrationDeadline: event.registrationDeadline ? new Date(event.registrationDeadline).toISOString().slice(0, 16) : '',
      guestName: event.guestName || '',
      guestImage: event.guestImage || '',
      guestOrganization: event.guestOrganization || '',
      guestPosition: event.guestPosition || '',
      guestTwitter: event.guestTwitter || '',
      guestInstagram: event.guestInstagram || '',
      guestLinkedIn: event.guestLinkedIn || '',
      guestSnapchat: event.guestSnapchat || '',
      capacity: event.capacity,
      maxCompanions: event.maxCompanions || 0,
      registrationType: event.registrationType || 'registration',
      sendQR: event.sendQR || false,
      showCountdown: event.showCountdown ?? true,
      showRegistrantCount: event.showRegistrantCount ?? true,
      showGuestProfile: event.showGuestProfile ?? true,
      showHospitalityPreference: event.showHospitalityPreference ?? true,
      valetServiceEnabled: event.valetServiceEnabled ?? false,
      parkingCapacity: event.parkingCapacity || 0,
      carRetrievalTime: event.carRetrievalTime || ''
    })
  }

  const updateRegistrationStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/registrations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      if (response.ok) {
        toast.success('تم تحديث الحالة')
        fetchData()
      }
    } catch { toast.error('حدث خطأ') }
  }

  const deleteRegistration = async (id: string) => {
    try {
      const response = await fetch(`/api/registrations/${id}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        toast.success('تم حذف التسجيل')
        fetchData()
      }
    } catch { toast.error('حدث خطأ') }
  }

  const rejectRegistration = async (id: string) => {
    try {
      const response = await fetch(`/api/registrations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' })
      })
      if (response.ok) {
        toast.success('تم رفض التسجيل')
        fetchData()
      } else {
        const data = await response.json()
        toast.error(data.error || 'حدث خطأ أثناء الرفض')
      }
    } catch (error) {
      console.error('Reject error:', error)
      toast.error('حدث خطأ في الاتصال')
    }
  }

  const acceptRegistration = async (id: string) => {
    try {
      const response = await fetch(`/api/registrations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'confirmed' })
      })
      if (response.ok) {
        toast.success('تم قبول التسجيل')
        fetchData()
      } else {
        const data = await response.json()
        toast.error(data.error || 'حدث خطأ أثناء القبول')
      }
    } catch (error) {
      console.error('Accept error:', error)
      toast.error('حدث خطأ في الاتصال')
    }
  }

  const updateSponsorStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/sponsors/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      if (response.ok) {
        toast.success('تم تحديث الحالة')
        fetchData()
      }
    } catch { toast.error('حدث خطأ') }
  }

  // إضافة ضيوف للقاء
  const handleAddGuests = async () => {
    if (!viewingEventRegistrations) return

    const validGuests = guestForms.filter(g => g.name.trim())
    if (validGuests.length === 0) {
      toast.error('يرجى إدخال اسم الضيف على الأقل')
      return
    }

    let addedCount = 0
    for (const guest of validGuests) {
      try {
        const response = await fetch('/api/registrations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventId: viewingEventRegistrations.id,
            name: guest.name,
            email: guest.email || `no-email-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@placeholder.com`,
            phone: guest.phone,
            companyName: guest.companyName,
            jobTitle: guest.jobTitle,
            gender: guest.gender,
            status: 'confirmed',
            registrationSource: 'manual'
          })
        })
        if (response.ok) addedCount++
      } catch { /* ignore */ }
    }

    if (addedCount > 0) {
      toast.success(`تم إضافة ${toEnglishNumbers(addedCount)} ضيف بنجاح`)
      setShowAddGuestModal(false)
      setGuestForms([{ name: '', email: '', phone: '', companyName: '', jobTitle: '', gender: 'female' }])
      fetchData()
    } else {
      toast.error('لم يتم إضافة أي ضيف')
    }
  }

  // استيراد ضيوف من نص
  const handleImportGuests = () => {
    if (!importText.trim()) {
      toast.error('يرجى إدخال البيانات')
      return
    }

    const lines = importText.trim().split('\n').filter(line => line.trim())
    const newGuests: Array<{
      name: string
      email: string
      phone: string
      companyName: string
      jobTitle: string
      gender: string
    }> = []

    for (const line of lines) {
      const parts = line.split(/[,;\t]/).map(p => p.trim())
      if (parts[0]) {
        newGuests.push({
          name: parts[0],
          email: parts[1] || '',
          phone: parts[2] || '',
          companyName: parts[3] || '',
          jobTitle: parts[4] || '',
          gender: 'female'
        })
      }
    }

    if (newGuests.length > 0) {
      setGuestForms([...guestForms, ...newGuests])
      setShowImportModal(false)
      setImportText('')
      toast.success(`تم استيراد ${toEnglishNumbers(newGuests.length)} ضيف`)
    } else {
      toast.error('لم يتم العثور على بيانات صالحة')
    }
  }

  // استيراد من ملف Excel
  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImportLoading(true)
    try {
      const { read, utils } = await import('xlsx')
      const data = await file.arrayBuffer()
      const workbook = read(data)
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = utils.sheet_to_json(worksheet, { header: 1 }) as string[][]

      const newGuests: Array<{
        name: string
        email: string
        phone: string
        companyName: string
        jobTitle: string
        gender: string
      }> = []

      // تخطي الصف الأول إذا كان عناوين
      const startRow = jsonData[0]?.[0]?.includes('اسم') || jsonData[0]?.[0]?.includes('الاسم') ? 1 : 0

      for (let i = startRow; i < jsonData.length; i++) {
        const row = jsonData[i]
        if (row && row[0]) {
          newGuests.push({
            name: String(row[0] || '').trim(),
            email: String(row[1] || '').trim(),
            phone: String(row[2] || '').trim(),
            companyName: String(row[3] || '').trim(),
            jobTitle: String(row[4] || '').trim(),
            gender: 'female'
          })
        }
      }

      if (newGuests.length > 0) {
        setGuestForms([...guestForms, ...newGuests])
        setShowImportModal(false)
        toast.success(`تم استيراد ${toEnglishNumbers(newGuests.length)} ضيف من الملف`)
      } else {
        toast.error('لم يتم العثور على بيانات صالحة في الملف')
      }
    } catch (error) {
      console.error('Error importing file:', error)
      toast.error('حدث خطأ في قراءة الملف')
    } finally {
      setImportLoading(false)
      e.target.value = ''
    }
  }

  // استيراد من Google Sheets
  const handleUrlImport = async () => {
    if (!importUrl.trim()) {
      toast.error('يرجى إدخال رابط Google Sheets')
      return
    }

    setImportLoading(true)
    try {
      // استخراج معرف الورقة من الرابط
      let sheetId = ''
      const match = importUrl.match(/\/d\/([a-zA-Z0-9-_]+)/)
      if (match) {
        sheetId = match[1]
      } else {
        toast.error('رابط Google Sheets غير صحيح')
        setImportLoading(false)
        return
      }

      // استخدام CSV export
      const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`
      const response = await fetch(csvUrl)

      if (!response.ok) {
        toast.error('لم يتم الوصول للورقة. تأكد من أنها عامة (Anyone with the link)')
        setImportLoading(false)
        return
      }

      const csvText = await response.text()
      const lines = csvText.split('\n').filter(line => line.trim())

      const newGuests: Array<{
        name: string
        email: string
        phone: string
        companyName: string
        jobTitle: string
        gender: string
      }> = []

      // تخطي الصف الأول إذا كان عناوين
      const startIdx = lines[0]?.includes('اسم') || lines[0]?.includes('الاسم') ? 1 : 0

      for (let i = startIdx; i < lines.length; i++) {
        const parts = lines[i].split(',').map(p => p.trim().replace(/^"|"$/g, ''))
        if (parts[0]) {
          newGuests.push({
            name: parts[0],
            email: parts[1] || '',
            phone: parts[2] || '',
            companyName: parts[3] || '',
            jobTitle: parts[4] || '',
            gender: 'female'
          })
        }
      }

      if (newGuests.length > 0) {
        setGuestForms([...guestForms, ...newGuests])
        setShowImportModal(false)
        setImportUrl('')
        toast.success(`تم استيراد ${toEnglishNumbers(newGuests.length)} ضيف من Google Sheets`)
      } else {
        toast.error('لم يتم العثور على بيانات صالحة')
      }
    } catch (error) {
      console.error('Error importing from URL:', error)
      toast.error('حدث خطأ في الاستيراد من الرابط')
    } finally {
      setImportLoading(false)
    }
  }

  // إضافة حقل ضيف جديد
  const addGuestField = () => {
    setGuestForms([...guestForms, { name: '', email: '', phone: '', companyName: '', jobTitle: '', gender: 'female' }])
  }

  // حذف حقل ضيف
  const removeGuestField = (index: number) => {
    if (guestForms.length > 1) {
      setGuestForms(guestForms.filter((_, i) => i !== index))
    }
  }

  // تحديث حقل ضيف
  const updateGuestForm = (index: number, field: string, value: string) => {
    const updated = [...guestForms]
    updated[index] = { ...updated[index], [field]: value }
    setGuestForms(updated)
  }

  // قبول جميع المسجلين في اللقاء
  const acceptAllRegistrations = async () => {
    if (!viewingEventRegistrations) return
    
    const pendingRegs = registrations.filter(r => 
      r.eventId === viewingEventRegistrations.id && r.status === 'pending'
    )
    
    if (pendingRegs.length === 0) {
      toast.info('لا يوجد تسجيلات قيد الانتظار')
      return
    }
    
    try {
      let acceptedCount = 0
      for (const reg of pendingRegs) {
        const response = await fetch(`/api/registrations/${reg.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'confirmed' })
        })
        if (response.ok) acceptedCount++
      }
      toast.success(`تم قبول ${toEnglishNumbers(acceptedCount)} تسجيل`)
      fetchData()
    } catch { toast.error('حدث خطأ') }
  }

  // إلغاء قبول جميع المسجلين في اللقاء
  const cancelAllConfirmations = async () => {
    if (!viewingEventRegistrations) return
    
    const confirmedRegs = registrations.filter(r => 
      r.eventId === viewingEventRegistrations.id && r.status === 'confirmed'
    )
    
    if (confirmedRegs.length === 0) {
      toast.info('لا يوجد تسجيلات مقبولة')
      return
    }
    
    if (!confirm(`هل أنت متأكد من إلغاء قبول ${toEnglishNumbers(confirmedRegs.length)} تسجيل؟`)) return
    
    try {
      let cancelledCount = 0
      for (const reg of confirmedRegs) {
        const response = await fetch(`/api/registrations/${reg.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'pending' })
        })
        if (response.ok) cancelledCount++
      }
      toast.success(`تم إلغاء قبول ${toEnglishNumbers(cancelledCount)} تسجيل`)
      fetchData()
    } catch { toast.error('حدث خطأ') }
  }

  // إلغاء قبول التسجيلات المحددة
  const cancelSelectedConfirmations = async () => {
    if (selectedRegistrationsForCancel.length === 0) {
      toast.info('يرجى تحديد التسجيلات المراد إلغاء قبولها')
      return
    }
    
    if (!confirm(`هل أنت متأكد من إلغاء قبول ${toEnglishNumbers(selectedRegistrationsForCancel.length)} تسجيل؟`)) return
    
    try {
      let cancelledCount = 0
      for (const regId of selectedRegistrationsForCancel) {
        const response = await fetch(`/api/registrations/${regId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'pending' })
        })
        if (response.ok) cancelledCount++
      }
      toast.success(`تم إلغاء قبول ${toEnglishNumbers(cancelledCount)} تسجيل`)
      setSelectedRegistrationsForCancel([])
      setShowCancelModal(false)
      fetchData()
    } catch { toast.error('حدث خطأ') }
  }

  const openEditSponsor = (sponsor?: SponsorRequest) => {
    const sponsorToEdit = sponsor || viewingSponsor
    if (!sponsorToEdit) return
    if (sponsor) setViewingSponsor(sponsor)
    setEditSponsorForm({
      companyName: sponsorToEdit.companyName,
      contactName: sponsorToEdit.contactName,
      email: sponsorToEdit.email,
      phone: sponsorToEdit.phone,
      sponsorshipType: sponsorToEdit.sponsorshipType,
      sponsorType: sponsorToEdit.sponsorType || 'company',
      logoUrl: sponsorToEdit.logoUrl || '',
      websiteUrl: sponsorToEdit.websiteUrl || '',
      profileUrl: sponsorToEdit.profileUrl || '',
      amount: sponsorToEdit.amount || 0,
      description: sponsorToEdit.description || '',
      instagram: sponsorToEdit.instagram || '',
      twitter: sponsorToEdit.twitter || '',
      snapchat: sponsorToEdit.snapchat || '',
      tiktok: sponsorToEdit.tiktok || '',
      linkedin: sponsorToEdit.linkedin || '',
      status: sponsorToEdit.status || 'new',
    })
    setShowEditSponsorModal(true)
  }

  const handleUpdateSponsor = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!viewingSponsor) return
    try {
      const response = await fetch(`/api/sponsors/${viewingSponsor.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editSponsorForm)
      })
      if (response.ok) {
        toast.success('تم تحديث بيانات الراعي')
        setShowEditSponsorModal(false)
        await fetchData()
        // Close the sponsor details view
        setViewingSponsor(null)
      } else {
        const data = await response.json()
        toast.error(data.error || 'حدث خطأ')
      }
    } catch {
      toast.error('حدث خطأ')
    }
  }

  const handleAddSponsorToEvent = async () => {
    if (!viewingSponsor || !selectedEventForSponsor) {
      toast.error('يرجى اختيار الحدث')
      return
    }
    try {
      const response = await fetch('/api/event-sponsors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: selectedEventForSponsor,
          sponsorId: viewingSponsor.id,
          tasks: sponsorTasks
        })
      })
      if (response.ok) {
        toast.success('تم إضافة الراعي إلى الحدث وتحديث حالته إلى تم الرعاية')
        setShowAddToEventModal(false)
        setSelectedEventForSponsor(null)
        setSponsorTasks('')
        setEventSearch('')
        fetchSponsorEvents(viewingSponsor.id)
        fetchData() // تحديث البيانات لعرض الحالة الجديدة
      } else {
        const data = await response.json()
        toast.error(data.error || 'حدث خطأ')
      }
    } catch {
      toast.error('حدث خطأ')
    }
  }

  const handleRemoveSponsorFromEvent = async (eventId: string) => {
    if (!viewingSponsor) return
    
    try {
      const response = await fetch(`/api/event-sponsors/${eventId}/${viewingSponsor.id}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        toast.success('تم إزالة اللقاء بنجاح')
        setShowDeleteEventDialog(null)
        fetchSponsorEvents(viewingSponsor.id)
        fetchData()
      } else {
        const data = await response.json()
        toast.error(data.error || 'حدث خطأ')
      }
    } catch {
      toast.error('حدث خطأ')
    }
  }

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(eventSearch.toLowerCase()) ||
      event.location?.toLowerCase().includes(eventSearch.toLowerCase())
    
    // فلترة حسب النشر
    const matchesPublish = !eventPublishFilter || 
      (eventPublishFilter === 'public' && event.eventType === 'public') ||
      (eventPublishFilter === 'private' && event.eventType === 'private') ||
      (eventPublishFilter === 'pending' && !event.isPublished)
    
    // فلترة حسب الحالة
    const matchesStatus = !eventStatusFilter || event.status === eventStatusFilter
    
    return matchesSearch && matchesPublish && matchesStatus
  })

  // تصفية اللقاءات المضافة بالفعل من قائمة الإضافة
  const availableEventsForSponsor = filteredEvents.filter(event => 
    !sponsorEvents.some(se => se.id === event.id)
  )

  const filteredMembersForLink = registrations.filter(reg =>
    reg.name.toLowerCase().includes(memberLinkSearch.toLowerCase()) ||
    reg.phone?.includes(memberLinkSearch)
  )

  const handleLogout = async () => {
    try {
      await fetch('/api/member/logout', { method: 'POST' })
      await fetch('/api/admin/logout', { method: 'POST' })
      router.refresh()
      router.push('/')
    } catch { 
      router.push('/') 
    }
  }

  const exportToCSV = (type: 'registrations' | 'sponsors') => {
    let csv = ''
    let filename = ''

    if (type === 'registrations') {
      // Build header based on selected fields
      const headers: string[] = []
      if (memberExportFields.name) headers.push('الاسم')
      if (memberExportFields.companyName) headers.push('الشركة')
      if (memberExportFields.jobTitle) headers.push('المسمى الوظيفي')
      if (memberExportFields.phone) headers.push('رقم الجوال')
      if (memberExportFields.email) headers.push('البريد الإلكتروني')
      headers.push('اللقاء', 'الحالة', 'تاريخ التسجيل')

      csv = headers.join(',') + '\n'

      registrations.forEach(r => {
        const row: string[] = []
        if (memberExportFields.name) row.push(`"${r.name}"`)
        if (memberExportFields.companyName) row.push(`"${r.companyName || ''}"`)
        if (memberExportFields.jobTitle) row.push(`"${r.jobTitle || ''}"`)
        if (memberExportFields.phone) row.push(`"${r.phone || ''}"`)
        if (memberExportFields.email) row.push(`"${r.email}"`)
        row.push(`"${r.event?.title || ''}"`, `"${r.status}"`, `"${toEnglishNumbers(new Date(r.createdAt).toLocaleDateString('ar-SA'))}"`)
        csv += row.join(',') + '\n'
      })
      filename = 'الأعضاء.csv'
    } else {
      // Build header based on selected fields
      const headers: string[] = []
      if (sponsorExportFields.companyName) headers.push('اسم الشركة')
      if (sponsorExportFields.contactName) headers.push('المسؤول')
      if (sponsorExportFields.phone) headers.push('رقم الجوال')
      if (sponsorExportFields.email) headers.push('البريد الإلكتروني')
      headers.push('نوع الرعاية', 'القيمة', 'الحالة', 'تاريخ الطلب')

      csv = headers.join(',') + '\n'

      sponsorRequests.forEach(s => {
        const row: string[] = []
        if (sponsorExportFields.companyName) row.push(`"${s.companyName}"`)
        if (sponsorExportFields.contactName) row.push(`"${s.contactName}"`)
        if (sponsorExportFields.phone) row.push(`"${s.phone}"`)
        if (sponsorExportFields.email) row.push(`"${s.email}"`)
        row.push(`"${s.sponsorshipType}"`, `"${s.amount || ''}"`, `"${s.status}"`, `"${toEnglishNumbers(new Date(s.createdAt).toLocaleDateString('ar-SA'))}"`)
        csv += row.join(',') + '\n'
      })
      filename = 'طلبات_الرعاية.csv'
    }

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename
    link.click()
    setShowExportModal(null)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const arabicDate = date.toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' })
    return toEnglishNumbers(arabicDate)
  }

  const stats = {
    // اللقاءات
    totalEvents: events.length,
    publishedEvents: events.filter(e => e.eventType === 'public').length,
    unpublishedEvents: events.filter(e => e.eventType === 'private').length,
    pendingEvents: events.filter(e => !e.isPublished).length, // معلقة (غير منشورة)
    openEvents: events.filter(e => e.status === 'open' && new Date(e.date) >= new Date(new Date().toDateString())).length,
    closedEvents: events.filter(e => e.status === 'closed' || (e.status === 'open' && new Date(e.date) < new Date(new Date().toDateString()))).length,
    // منشور ومتاح التسجيل
    publishedOpenEvents: events.filter(e => e.isPublished && e.status === 'open' && new Date(e.date) >= new Date(new Date().toDateString())).length,
    // منشور وانتهى التسجيل
    publishedClosedEvents: events.filter(e => e.isPublished && (e.status === 'closed' || (e.status === 'open' && new Date(e.date) < new Date(new Date().toDateString())))).length,
    endedEvents: events.filter(e => e.status === 'ended').length,
    archivedEvents: events.filter(e => e.status === 'archived').length,
    upcomingEvents: events.filter(e => e.status === 'open' && new Date(e.date) >= new Date()).length,
    // الأعضاء (الجميع)
    totalMembers: allMembersList.length,
    femaleMembers: members.filter(m => m.gender === 'female').length,
    maleMembers: members.filter(m => m.gender === 'male').length,
    membersWithAccount: members.length,
    // الأعضاء المسجلين (فريدين من التسجيلات)
    uniqueRegisteredMembers: [...new Set(registrations.map(r => r.email.toLowerCase()))].length,
    // تسجيلات اللقاءات
    totalRegistrations: registrations.length,
    registeredMembers: registrations.filter(r => r.status === 'confirmed' || r.status === 'pending').length,
    attendedRegistrations: registrations.filter(r => r.status === 'attended').length,
    bannedRegistrations: registrations.filter(r => r.status === 'cancelled' || r.status === 'banned').length,
    attendanceRate: registrations.length > 0 
      ? Math.round((registrations.filter(r => r.status === 'attended').length / registrations.length) * 100) 
      : 0,
    // الرعاة
    totalSponsors: sponsorRequests.length,
    newSponsors: sponsorRequests.filter(s => s.status === 'new').length,
    contactedSponsors: sponsorRequests.filter(s => s.status === 'contacted').length,
    completedSponsors: sponsorRequests.filter(s => s.status === 'completed').length,
    interestedAgainSponsors: sponsorRequests.filter(s => s.status === 'interested_again').length,
    interestedPermanentSponsors: sponsorRequests.filter(s => s.status === 'interested_permanent').length,
    activeSponsors: sponsorRequests.filter(s => s.status !== 'cancelled' && s.status !== 'archived').length,
  }

  const sponsorshipTypeLabels: Record<string, string> = {
    financial: 'رعاية مالية', technical: 'رعاية تقنية', media: 'رعاية إعلامية',
    marketing: 'رعاية تسويقية', knowledge: 'رعاية معرفية', in_kind: 'رعاية عينية'
  }

  const statusLabels: Record<string, string> = {
    pending: 'قيد المراجعة', confirmed: 'مؤكد', attended: 'حضرت',
    cancelled: 'ملغي',
    open: 'مفتوح', closed: 'مغلق', ended: 'منتهي',
    // حالات الرعاة
    new: 'جديدة', contacted: 'تم التواصل', completed: 'تم الرعاية',
    interested_again: 'مهتم بالرعاية مرة أخرى', interested_permanent: 'مهتم بالرعاية بشكل دائم',
    archived: 'مؤرشف'
  }

  const eventStatusLabels: Record<string, string> = {
    open: 'مفتوح التسجيل', upcoming: 'قادمة', ended: 'منتهية', archived: 'مؤرشف'
  }

  const eventTypeLabels: Record<string, string> = {
    public: 'عام', private: 'خاص'
  }

  const getStatusStyle = (status: string) => {
    const styles: Record<string, { background: string; color: string }> = {
      pending: { background: '#fef3e0', color: '#9a6b1a' },
      confirmed: { background: '#e8d8dc', color: '#6b5a60' },
      attended: { background: '#d4edda', color: '#3a7d44' },
      cancelled: { background: '#fce8e8', color: '#8a3a3a' },
      approved: { background: '#d4edda', color: '#3a7d44' },
      rejected: { background: '#fce8e8', color: '#8a3a3a' },
      open: { background: '#d4edda', color: '#3a7d44' },
      closed: { background: '#fef3e0', color: '#9a6b1a' },
      ended: { background: '#f5f5f5', color: '#666' },
      // حالات الرعاة
      new: { background: '#e8f4fd', color: '#1e6bb8' },
      contacted: { background: '#fef3e0', color: '#9a6b1a' },
      completed: { background: '#d4edda', color: '#3a7d44' },
      interested_again: { background: '#e8d8dc', color: '#6b5a60' },
      interested_permanent: { background: '#e8dde8', color: '#6b4a5a' },
      archived: { background: '#f5f5f5', color: '#666' }
    }
    return styles[status] || { background: '#f5f5f5', color: '#666' }
  }

  const resetEventForm = () => ({
    title: '', description: '', date: '', startTime: '18:00', endTime: '22:00', location: '', imageUrl: '',
    status: 'open', eventType: 'public', isPublished: false, registrationDeadline: '',
    guestName: '', guestImage: '', guestOrganization: '', guestPosition: '',
    guestTwitter: '', guestInstagram: '', guestLinkedIn: '', guestSnapchat: '',
    capacity: 50, maxCompanions: 0, registrationType: 'registration', sendQR: false,
    showCountdown: true, showRegistrantCount: true, showGuestProfile: true, showHospitalityPreference: true,
    valetServiceEnabled: false, parkingCapacity: 0, carRetrievalTime: ''
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#fdf8f9' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-3 mx-auto" style={{ borderColor: '#e8b4c4', borderTopColor: '#a8556f' }}></div>
          <p className="mt-4 font-medium" style={{ color: '#6b5a60' }}>جاري التحميل...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" dir="rtl" style={{ background: 'linear-gradient(180deg, #fdf8f9 0%, #ffffff 100%)' }}>
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b" style={{ borderColor: 'rgba(240, 224, 228, 0.5)' }}>
        <div className="container">
          <div className="flex items-center justify-between h-28">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: '#e8d8dc' }}>
                <Crown className="w-6 h-6" style={{ color: '#6b5a60' }} />
              </div>
              <div className="space-y-1.5">
                <h1 className="text-lg font-bold" style={{ color: '#2d1f26' }}>ملتقى ريادة</h1>
                <p className="text-xs" style={{ color: '#6b5a60' }}>تجمع سيدات الأعمال</p>
                <a 
                  href="/" 
                  target="_blank"
                  className="flex items-center gap-1 text-xs hover:underline"
                  style={{ color: '#a8556f' }}
                >
                  <Globe className="w-3 h-3" />
                  زيارة الموقع
                </a>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* أيقونة الإشعارات */}
              <Popover open={showNotifications} onOpenChange={setShowNotifications}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" className="rounded-full relative" style={{ color: '#6b5a60' }}>
                    <Bell className="w-5 h-5" />
                    {notifications.filter(n => !n.isRead).length > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center text-white" style={{ background: '#a8556f' }}>
                        {notifications.filter(n => !n.isRead).length}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end" dir="rtl">
                  <div className="p-4 border-b" style={{ borderColor: '#f0e0e4' }}>
                    <h3 className="font-bold" style={{ color: '#2d1f26' }}>الإشعارات</h3>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center" style={{ color: '#9a8a90' }}>لا توجد إشعارات</div>
                    ) : (
                      notifications.map(notification => (
                        <div 
                          key={notification.id} 
                          className="p-4 border-b hover:bg-gray-50 cursor-pointer"
                          style={{ borderColor: '#f0e0e4', background: notification.isRead ? 'transparent' : '#fdf2f4' }}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: notification.type === 'ended_event' ? '#fce8e8' : '#e8d8dc' }}>
                              {notification.type === 'ended_event' ? (
                                <Calendar className="w-5 h-5" style={{ color: '#8a3a3a' }} />
                              ) : (
                                <Bell className="w-5 h-5" style={{ color: '#6b5a60' }} />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm" style={{ color: '#2d1f26' }}>{notification.title}</p>
                              <p className="text-xs mt-1" style={{ color: '#6b5a60' }}>{notification.message}</p>
                              {notification.type === 'ended_event' && notification.Event && (
                                <div className="flex gap-2 mt-3">
                                  <Button 
                                    size="sm" 
                                    className="rounded-full text-xs h-8"
                                    style={{ background: '#a8556f', color: 'white' }}
                                    onClick={() => {
                                      handleUpdateEventStatus(notification.eventId!, 'ended', true)
                                      setShowNotifications(false)
                                    }}
                                  >
                                    حدّث اللقاء
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    className="rounded-full text-xs h-8"
                                    style={{ background: '#e8d8dc', color: '#6b5a60' }}
                                    onClick={() => {
                                      handleUpdateEventStatus(notification.eventId!, 'archived', true)
                                      setShowNotifications(false)
                                    }}
                                  >
                                    أرشفه
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    className="rounded-full text-xs h-8"
                                    onClick={() => handleDismissNotification(notification.id)}
                                  >
                                    تجاهل
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </PopoverContent>
              </Popover>
              
              <Button variant="ghost" onClick={handleLogout} className="rounded-full gap-2" style={{ color: '#6b5a60' }}>
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">تسجيل الخروج</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
          <div className="relative flex items-center justify-center mb-8">
            <TabsList className="flex justify-center gap-2 rounded-full p-1.5" style={{ background: '#fdf2f4', direction: 'rtl' }}>
              {/* زر الرجوع - يظهر فقط عند القدوم من نظرة عامة */}
              {cameFromOverview && (
                <button
                  onClick={() => {
                    setCameFromOverview(false)
                    setEventStatusFilter(null)
                    setEventPublishFilter(null)
                    setMemberFilter('all')
                    setCurrentTab('overview')
                  }}
                  className="flex items-center gap-1 shadow-md rounded-full text-xs sm:text-sm px-4 py-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                  style={{ background: '#fdf2f4', color: '#6b5a60' }}
                >
                  <ArrowRight className="w-4 h-4 rotate-180" />
                  رجوع
                </button>
              )}
              <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-full text-xs sm:text-sm px-4">نظرة عامة</TabsTrigger>
              <TabsTrigger value="events" className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-full text-xs sm:text-sm px-4">اللقاءات</TabsTrigger>
              <TabsTrigger value="registrations" className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-full text-xs sm:text-sm px-4">الأعضاء</TabsTrigger>
              <TabsTrigger value="sponsors" className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-full text-xs sm:text-sm px-4">الرعاة</TabsTrigger>
              <TabsTrigger value="messages" className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-full text-xs sm:text-sm px-4">رسائل النظام</TabsTrigger>
              {(adminPermissions?.settings || isSuperAdmin) && (
                <TabsTrigger value="settings" className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-full text-xs sm:text-sm px-4">إعدادات الموقع</TabsTrigger>
              )}
            </TabsList>
            <h2 className="absolute right-0 top-1/2 -translate-y-1/2 text-lg font-bold pr-10" style={{ color: '#a8556f' }}>لوحة التحكم</h2>
          </div>

          {/* Overview */}
          <TabsContent value="overview" dir="rtl">
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {/* اللقاءات */}
              <Card className="rounded-2xl border bg-transparent" style={{ borderColor: '#f0e0e4' }}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between pb-2">
                    <span className="text-lg font-bold" style={{ color: '#2d1f26' }}>اللقاءات</span>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" style={{ color: '#a8556f' }} />
                      <div className="text-3xl font-bold" style={{ color: '#2d1f26' }}>{toEnglishNumbers(stats.totalEvents)}</div>
                    </div>
                  </div>
                  {/* القسم الأول: نوع اللقاء */}
                  <div className="mt-3 pt-3 border-t" style={{ borderColor: '#f0e0e4' }}>
                    <span 
                      className="text-sm font-bold block mb-2 text-right" 
                      style={{ color: '#a8556f' }}
                    >نوع اللقاء</span>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                      <button 
                        onClick={() => navigateToEventsWithFilter('publish', 'public')}
                        className="text-sm text-right hover:text-[#a8556f] cursor-pointer transition-colors" 
                        style={{ color: '#6b5a60' }}
                      >عام</button>
                      <button 
                        onClick={() => navigateToEventsWithFilter('publish', 'public')}
                        className="text-sm text-right hover:text-[#a8556f] cursor-pointer transition-colors" 
                        style={{ color: '#6b5a60' }}
                      >{toEnglishNumbers(stats.publishedEvents)}</button>
                      <button 
                        onClick={() => navigateToEventsWithFilter('publish', 'private')}
                        className="text-sm text-right hover:text-[#a8556f] cursor-pointer transition-colors" 
                        style={{ color: '#6b5a60' }}
                      >خاص</button>
                      <button 
                        onClick={() => navigateToEventsWithFilter('publish', 'private')}
                        className="text-sm text-right hover:text-[#a8556f] cursor-pointer transition-colors" 
                        style={{ color: '#6b5a60' }}
                      >{toEnglishNumbers(stats.unpublishedEvents)}</button>
                    </div>
                  </div>
                  {/* القسم الثاني: حالة اللقاء */}
                  <div className="mt-3 pt-3 border-t" style={{ borderColor: '#f0e0e4' }}>
                    <span 
                      className="text-sm font-bold block mb-2 text-right" 
                      style={{ color: '#a8556f' }}
                    >حالة اللقاء</span>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                      <button 
                        onClick={() => navigateToEventsWithFilter('publish', 'published_open')}
                        className="text-sm text-right hover:text-[#a8556f] cursor-pointer transition-colors" 
                        style={{ color: '#6b5a60' }}
                      >منشور و متاح التسجيل</button>
                      <button 
                        onClick={() => navigateToEventsWithFilter('publish', 'published_open')}
                        className="text-sm text-right hover:text-[#a8556f] cursor-pointer transition-colors" 
                        style={{ color: '#6b5a60' }}
                      >{toEnglishNumbers(stats.publishedOpenEvents)}</button>
                      <button 
                        onClick={() => navigateToEventsWithFilter('publish', 'published_closed')}
                        className="text-sm text-right hover:text-[#a8556f] cursor-pointer transition-colors" 
                        style={{ color: '#6b5a60' }}
                      >منشور و انتهى التسجيل</button>
                      <button 
                        onClick={() => navigateToEventsWithFilter('publish', 'published_closed')}
                        className="text-sm text-right hover:text-[#a8556f] cursor-pointer transition-colors" 
                        style={{ color: '#6b5a60' }}
                      >{toEnglishNumbers(stats.publishedClosedEvents)}</button>
                      <button 
                        onClick={() => navigateToEventsWithFilter('publish', 'pending')}
                        className="text-sm text-right hover:text-[#a8556f] cursor-pointer transition-colors" 
                        style={{ color: '#6b5a60' }}
                      >لم يتم النشر</button>
                      <button 
                        onClick={() => navigateToEventsWithFilter('publish', 'pending')}
                        className="text-sm text-right hover:text-[#a8556f] cursor-pointer transition-colors" 
                        style={{ color: '#6b5a60' }}
                      >{toEnglishNumbers(stats.pendingEvents)}</button>
                      <button 
                        onClick={() => navigateToEventsWithFilter('status', 'archived')}
                        className="text-sm text-right hover:text-[#a8556f] cursor-pointer transition-colors" 
                        style={{ color: '#6b5a60' }}
                      >مؤرشف</button>
                      <button 
                        onClick={() => navigateToEventsWithFilter('status', 'archived')}
                        className="text-sm text-right hover:text-[#a8556f] cursor-pointer transition-colors" 
                        style={{ color: '#6b5a60' }}
                      >{toEnglishNumbers(stats.archivedEvents)}</button>
                    </div>
                  </div>
                  {/* القسم الثالث: حالة التسجيل */}
                  <div className="mt-3 pt-3 border-t" style={{ borderColor: '#f0e0e4' }}>
                    <span 
                      className="text-sm font-bold block mb-2 text-right" 
                      style={{ color: '#a8556f' }}
                    >حالة التسجيل</span>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                      <button 
                        onClick={() => navigateToEventsWithFilter('status', 'open')}
                        className="text-sm text-right hover:text-[#a8556f] cursor-pointer transition-colors" 
                        style={{ color: '#6b5a60' }}
                      >متاح</button>
                      <button 
                        onClick={() => navigateToEventsWithFilter('status', 'open')}
                        className="text-sm text-right hover:text-[#a8556f] cursor-pointer transition-colors" 
                        style={{ color: '#6b5a60' }}
                      >{toEnglishNumbers(stats.openEvents)}</button>
                      <button 
                        onClick={() => navigateToEventsWithFilter('status', 'closed')}
                        className="text-sm text-right hover:text-[#a8556f] cursor-pointer transition-colors" 
                        style={{ color: '#6b5a60' }}
                      >مغلق</button>
                      <button 
                        onClick={() => navigateToEventsWithFilter('status', 'closed')}
                        className="text-sm text-right hover:text-[#a8556f] cursor-pointer transition-colors" 
                        style={{ color: '#6b5a60' }}
                      >{toEnglishNumbers(stats.closedEvents)}</button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* الأعضاء */}
              <Card className="rounded-2xl border bg-transparent" style={{ borderColor: '#f0e0e4' }}>
                <CardContent className="p-6">
                  <button 
                    onClick={() => setActiveTab('members')}
                    className="flex items-center justify-between pb-2 w-full hover:opacity-80 transition-opacity"
                  >
                    <span className="text-lg font-bold" style={{ color: '#2d1f26' }}>الأعضاء</span>
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5" style={{ color: '#a8556f' }} />
                      <div className="text-3xl font-bold" style={{ color: '#2d1f26' }}>{toEnglishNumbers(stats.totalMembers)}</div>
                    </div>
                  </button>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-3">
                    <button 
                      onClick={() => navigateToMembersWithFilter('female')}
                      className="text-sm text-right hover:text-[#a8556f] cursor-pointer transition-colors" 
                      style={{ color: '#6b5a60' }}
                    >سيدات</button>
                    <button 
                      onClick={() => navigateToMembersWithFilter('female')}
                      className="text-sm text-right hover:text-[#a8556f] cursor-pointer transition-colors" 
                      style={{ color: '#6b5a60' }}
                    >{toEnglishNumbers(stats.femaleMembers)}</button>
                    <button 
                      onClick={() => navigateToMembersWithFilter('male')}
                      className="text-sm text-right hover:text-[#a8556f] cursor-pointer transition-colors" 
                      style={{ color: '#6b5a60' }}
                    >رجال</button>
                    <button 
                      onClick={() => navigateToMembersWithFilter('male')}
                      className="text-sm text-right hover:text-[#a8556f] cursor-pointer transition-colors" 
                      style={{ color: '#6b5a60' }}
                    >{toEnglishNumbers(stats.maleMembers)}</button>
                    <button 
                      onClick={() => navigateToMembersWithFilter('registered')}
                      className="text-sm text-right hover:text-[#a8556f] cursor-pointer transition-colors" 
                      style={{ color: '#6b5a60' }}
                    >الأعضاء المسجلين</button>
                    <button 
                      onClick={() => navigateToMembersWithFilter('registered')}
                      className="text-sm text-right hover:text-[#a8556f] cursor-pointer transition-colors" 
                      style={{ color: '#6b5a60' }}
                    >{toEnglishNumbers(stats.uniqueRegisteredMembers)}</button>
                  </div>
                </CardContent>
              </Card>
              
              {/* الرعاة */}
              <Card className="rounded-2xl border bg-transparent" style={{ borderColor: '#f0e0e4' }}>
                <CardContent className="p-6">
                  <button 
                    onClick={() => setActiveTab('sponsors')}
                    className="flex items-center justify-between pb-2 w-full hover:opacity-80 transition-opacity"
                  >
                    <span className="text-lg font-bold" style={{ color: '#2d1f26' }}>الرعاة</span>
                    <div className="flex items-center gap-2">
                      <Handshake className="w-5 h-5" style={{ color: '#a8556f' }} />
                      <div className="text-3xl font-bold" style={{ color: '#2d1f26' }}>{toEnglishNumbers(stats.totalSponsors)}</div>
                    </div>
                  </button>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-3">
                    <button 
                      onClick={() => setActiveTab('sponsors')}
                      className="text-sm text-right hover:text-[#c9a066] cursor-pointer transition-colors" 
                      style={{ color: '#6b5a60' }}
                    >جديد</button>
                    <button 
                      onClick={() => setActiveTab('sponsors')}
                      className="text-sm text-right hover:text-[#c9a066] cursor-pointer transition-colors" 
                      style={{ color: '#6b5a60' }}
                    >{toEnglishNumbers(stats.newSponsors)}</button>
                    <button 
                      onClick={() => setActiveTab('sponsors')}
                      className="text-sm text-right hover:text-[#c9a066] cursor-pointer transition-colors" 
                      style={{ color: '#6b5a60' }}
                    >تم التواصل</button>
                    <button 
                      onClick={() => setActiveTab('sponsors')}
                      className="text-sm text-right hover:text-[#c9a066] cursor-pointer transition-colors" 
                      style={{ color: '#6b5a60' }}
                    >{toEnglishNumbers(stats.contactedSponsors)}</button>
                    <button 
                      onClick={() => setActiveTab('sponsors')}
                      className="text-sm text-right hover:text-[#c9a066] cursor-pointer transition-colors" 
                      style={{ color: '#6b5a60' }}
                    >تم الرعاية</button>
                    <button 
                      onClick={() => setActiveTab('sponsors')}
                      className="text-sm text-right hover:text-[#c9a066] cursor-pointer transition-colors" 
                      style={{ color: '#6b5a60' }}
                    >{toEnglishNumbers(stats.completedSponsors)}</button>
                    <button 
                      onClick={() => setActiveTab('sponsors')}
                      className="text-sm text-right hover:text-[#c9a066] cursor-pointer transition-colors" 
                      style={{ color: '#6b5a60' }}
                    >مهتم مجدداً</button>
                    <button 
                      onClick={() => setActiveTab('sponsors')}
                      className="text-sm text-right hover:text-[#c9a066] cursor-pointer transition-colors" 
                      style={{ color: '#6b5a60' }}
                    >{toEnglishNumbers(stats.interestedAgainSponsors)}</button>
                    <button 
                      onClick={() => setActiveTab('sponsors')}
                      className="text-sm text-right hover:text-[#c9a066] cursor-pointer transition-colors" 
                      style={{ color: '#6b5a60' }}
                    >مهتم دائم</button>
                    <button 
                      onClick={() => setActiveTab('sponsors')}
                      className="text-sm text-right hover:text-[#c9a066] cursor-pointer transition-colors" 
                      style={{ color: '#6b5a60' }}
                    >{toEnglishNumbers(stats.interestedPermanentSponsors)}</button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="rounded-2xl border" style={{ borderColor: '#f0e0e4' }}>
                <CardContent className="p-6">
                  <h3 className="text-base font-bold mb-4" style={{ color: '#2d1f26' }}>أحدث الأعضاء</h3>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {allMembersList.slice(0, 5).map(member => (
                      <div key={member.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: '#fdf8f9' }}>
                        <div className="flex items-center gap-3">
                          {member.imageUrl ? (
                            <img src={member.imageUrl} alt={member.name} className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#fdf2f4' }}>
                              <User className="w-4 h-4" style={{ color: '#a8556f' }} />
                            </div>
                          )}
                          <div>
                            <Link href={`/admin/member/${member.id}`} className="font-bold text-sm hover:underline block" style={{ color: '#a8556f' }}>{member.name}</Link>
                            {member.companyName ? (
                              <Link href={`/admin/company/${encodeURIComponent(member.companyName)}`} className="text-sm hover:underline block" style={{ color: '#6b5a60' }}>{member.companyName}</Link>
                            ) : (
                              <span className="text-sm block" style={{ color: '#6b5a60' }}>بدون شركة</span>
                            )}
                            {member.jobTitle ? (
                              <Link href={`/admin/job-title/${encodeURIComponent(member.jobTitle)}`} className="text-xs mt-1 hover:underline block" style={{ color: '#9a8a90' }}>{member.jobTitle}</Link>
                            ) : (
                              <p className="text-xs mt-1" style={{ color: '#9a8a90' }}>-</p>
                            )}
                          </div>
                        </div>
                        {member.gender && (
                          <Badge className="text-xs" style={{ background: member.gender === 'female' ? '#fdf2f4' : '#e8f4fd', color: member.gender === 'female' ? '#a8556f' : '#1e6bb8' }}>
                            {member.gender === 'female' ? 'سيدة' : 'رجل'}
                          </Badge>
                        )}
                      </div>
                    ))}
                    {allMembersList.length === 0 && <p className="text-center py-4" style={{ color: '#9a8a90' }}>لا يوجد أعضاء</p>}
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border" style={{ borderColor: '#f0e0e4' }}>
                <CardContent className="p-6">
                  <h3 className="text-base font-bold mb-4" style={{ color: '#2d1f26' }}>أحدث طلبات الرعاية</h3>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {sponsorRequests.slice(0, 5).map(sponsor => (
                      <div key={sponsor.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: '#fdf8f9' }}>
                        <div>
                          <p className="font-bold text-sm" style={{ color: '#a8556f' }}>{sponsor.companyName}</p>
                          <p className="text-sm" style={{ color: '#6b5a60' }}>{sponsorshipTypeLabels[sponsor.sponsorshipType]}</p>
                        </div>
                        <Badge className="text-xs" style={getStatusStyle(sponsor.status)}>{statusLabels[sponsor.status] || sponsor.status}</Badge>
                      </div>
                    ))}
                    {sponsorRequests.length === 0 && <p className="text-center py-4" style={{ color: '#9a8a90' }}>لا توجد طلبات</p>}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Events */}
          <TabsContent value="events" dir="rtl">
            {viewingEventRegistrations ? (
              /* Event Registrations Page */
              <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <Button 
                      variant="ghost" 
                      onClick={() => setViewingEventRegistrations(null)}
                      className="rounded-full"
                      style={{ color: '#6b5a60' }}
                    >
                      <X className="w-5 h-5" />
                      إغلاق
                    </Button>
                    <div>
                      <h2 className="text-2xl font-bold" style={{ color: '#2d1f26' }}>إدارة اللقاء</h2>
                      <p className="text-sm" style={{ color: '#6b5a60' }}>{viewingEventRegistrations.title}</p>
                    </div>
                  </div>
                  
                  {/* أزرار الإضافة والإجراءات */}
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      onClick={() => toggleEventPublish(viewingEventRegistrations.id, !viewingEventRegistrations.isPublished)}
                      className="rounded-xl gap-2"
                      style={{ background: viewingEventRegistrations.isPublished ? '#f5e6ea' : '#e8f0ea', color: viewingEventRegistrations.isPublished ? '#8a5a6a' : '#4a7d54' }}
                    >
                      <Globe className="w-4 h-4" />
                      {viewingEventRegistrations.isPublished ? 'إلغاء النشر' : 'نشر'}
                    </Button>
                    <Button
                      onClick={() => window.open(`/register?event=${viewingEventRegistrations.id}${!viewingEventRegistrations.isPublished ? '&preview=true' : ''}`, '_blank')}
                      className="rounded-xl gap-2"
                      style={{ background: '#f0f4f8', color: '#5a6b78' }}
                    >
                      <Eye className="w-4 h-4" />
                      معاينة صفحة التسجيل
                    </Button>
                    <Button
                      onClick={() => {
                        localStorage.setItem('invitationPreview', JSON.stringify({ eventForm: viewingEventRegistrations, selectedSponsors: [], sponsorRequests: [] }))
                        window.open('/invitation-preview', '_blank')
                      }}
                      className="rounded-xl gap-2"
                      style={{ background: '#f5eef0', color: '#8a5a6a' }}
                    >
                      <Mail className="w-4 h-4" />
                      معاينة الدعوة
                    </Button>
                    <Button
                      onClick={acceptAllRegistrations}
                      className="rounded-xl gap-2"
                      style={{ background: '#e8f0ea', color: '#4a7d54' }}
                    >
                      <CheckCheck className="w-4 h-4" />
                      قبول الكل
                    </Button>
                    <Button
                      onClick={() => setShowCancelModal(true)}
                      className="rounded-xl gap-2"
                      style={{ background: '#fce8e8', color: '#8a3a3a' }}
                    >
                      <X className="w-4 h-4" />
                      إلغاء القبول
                    </Button>
                    <Link href={`/admin/add-members/${viewingEventRegistrations.id}`}>
                      <Button
                        className="rounded-xl gap-2"
                        style={{ background: '#f5eef0', color: '#8a5a6a' }}
                      >
                        <Users className="w-4 h-4" />
                        إضافة من الأعضاء
                      </Button>
                    </Link>
                    <Button
                      onClick={() => setShowAddGuestModal(true)}
                      className="rounded-xl gap-2"
                      style={{ background: '#e8ecf0', color: '#5a6a78' }}
                    >
                      <UserPlus className="w-4 h-4" />
                      إضافة يدوياً
                    </Button>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <Card className="rounded-xl border" style={{ borderColor: '#f0e0e4' }}>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold" style={{ color: '#2d1f26' }}>
                        {toEnglishNumbers(registrations.filter(r => r.eventId === viewingEventRegistrations.id).length)}
                      </div>
                      <div className="text-xs" style={{ color: '#6b5a60' }}>إجمالي المسجلين</div>
                    </CardContent>
                  </Card>
                  <Card className="rounded-xl border" style={{ borderColor: '#f0e0e4' }}>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold" style={{ color: '#3a7d44' }}>
                        {toEnglishNumbers(registrations.filter(r => r.eventId === viewingEventRegistrations.id && r.status === 'confirmed').length)}
                      </div>
                      <div className="text-xs" style={{ color: '#6b5a60' }}>مؤكد</div>
                    </CardContent>
                  </Card>
                  <Card className="rounded-xl border" style={{ borderColor: '#f0e0e4' }}>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold" style={{ color: '#9a6b1a' }}>
                        {toEnglishNumbers(registrations.filter(r => r.eventId === viewingEventRegistrations.id && r.status === 'pending').length)}
                      </div>
                      <div className="text-xs" style={{ color: '#6b5a60' }}>قيد الانتظار</div>
                    </CardContent>
                  </Card>
                  <Card className="rounded-xl border" style={{ borderColor: '#f0e0e4' }}>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold" style={{ color: '#8a3a3a' }}>
                        {toEnglishNumbers(registrations.filter(r => r.eventId === viewingEventRegistrations.id && r.status === 'cancelled').length)}
                      </div>
                      <div className="text-xs" style={{ color: '#6b5a60' }}>ملغي</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Registrations Table */}
                <Card className="rounded-2xl border" style={{ borderColor: '#f0e0e4' }}>
                  <CardContent className="p-6">
                    {/* البحث وفلتر الجنس */}
                    <div className="flex flex-wrap items-center gap-4 mb-4">
                      {/* البحث */}
                      <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9a8a90' }} />
                        <Input
                          value={registrationSearch}
                          onChange={e => setRegistrationSearch(e.target.value)}
                          placeholder="بحث بالاسم، الشركة، المنصب..."
                          className="h-10 pr-10 rounded-xl"
                          style={{ borderColor: '#e8d8dc' }}
                        />
                      </div>
                      
                      {/* فلتر الجنس */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium" style={{ color: '#2d1f26' }}>الجنس:</span>
                        <Button
                          size="sm"
                          variant={registrationGenderFilter === 'all' ? 'default' : 'outline'}
                          onClick={() => setRegistrationGenderFilter('all')}
                          className="rounded-full"
                          style={registrationGenderFilter === 'all' ? { background: '#d8c0c8', color: '#5a4a50' } : { borderColor: '#e8d8dc', color: '#6b5a60' }}
                        >
                          الكل
                        </Button>
                        <Button
                          size="sm"
                          variant={registrationGenderFilter === 'female' ? 'default' : 'outline'}
                          onClick={() => setRegistrationGenderFilter('female')}
                          className="rounded-full"
                          style={registrationGenderFilter === 'female' ? { background: '#d8c0c8', color: '#5a4a50' } : { borderColor: '#e8d8dc', color: '#6b5a60' }}
                        >
                          سيدات
                        </Button>
                        <Button
                          size="sm"
                          variant={registrationGenderFilter === 'male' ? 'default' : 'outline'}
                          onClick={() => setRegistrationGenderFilter('male')}
                          className="rounded-full"
                          style={registrationGenderFilter === 'male' ? { background: '#d8c0c8', color: '#5a4a50' } : { borderColor: '#e8d8dc', color: '#6b5a60' }}
                        >
                          رجال
                        </Button>
                      </div>
                    </div>
                    
                    <Table className="w-full">
                      <TableHeader>
                        <TableRow style={{ background: '#fdf8f9' }}>
                          <TableHead className="text-right font-bold w-1/5" style={{ color: '#2d1f26' }}>الاسم</TableHead>
                          <TableHead className="text-right font-bold w-1/6" style={{ color: '#2d1f26' }}>الشركة</TableHead>
                          <TableHead className="text-right font-bold w-1/6" style={{ color: '#2d1f26' }}>المنصب</TableHead>
                          <TableHead className="text-center font-bold w-1/12" style={{ color: '#2d1f26' }}>الجنس</TableHead>
                          <TableHead className="text-center font-bold w-1/12" style={{ color: '#2d1f26' }}>الحالة</TableHead>
                          <TableHead className="text-center font-bold w-1/4" style={{ color: '#2d1f26' }}>
                            <div className="flex justify-center gap-1 text-xs">
                              <span>قبول</span>
                              <span className="mx-1">|</span>
                              <span>رفض</span>
                              <span className="mx-1">|</span>
                              <span>دعوة</span>
                              <span className="mx-1">|</span>
                              <span>واتساب</span>
                              <span className="mx-1">|</span>
                              <span>حذف</span>
                            </div>
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(() => {
                          // إزالة التكرارات بناءً على البريد الإلكتروني والاسم
                          const uniqueRegistrations = new Map<string, typeof registrations[0]>()
                          registrations
                            .filter(r => r.eventId === viewingEventRegistrations.id)
                            .filter(r => registrationGenderFilter === 'all' || r.gender === registrationGenderFilter)
                            .filter(r => {
                              if (!registrationSearch) return true
                              const search = registrationSearch.toLowerCase()
                              return (
                                r.name.toLowerCase().includes(search) ||
                                (r.companyName?.toLowerCase().includes(search) ?? false) ||
                                (r.jobTitle?.toLowerCase().includes(search) ?? false)
                              )
                            })
                            .forEach(r => {
                              // استخدام البريد الإلكتروني كمفتاح فريد
                              const key = r.email.toLowerCase()
                              if (!uniqueRegistrations.has(key)) {
                                uniqueRegistrations.set(key, r)
                              }
                            })
                          
                          return Array.from(uniqueRegistrations.values()).map(reg => (
                            <TableRow key={reg.id}>
                              <TableCell className="font-medium whitespace-normal break-words" style={{ color: '#2d1f26' }}>
                                <Link 
                                  href={`/admin/member/${reg.memberId || reg.id}`}
                                  className="hover:underline cursor-pointer"
                                  style={{ color: '#a8556f' }}
                                >
                                  {reg.name}
                                </Link>
                              </TableCell>
                              <TableCell className="whitespace-normal break-words" style={{ color: '#6b5a60' }}>{reg.companyName || '-'}</TableCell>
                              <TableCell className="whitespace-normal break-words" style={{ color: '#6b5a60' }}>{reg.jobTitle || '-'}</TableCell>
                              <TableCell className="text-center">
                                <span className="text-sm font-medium" style={{ color: reg.gender === 'male' ? '#1e6bb8' : reg.gender === 'female' ? '#a8556f' : '#6b5a60' }}>{reg.gender === 'male' ? 'ذكر' : reg.gender === 'female' ? 'أنثى' : '-'}</span>
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge style={getStatusStyle(reg.status)}>
                                  {reg.status === 'pending' ? 'قيد الانتظار' : 
                                   reg.status === 'confirmed' ? 'مؤكد' : 
                                   reg.status === 'attended' ? 'حضر' : 'ملغي'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2 flex-wrap items-center justify-center">
                                  {/* قبول - يعطل فقط إذا كانت الحالة مؤكد */}
                                  <Button
                                    size="sm"
                                    className="rounded-xl h-8 px-3"
                                    style={{ background: reg.status === 'confirmed' ? '#f0f0f0' : '#a8556f', color: reg.status === 'confirmed' ? '#999' : 'white' }}
                                    disabled={reg.status === 'confirmed'}
                                    onClick={() => acceptRegistration(reg.id)}
                                    title="قبول"
                                  >
                                    <Check className="w-4 h-4" />
                                  </Button>

                                  {/* رفض - يعطل فقط إذا كانت الحالة ملغي */}
                                  <Button
                                    size="sm"
                                    className="rounded-xl h-8 px-3"
                                    style={{ background: reg.status === 'cancelled' ? '#f0f0f0' : '#fce8e8', color: reg.status === 'cancelled' ? '#999' : '#dc2626' }}
                                    disabled={reg.status === 'cancelled'}
                                    onClick={() => rejectRegistration(reg.id)}
                                    title="رفض"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                  
                                  {/* تحميل الدعوة */}
                                  <Button 
                                    size="sm" 
                                    className="rounded-xl h-8 px-3" 
                                    style={{ background: '#f5eef0', color: '#8a5a6a' }}
                                    onClick={() => {
                                      const invitationData = {
                                        eventForm: {
                                          title: viewingEventRegistrations.title,
                                          description: viewingEventRegistrations.description,
                                          date: viewingEventRegistrations.date,
                                          startTime: viewingEventRegistrations.startTime,
                                          endTime: viewingEventRegistrations.endTime,
                                          location: viewingEventRegistrations.location,
                                          imageUrl: viewingEventRegistrations.imageUrl,
                                          guestName: viewingEventRegistrations.guestName,
                                          guestImage: viewingEventRegistrations.guestImage,
                                          guestOrganization: viewingEventRegistrations.guestOrganization,
                                          guestPosition: viewingEventRegistrations.guestPosition,
                                        },
                                        // بيانات الضيف/المسجل
                                        registrant: {
                                          name: reg.name,
                                          companyName: reg.companyName,
                                          jobTitle: reg.jobTitle,
                                          imageUrl: reg.imageUrl,
                                          gender: reg.gender
                                        },
                                        selectedSponsors: [],
                                        sponsorRequests: []
                                      }
                                      localStorage.setItem('invitationPreview', JSON.stringify(invitationData))
                                      window.open('/invitation-preview', '_blank')
                                    }}
                                    title="دعوة"
                                  >
                                    <Download className="w-4 h-4" />
                                  </Button>
                                  
                                  {/* واتساب */}
                                  <Button 
                                    size="sm" 
                                    className="rounded-xl h-8 px-3" 
                                    style={{ background: '#d4edda', color: '#3a7d44' }}
                                    onClick={() => {
                                      // Use phone from registration or look up in members
                                      const phone = reg.phone;
                                      if (phone) {
                                        const cleanPhone = phone.replace(/\D/g, '');
                                        const waLink = cleanPhone.startsWith('966') ? `https://wa.me/${cleanPhone}` : `https://wa.me/966${cleanPhone.replace(/^0/, '')}`;
                                        window.open(waLink, '_blank');
                                      } else {
                                        toast.error('لا يوجد رقم جوال')
                                      }
                                    }}
                                    title="واتساب"
                                  >
                                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                    </svg>
                                  </Button>
                                  
                                  {/* حذف */}
                                  <Button 
                                    size="sm" 
                                    className="rounded-xl h-8 px-3" 
                                    style={{ background: '#f5e6e8', color: '#8a5a6a' }}
                                    onClick={() => {
                                      if (confirm('هل أنت متأكد من حذف هذا التسجيل؟')) {
                                        deleteRegistration(reg.id)
                                      }
                                    }}
                                    title="حذف"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        })()}
                        {(() => {
                          const uniqueRegistrations = new Map<string, typeof registrations[0]>()
                          registrations
                            .filter(r => r.eventId === viewingEventRegistrations.id)
                            .filter(r => registrationGenderFilter === 'all' || r.gender === registrationGenderFilter)
                            .filter(r => {
                              if (!registrationSearch) return true
                              const search = registrationSearch.toLowerCase()
                              return (
                                r.name.toLowerCase().includes(search) ||
                                (r.companyName?.toLowerCase().includes(search) ?? false) ||
                                (r.jobTitle?.toLowerCase().includes(search) ?? false)
                              )
                            })
                            .forEach(r => {
                              const key = r.email.toLowerCase()
                              if (!uniqueRegistrations.has(key)) {
                                uniqueRegistrations.set(key, r)
                              }
                            })
                          return uniqueRegistrations.size === 0
                        })() && (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8" style={{ color: '#9a8a90' }}>
                              لا يوجد نتائج {registrationGenderFilter !== 'all' ? (registrationGenderFilter === 'female' ? 'لسيدات' : 'لرجال') : ''} {registrationSearch && `للبحث "${registrationSearch}"`}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            ) : editingEvent ? (
              /* Edit Event Page */
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-6">
                  <Button 
                    variant="ghost" 
                    onClick={() => { setEditingEvent(null); setEventForm(resetEventForm()); }}
                    className="rounded-full"
                    style={{ color: '#6b5a60' }}
                  >
                    <X className="w-5 h-5" />
                    إلغاء
                  </Button>
                  <h2 className="text-2xl font-bold" style={{ color: '#2d1f26' }}>تعديل اللقاء</h2>
                </div>
                
                <form onSubmit={handleUpdateEvent} className="space-y-4">
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
                        <Input value={eventForm.title} onChange={e => setEventForm(prev => ({ ...prev, title: e.target.value }))} required className="mt-2 h-12 rounded-xl" style={{ borderColor: '#e8d8dc' }} />
                      </div>
                      <div>
                        <Label className="text-sm font-medium" style={{ color: '#2d1f26' }}>الوصف</Label>
                        <Textarea value={eventForm.description} onChange={e => setEventForm(prev => ({ ...prev, description: e.target.value }))} rows={3} className="mt-2 resize-none rounded-xl" style={{ borderColor: '#e8d8dc' }} />
                      </div>
                      
                      {/* Event Type - Prominent */}
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
                          <EventStatusButton 
                            status="ended" 
                            label="منتهي" 
                            icon={CheckCircle2} 
                            color="ended"
                            selected={eventForm.status === 'ended'} 
                            onClick={() => setEventForm(prev => ({ ...prev, status: 'ended' }))} 
                          />
                        </div>
                      </div>
                      
                      {/* Publish/Unpublish Toggle - In Edit Form Only */}
                      <div className="p-4 rounded-2xl border-2" style={{ background: eventForm.isPublished ? '#d4edda' : '#fdf8f9', borderColor: eventForm.isPublished ? '#3a7d44' : '#e8d8dc' }}>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: eventForm.isPublished ? '#3a7d44' : '#e8d8dc' }}>
                            {eventForm.isPublished ? (
                              <Check className="w-5 h-5 text-white" />
                            ) : (
                              <X className="w-5 h-5" style={{ color: '#6b5a60' }} />
                            )}
                          </div>
                          <div>
                            <p className="font-bold" style={{ color: '#2d1f26' }}>حالة النشر</p>
                            <p className="text-sm" style={{ color: '#9a8a90' }}>
                              {eventForm.isPublished ? 'اللقاء منشور ومرئي للزوار' : 'اللقاء غير منشور - مخفي عن الزوار'}
                            </p>
                          </div>
                        </div>
                        <div className="flex rounded-xl overflow-hidden border" style={{ borderColor: eventForm.isPublished ? '#3a7d44' : '#e8d8dc' }}>
                          <button
                            type="button"
                            onClick={() => setEventForm(prev => ({ ...prev, isPublished: true }))}
                            className="flex-1 py-3 px-4 font-medium transition-all flex items-center justify-center gap-2"
                            style={{ 
                              background: eventForm.isPublished ? '#3a7d44' : 'white',
                              color: eventForm.isPublished ? 'white' : '#6b5a60'
                            }}
                          >
                            <Check className="w-5 h-5" />
                            منشور
                          </button>
                          <button
                            type="button"
                            onClick={() => setEventForm(prev => ({ ...prev, isPublished: false }))}
                            className="flex-1 py-3 px-4 font-medium transition-all flex items-center justify-center gap-2"
                            style={{ 
                              background: !eventForm.isPublished ? '#6b5a60' : 'white',
                              color: !eventForm.isPublished ? 'white' : '#6b5a60'
                            }}
                          >
                            <X className="w-5 h-5" />
                            غير منشور
                          </button>
                        </div>
                      </div>
                      
                      {/* Event Image Upload */}
                      <ImageUpload 
                        label="صورة اللقاء" 
                        value={eventForm.imageUrl} 
                        onChange={v => setEventForm(prev => ({ ...prev, imageUrl: v }))} 
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium" style={{ color: '#2d1f26' }}>تاريخ اللقاء *</Label>
                          <Input type="date" value={eventForm.date} onChange={e => setEventForm(prev => ({ ...prev, date: e.target.value }))} required className="mt-2 h-12 rounded-xl" style={{ borderColor: '#e8d8dc' }} />
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
                                  // Use Arabic locale for better results in Saudi Arabia
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
                          <p className="text-xs mt-1" style={{ color: '#9a8a90' }}>اضغط على زر الخريطة لمعاينة الموقع في قوقل ماب</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium" style={{ color: '#2d1f26' }}>وقت البداية</Label>
                          <Input type="time" value={eventForm.startTime} onChange={e => setEventForm(prev => ({ ...prev, startTime: e.target.value }))} className="mt-2 h-12 rounded-xl" style={{ borderColor: '#e8d8dc' }} />
                        </div>
                        <div>
                          <Label className="text-sm font-medium" style={{ color: '#2d1f26' }}>وقت الانتهاء</Label>
                          <Input type="time" value={eventForm.endTime} onChange={e => setEventForm(prev => ({ ...prev, endTime: e.target.value }))} className="mt-2 h-12 rounded-xl" style={{ borderColor: '#e8d8dc' }} />
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
                      {/* Guest Image - Prominent Display */}
                      <div className="flex justify-center">
                        <GuestImageUpload 
                          value={eventForm.guestImage} 
                          onChange={v => setEventForm(prev => ({ ...prev, guestImage: v }))} 
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium" style={{ color: '#2d1f26' }}>اسم الضيف</Label>
                          <Input value={eventForm.guestName} onChange={e => setEventForm(prev => ({ ...prev, guestName: e.target.value }))} className="mt-2 h-12 rounded-xl" style={{ borderColor: '#e8d8dc' }} />
                        </div>
                        <div>
                          <Label className="text-sm font-medium" style={{ color: '#2d1f26' }}>الجهة</Label>
                          <Input value={eventForm.guestOrganization} onChange={e => setEventForm(prev => ({ ...prev, guestOrganization: e.target.value }))} className="mt-2 h-12 rounded-xl" style={{ borderColor: '#e8d8dc' }} />
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium" style={{ color: '#2d1f26' }}>المنصب</Label>
                        <Input value={eventForm.guestPosition} onChange={e => setEventForm(prev => ({ ...prev, guestPosition: e.target.value }))} className="mt-2 h-12 rounded-xl" style={{ borderColor: '#e8d8dc' }} />
                      </div>
                      <div>
                        <Label className="text-sm font-medium" style={{ color: '#2d1f26' }}>حسابات التواصل الاجتماعي</Label>
                        <div className="grid grid-cols-4 gap-4 mt-2">
                          <Input value={eventForm.guestTwitter} onChange={e => setEventForm(prev => ({ ...prev, guestTwitter: e.target.value }))} placeholder="تويتر X" className="h-12 rounded-xl" style={{ borderColor: '#e8d8dc' }} />
                          <Input value={eventForm.guestInstagram} onChange={e => setEventForm(prev => ({ ...prev, guestInstagram: e.target.value }))} placeholder="انستغرام" className="h-12 rounded-xl" style={{ borderColor: '#e8d8dc' }} />
                          <Input value={eventForm.guestLinkedIn} onChange={e => setEventForm(prev => ({ ...prev, guestLinkedIn: e.target.value }))} placeholder="لينكد إن" className="h-12 rounded-xl" style={{ borderColor: '#e8d8dc' }} />
                          <Input value={eventForm.guestSnapchat} onChange={e => setEventForm(prev => ({ ...prev, guestSnapchat: e.target.value }))} placeholder="سناب شات" className="h-12 rounded-xl" style={{ borderColor: '#e8d8dc' }} />
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
                          <Input type="datetime-local" value={eventForm.registrationDeadline} onChange={e => setEventForm(prev => ({ ...prev, registrationDeadline: e.target.value }))} className="mt-2 h-12 rounded-xl" style={{ borderColor: '#e8d8dc' }} />
                        </div>
                        <div>
                          <Label className="text-sm font-medium" style={{ color: '#2d1f26' }}>نوع التسجيل *</Label>
                          <Select value={eventForm.registrationType} onValueChange={v => setEventForm(prev => ({ ...prev, registrationType: v }))}>
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
                          <Input type="number" value={eventForm.capacity} onChange={e => setEventForm(prev => ({ ...prev, capacity: parseInt(e.target.value) || 0 }))} required className="mt-2 h-12 rounded-xl" style={{ borderColor: '#e8d8dc' }} />
                        </div>
                        <div>
                          <Label className="text-sm font-medium" style={{ color: '#2d1f26' }}>الحد الأقصى للمرافقين</Label>
                          <Input type="number" value={eventForm.maxCompanions} onChange={e => setEventForm(prev => ({ ...prev, maxCompanions: parseInt(e.target.value) || 0 }))} className="mt-2 h-12 rounded-xl" style={{ borderColor: '#e8d8dc' }} />
                        </div>
                      </div>
                      {/* QR Code Toggle - Pill Design */}
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
                            <p className="text-sm" style={{ color: '#9a8a90' }}>إرسال رمز QR للمسجلين تلقائياً عند تأكيد التسجيل</p>
                          </div>
                        </div>
                        {/* Pill Toggle */}
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
                        { key: 'showHospitalityPreference', label: 'الرغبة في الضيافة', desc: 'عرض خيار الرغبة في الضيافة للتسجيل' },
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
                            {/* Pill Toggle */}
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

                  {/* Invitation Settings */}
                  <AccordionCard 
                    title="إعدادات الدعوة" 
                    icon={Mail} 
                    iconBg="#fdf2f4" 
                    iconColor="#a8556f"
                  >
                    <div className="space-y-6 pt-4">
                      {/* Sending Methods */}
                      <div className="grid grid-cols-2 gap-4">
                        {/* WhatsApp */}
                        <div className="p-4 rounded-2xl border-2" style={{ background: '#fdf8f9', borderColor: '#e8d8dc' }}>
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: whatsappEnabled ? '#d4edda' : '#e8d8dc' }}>
                              <svg className="w-5 h-5" viewBox="0 0 24 24" fill={whatsappEnabled ? '#3a7d44' : '#6b5a60'}>
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
                      
                      {/* Preview Invitation Button - Prominent */}
                      <div className="flex justify-center">
                        <Button 
                          type="button" 
                          onClick={() => {
                            // Save form data to localStorage and open preview in new tab
                            localStorage.setItem('invitationPreview', JSON.stringify({
                              eventForm,
                              selectedSponsors,
                              sponsorRequests: sponsorRequests.filter(s => s.status === 'approved')
                            }))
                            window.open('/invitation-preview', '_blank')
                          }}
                          className="rounded-full gap-2 px-10 py-6 text-lg font-medium"
                          style={{ background: '#e8d8dc', color: '#6b5a60' }}
                        >
                          <Eye className="w-6 h-6" />
                          معاينة الدعوة
                        </Button>
                      </div>
                    </div>
                  </AccordionCard>

                  <div className="flex gap-3 pt-6 justify-center">
                    <Button type="submit" className="w-40 rounded-full h-11 text-sm font-medium" style={{ background: '#e8d8dc', color: '#6b5a60' }}>حفظ التعديلات</Button>
                    <Button type="button" variant="outline" onClick={() => { setEditingEvent(null); setEventForm(resetEventForm()); }} className="w-40 rounded-full h-11 text-sm font-medium">إلغاء</Button>
                  </div>
                </form>
              </div>
            ) : (
              /* Events List */
              <>
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold" style={{ color: '#2d1f26' }}>إدارة اللقاءات</h2>
                    {(eventStatusFilter || eventPublishFilter) && (
                      <Badge 
                        className="gap-2 cursor-pointer"
                        style={{ background: '#fdf2f4', color: '#a8556f' }}
                        onClick={() => { setEventStatusFilter(null); setEventPublishFilter(null); }}
                      >
                        {eventPublishFilter === 'public' ? 'لقاءات عامة' : 
                         eventPublishFilter === 'private' ? 'لقاءات خاصة' : 
                         eventPublishFilter === 'pending' ? 'لقاءات غير منشورة' :
                         eventPublishFilter === 'published_open' ? 'منشور و متاح التسجيل' :
                         eventPublishFilter === 'published_closed' ? 'منشور و انتهى التسجيل' :
                         eventStatusFilter === 'open' ? 'لقاءات مفتوحة' :
                         eventStatusFilter === 'closed' ? 'لقاءات منتهية' :
                         eventStatusFilter === 'archived' ? 'لقاءات مؤرشفة' : ''}
                        <X className="w-3 h-3" />
                      </Badge>
                    )}
                  </div>
                  <Button className="rounded-full gap-2" style={{ background: '#e8d8dc', color: '#6b5a60' }} onClick={() => router.push('/admin/create-event')}>
                    <Plus className="w-4 h-4" />
                    إنشاء لقاء
                  </Button>
                </div>

                <Card className="rounded-2xl border" style={{ borderColor: '#f0e0e4' }}>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table dir="rtl">
                        <TableHeader>
                          <TableRow className="border-b" style={{ background: '#fdf8f9', borderColor: '#d8c8cc' }}>
                            <TableHead className="font-semibold text-right" style={{ color: '#2d1f26' }}>العنوان</TableHead>
                            <TableHead className="font-semibold text-right" style={{ color: '#2d1f26' }}>التاريخ</TableHead>
                            <TableHead className="font-semibold text-right" style={{ color: '#2d1f26' }}>النوع</TableHead>
                            <TableHead className="font-semibold text-right" style={{ color: '#2d1f26' }}>الحالة</TableHead>
                            <TableHead className="font-semibold text-right" style={{ color: '#2d1f26' }}>المسجلون</TableHead>
                            <TableHead className="font-semibold text-center w-12" style={{ color: '#2d1f26' }}>تعديل</TableHead>
                            <TableHead className="font-semibold text-center w-12" style={{ color: '#2d1f26' }}>أرشفة</TableHead>
                            <TableHead className="font-semibold text-center w-12" style={{ color: '#2d1f26' }}>حذف</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(() => {
                            // تطبيق الفلترة على اللقاءات
                            const filteredEvents = events.filter(event => {
                              // فلتر النشر
                              if (eventPublishFilter === 'public' && event.eventType !== 'public') return false
                              if (eventPublishFilter === 'private' && event.eventType !== 'private') return false
                              if (eventPublishFilter === 'pending' && event.isPublished) return false
                              if (eventPublishFilter === 'published' && !event.isPublished) return false
                              
                              // فلتر التاريخ للحسابات
                              const eventDate = new Date(event.date)
                              const today = new Date(new Date().toDateString())
                              
                              // فلتر اللقاءات المنشورة والمتاحة
                              if (eventPublishFilter === 'published_open') {
                                if (!event.isPublished) return false
                                if (event.status !== 'open') return false
                                if (eventDate < today) return false
                              }
                              
                              // فلتر اللقاءات المنشورة والمنتهية
                              if (eventPublishFilter === 'published_closed') {
                                if (!event.isPublished) return false
                                if (event.status !== 'closed' && !(event.status === 'open' && eventDate < today)) return false
                              }
                              
                              // فلتر الحالة - مع مراعاة التاريخ لللقاءات المفتوحة
                              if (eventStatusFilter === 'open') {
                                // مفتوح للتسجيل وتاريخه لم ينتهي
                                if (event.status !== 'open') return false
                                if (eventDate < today) return false
                              }
                              if (eventStatusFilter === 'closed') {
                                // مغلق أو مفتوح لكن تاريخه انتهى
                                if (event.status !== 'closed' && !(event.status === 'open' && eventDate < today)) return false
                              }
                              if (eventStatusFilter === 'ended' && event.status !== 'ended') return false
                              if (eventStatusFilter === 'archived' && event.status !== 'archived') return false
                              
                              return true
                            })
                            
                            return filteredEvents.map(event => {
                            const eventDate = new Date(event.date)
                            const today = new Date()
                            today.setHours(0, 0, 0, 0)
                            
                            let displayStatus = ''
                            let statusStyle = { background: '#f5f5f5', color: '#666' }
                            
                            if (event.status === 'ended' || event.status === 'archived') {
                              displayStatus = 'منتهية'
                              statusStyle = { background: '#f5f5f5', color: '#666' }
                            } else if (eventDate > today) {
                              if (event.status === 'open') {
                                displayStatus = 'مفتوح التسجيل'
                                statusStyle = { background: '#d4edda', color: '#3a7d44' }
                              } else {
                                displayStatus = 'قادمة'
                                statusStyle = { background: '#e8f4fd', color: '#1e6bb8' }
                              }
                            } else {
                              displayStatus = 'منتهية'
                              statusStyle = { background: '#f5f5f5', color: '#666' }
                            }
                            
                            return (
                            <TableRow key={event.id} className="border-b" style={{ borderColor: '#f0e0e4' }}>
                              <TableCell className="font-medium text-right">
                                <button 
                                  onClick={() => setViewingEventRegistrations(event)}
                                  className="hover:underline cursor-pointer text-right"
                                  style={{ color: '#a8556f' }}
                                >
                                  {event.title}
                                </button>
                              </TableCell>
                              <TableCell className="text-right" style={{ color: '#6b5a60' }}>{formatDate(event.date)}</TableCell>
                              <TableCell className="text-right">
                                <Badge className="text-xs" style={{ background: event.eventType === 'public' ? '#d4edda' : '#e8d8dc', color: event.eventType === 'public' ? '#3a7d44' : '#6b5a60' }}>
                                  {eventTypeLabels[event.eventType] || event.eventType}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <Badge className="text-xs" style={statusStyle}>{displayStatus}</Badge>
                              </TableCell>
                              <TableCell className="text-right" style={{ color: '#6b5a60' }}>{toEnglishNumbers(event._count?.registrations || 0)}/{toEnglishNumbers(event.capacity)}</TableCell>
                              <TableCell className="text-center w-12 p-1">
                                <Button size="sm" className="rounded-full w-8 h-8 p-0" style={{ background: '#e8d8dc', color: '#6b5a60' }} onClick={() => openEditEvent(event)} title="تعديل">
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </TableCell>
                              <TableCell className="text-center w-12 p-1">
                                {isSuperAdmin && (
                                  <Button 
                                    size="sm" 
                                    className="rounded-full w-8 h-8 p-0" 
                                    style={{ background: event.status === 'archived' ? '#d4edda' : '#f5f5f5', color: event.status === 'archived' ? '#3a7d44' : '#666' }} 
                                    onClick={() => archiveEvent(event.id, event.status !== 'archived')}
                                    title={event.status === 'archived' ? 'إلغاء الأرشفة' : 'أرشفة'}
                                  >
                                    <Archive className="w-4 h-4" />
                                  </Button>
                                )}
                              </TableCell>
                              <TableCell className="text-center w-12 p-1">
                                {isSuperAdmin && (
                                  <Button size="sm" className="rounded-full w-8 h-8 p-0" style={{ background: '#fce8e8', color: '#8a3a3a' }} onClick={() => handleDeleteEvent(event.id)} title="حذف">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          )})
                          })()}
                          {events.filter(event => {
                            if (eventPublishFilter === 'public' && event.eventType !== 'public') return false
                            if (eventPublishFilter === 'private' && event.eventType !== 'private') return false
                            if (eventPublishFilter === 'pending' && event.isPublished) return false
                            if (eventPublishFilter === 'published' && !event.isPublished) return false
                            
                            const eventDate = new Date(event.date)
                            const today = new Date(new Date().toDateString())
                            
                            if (eventPublishFilter === 'published_open') {
                              if (!event.isPublished) return false
                              if (event.status !== 'open') return false
                              if (eventDate < today) return false
                            }
                            if (eventPublishFilter === 'published_closed') {
                              if (!event.isPublished) return false
                              if (event.status !== 'closed' && !(event.status === 'open' && eventDate < today)) return false
                            }
                            if (eventStatusFilter === 'open') {
                              if (event.status !== 'open') return false
                              if (eventDate < today) return false
                            }
                            if (eventStatusFilter === 'closed') {
                              if (event.status !== 'closed' && !(event.status === 'open' && eventDate < today)) return false
                            }
                            if (eventStatusFilter === 'ended' && event.status !== 'ended') return false
                            if (eventStatusFilter === 'archived' && event.status !== 'archived') return false
                            return true
                          }).length === 0 && (
                            <TableRow>
                              <TableCell colSpan={8} className="text-center py-8" style={{ color: '#9a8a90' }}>لا توجد لقاءات</TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Registrations */}
          <TabsContent value="registrations" dir="rtl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold" style={{ color: '#2d1f26' }}>إدارة الأعضاء</h2>
              <div className="flex gap-3">
                <Button variant="outline" className="rounded-full gap-2" style={{ borderColor: '#e8d8dc', color: '#6b5a60' }} onClick={() => setShowAddMemberModal(true)}>
                  <Plus className="w-4 h-4" />
                  إضافة عضو
                </Button>
                {adminPermissions?.export && (
                  <Button variant="outline" className="rounded-full gap-2" onClick={() => setShowExportModal('members')}>
                    <Download className="w-4 h-4" />
                    تصدير
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="rounded-full gap-2"
                  style={{ borderColor: '#e8d8dc', color: '#6b5a60' }}
                  onClick={async () => {
                    try {
                      const res = await fetch('/api/admin/restore-members', { method: 'POST' })
                      const data = await res.json()
                      if (res.ok && data.success) {
                        toast.success(data.message)
                        fetchData()
                      } else {
                        toast.error(data.error || 'حدث خطأ')
                      }
                    } catch {
                      toast.error('حدث خطأ في الاتصال')
                    }
                  }}
                >
                  <Users className="w-4 h-4" />
                  استعادة الأعضاء المفقودين
                </Button>
              </div>
            </div>

            {/* Member Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="rounded-2xl border" style={{ borderColor: '#f0e0e4' }}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: '#fdf2f4' }}>
                      <Users className="w-6 h-6" style={{ color: '#a8556f' }} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold" style={{ color: '#2d1f26' }}>{toEnglishNumbers(allMembersList.length)}</p>
                      <p className="text-sm" style={{ color: '#6b5a60' }}>إجمالي الأعضاء</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl border" style={{ borderColor: '#f0e0e4' }}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: '#e8d8dc' }}>
                      <Users className="w-6 h-6" style={{ color: '#6b5a60' }} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold" style={{ color: '#2d1f26' }}>{toEnglishNumbers(members.filter(m => m.gender === 'female').length)}</p>
                      <p className="text-sm" style={{ color: '#6b5a60' }}>سيدات</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl border" style={{ borderColor: '#f0e0e4' }}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: '#fce8e8' }}>
                      <User className="w-6 h-6" style={{ color: '#8a3a3a' }} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold" style={{ color: '#2d1f26' }}>{toEnglishNumbers(members.filter(m => m.gender === 'male').length)}</p>
                      <p className="text-sm" style={{ color: '#6b5a60' }}>رجال</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search */}
            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#9a8a90' }} />
                <Input
                  placeholder="ابحث بالاسم أو اسم الشركة أو البريد الإلكتروني..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="h-11 rounded-xl pr-10"
                  style={{ borderColor: '#e8d8dc' }}
                />
              </div>
            </div>

            <Card className="rounded-2xl border" style={{ borderColor: '#f0e0e4' }}>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table dir="rtl">
                    <TableHeader>
                      <TableRow className="border-b" style={{ background: '#fdf8f9', borderColor: '#d8c8cc' }}>
                        <TableHead className="font-semibold text-right" style={{ color: '#2d1f26' }}>الاسم</TableHead>
                        <TableHead className="font-semibold text-right" style={{ color: '#2d1f26' }}>الشركة</TableHead>
                        <TableHead className="font-semibold text-right" style={{ color: '#2d1f26' }}>المنصب</TableHead>
                        <TableHead className="font-semibold text-right" style={{ color: '#2d1f26' }}>عدد اللقاءات</TableHead>
                        <TableHead className="font-semibold text-right" style={{ color: '#2d1f26' }}>الجنس</TableHead>
                        <TableHead className="font-semibold text-center w-12" style={{ color: '#2d1f26' }}>واتساب</TableHead>
                        <TableHead className="font-semibold text-center w-12" style={{ color: '#2d1f26' }}>تعديل</TableHead>
                        <TableHead className="font-semibold text-center w-12" style={{ color: '#2d1f26' }}>حذف</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMembers.map(member => (
                        <TableRow key={member.id} className="border-b" style={{ borderColor: '#f0e0e4' }}>
                          <TableCell className="font-medium text-right">
                            <div className="flex items-center gap-3">
                              {member.imageUrl ? (
                                <Link href={`/admin/member/${member.id}`}>
                                  <img src={member.imageUrl} alt={member.name} className="w-8 h-8 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity" />
                                </Link>
                              ) : (
                                <Link href={`/admin/member/${member.id}`}>
                                  <div className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity" style={{ background: '#fdf2f4' }}>
                                    <User className="w-4 h-4" style={{ color: '#a8556f' }} />
                                  </div>
                                </Link>
                              )}
                              <Link 
                                href={`/admin/member/${member.id}`}
                                className="hover:underline text-right"
                                style={{ color: '#a8556f' }}
                              >
                                {member.name}
                              </Link>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {member.companyName ? (
                              <Link href={`/admin/company/${encodeURIComponent(member.companyName)}`} className="hover:underline" style={{ color: '#6b5a60' }}>
                                {member.companyName}
                              </Link>
                            ) : (
                              <span style={{ color: '#9a8a90' }}>-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {member.jobTitle ? (
                              <Link href={`/admin/job-title/${encodeURIComponent(member.jobTitle)}`} className="hover:underline text-xs" style={{ color: '#6b5a60' }}>
                                {member.jobTitle}
                              </Link>
                            ) : (
                              <span style={{ color: '#9a8a90' }}>-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right" style={{ color: '#6b5a60' }}>
                            {toEnglishNumbers(member.eventsCount || 0)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge className="text-xs" style={{ background: member.gender === 'female' ? '#fdf2f4' : '#e8f4fd', color: member.gender === 'female' ? '#a8556f' : '#1e6bb8' }}>
                              {member.gender === 'female' ? 'أنثى' : member.gender === 'male' ? 'ذكر' : '-'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center w-12 p-1">
                            {member.phone && (
                              <Button 
                                size="sm" 
                                className="rounded-full w-8 h-8 p-0" 
                                style={{ background: '#d4edda', color: '#3a7d44' }}
                                onClick={() => {
                                  const phone = member.phone?.replace(/\D/g, '') || '';
                                  const waLink = phone.startsWith('966') ? `https://wa.me/${phone}` : `https://wa.me/966${phone.replace(/^0/, '')}`;
                                  window.open(waLink, '_blank');
                                }}
                                title="واتساب"
                              >
                                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                </svg>
                              </Button>
                            )}
                          </TableCell>
                          <TableCell className="text-center w-12 p-1">
                            <Button 
                              size="sm" 
                              className="rounded-full w-8 h-8 p-0" 
                              style={{ background: '#fdf2f4', color: '#a8556f' }}
                              onClick={() => openEditMember(member)}
                              title="تعديل"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </TableCell>
                          <TableCell className="text-center w-12 p-1">
                            {isSuperAdmin && (
                              <Button 
                                size="sm" 
                                className="rounded-full w-8 h-8 p-0" 
                                style={{ background: '#fce8e8', color: '#dc2626' }}
                                onClick={() => handleDeleteMember(member)}
                                title="حذف"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredMembers.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8" style={{ color: '#9a8a90' }}>لا يوجد أعضاء</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sponsors */}
          <TabsContent value="sponsors" dir="rtl">
            {viewingSponsor ? (
              /* Sponsor Details Page */
              <div className="max-w-3xl mx-auto" dir="rtl">
                <div className="flex items-center gap-4 mb-6">
                  <Button 
                    variant="ghost" 
                    onClick={() => setViewingSponsor(null)}
                    className="rounded-full"
                    style={{ color: '#6b5a60' }}
                  >
                    <X className="w-5 h-5" />
                    إغلاق
                  </Button>
                  <h2 className="text-2xl font-bold" style={{ color: '#2d1f26' }}>ملف الراعي</h2>
                </div>
                
                {/* Header with Logo and Name */}
                <div className="flex items-center gap-6 mb-4 p-6 rounded-2xl" style={{ background: '#fdf8f9' }}>
                  {viewingSponsor.logoUrl ? (
                    <img 
                      src={viewingSponsor.logoUrl} 
                      alt={viewingSponsor.companyName}
                      className="w-24 h-24 rounded-lg object-contain"
                      style={{ background: '#fdf8f9' }}
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-lg flex items-center justify-center" style={{ background: '#e8d8dc' }}>
                      <Building2 className="w-12 h-12 text-white" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-1" style={{ color: '#2d1f26' }}>{viewingSponsor.companyName}</h3>
                    <p className="text-sm" style={{ color: '#6b5a60' }}>{viewingSponsor.sponsorType === 'company' ? 'شركة' : viewingSponsor.sponsorType === 'individual' ? 'فرد' : '-'}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 mb-6">
                  <Button 
                    variant="outline"
                    type="button"
                    className="rounded-full gap-2 flex-1 min-w-[140px]"
                    style={{ borderColor: '#e8d8dc', color: '#6b5a60' }}
                    onClick={openEditSponsor}
                  >
                    <Edit className="w-4 h-4" />
                    تعديل البيانات
                  </Button>
                  <Button 
                    variant="outline"
                    type="button"
                    className="rounded-full gap-2 flex-1 min-w-[140px]"
                    style={{ borderColor: '#e8d8dc', color: '#6b5a60' }}
                    onClick={() => setShowAddToEventModal(true)}
                  >
                    <Calendar className="w-4 h-4" />
                    إضافة إلى حدث
                  </Button>
                  <Button 
                    variant="outline"
                    type="button"
                    className="rounded-full gap-2 flex-1 min-w-[140px]"
                    style={{ borderColor: '#e8d8dc', color: '#6b5a60' }}
                    onClick={() => setShowLinkToMemberModal(true)}
                  >
                    <UserCheck className="w-4 h-4" />
                    ربط بعضو
                  </Button>
                  {viewingSponsor.phone && (
                    <Button 
                      variant="outline"
                      type="button"
                      className="rounded-full gap-2 flex-1 min-w-[140px]"
                      style={{ borderColor: '#e8d8dc', color: '#6b5a60' }}
                      onClick={() => {
                        const phone = viewingSponsor.phone.replace(/\D/g, '');
                        const waLink = phone.startsWith('966') ? `https://wa.me/${phone}` : `https://wa.me/966${phone.replace(/^0/, '')}`;
                        window.open(waLink, '_blank');
                      }}
                    >
                      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="#3a7d44">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      واتساب
                    </Button>
                  )}
                </div>

                {/* Stats */}
                <div className={`grid gap-4 mb-6 ${viewingSponsor.sponsorshipType === 'financial' ? 'grid-cols-3' : 'grid-cols-2'}`}>
                  <div className="p-4 rounded-xl text-center" style={{ background: '#fdf8f9' }}>
                    <p className="text-3xl font-bold mb-1" style={{ color: '#a8556f' }}>{toEnglishNumbers(sponsorEvents.length)}</p>
                    <p className="text-sm" style={{ color: '#6b5a60' }}>اللقاءات التي رعاها</p>
                  </div>
                  {viewingSponsor.sponsorshipType === 'financial' && (
                    <div className="p-4 rounded-xl text-center" style={{ background: '#fdf8f9' }}>
                      <p className="text-3xl font-bold mb-1" style={{ color: '#a8556f' }}>{viewingSponsor.amount ? toEnglishNumbers(viewingSponsor.amount) : '-'}</p>
                      <p className="text-sm" style={{ color: '#6b5a60' }}>إجمالي الرعايات (ريال)</p>
                    </div>
                  )}
                  <div className="p-4 rounded-xl text-center" style={{ background: '#fdf8f9' }}>
                    <p className="text-lg font-bold mb-1" style={{ color: '#a8556f' }}>{toEnglishNumbers(new Date(viewingSponsor.createdAt).toLocaleDateString('en-US'))}</p>
                    <p className="text-sm" style={{ color: '#6b5a60' }}>تاريخ الانضمام</p>
                  </div>
                </div>

                {/* Contact Info */}
                <Card className="rounded-2xl border mb-6" style={{ borderColor: '#f0e0e4' }}>
                  <CardContent className="p-6">
                    <h4 className="text-lg font-bold mb-4" style={{ color: '#2d1f26' }}>معلومات التواصل</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl flex items-center gap-3" style={{ background: '#fdf8f9' }}>
                        <User className="w-5 h-5" style={{ color: '#a8556f' }} />
                        <div>
                          <p className="text-xs" style={{ color: '#9a8a90' }}>المسؤول</p>
                          <p className="font-medium" style={{ color: '#2d1f26' }}>{viewingSponsor.contactName}</p>
                        </div>
                      </div>
                      <div className="p-4 rounded-xl flex items-center gap-3" style={{ background: '#fdf8f9' }}>
                        <Mail className="w-5 h-5" style={{ color: '#a8556f' }} />
                        <div>
                          <p className="text-xs" style={{ color: '#9a8a90' }}>البريد الإلكتروني</p>
                          <p className="font-medium" style={{ color: '#2d1f26' }}>{viewingSponsor.email}</p>
                        </div>
                      </div>
                      <div className="p-4 rounded-xl flex items-center gap-3" style={{ background: '#fdf8f9' }}>
                        <Phone className="w-5 h-5" style={{ color: '#a8556f' }} />
                        <div>
                          <p className="text-xs" style={{ color: '#9a8a90' }}>رقم الجوال</p>
                          <p className="font-medium" style={{ color: '#2d1f26' }} dir="ltr">{toEnglishNumbers(viewingSponsor.phone)}</p>
                        </div>
                      </div>
                      <div className="p-4 rounded-xl flex items-center gap-3" style={{ background: '#fdf8f9' }}>
                        <Handshake className="w-5 h-5" style={{ color: '#a8556f' }} />
                        <div>
                          <p className="text-xs" style={{ color: '#9a8a90' }}>نوع الرعاية</p>
                          <p className="font-medium" style={{ color: '#2d1f26' }}>{sponsorshipTypeLabels[viewingSponsor.sponsorshipType]}</p>
                        </div>
                      </div>
                    </div>
                    {viewingSponsor.websiteUrl && (
                      <div className="mt-4 p-4 rounded-xl flex items-center gap-3" style={{ background: '#fdf8f9' }}>
                        <Globe className="w-5 h-5" style={{ color: '#a8556f' }} />
                        <div>
                          <p className="text-xs" style={{ color: '#9a8a90' }}>الموقع الإلكتروني</p>
                          <a href={viewingSponsor.websiteUrl} target="_blank" rel="noopener noreferrer" className="font-medium" style={{ color: '#a8556f' }}>{viewingSponsor.websiteUrl}</a>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Notes Section */}
                <Card className="rounded-2xl border mb-6" style={{ borderColor: '#f0e0e4' }}>
                  <CardContent className="p-6">
                    <h4 className="text-lg font-bold mb-4" style={{ color: '#2d1f26' }}>الملاحظات</h4>
                    
                    {/* Add New Note */}
                    <div className="flex gap-3 mb-6">
                      <Textarea
                        value={newNoteContent}
                        onChange={(e) => setNewNoteContent(e.target.value)}
                        placeholder="اكتب ملاحظة جديدة..."
                        rows={2}
                        className="rounded-xl resize-none flex-1"
                        style={{ borderColor: '#e8d8dc', background: '#fdf8f9' }}
                      />
                      <Button
                        type="button"
                        onClick={handleAddNote}
                        disabled={!newNoteContent.trim()}
                        className="rounded-full px-6 h-fit self-end"
                        style={{ background: '#e8d8dc', color: '#6b5a60' }}
                      >
                        إرسال
                      </Button>
                    </div>
                    
                    {/* Notes List */}
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {sponsorNotesList.length > 0 ? (
                        sponsorNotesList.map((note) => (
                          <div key={note.id} className="p-4 rounded-xl" style={{ background: '#fdf8f9' }}>
                            <p className="text-sm mb-2" style={{ color: '#2d1f26' }}>{note.content}</p>
                            <div className="flex items-center gap-3 text-xs" style={{ color: '#9a8a90' }}>
                              <span>{note.authorName}</span>
                              <span>•</span>
                              <span>{toEnglishNumbers(new Date(note.createdAt).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }))}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-center py-4" style={{ color: '#9a8a90' }}>لا توجد ملاحظات</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Social Media */}
                <Card className="rounded-2xl border mb-6" style={{ borderColor: '#f0e0e4' }}>
                  <CardContent className="p-6">
                    <h4 className="text-lg font-bold mb-4" style={{ color: '#2d1f26' }}>حسابات التواصل الاجتماعي</h4>
                    <div className="flex flex-wrap gap-3">
                      {viewingSponsor.profileUrl && (
                        <a href={viewingSponsor.profileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: '#fdf8f9' }}>
                          <Globe className="w-5 h-5" style={{ color: '#a8556f' }} />
                          <span className="text-sm" style={{ color: '#2d1f26' }}>الملف التعريفي</span>
                        </a>
                      )}
                      {viewingSponsor.instagram && (
                        <a href={viewingSponsor.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: '#fdf8f9' }}>
                          <Instagram className="w-5 h-5" style={{ color: '#E1306C' }} />
                          <span className="text-sm" style={{ color: '#2d1f26' }}>Instagram</span>
                        </a>
                      )}
                      {viewingSponsor.twitter && (
                        <a href={viewingSponsor.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: '#fdf8f9' }}>
                          <Twitter className="w-5 h-5" style={{ color: '#1DA1F2' }} />
                          <span className="text-sm" style={{ color: '#2d1f26' }}>Twitter</span>
                        </a>
                      )}
                      {viewingSponsor.snapchat && (
                        <a href={viewingSponsor.snapchat} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: '#fdf8f9' }}>
                          <img src="/snapchat-logo.png" alt="Snapchat" className="w-5 h-5" />
                          <span className="text-sm" style={{ color: '#2d1f26' }}>Snapchat</span>
                        </a>
                      )}
                      {viewingSponsor.tiktok && (
                        <a href={viewingSponsor.tiktok} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: '#fdf8f9' }}>
                          <Youtube className="w-5 h-5" style={{ color: '#000000' }} />
                          <span className="text-sm" style={{ color: '#2d1f26' }}>TikTok</span>
                        </a>
                      )}
                      {!viewingSponsor.profileUrl && !viewingSponsor.instagram && !viewingSponsor.twitter && !viewingSponsor.snapchat && !viewingSponsor.tiktok && (
                        <p className="text-sm" style={{ color: '#9a8a90' }}>لا توجد حسابات مسجلة</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Events Sponsored */}
                <Card className="rounded-2xl border mb-6" style={{ borderColor: '#f0e0e4' }}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-bold" style={{ color: '#2d1f26' }}>اللقاءات التي رعاها</h4>
                      <div className="flex items-center gap-2">
                        <Badge className="text-sm px-3 py-1" style={{ background: '#a8556f', color: 'white' }}>
                          {toEnglishNumbers(sponsorEvents.length)} لقاء
                        </Badge>
                        <Button
                          type="button"
                          size="sm"
                          className="rounded-full gap-1"
                          style={{ background: '#e8d8dc', color: '#6b5a60' }}
                          onClick={() => setShowAddToEventModal(true)}
                        >
                          <Plus className="w-4 h-4" />
                          إضافة لقاء
                        </Button>
                      </div>
                    </div>
                    {sponsorEvents.length > 0 ? (
                      <div className="space-y-3">
                        {sponsorEvents.map(event => (
                          <div key={event.id} className="p-4 rounded-xl flex items-center justify-between" style={{ background: '#fdf8f9' }}>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#e8d8dc' }}>
                                <Calendar className="w-5 h-5" style={{ color: '#a8556f' }} />
                              </div>
                              <div>
                                <p className="font-medium" style={{ color: '#2d1f26' }}>{event.title}</p>
                                <p className="text-xs" style={{ color: '#6b5a60' }}>{toEnglishNumbers(new Date(event.date).toLocaleDateString('en-GB'))}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {event.tasks && (
                                <Badge style={{ background: '#e8dde8', color: '#6b4a5a' }}>{event.tasks}</Badge>
                              )}
                              <Button
                                type="button"
                                size="sm"
                                className="rounded-full w-8 h-8 p-0"
                                style={{ background: '#fce8e8', color: '#8a3a3a' }}
                                onClick={() => setShowDeleteEventDialog(event.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Calendar className="w-12 h-12 mx-auto mb-3" style={{ color: '#e8d8dc' }} />
                        <p className="text-sm mb-4" style={{ color: '#9a8a90' }}>لم يشارك في لقاءات بعد</p>
                        <Button
                          type="button"
                          className="rounded-full gap-2"
                          style={{ background: '#a8556f', color: 'white' }}
                          onClick={() => setShowAddToEventModal(true)}
                        >
                          <Plus className="w-4 h-4" />
                          إضافة لقاء
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Close Button */}
                <div className="flex justify-center mt-6">
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={() => { setViewingSponsor(null); setSponsorEvents([]); }} 
                    className="rounded-full px-12 py-6 gap-2"
                    style={{ borderColor: '#e8d8dc', color: '#6b5a60' }}
                  >
                    <X className="w-4 h-4" />
                    إغلاق
                  </Button>
                </div>

                {/* Delete Event Confirmation Dialog */}
                {showDeleteEventDialog && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(168, 85, 111, 0.3)' }} onClick={() => setShowDeleteEventDialog(null)}>
                    <div className="rounded-2xl p-6 max-w-sm w-full" style={{ background: 'linear-gradient(135deg, #fdf8f9 0%, #fff 100%)' }} dir="rtl" onClick={(e) => e.stopPropagation()}>
                      <div className="text-center">
                        <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: '#fce8e8' }}>
                          <Trash2 className="w-8 h-8" style={{ color: '#8a3a3a' }} />
                        </div>
                        <h3 className="text-lg font-bold mb-2" style={{ color: '#2d1f26' }}>تأكيد الحذف</h3>
                        <p className="text-sm mb-6" style={{ color: '#6b5a60' }}>هل أنت متأكد من إزالة هذا اللقاء من قائمة رعايات الراعي؟</p>
                        <div className="flex gap-3 justify-center">
                          <Button
                            type="button"
                            onClick={() => handleRemoveSponsorFromEvent(showDeleteEventDialog)}
                            className="rounded-full px-6"
                            style={{ background: '#fce8e8', color: '#8a3a3a' }}
                          >
                            نعم، إزالة
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowDeleteEventDialog(null)}
                            className="rounded-full px-6"
                            style={{ borderColor: '#e8d8dc', color: '#6b5a60' }}
                          >
                            إلغاء
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Sponsors List */
              <>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold" style={{ color: '#2d1f26' }}>إدارة طلبات الرعاية</h2>
                  <div className="flex gap-3">
                    <Button 
                      variant="outline"
                      className="rounded-full gap-2"
                      style={{ borderColor: '#e8d8dc', color: '#6b5a60' }}
                      onClick={() => setShowAddSponsorModal(true)}
                    >
                      <Plus className="w-4 h-4" />
                      إضافة راعي
                    </Button>
                    {adminPermissions?.export && (
                      <Button variant="outline" className="rounded-full gap-2" onClick={() => setShowExportModal('sponsors')}>
                        <Download className="w-4 h-4" />
                        تصدير
                      </Button>
                    )}
                  </div>
                </div>

                {/* Search and Filter */}
                <div className="flex gap-4 mb-6 flex-wrap">
                  <div className="flex-1 min-w-[200px] relative">
                    <Search className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#9a8a90' }} />
                    <Input
                      placeholder="ابحث باسم الشركة، المسؤول أو رقم الجوال..."
                      value={sponsorSearch}
                      onChange={(e) => setSponsorSearch(e.target.value)}
                      className="h-11 rounded-xl pr-10"
                      style={{ borderColor: '#e8d8dc' }}
                    />
                  </div>
                  <Select value={sponsorStatusFilter} onValueChange={setSponsorStatusFilter}>
                    <SelectTrigger className="w-48 h-11 rounded-xl" style={{ borderColor: '#e8d8dc' }}>
                      <Filter className="w-4 h-4 ml-2" style={{ color: '#6b5a60' }} />
                      <SelectValue placeholder="فلترة الحالة" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="all">جميع الحالات</SelectItem>
                      <SelectItem value="new">جديدة</SelectItem>
                      <SelectItem value="contacted">تم التواصل</SelectItem>
                      <SelectItem value="completed">تم الرعاية</SelectItem>
                      <SelectItem value="interested_again">مهتم بالرعاية مرة أخرى</SelectItem>
                      <SelectItem value="interested_permanent">مهتم بالرعاية بشكل دائم</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={sponsorFilter} onValueChange={(v) => setSponsorFilter(v as 'all' | 'active' | 'disabled' | 'archived')}>
                    <SelectTrigger className="w-40 h-11 rounded-xl" style={{ borderColor: '#e8d8dc' }}>
                      <SelectValue placeholder="التصفية" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="all">الكل</SelectItem>
                      <SelectItem value="active">نشط</SelectItem>
                      <SelectItem value="disabled">معطل</SelectItem>
                      <SelectItem value="archived">أرشفة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Card className="rounded-2xl border" style={{ borderColor: '#f0e0e4' }}>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table dir="rtl">
                        <TableHeader>
                          <TableRow style={{ background: '#fdf8f9' }}>
                            <TableHead className="font-semibold text-right" style={{ color: '#2d1f26' }}>الاسم</TableHead>
                            <TableHead className="font-semibold text-right" style={{ color: '#2d1f26' }}>المسؤول</TableHead>
                            <TableHead className="font-semibold text-right" style={{ color: '#2d1f26' }}>التواصل</TableHead>
                            <TableHead className="font-semibold text-right" style={{ color: '#2d1f26' }}>النوع</TableHead>
                            <TableHead className="font-semibold text-right" style={{ color: '#2d1f26' }}>الحالة</TableHead>
                            <TableHead className="font-semibold text-right" style={{ color: '#2d1f26' }}>الرعايات</TableHead>
                            <TableHead className="font-semibold text-right" style={{ color: '#2d1f26' }}>إجراءات</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredSponsors.map(sponsor => (
                            <TableRow key={sponsor.id}>
                              <TableCell className="font-medium text-right" style={{ color: '#2d1f26' }}>
                                <div className="flex items-center gap-3">
                                  {sponsor.logoUrl ? (
                                    <img 
                                      src={sponsor.logoUrl} 
                                      alt={sponsor.companyName}
                                      className="w-10 h-10 rounded-md object-contain"
                                      style={{ background: '#fdf8f9' }}
                                    />
                                  ) : (
                                    <div className="w-10 h-10 rounded-md flex items-center justify-center" style={{ background: '#fdf8f9' }}>
                                      <Building2 className="w-5 h-5" style={{ color: '#a8556f' }} />
                                    </div>
                                  )}
                                  <span>{sponsor.companyName}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-right" style={{ color: '#6b5a60' }}>{sponsor.contactName}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex flex-col gap-1">
                                  <span className="text-sm" style={{ color: '#6b5a60' }}>{sponsor.phone || '-'}</span>
                                  <span className="text-xs" style={{ color: '#9a8a90' }}>{sponsor.email}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-right" style={{ color: '#6b5a60' }}>{sponsorshipTypeLabels[sponsor.sponsorshipType]}</TableCell>
                              <TableCell className="text-right">
                                <Select value={sponsor.status} onValueChange={v => updateSponsorStatus(sponsor.id, v)}>
                                  <SelectTrigger className="h-9 w-44 rounded-xl text-xs" style={{ borderColor: '#e8d8dc', background: getStatusStyle(sponsor.status).background, color: getStatusStyle(sponsor.status).color }}>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="new">جديدة</SelectItem>
                                    <SelectItem value="contacted">تم التواصل</SelectItem>
                                    <SelectItem value="completed">تم الرعاية</SelectItem>
                                    <SelectItem value="interested_again">مهتم بالرعاية مرة أخرى</SelectItem>
                                    <SelectItem value="interested_permanent">مهتم بالرعاية بشكل دائم</SelectItem>
                                    <SelectItem value="archived">مؤرشف</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex flex-col gap-1">
                                  <Badge className="text-xs w-fit" style={{ background: '#e8d8dc', color: '#6b5a60' }}>
                                    {toEnglishNumbers(sponsor.sponsorshipsCount || 0)} رعاية
                                  </Badge>
                                  {sponsor.lastSponsorshipDate && (
                                    <span className="text-xs" style={{ color: '#9a8a90' }}>
                                      {formatDate(sponsor.lastSponsorshipDate)}
                                    </span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex gap-2 justify-end flex-wrap">
                                  <Button 
                                    size="sm" 
                                    className="rounded-lg w-8 h-8 p-0" 
                                    style={{ background: '#fdf2f4', color: '#a8556f' }}
                                    onClick={() => {
                                      fetchSponsorEvents(sponsor.id);
                                      openEditSponsor(sponsor);
                                    }}
                                    title="تعديل البيانات"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  {sponsor.phone && (
                                    <Button 
                                      size="sm" 
                                      className="rounded-full w-8 h-8 p-0" 
                                      style={{ background: '#d4edda', color: '#3a7d44' }}
                                      onClick={() => {
                                        const phone = sponsor.phone.replace(/\D/g, '');
                                        const waLink = phone.startsWith('966') ? `https://wa.me/${phone}` : `https://wa.me/966${phone.replace(/^0/, '')}`;
                                        window.open(waLink, '_blank');
                                      }}
                                    >
                                      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                      </svg>
                                    </Button>
                                  )}
                                  <Button 
                                    size="sm" 
                                    className="rounded-full px-3 h-8 text-xs font-medium" 
                                    style={{ background: sponsor.status === 'cancelled' ? '#fce8e8' : '#d4edda', color: sponsor.status === 'cancelled' ? '#8a3a3a' : '#3a7d44' }}
                                    onClick={() => updateSponsorStatus(sponsor.id, sponsor.status === 'cancelled' ? 'new' : 'cancelled')}
                                  >
                                    {sponsor.status === 'cancelled' ? 'معطل' : 'نشط'}
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    className="rounded-full px-3 h-8 text-xs font-medium" 
                                    style={{ background: '#e8d8dc', color: '#6b5a60' }}
                                    onClick={() => { setViewingSponsor(sponsor); setShowLinkToMemberModal(true); }}
                                  >
                                    ربط
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    className="rounded-full px-3 h-8 text-xs font-medium" 
                                    style={{ background: sponsor.status === 'archived' ? '#f5f5f5' : '#fef3e0', color: sponsor.status === 'archived' ? '#666' : '#9a6b1a' }}
                                    onClick={() => updateSponsorStatus(sponsor.id, sponsor.status === 'archived' ? 'new' : 'archived')}
                                  >
                                    {sponsor.status === 'archived' ? 'إلغاء الأرشفة' : 'أرشفة'}
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                          {filteredSponsors.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={7} className="text-center py-8" style={{ color: '#9a8a90' }}>لا توجد طلبات رعاية</TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* System Messages */}
          <TabsContent value="messages" dir="rtl">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold" style={{ color: '#2d1f26' }}>تخصيص رسائل النظام</h2>
                  <p className="text-sm mt-1" style={{ color: '#9a8a90' }}>تخصيص محتوى رسائل البريد الإلكتروني التلقائية وتعديل الرأس والتذييل</p>
                </div>
                <Button
                  onClick={async () => {
                    setEmailSettingsLoading(true)
                    try {
                      const response = await fetch('/api/email-settings', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(emailSettings)
                      })
                      if (response.ok) {
                        toast.success('تم حفظ الإعدادات بنجاح')
                      } else {
                        toast.error('حدث خطأ أثناء الحفظ')
                      }
                    } catch {
                      toast.error('حدث خطأ في الاتصال بالخادم')
                    } finally {
                      setEmailSettingsLoading(false)
                    }
                  }}
                  disabled={emailSettingsLoading}
                  className="rounded-full gap-2 px-6"
                  style={{ background: '#a8556f', color: 'white' }}
                >
                  {emailSettingsLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2" style={{ borderColor: 'white', borderTopColor: 'transparent' }}></div>
                      جاري الحفظ...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      حفظ الإعدادات
                    </>
                  )}
                </Button>
              </div>

              {/* Email Header Settings */}
              <AccordionCard
                title="تخصيص رأس الرسالة"
                icon={Mail}
                iconBg="#fdf2f4"
                iconColor="#a8556f"
              >
                <div className="space-y-4 pt-4">
                  {/* Logo Upload */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block" style={{ color: '#2d1f26' }}>شعار الرسالة</Label>
                    <div className="flex items-center gap-4">
                      <div 
                        className="relative w-24 h-24 rounded-xl border-2 border-dashed cursor-pointer overflow-hidden group flex-shrink-0"
                        style={{ borderColor: emailSettings.headerLogo ? '#a8556f' : '#e8d8dc', background: '#fdf8f9' }}
                        onClick={() => {
                          const input = document.createElement('input')
                          input.type = 'file'
                          input.accept = 'image/*'
                          input.onchange = async (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0]
                            if (!file) return
                            
                            if (!file.type.startsWith('image/')) {
                              toast.error('يرجى اختيار ملف صورة صالح')
                              return
                            }
                            
                            if (file.size > 5 * 1024 * 1024) {
                              toast.error('حجم الصورة كبير جداً. الحد الأقصى 5 ميجابايت')
                              return
                            }
                            
                            try {
                              const formData = new FormData()
                              formData.append('file', file)
                              
                              const response = await fetch('/api/upload', {
                                method: 'POST',
                                body: formData
                              })
                              
                              if (response.ok) {
                                const data = await response.json()
                                setEmailSettings(prev => ({ ...prev, headerLogo: data.url }))
                                toast.success('تم رفع الشعار بنجاح')
                              } else {
                                toast.error('حدث خطأ أثناء رفع الشعار')
                              }
                            } catch {
                              toast.error('حدث خطأ في الاتصال بالخادم')
                            }
                          }
                          input.click()
                        }}
                      >
                        {emailSettings.headerLogo ? (
                          <>
                            <img 
                              src={emailSettings.headerLogo} 
                              alt="الشعار" 
                              className="w-full h-full object-contain"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <Camera className="w-5 h-5 text-white" />
                              <span className="text-white text-xs">تغيير</span>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setEmailSettings(prev => ({ ...prev, headerLogo: '' })); }}
                              className="absolute -top-1 -left-1 w-5 h-5 rounded-full flex items-center justify-center shadow-md"
                              style={{ background: '#fce8e8', color: '#8a3a3a' }}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </>
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                            <Camera className="w-6 h-6" style={{ color: '#a8556f' }} />
                            <span className="text-xs" style={{ color: '#9a8a90' }}>رفع الشعار</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm" style={{ color: '#2d1f26' }}>ارفع شعار الرسالة</p>
                        <p className="text-xs mt-1" style={{ color: '#9a8a90' }}>يُنصح بصورة بحجم 200×60 بكسل (اختياري)</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium mb-2 block" style={{ color: '#2d1f26' }}>لون خلفية الرأس</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={emailSettings.headerBackgroundColor}
                          onChange={e => setEmailSettings(prev => ({ ...prev, headerBackgroundColor: e.target.value }))}
                          className="w-14 h-11 rounded-xl cursor-pointer"
                          style={{ borderColor: '#e8d8dc' }}
                        />
                        <Input
                          value={emailSettings.headerBackgroundColor}
                          onChange={e => setEmailSettings(prev => ({ ...prev, headerBackgroundColor: e.target.value }))}
                          className="flex-1 h-11 rounded-xl"
                          style={{ borderColor: '#e8d8dc' }}
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium mb-2 block" style={{ color: '#2d1f26' }}>لون نص الرأس</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={emailSettings.headerTextColor}
                          onChange={e => setEmailSettings(prev => ({ ...prev, headerTextColor: e.target.value }))}
                          className="w-14 h-11 rounded-xl cursor-pointer"
                          style={{ borderColor: '#e8d8dc' }}
                        />
                        <Input
                          value={emailSettings.headerTextColor}
                          onChange={e => setEmailSettings(prev => ({ ...prev, headerTextColor: e.target.value }))}
                          className="flex-1 h-11 rounded-xl"
                          style={{ borderColor: '#e8d8dc' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Header Preview */}
                  <div className="mt-4">
                    <Label className="text-sm font-medium mb-2 block" style={{ color: '#2d1f26' }}>معاينة الرأس</Label>
                    <div
                      className="p-4 rounded-xl text-center"
                      style={{ background: emailSettings.headerBackgroundColor }}
                    >
                      {emailSettings.headerLogo ? (
                        <img src={emailSettings.headerLogo} alt="Logo" className="h-16 mx-auto object-contain" />
                      ) : (
                        <h3 className="text-xl font-bold" style={{ color: emailSettings.headerTextColor }}>ملتقى ريادة</h3>
                      )}
                    </div>
                  </div>
                </div>
              </AccordionCard>

              {/* Email Footer Settings */}
              <AccordionCard
                title="تخصيص تذييل الرسالة"
                icon={Mail}
                iconBg="#e0f0e4"
                iconColor="#2d6b3d"
              >
                <div className="space-y-4 pt-4">
                  <div>
                    <Label className="text-sm font-medium mb-2 block" style={{ color: '#2d1f26' }}>نص التذييل</Label>
                    <Textarea
                      value={emailSettings.footerText}
                      onChange={e => setEmailSettings(prev => ({ ...prev, footerText: e.target.value }))}
                      rows={2}
                      className="rounded-xl"
                      style={{ borderColor: '#e8d8dc' }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium mb-2 block" style={{ color: '#2d1f26' }}>لون خلفية التذييل</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={emailSettings.footerBackgroundColor}
                          onChange={e => setEmailSettings(prev => ({ ...prev, footerBackgroundColor: e.target.value }))}
                          className="w-14 h-11 rounded-xl cursor-pointer"
                          style={{ borderColor: '#e8d8dc' }}
                        />
                        <Input
                          value={emailSettings.footerBackgroundColor}
                          onChange={e => setEmailSettings(prev => ({ ...prev, footerBackgroundColor: e.target.value }))}
                          className="flex-1 h-11 rounded-xl"
                          style={{ borderColor: '#e8d8dc' }}
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium mb-2 block" style={{ color: '#2d1f26' }}>لون نص التذييل</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={emailSettings.footerTextColor}
                          onChange={e => setEmailSettings(prev => ({ ...prev, footerTextColor: e.target.value }))}
                          className="w-14 h-11 rounded-xl cursor-pointer"
                          style={{ borderColor: '#e8d8dc' }}
                        />
                        <Input
                          value={emailSettings.footerTextColor}
                          onChange={e => setEmailSettings(prev => ({ ...prev, footerTextColor: e.target.value }))}
                          className="flex-1 h-11 rounded-xl"
                          style={{ borderColor: '#e8d8dc' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Footer Preview */}
                  <div className="mt-4">
                    <Label className="text-sm font-medium mb-2 block" style={{ color: '#2d1f26' }}>معاينة التذييل</Label>
                    <div
                      className="p-4 rounded-xl text-center"
                      style={{ background: emailSettings.footerBackgroundColor }}
                    >
                      <p className="text-sm" style={{ color: emailSettings.footerTextColor }}>{emailSettings.footerText}</p>
                    </div>
                  </div>
                </div>
              </AccordionCard>

              {/* Registration Message */}
              <AccordionCard
                title="رسالة تأكيد التسجيل"
                icon={Mail}
                iconBg="#e0f0f4"
                iconColor="#1a6b8a"
                defaultOpen={true}
              >
                <div className="space-y-4 pt-4">
                  <div className="p-3 rounded-xl" style={{ background: '#fdf8f9', border: '1px solid #e8d8dc' }}>
                    <p className="text-xs font-medium" style={{ color: '#6b5a60' }}>
                      المتغيرات المتاحة: {'{name}'} - {'{eventName}'} - {'{date}'} - {'{location}'} - {'{time}'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-2 block" style={{ color: '#2d1f26' }}>موضوع الرسالة</Label>
                    <Input
                      value={emailSettings.registrationSubject}
                      onChange={e => setEmailSettings(prev => ({ ...prev, registrationSubject: e.target.value }))}
                      className="h-11 rounded-xl"
                      style={{ borderColor: '#e8d8dc' }}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-2 block" style={{ color: '#2d1f26' }}>محتوى الرسالة</Label>
                    <Textarea
                      value={emailSettings.registrationBody}
                      onChange={e => setEmailSettings(prev => ({ ...prev, registrationBody: e.target.value }))}
                      rows={6}
                      className="rounded-xl"
                      style={{ borderColor: '#e8d8dc' }}
                    />
                  </div>
                </div>
              </AccordionCard>

              {/* Confirmation Message */}
              <AccordionCard
                title="رسالة تأكيد الحضور"
                icon={CheckCircle2}
                iconBg="#e0f0e4"
                iconColor="#2d6b3d"
              >
                <div className="space-y-4 pt-4">
                  <div className="p-3 rounded-xl" style={{ background: '#fdf8f9', border: '1px solid #e8d8dc' }}>
                    <p className="text-xs font-medium" style={{ color: '#6b5a60' }}>
                      المتغيرات المتاحة: {'{name}'} - {'{eventName}'} - {'{date}'} - {'{location}'} - {'{time}'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-2 block" style={{ color: '#2d1f26' }}>موضوع الرسالة</Label>
                    <Input
                      value={emailSettings.confirmationSubject}
                      onChange={e => setEmailSettings(prev => ({ ...prev, confirmationSubject: e.target.value }))}
                      className="h-11 rounded-xl"
                      style={{ borderColor: '#e8d8dc' }}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-2 block" style={{ color: '#2d1f26' }}>محتوى الرسالة</Label>
                    <Textarea
                      value={emailSettings.confirmationBody}
                      onChange={e => setEmailSettings(prev => ({ ...prev, confirmationBody: e.target.value }))}
                      rows={6}
                      className="rounded-xl"
                      style={{ borderColor: '#e8d8dc' }}
                    />
                  </div>
                </div>
              </AccordionCard>

              {/* Reminder Message */}
              <AccordionCard
                title="رسالة التذكير"
                icon={Clock}
                iconBg="#fdf2f4"
                iconColor="#c9a066"
              >
                <div className="space-y-4 pt-4">
                  <div className="p-3 rounded-xl" style={{ background: '#fdf8f9', border: '1px solid #e8d8dc' }}>
                    <p className="text-xs font-medium" style={{ color: '#6b5a60' }}>
                      المتغيرات المتاحة: {'{name}'} - {'{eventName}'} - {'{date}'} - {'{location}'} - {'{time}'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-2 block" style={{ color: '#2d1f26' }}>موضوع الرسالة</Label>
                    <Input
                      value={emailSettings.reminderSubject}
                      onChange={e => setEmailSettings(prev => ({ ...prev, reminderSubject: e.target.value }))}
                      className="h-11 rounded-xl"
                      style={{ borderColor: '#e8d8dc' }}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-2 block" style={{ color: '#2d1f26' }}>محتوى الرسالة</Label>
                    <Textarea
                      value={emailSettings.reminderBody}
                      onChange={e => setEmailSettings(prev => ({ ...prev, reminderBody: e.target.value }))}
                      rows={6}
                      className="rounded-xl"
                      style={{ borderColor: '#e8d8dc' }}
                    />
                  </div>
                </div>
              </AccordionCard>

              {/* Test Welcome Email */}
              <Card className="rounded-2xl border" style={{ borderColor: '#f0e0e4' }}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#fdf2f4' }}>
                      <Mail className="w-5 h-5" style={{ color: '#a8556f' }} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold" style={{ color: '#2d1f26' }}>تجربة البريد الترحيبي</h3>
                      <p className="text-xs" style={{ color: '#9a8a90' }}>أرسل بريد ترحيبي تجريبي لأي بريد إلكتروني</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium mb-2 block" style={{ color: '#2d1f26' }}>البريد الإلكتروني *</Label>
                        <Input
                          type="email"
                          placeholder="test@example.com"
                          id="test-email-input"
                          className="h-11 rounded-xl"
                          style={{ borderColor: '#e8d8dc' }}
                          dir="ltr"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium mb-2 block" style={{ color: '#2d1f26' }}>اسم المستلم</Label>
                        <Input
                          type="text"
                          placeholder="اسم التجربة"
                          id="test-name-input"
                          className="h-11 rounded-xl"
                          style={{ borderColor: '#e8d8dc' }}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium mb-2 block" style={{ color: '#2d1f26' }}>الشركة (اختياري)</Label>
                        <Input
                          type="text"
                          placeholder="اسم الشركة"
                          id="test-company-input"
                          className="h-11 rounded-xl"
                          style={{ borderColor: '#e8d8dc' }}
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium mb-2 block" style={{ color: '#2d1f26' }}>المنصب (اختياري)</Label>
                        <Input
                          type="text"
                          placeholder="المسمى الوظيفي"
                          id="test-job-input"
                          className="h-11 rounded-xl"
                          style={{ borderColor: '#e8d8dc' }}
                        />
                      </div>
                    </div>
                    
                    <Button
                      onClick={async () => {
                        const email = (document.getElementById('test-email-input') as HTMLInputElement)?.value
                        const name = (document.getElementById('test-name-input') as HTMLInputElement)?.value || 'عضو تجريبي'
                        const companyName = (document.getElementById('test-company-input') as HTMLInputElement)?.value
                        const jobTitle = (document.getElementById('test-job-input') as HTMLInputElement)?.value
                        
                        if (!email) {
                          toast.error('يرجى إدخال البريد الإلكتروني')
                          return
                        }
                        
                        try {
                          const response = await fetch('/api/email/test-welcome', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              email,
                              name,
                              companyName,
                              jobTitle
                            })
                          })
                          
                          const data = await response.json()
                          
                          if (response.ok && data.success) {
                            toast.success('تم إرسال البريد الترحيبي بنجاح! تحقق من صندوق الورد')
                          } else {
                            // عرض تفاصيل الخطأ
                            console.error('Email error:', data)
                            let errorMsg = data.error || 'حدث خطأ أثناء الإرسال'
                            if (data.details) {
                              errorMsg += `\n\nالتفاصيل: ${data.details}`
                            }
                            if (data.envCheck) {
                              errorMsg += `\n\nحالة الإعدادات:\n- مفتاح API: ${data.envCheck.hasApiKey ? 'موجود ✓' : 'غير موجود ✗'}\n- عنوان المرسل: ${data.envCheck.fromEmail}`
                            }
                            toast.error(errorMsg, { duration: 8000 })
                          }
                        } catch (err) {
                          console.error('Connection error:', err)
                          toast.error('حدث خطأ في الاتصال بالخادم')
                        }
                      }}
                      className="w-full rounded-full py-6 text-lg gap-2"
                      style={{ background: 'linear-gradient(135deg, #a8556f 0%, #9b7b9a 100%)', color: 'white' }}
                    >
                      <Mail className="w-5 h-5" />
                      إرسال بريد ترحيبي تجريبي
                    </Button>
                    
                    <div className="p-3 rounded-xl" style={{ background: '#fdf8f9', border: '1px solid #e8d8dc' }}>
                      <p className="text-xs" style={{ color: '#6b5a60' }}>
                        💡 <strong>تلميح:</strong> سيُرسل البريد من عنوان الملتقى وسيتضمن تصميم البريد الترحيبي الكامل مع الشعار والألوان المخصصة.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Site Settings */}
          {(adminPermissions?.settings || isSuperAdmin) && (
            <TabsContent value="settings" dir="rtl">
              <SiteSettingsTab />
            </TabsContent>
          )}
        </Tabs>
      </main>

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(168, 85, 111, 0.3)' }} onClick={() => setShowAddMemberModal(false)}>
          <div className="rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-auto" style={{ background: 'linear-gradient(135deg, #fdf8f9 0%, #fff 100%)' }} dir="rtl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold" style={{ color: '#2d1f26' }}>إضافة عضو جديد</h3>
              <button type="button" onClick={() => setShowAddMemberModal(false)}>
                <X className="w-6 h-6" style={{ color: '#6b5a60' }} />
              </button>
            </div>
            
            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block" style={{ color: '#2d1f26' }}>الاسم الكامل *</Label>
                <Input 
                  value={memberForm.name} 
                  onChange={e => setMemberForm(prev => ({ ...prev, name: e.target.value }))} 
                  required 
                  className="h-11 rounded-xl" 
                  style={{ borderColor: '#e8d8dc' }} 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block" style={{ color: '#2d1f26' }}>البريد الإلكتروني</Label>
                  <Input 
                    type="email"
                    value={memberForm.email} 
                    onChange={e => setMemberForm(prev => ({ ...prev, email: e.target.value }))} 
                    className="h-11 rounded-xl" 
                    style={{ borderColor: '#e8d8dc' }} 
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block" style={{ color: '#2d1f26' }}>رقم الجوال *</Label>
                  <Input 
                    value={memberForm.phone} 
                    onChange={e => setMemberForm(prev => ({ ...prev, phone: e.target.value }))} 
                    required 
                    className="h-11 rounded-xl" 
                    style={{ borderColor: '#e8d8dc' }} 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block" style={{ color: '#2d1f26' }}>اسم الشركة</Label>
                  <Input 
                    value={memberForm.companyName} 
                    onChange={e => setMemberForm(prev => ({ ...prev, companyName: e.target.value }))} 
                    className="h-11 rounded-xl" 
                    style={{ borderColor: '#e8d8dc' }} 
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block" style={{ color: '#2d1f26' }}>المسمى الوظيفي</Label>
                  <Input 
                    value={memberForm.jobTitle} 
                    onChange={e => setMemberForm(prev => ({ ...prev, jobTitle: e.target.value }))} 
                    className="h-11 rounded-xl" 
                    style={{ borderColor: '#e8d8dc' }} 
                  />
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium mb-2 block" style={{ color: '#2d1f26' }}>الاهتمامات</Label>
                <Input 
                  value={memberForm.interests} 
                  onChange={e => setMemberForm(prev => ({ ...prev, interests: e.target.value }))} 
                  placeholder="مثال: التقنية، الريادة، التسويق..."
                  className="h-11 rounded-xl" 
                  style={{ borderColor: '#e8d8dc' }} 
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium mb-2 block" style={{ color: '#2d1f26' }}>كلمة المرور *</Label>
                <Input 
                  type="password"
                  value={memberForm.password} 
                  onChange={e => setMemberForm(prev => ({ ...prev, password: e.target.value }))} 
                  placeholder="أدخل كلمة المرور للعضو"
                  required 
                  className="h-11 rounded-xl" 
                  style={{ borderColor: '#e8d8dc' }} 
                />
              </div>
              
              <div className="flex gap-4 pt-4">
                <Button type="submit" className="flex-1 rounded-full py-6 text-lg" style={{ background: '#e8d8dc', color: '#6b5a60' }}>إضافة العضو</Button>
                <Button type="button" variant="outline" onClick={() => setShowAddMemberModal(false)} className="flex-1 rounded-full py-6 text-lg">إلغاء</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(168, 85, 111, 0.3)' }} onClick={() => setEditingMember(null)}>
          <div className="rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-auto" style={{ background: 'linear-gradient(135deg, #fdf8f9 0%, #fff 100%)' }} dir="rtl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold" style={{ color: '#2d1f26' }}>تعديل بيانات العضو</h3>
              <button type="button" onClick={() => setEditingMember(null)}>
                <X className="w-6 h-6" style={{ color: '#6b5a60' }} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateMember} className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block" style={{ color: '#2d1f26' }}>الاسم الكامل *</Label>
                <Input 
                  value={editMemberForm.name} 
                  onChange={e => setEditMemberForm(prev => ({ ...prev, name: e.target.value }))} 
                  required 
                  className="h-11 rounded-xl" 
                  style={{ borderColor: '#e8d8dc' }} 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block" style={{ color: '#2d1f26' }}>البريد الإلكتروني</Label>
                  <Input 
                    type="email"
                    value={editMemberForm.email} 
                    onChange={e => setEditMemberForm(prev => ({ ...prev, email: e.target.value }))} 
                    className="h-11 rounded-xl" 
                    style={{ borderColor: '#e8d8dc' }} 
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block" style={{ color: '#2d1f26' }}>رقم الجوال</Label>
                  <Input 
                    value={editMemberForm.phone} 
                    onChange={e => setEditMemberForm(prev => ({ ...prev, phone: e.target.value }))} 
                    className="h-11 rounded-xl" 
                    style={{ borderColor: '#e8d8dc' }} 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block" style={{ color: '#2d1f26' }}>اسم الشركة</Label>
                  <Input 
                    value={editMemberForm.companyName} 
                    onChange={e => setEditMemberForm(prev => ({ ...prev, companyName: e.target.value }))} 
                    className="h-11 rounded-xl" 
                    style={{ borderColor: '#e8d8dc' }} 
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block" style={{ color: '#2d1f26' }}>المسمى الوظيفي</Label>
                  <Input 
                    value={editMemberForm.jobTitle} 
                    onChange={e => setEditMemberForm(prev => ({ ...prev, jobTitle: e.target.value }))} 
                    className="h-11 rounded-xl" 
                    style={{ borderColor: '#e8d8dc' }} 
                  />
                </div>
              </div>

              {/* Gender Selection */}
              <div>
                <Label className="text-sm font-medium mb-2 block" style={{ color: '#2d1f26' }}>الجنس</Label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setEditMemberForm(prev => ({ ...prev, gender: 'female' }))}
                    className="flex-1 py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                    style={{ 
                      background: editMemberForm.gender === 'female' ? '#fdf2f4' : '#f5f5f5',
                      border: editMemberForm.gender === 'female' ? '2px solid #d4a5b5' : '1px solid #e8e8e8',
                      color: editMemberForm.gender === 'female' ? '#a8556f' : '#6b5a60'
                    }}
                  >
                    <span>👩</span>
                    <span>أنثى</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditMemberForm(prev => ({ ...prev, gender: 'male' }))}
                    className="flex-1 py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                    style={{ 
                      background: editMemberForm.gender === 'male' ? '#fdf2f4' : '#f5f5f5',
                      border: editMemberForm.gender === 'male' ? '2px solid #d4a5b5' : '1px solid #e8e8e8',
                      color: editMemberForm.gender === 'male' ? '#a8556f' : '#6b5a60'
                    }}
                  >
                    <span>👨</span>
                    <span>ذكر</span>
                  </button>
                </div>
              </div>
              
              {/* Password Field */}
              {editingMember.isRegistered && (
                <div>
                  <Label className="text-sm font-medium mb-2 block" style={{ color: '#2d1f26' }}>
                    كلمة المرور الجديدة
                    <span className="text-xs font-normal mr-1" style={{ color: '#9a8a90' }}>(اتركها فارغة للإبقاء على الحالية)</span>
                  </Label>
                  <Input 
                    type="password"
                    value={editMemberForm.password} 
                    onChange={e => setEditMemberForm(prev => ({ ...prev, password: e.target.value }))} 
                    placeholder="أدخل كلمة مرور جديدة"
                    className="h-11 rounded-xl" 
                    style={{ borderColor: '#e8d8dc' }} 
                  />
                </div>
              )}
              
              <div className="flex gap-4 pt-4">
                <Button type="submit" className="flex-1 rounded-full py-6 text-lg" style={{ background: 'linear-gradient(135deg, #a8556f 0%, #9b7b9a 100%)', color: 'white' }}>حفظ التعديلات</Button>
                <Button type="button" variant="outline" onClick={() => setEditingMember(null)} className="flex-1 rounded-full py-6 text-lg">إلغاء</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Sponsor Modal */}
      {showAddSponsorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(168, 85, 111, 0.3)' }} onClick={(e) => e.stopPropagation()}>
          <div className="rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-auto" style={{ background: 'linear-gradient(135deg, #fdf8f9 0%, #fff 100%)' }} dir="rtl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold" style={{ color: '#2d1f26' }}>إضافة راعي جديد</h3>
              <button type="button" onClick={() => setShowAddSponsorModal(false)}>
                <X className="w-6 h-6" style={{ color: '#6b5a60' }} />
              </button>
            </div>
            
            <form onSubmit={handleCreateSponsor} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block" style={{ color: '#2d1f26' }}>اسم الشركة/الراعي *</Label>
                  <Input 
                    value={sponsorForm.companyName} 
                    onChange={e => setSponsorForm(prev => ({ ...prev, companyName: e.target.value }))} 
                    required 
                    className="h-11 rounded-xl" 
                    style={{ borderColor: '#e8d8dc' }} 
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block" style={{ color: '#2d1f26' }}>اسم المسؤول *</Label>
                  <Input 
                    value={sponsorForm.contactName} 
                    onChange={e => setSponsorForm(prev => ({ ...prev, contactName: e.target.value }))} 
                    required 
                    className="h-11 rounded-xl" 
                    style={{ borderColor: '#e8d8dc' }} 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block" style={{ color: '#2d1f26' }}>البريد الإلكتروني *</Label>
                  <Input 
                    type="email"
                    value={sponsorForm.email} 
                    onChange={e => setSponsorForm(prev => ({ ...prev, email: e.target.value }))} 
                    required 
                    className="h-11 rounded-xl" 
                    style={{ borderColor: '#e8d8dc' }} 
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block" style={{ color: '#2d1f26' }}>رقم الجوال *</Label>
                  <Input 
                    value={sponsorForm.phone} 
                    onChange={e => setSponsorForm(prev => ({ ...prev, phone: e.target.value }))} 
                    required 
                    className="h-11 rounded-xl" 
                    style={{ borderColor: '#e8d8dc' }} 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block" style={{ color: '#2d1f26' }}>نوع الراعي</Label>
                  <Select value={sponsorForm.sponsorType} onValueChange={v => setSponsorForm(prev => ({ ...prev, sponsorType: v }))}>
                    <SelectTrigger className="h-11 rounded-xl" style={{ borderColor: '#e8d8dc' }}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="company">شركة</SelectItem>
                      <SelectItem value="individual">فرد</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block" style={{ color: '#2d1f26' }}>نوع الرعاية</Label>
                  <Select value={sponsorForm.sponsorshipType} onValueChange={v => setSponsorForm(prev => ({ ...prev, sponsorshipType: v }))}>
                    <SelectTrigger className="h-11 rounded-xl" style={{ borderColor: '#e8d8dc' }}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="financial">رعاية مالية</SelectItem>
                      <SelectItem value="technical">رعاية تقنية</SelectItem>
                      <SelectItem value="media">رعاية إعلامية</SelectItem>
                      <SelectItem value="marketing">رعاية تسويقية</SelectItem>
                      <SelectItem value="knowledge">رعاية معرفية</SelectItem>
                      <SelectItem value="in_kind">رعاية عينية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {sponsorForm.sponsorshipType === 'financial' && (
                <div>
                  <Label className="text-sm font-medium mb-2 block" style={{ color: '#2d1f26' }}>قيمة الرعاية (ريال)</Label>
                  <Input 
                    type="number"
                    value={sponsorForm.amount} 
                    onChange={e => setSponsorForm(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))} 
                    className="h-11 rounded-xl" 
                    style={{ borderColor: '#e8d8dc' }} 
                  />
                </div>
              )}
              
              {/* Logo Upload */}
              <Card className="rounded-2xl border" style={{ borderColor: '#f0e0e4' }}>
                <CardContent className="p-6 flex flex-col items-center">
                  <SponsorLogoUpload 
                    value={sponsorForm.logoUrl} 
                    onChange={v => setSponsorForm(prev => ({ ...prev, logoUrl: v }))} 
                  />
                </CardContent>
              </Card>
              
              <div>
                <Label className="text-sm font-medium mb-2 block" style={{ color: '#2d1f26' }}>رابط الموقع الإلكتروني</Label>
                <Input 
                  value={sponsorForm.websiteUrl} 
                  onChange={e => setSponsorForm(prev => ({ ...prev, websiteUrl: e.target.value }))} 
                  placeholder="https://..."
                  className="h-11 rounded-xl" 
                  style={{ borderColor: '#e8d8dc' }} 
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium mb-2 block" style={{ color: '#2d1f26' }}>ملاحظات</Label>
                <Textarea 
                  value={sponsorForm.description} 
                  onChange={e => setSponsorForm(prev => ({ ...prev, description: e.target.value }))} 
                  rows={2}
                  className="rounded-xl resize-none" 
                  style={{ borderColor: '#e8d8dc' }} 
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button 
                  type="submit" 
                  className="flex-1 rounded-full py-3"
                  style={{ background: '#e8d8dc', color: '#6b5a60' }}
                >
                  إضافة الراعي
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAddSponsorModal(false)}
                  className="flex-1 rounded-full py-3"
                >
                  إلغاء
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Sponsor Modal - Full Page */}
      {showEditSponsorModal && viewingSponsor && (
        <div className="fixed inset-0 z-50 overflow-auto" style={{ background: 'linear-gradient(180deg, #fdf8f9 0%, #ffffff 100%)' }}>
          <div className="max-w-3xl mx-auto p-6" dir="rtl">
            <div className="flex items-center gap-4 mb-6">
              <h3 className="text-2xl font-bold" style={{ color: '#2d1f26' }}>تعديل بيانات الراعي</h3>
            </div>
            
            <form onSubmit={handleUpdateSponsor} className="space-y-6">
              {/* Logo Upload */}
              <Card className="rounded-2xl border" style={{ borderColor: '#f0e0e4' }}>
                <CardContent className="p-6 flex flex-col items-center">
                  <SponsorLogoUpload 
                    value={editSponsorForm.logoUrl} 
                    onChange={v => setEditSponsorForm(prev => ({ ...prev, logoUrl: v }))} 
                  />
                </CardContent>
              </Card>
              
              {/* Basic Info */}
              <Card className="rounded-2xl border" style={{ borderColor: '#f0e0e4' }}>
                <CardContent className="p-6">
                  <h4 className="text-lg font-bold mb-4" style={{ color: '#2d1f26' }}>المعلومات الأساسية</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium mb-2 block" style={{ color: '#2d1f26' }}>اسم الشركة/الراعي *</Label>
                      <Input 
                        value={editSponsorForm.companyName} 
                        onChange={e => setEditSponsorForm(prev => ({ ...prev, companyName: e.target.value }))} 
                        required 
                        className="h-11 rounded-xl" 
                        style={{ borderColor: '#e8d8dc' }} 
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium mb-2 block" style={{ color: '#2d1f26' }}>اسم المسؤول *</Label>
                      <Input 
                        value={editSponsorForm.contactName} 
                        onChange={e => setEditSponsorForm(prev => ({ ...prev, contactName: e.target.value }))} 
                        required 
                        className="h-11 rounded-xl" 
                        style={{ borderColor: '#e8d8dc' }} 
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <Label className="text-sm font-medium mb-2 block" style={{ color: '#2d1f26' }}>البريد الإلكتروني *</Label>
                      <Input 
                        type="email"
                        value={editSponsorForm.email} 
                        onChange={e => setEditSponsorForm(prev => ({ ...prev, email: e.target.value }))} 
                        required 
                        className="h-11 rounded-xl" 
                        style={{ borderColor: '#e8d8dc' }} 
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium mb-2 block" style={{ color: '#2d1f26' }}>رقم الجوال *</Label>
                      <Input 
                        value={editSponsorForm.phone} 
                        onChange={e => setEditSponsorForm(prev => ({ ...prev, phone: e.target.value }))} 
                        required 
                        className="h-11 rounded-xl" 
                        style={{ borderColor: '#e8d8dc' }} 
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <Label className="text-sm font-medium mb-2 block" style={{ color: '#2d1f26' }}>نوع الراعي</Label>
                      <Select value={editSponsorForm.sponsorType} onValueChange={v => setEditSponsorForm(prev => ({ ...prev, sponsorType: v }))}>
                        <SelectTrigger className="h-11 rounded-xl" style={{ borderColor: '#e8d8dc' }}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="company">شركة</SelectItem>
                          <SelectItem value="individual">فرد</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm font-medium mb-2 block" style={{ color: '#2d1f26' }}>نوع الرعاية</Label>
                      <Select value={editSponsorForm.sponsorshipType} onValueChange={v => setEditSponsorForm(prev => ({ ...prev, sponsorshipType: v }))}>
                        <SelectTrigger className="h-11 rounded-xl" style={{ borderColor: '#e8d8dc' }}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="financial">رعاية مالية</SelectItem>
                          <SelectItem value="technical">رعاية تقنية</SelectItem>
                          <SelectItem value="media">رعاية إعلامية</SelectItem>
                          <SelectItem value="marketing">رعاية تسويقية</SelectItem>
                          <SelectItem value="knowledge">رعاية معرفية</SelectItem>
                          <SelectItem value="in_kind">رعاية عينية</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {editSponsorForm.sponsorshipType === 'financial' && (
                    <div className="mt-4">
                      <Label className="text-sm font-medium mb-2 block" style={{ color: '#2d1f26' }}>قيمة الرعاية (ريال)</Label>
                      <Input 
                        type="number"
                        value={editSponsorForm.amount} 
                        onChange={e => setEditSponsorForm(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))} 
                        className="h-11 rounded-xl" 
                        style={{ borderColor: '#e8d8dc' }} 
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Social Media */}
              <Card className="rounded-2xl border" style={{ borderColor: '#f0e0e4' }}>
                <CardContent className="p-6">
                  <h4 className="text-lg font-bold mb-4" style={{ color: '#2d1f26' }}>حسابات التواصل الاجتماعي</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium mb-2 flex items-center gap-2" style={{ color: '#2d1f26' }}>
                        <Twitter className="w-4 h-4" style={{ color: '#1DA1F2' }} />
                        X (تويتر)
                      </Label>
                      <Input 
                        value={editSponsorForm.twitter} 
                        onChange={e => setEditSponsorForm(prev => ({ ...prev, twitter: e.target.value }))} 
                        placeholder="https://x.com/..."
                        className="h-11 rounded-xl" 
                        style={{ borderColor: '#e8d8dc' }} 
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium mb-2 flex items-center gap-2" style={{ color: '#2d1f26' }}>
                        <Instagram className="w-4 h-4" style={{ color: '#E1306C' }} />
                        انستقرام
                      </Label>
                      <Input 
                        value={editSponsorForm.instagram} 
                        onChange={e => setEditSponsorForm(prev => ({ ...prev, instagram: e.target.value }))} 
                        placeholder="https://instagram.com/..."
                        className="h-11 rounded-xl" 
                        style={{ borderColor: '#e8d8dc' }} 
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <Label className="text-sm font-medium mb-2 flex items-center gap-2" style={{ color: '#2d1f26' }}>
                        <img src="/snapchat-logo.png" alt="Snapchat" className="w-4 h-4" />
                        سناب شات
                      </Label>
                      <Input 
                        value={editSponsorForm.snapchat} 
                        onChange={e => setEditSponsorForm(prev => ({ ...prev, snapchat: e.target.value }))} 
                        placeholder="https://snapchat.com/..."
                        className="h-11 rounded-xl" 
                        style={{ borderColor: '#e8d8dc' }} 
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium mb-2 flex items-center gap-2" style={{ color: '#2d1f26' }}>
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" fill="#000"/>
                        </svg>
                        تيك توك
                      </Label>
                      <Input 
                        value={editSponsorForm.tiktok} 
                        onChange={e => setEditSponsorForm(prev => ({ ...prev, tiktok: e.target.value }))} 
                        placeholder="https://tiktok.com/..."
                        className="h-11 rounded-xl" 
                        style={{ borderColor: '#e8d8dc' }} 
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <Label className="text-sm font-medium mb-2 flex items-center gap-2" style={{ color: '#2d1f26' }}>
                        <Linkedin className="w-4 h-4" style={{ color: '#0A66C2' }} />
                        لينكد إن
                      </Label>
                      <Input 
                        value={editSponsorForm.linkedin} 
                        onChange={e => setEditSponsorForm(prev => ({ ...prev, linkedin: e.target.value }))} 
                        placeholder="https://linkedin.com/..."
                        className="h-11 rounded-xl" 
                        style={{ borderColor: '#e8d8dc' }} 
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium mb-2 flex items-center gap-2" style={{ color: '#2d1f26' }}>
                        <Globe className="w-4 h-4" style={{ color: '#a8556f' }} />
                        الموقع الإلكتروني
                      </Label>
                      <Input 
                        value={editSponsorForm.websiteUrl} 
                        onChange={e => setEditSponsorForm(prev => ({ ...prev, websiteUrl: e.target.value }))} 
                        placeholder="https://..."
                        className="h-11 rounded-xl" 
                        style={{ borderColor: '#e8d8dc' }} 
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <Label className="text-sm font-medium mb-2 flex items-center gap-2" style={{ color: '#2d1f26' }}>
                      <Upload className="w-4 h-4" style={{ color: '#a8556f' }} />
                      ملف البروفايل (PDF)
                    </Label>
                    <div className="flex gap-3">
                      <Input 
                        type="file"
                        accept=".pdf"
                        onChange={async (e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            if (file.type !== 'application/pdf') {
                              toast.error('يرجى اختيار ملف PDF')
                              return
                            }
                            if (file.size > 10 * 1024 * 1024) {
                              toast.error('حجم الملف كبير جداً. الحد الأقصى 10 ميجابايت')
                              return
                            }
                            const formData = new FormData()
                            formData.append('file', file)
                            try {
                              const res = await fetch('/api/upload', {
                                method: 'POST',
                                body: formData
                              })
                              const data = await res.json()
                              if (data.url) {
                                setEditSponsorForm(prev => ({ ...prev, profileUrl: data.url }))
                                toast.success('تم رفع الملف بنجاح')
                              }
                            } catch {
                              toast.error('حدث خطأ أثناء رفع الملف')
                            }
                          }
                        }}
                        className="h-11 rounded-xl" 
                        style={{ borderColor: '#e8d8dc' }} 
                      />
                      {editSponsorForm.profileUrl && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="rounded-xl"
                          onClick={() => window.open(editSponsorForm.profileUrl, '_blank')}
                        >
                          عرض الملف
                        </Button>
                      )}
                    </div>
                    {editSponsorForm.profileUrl && (
                      <p className="text-xs mt-2" style={{ color: '#6b5a60' }}>
                        الملف الحالي: {editSponsorForm.profileUrl.split('/').pop()}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              {/* Notes */}
              <Card className="rounded-2xl border" style={{ borderColor: '#f0e0e4' }}>
                <CardContent className="p-6">
                  <h4 className="text-lg font-bold mb-4" style={{ color: '#2d1f26' }}>ملاحظات</h4>
                  <Textarea 
                    value={editSponsorForm.description} 
                    onChange={e => setEditSponsorForm(prev => ({ ...prev, description: e.target.value }))} 
                    rows={3}
                    placeholder="ملاحظات إضافية..."
                    className="rounded-xl resize-none" 
                    style={{ borderColor: '#e8d8dc' }} 
                  />
                </CardContent>
              </Card>
              
              <div className="flex gap-3 justify-start">
                <Button 
                  type="submit" 
                  className="rounded-full px-6 py-2 text-sm"
                  variant="outline"
                >
                  حفظ التغييرات
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowEditSponsorModal(false)}
                  className="rounded-full px-6 py-2 text-sm"
                >
                  إلغاء
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add to Event Modal - Full Page */}
      {showAddToEventModal && viewingSponsor && (
        <div className="fixed inset-0 z-50 overflow-auto" style={{ background: 'linear-gradient(180deg, #fdf8f9 0%, #ffffff 100%)' }}>
          <div className="max-w-2xl mx-auto p-6" dir="rtl">
            <div className="flex items-center gap-4 mb-6">
              <Button 
                variant="ghost" 
                onClick={() => { setShowAddToEventModal(false); setSelectedEventForSponsor(null); setEventSearch(''); }}
                className="rounded-full"
                style={{ color: '#6b5a60' }}
              >
                <X className="w-5 h-5" />
                إغلاق
              </Button>
              <h3 className="text-2xl font-bold" style={{ color: '#2d1f26' }}>إضافة الراعي إلى حدث</h3>
            </div>
            
            <Card className="rounded-2xl border mb-6" style={{ borderColor: '#f0e0e4' }}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium mb-2 block" style={{ color: '#2d1f26' }}>البحث عن حدث</Label>
                    <div className="relative">
                      <Search className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#9a8a90' }} />
                      <Input
                        placeholder="ابحث بالعنوان أو الموقع..."
                        value={eventSearch}
                        onChange={(e) => setEventSearch(e.target.value)}
                        className="h-11 rounded-xl pr-10"
                        style={{ borderColor: '#e8d8dc' }}
                      />
                    </div>
                  </div>
                  
                  <div className="max-h-80 overflow-y-auto space-y-2">
                    {availableEventsForSponsor.length > 0 ? (
                      availableEventsForSponsor.map(event => (
                        <div 
                          key={event.id}
                          className={`p-4 rounded-xl cursor-pointer transition-all border-2 ${selectedEventForSponsor === event.id ? 'border-[#a8556f] bg-[#fdf2f4]' : 'border-[#e8d8dc] bg-[#fdf8f9] hover:border-[#d8c8cc]'}`}
                          onClick={() => setSelectedEventForSponsor(event.id)}
                        >
                          <p className="font-medium" style={{ color: '#2d1f26' }}>{event.title}</p>
                          <p className="text-sm" style={{ color: '#6b5a60' }}>{formatDate(event.date)} - {event.location || '-'}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-center py-4" style={{ color: '#9a8a90' }}>لا توجد لقاءات متاحة للإضافة</p>
                    )}
                  </div>
                  
                  {selectedEventForSponsor && (
                    <div>
                      <Label className="text-sm font-medium mb-2 block" style={{ color: '#2d1f26' }}>مهام الرعاية</Label>
                      <Textarea
                        value={sponsorTasks}
                        onChange={(e) => setSponsorTasks(e.target.value)}
                        placeholder="مثال: تغطية تكاليف الضيافة، طباعة البطاقات..."
                        rows={3}
                        className="rounded-xl resize-none"
                        style={{ borderColor: '#e8d8dc' }}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <div className="flex gap-4">
              <Button 
                type="button" 
                className="flex-1 rounded-full py-6 text-lg"
                style={{ background: '#e8d8dc', color: '#6b5a60' }}
                onClick={handleAddSponsorToEvent}
                disabled={!selectedEventForSponsor}
              >
                إضافة إلى الحدث
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => { setShowAddToEventModal(false); setSelectedEventForSponsor(null); setEventSearch(''); }}
                className="flex-1 rounded-full py-6 text-lg"
              >
                إلغاء
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Link to Member Modal - Full Page */}
      {showLinkToMemberModal && viewingSponsor && (
        <div className="fixed inset-0 z-50 overflow-auto" style={{ background: 'linear-gradient(180deg, #fdf8f9 0%, #ffffff 100%)' }}>
          <div className="max-w-2xl mx-auto p-6" dir="rtl">
            <div className="flex items-center gap-4 mb-6">
              <Button 
                variant="ghost" 
                onClick={() => { setShowLinkToMemberModal(false); setMemberLinkSearch(''); }}
                className="rounded-full"
                style={{ color: '#6b5a60' }}
              >
                <X className="w-5 h-5" />
                إغلاق
              </Button>
              <h3 className="text-2xl font-bold" style={{ color: '#2d1f26' }}>ربط الراعي بعضو</h3>
            </div>
            
            <Card className="rounded-2xl border mb-6" style={{ borderColor: '#f0e0e4' }}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium mb-2 block" style={{ color: '#2d1f26' }}>البحث عن عضو</Label>
                    <div className="relative">
                      <Search className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#9a8a90' }} />
                      <Input
                        placeholder="ابحث بالاسم أو رقم الجوال..."
                        value={memberLinkSearch}
                        onChange={(e) => setMemberLinkSearch(e.target.value)}
                        className="h-11 rounded-xl pr-10"
                        style={{ borderColor: '#e8d8dc' }}
                      />
                    </div>
                  </div>
                  
                  <div className="max-h-80 overflow-y-auto space-y-2">
                    {filteredMembersForLink.length > 0 ? (
                      filteredMembersForLink.map(member => (
                        <div 
                          key={member.id}
                          className="p-4 rounded-xl border-2"
                          style={{ borderColor: '#e8d8dc', background: '#fdf8f9' }}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium" style={{ color: '#2d1f26' }}>{member.name}</p>
                              <p className="text-sm" style={{ color: '#6b5a60' }}>{member.phone || '-'} | {member.companyName || '-'}</p>
                            </div>
                            <Button
                              type="button"
                              size="sm"
                              className="rounded-full"
                              style={{ background: '#e8d8dc', color: '#6b5a60' }}
                              onClick={() => {
                                toast.success(`تم ربط الراعي بالعضو: ${member.name}`)
                                setShowLinkToMemberModal(false)
                                setMemberLinkSearch('')
                              }}
                            >
                              ربط
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center py-4" style={{ color: '#9a8a90' }}>لا يوجد أعضاء</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-end">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => { setShowLinkToMemberModal(false); setMemberLinkSearch(''); }}
                className="rounded-full px-10 py-6"
              >
                إغلاق
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(168, 85, 111, 0.3)' }} onClick={() => setShowExportModal(null)}>
          <div className="rounded-2xl p-6 max-w-md w-full" style={{ background: 'linear-gradient(135deg, #fdf8f9 0%, #fff 100%)' }} dir="rtl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold" style={{ color: '#2d1f26' }}>
                خيارات التصدير
              </h3>
              <button type="button" onClick={() => setShowExportModal(null)}>
                <X className="w-6 h-6" style={{ color: '#6b5a60' }} />
              </button>
            </div>

            <p className="text-sm mb-4" style={{ color: '#6b5a60' }}>
              اختر الحقول التي تريد تصديرها:
            </p>

            <div className="space-y-3 mb-6">
              {showExportModal === 'members' ? (
                <>
                  <label className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-white/50 transition-colors" style={{ background: memberExportFields.name ? '#fdf2f4' : 'transparent', border: '1px solid', borderColor: memberExportFields.name ? '#e8b4c4' : '#f0e0e4' }}>
                    <input
                      type="checkbox"
                      checked={memberExportFields.name}
                      onChange={(e) => setMemberExportFields({ ...memberExportFields, name: e.target.checked })}
                      className="w-5 h-5 rounded"
                      style={{ accentColor: '#a8556f' }}
                    />
                    <span className="font-medium" style={{ color: '#2d1f26' }}>اسم العضو</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-white/50 transition-colors" style={{ background: memberExportFields.companyName ? '#fdf2f4' : 'transparent', border: '1px solid', borderColor: memberExportFields.companyName ? '#e8b4c4' : '#f0e0e4' }}>
                    <input
                      type="checkbox"
                      checked={memberExportFields.companyName}
                      onChange={(e) => setMemberExportFields({ ...memberExportFields, companyName: e.target.checked })}
                      className="w-5 h-5 rounded"
                      style={{ accentColor: '#a8556f' }}
                    />
                    <span className="font-medium" style={{ color: '#2d1f26' }}>اسم الشركة</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-white/50 transition-colors" style={{ background: memberExportFields.jobTitle ? '#fdf2f4' : 'transparent', border: '1px solid', borderColor: memberExportFields.jobTitle ? '#e8b4c4' : '#f0e0e4' }}>
                    <input
                      type="checkbox"
                      checked={memberExportFields.jobTitle}
                      onChange={(e) => setMemberExportFields({ ...memberExportFields, jobTitle: e.target.checked })}
                      className="w-5 h-5 rounded"
                      style={{ accentColor: '#a8556f' }}
                    />
                    <span className="font-medium" style={{ color: '#2d1f26' }}>المنصب</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-white/50 transition-colors" style={{ background: memberExportFields.phone ? '#fdf2f4' : 'transparent', border: '1px solid', borderColor: memberExportFields.phone ? '#e8b4c4' : '#f0e0e4' }}>
                    <input
                      type="checkbox"
                      checked={memberExportFields.phone}
                      onChange={(e) => setMemberExportFields({ ...memberExportFields, phone: e.target.checked })}
                      className="w-5 h-5 rounded"
                      style={{ accentColor: '#a8556f' }}
                    />
                    <span className="font-medium" style={{ color: '#2d1f26' }}>رقم الجوال</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-white/50 transition-colors" style={{ background: memberExportFields.email ? '#fdf2f4' : 'transparent', border: '1px solid', borderColor: memberExportFields.email ? '#e8b4c4' : '#f0e0e4' }}>
                    <input
                      type="checkbox"
                      checked={memberExportFields.email}
                      onChange={(e) => setMemberExportFields({ ...memberExportFields, email: e.target.checked })}
                      className="w-5 h-5 rounded"
                      style={{ accentColor: '#a8556f' }}
                    />
                    <span className="font-medium" style={{ color: '#2d1f26' }}>البريد الإلكتروني</span>
                  </label>
                </>
              ) : (
                <>
                  <label className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-white/50 transition-colors" style={{ background: sponsorExportFields.companyName ? '#fdf2f4' : 'transparent', border: '1px solid', borderColor: sponsorExportFields.companyName ? '#e8b4c4' : '#f0e0e4' }}>
                    <input
                      type="checkbox"
                      checked={sponsorExportFields.companyName}
                      onChange={(e) => setSponsorExportFields({ ...sponsorExportFields, companyName: e.target.checked })}
                      className="w-5 h-5 rounded"
                      style={{ accentColor: '#a8556f' }}
                    />
                    <span className="font-medium" style={{ color: '#2d1f26' }}>اسم الشركة</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-white/50 transition-colors" style={{ background: sponsorExportFields.contactName ? '#fdf2f4' : 'transparent', border: '1px solid', borderColor: sponsorExportFields.contactName ? '#e8b4c4' : '#f0e0e4' }}>
                    <input
                      type="checkbox"
                      checked={sponsorExportFields.contactName}
                      onChange={(e) => setSponsorExportFields({ ...sponsorExportFields, contactName: e.target.checked })}
                      className="w-5 h-5 rounded"
                      style={{ accentColor: '#a8556f' }}
                    />
                    <span className="font-medium" style={{ color: '#2d1f26' }}>اسم المسؤول</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-white/50 transition-colors" style={{ background: sponsorExportFields.phone ? '#fdf2f4' : 'transparent', border: '1px solid', borderColor: sponsorExportFields.phone ? '#e8b4c4' : '#f0e0e4' }}>
                    <input
                      type="checkbox"
                      checked={sponsorExportFields.phone}
                      onChange={(e) => setSponsorExportFields({ ...sponsorExportFields, phone: e.target.checked })}
                      className="w-5 h-5 rounded"
                      style={{ accentColor: '#a8556f' }}
                    />
                    <span className="font-medium" style={{ color: '#2d1f26' }}>رقم الجوال</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-white/50 transition-colors" style={{ background: sponsorExportFields.email ? '#fdf2f4' : 'transparent', border: '1px solid', borderColor: sponsorExportFields.email ? '#e8b4c4' : '#f0e0e4' }}>
                    <input
                      type="checkbox"
                      checked={sponsorExportFields.email}
                      onChange={(e) => setSponsorExportFields({ ...sponsorExportFields, email: e.target.checked })}
                      className="w-5 h-5 rounded"
                      style={{ accentColor: '#a8556f' }}
                    />
                    <span className="font-medium" style={{ color: '#2d1f26' }}>البريد الإلكتروني</span>
                  </label>
                </>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => exportToCSV(showExportModal === 'members' ? 'registrations' : 'sponsors')}
                className="flex-1 rounded-full py-6 text-lg gap-2"
                style={{ background: 'linear-gradient(135deg, #a8556f 0%, #9b7b9a 100%)', color: 'white' }}
              >
                <Download className="w-5 h-5" />
                تصدير
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowExportModal(null)}
                className="flex-1 rounded-full py-6 text-lg"
              >
                إلغاء
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal إضافة ضيوف */}
      {showAddGuestModal && viewingEventRegistrations && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col" dir="rtl">
            <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: '#f0e0e4' }}>
              <h3 className="text-xl font-bold" style={{ color: '#2d1f26' }}>إضافة ضيوف</h3>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  onClick={() => setShowImportModal(true)}
                  className="rounded-xl gap-2"
                  style={{ background: '#e8f0ea', color: '#4a7d54' }}
                >
                  <Upload className="w-4 h-4" />
                  استيراد
                </Button>
                <Button variant="ghost" size="sm" onClick={() => {
                  setShowAddGuestModal(false)
                  setGuestForms([{ name: '', email: '', phone: '', companyName: '', jobTitle: '', gender: 'female' }])
                }}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* قائمة الضيوف */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {guestForms.map((guest, index) => (
                <div key={index} className="p-4 rounded-xl border relative" style={{ borderColor: '#f0e0e4', background: '#fdf8f9' }}>
                  {guestForms.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeGuestField(index)}
                      className="absolute -top-2 -left-2 w-6 h-6 rounded-full flex items-center justify-center shadow-md z-10"
                      style={{ background: '#fce8e8', color: '#8a3a3a' }}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}

                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: '#e8d8dc', color: '#6b5a60' }}>
                      {index + 1}
                    </div>
                    <span className="text-sm font-medium" style={{ color: '#2d1f26' }}>الضيف {index + 1}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-medium" style={{ color: '#6b5a60' }}>الاسم *</Label>
                      <Input
                        value={guest.name}
                        onChange={e => updateGuestForm(index, 'name', e.target.value)}
                        className="mt-1 h-10 rounded-lg text-sm"
                        style={{ borderColor: '#e8d8dc' }}
                        placeholder="اسم الضيف"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-medium" style={{ color: '#6b5a60' }}>الجوال</Label>
                      <Input
                        value={guest.phone}
                        onChange={e => updateGuestForm(index, 'phone', e.target.value)}
                        className="mt-1 h-10 rounded-lg text-sm"
                        style={{ borderColor: '#e8d8dc' }}
                        placeholder="05xxxxxxxx"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-medium" style={{ color: '#6b5a60' }}>البريد</Label>
                      <Input
                        type="email"
                        value={guest.email}
                        onChange={e => updateGuestForm(index, 'email', e.target.value)}
                        className="mt-1 h-10 rounded-lg text-sm"
                        style={{ borderColor: '#e8d8dc' }}
                        placeholder="email@example.com"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-medium" style={{ color: '#6b5a60' }}>الشركة</Label>
                      <Input
                        value={guest.companyName}
                        onChange={e => updateGuestForm(index, 'companyName', e.target.value)}
                        className="mt-1 h-10 rounded-lg text-sm"
                        style={{ borderColor: '#e8d8dc' }}
                        placeholder="اسم الشركة"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-medium" style={{ color: '#6b5a60' }}>المنصب</Label>
                      <Input
                        value={guest.jobTitle}
                        onChange={e => updateGuestForm(index, 'jobTitle', e.target.value)}
                        className="mt-1 h-10 rounded-lg text-sm"
                        style={{ borderColor: '#e8d8dc' }}
                        placeholder="المسمى الوظيفي"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-medium" style={{ color: '#6b5a60' }}>الجنس</Label>
                      <div className="flex gap-3 mt-1">
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="radio"
                            name={`gender-${index}`}
                            checked={guest.gender === 'female'}
                            onChange={() => updateGuestForm(index, 'gender', 'female')}
                            className="w-3 h-3"
                            style={{ accentColor: '#a8556f' }}
                          />
                          <span className="text-xs" style={{ color: '#2d1f26' }}>👩 سيدة</span>
                        </label>
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="radio"
                            name={`gender-${index}`}
                            checked={guest.gender === 'male'}
                            onChange={() => updateGuestForm(index, 'gender', 'male')}
                            className="w-3 h-3"
                            style={{ accentColor: '#a8556f' }}
                          />
                          <span className="text-xs" style={{ color: '#2d1f26' }}>👨 رجل</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* زر إضافة ضيف جديد */}
              <button
                type="button"
                onClick={addGuestField}
                className="w-full p-3 rounded-xl border-2 border-dashed flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                style={{ borderColor: '#e8d8dc', color: '#a8556f' }}
              >
                <Plus className="w-5 h-5" />
                <span className="font-medium">إضافة ضيف آخر</span>
              </button>
            </div>

            {/* أزرار الحفظ */}
            <div className="p-6 border-t flex gap-3" style={{ borderColor: '#f0e0e4' }}>
              <Button
                type="button"
                onClick={handleAddGuests}
                className="flex-1 rounded-xl h-12 gap-2"
                style={{ background: 'linear-gradient(135deg, #a8556f 0%, #9b7b9a 100%)', color: 'white' }}
              >
                <UserPlus className="w-5 h-5" />
                إضافة {toEnglishNumbers(guestForms.filter(g => g.name.trim()).length)} ضيف
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddGuestModal(false)
                  setGuestForms([{ name: '', email: '', phone: '', companyName: '', jobTitle: '', gender: 'female' }])
                }}
                className="flex-1 rounded-xl h-12"
              >
                إلغاء
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal استيراد من Excel/Google Sheets */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6" dir="rtl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold" style={{ color: '#2d1f26' }}>استيراد ضيوف</h3>
              <Button variant="ghost" size="sm" onClick={() => {
                setShowImportModal(false)
                setImportText('')
                setImportUrl('')
              }}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-4">
              <Button
                type="button"
                onClick={() => setImportMode('file')}
                className="flex-1 rounded-xl gap-2"
                style={importMode === 'file' ? { background: '#f5eef0', color: '#8a5a6a' } : { background: '#f5f5f5', color: '#6b5a60' }}
              >
                <Upload className="w-4 h-4" />
                ملف Excel
              </Button>
              <Button
                type="button"
                onClick={() => setImportMode('url')}
                className="flex-1 rounded-xl gap-2"
                style={importMode === 'url' ? { background: '#f5eef0', color: '#8a5a6a' } : { background: '#f5f5f5', color: '#6b5a60' }}
              >
                <Globe2 className="w-4 h-4" />
                Google Sheets
              </Button>
              <Button
                type="button"
                onClick={() => setImportMode('text')}
                className="flex-1 rounded-xl gap-2"
                style={importMode === 'text' ? { background: '#f5eef0', color: '#8a5a6a' } : { background: '#f5f5f5', color: '#6b5a60' }}
              >
                <Edit className="w-4 h-4" />
                نص
              </Button>
            </div>

            {/* تنسيق البيانات */}
            <div className="mb-4 p-3 rounded-xl" style={{ background: '#fdf8f9' }}>
              <p className="text-xs font-medium mb-1" style={{ color: '#2d1f26' }}>📋 تنسيق الأعمدة:</p>
              <p className="text-xs" style={{ color: '#6b5a60' }}>الاسم | البريد | الجوال | الشركة | المنصب</p>
            </div>

            {/* محتوى حسب الوضع */}
            {importMode === 'file' && (
              <div className="space-y-4">
                <label className="block">
                  <div className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors" style={{ borderColor: '#e8d8dc' }}>
                    <Upload className="w-10 h-10 mx-auto mb-3" style={{ color: '#a8556f' }} />
                    <p className="text-sm font-medium" style={{ color: '#2d1f26' }}>اضغط لرفع ملف Excel</p>
                    <p className="text-xs mt-1" style={{ color: '#9a8a90' }}>يدعم .xlsx و .xls</p>
                  </div>
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileImport}
                    className="hidden"
                    disabled={importLoading}
                  />
                </label>
                {importLoading && (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 mx-auto" style={{ borderColor: '#e8d8dc', borderTopColor: '#a8556f' }}></div>
                    <p className="text-sm mt-2" style={{ color: '#6b5a60' }}>جاري الاستيراد...</p>
                  </div>
                )}
              </div>
            )}

            {importMode === 'url' && (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium" style={{ color: '#2d1f26' }}>رابط Google Sheets</Label>
                  <Input
                    value={importUrl}
                    onChange={e => setImportUrl(e.target.value)}
                    className="mt-2 h-12 rounded-xl"
                    style={{ borderColor: '#e8d8dc' }}
                    placeholder="https://docs.google.com/spreadsheets/d/..."
                  />
                </div>
                <div className="p-3 rounded-xl" style={{ background: '#fff3cd' }}>
                  <p className="text-xs" style={{ color: '#856404' }}>⚠️ تأكد من أن الورقة عامة (Share → Anyone with the link)</p>
                </div>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    onClick={handleUrlImport}
                    disabled={importLoading || !importUrl.trim()}
                    className="flex-1 rounded-xl h-12 gap-2"
                    style={{ background: '#e8f0ea', color: '#4a7d54' }}
                  >
                    {importLoading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-2" style={{ borderColor: '#4a7d54', borderTopColor: 'transparent' }}></div>
                    ) : (
                      <>
                        <Globe2 className="w-5 h-5" />
                        استيراد
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {importMode === 'text' && (
              <div className="space-y-4">
                <Textarea
                  value={importText}
                  onChange={e => setImportText(e.target.value)}
                  className="min-h-[200px] rounded-xl"
                  style={{ borderColor: '#e8d8dc' }}
                  placeholder={"مثال:\nنورة أحمد، noura@email.com، 0512345678، شركة ABC، مديرة تسويق\nسارة محمد، sara@email.com، 0598765432، شركة XYZ، مديرة مشاريع"}
                />
                <div className="flex gap-3">
                  <Button
                    type="button"
                    onClick={handleImportGuests}
                    disabled={!importText.trim()}
                    className="flex-1 rounded-xl h-12 gap-2"
                    style={{ background: '#e8f0ea', color: '#4a7d54' }}
                  >
                    <Upload className="w-5 h-5" />
                    استيراد
                  </Button>
                </div>
              </div>
            )}

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowImportModal(false)
                setImportText('')
                setImportUrl('')
              }}
              className="w-full rounded-xl h-12 mt-4"
            >
              إلغاء
            </Button>
          </div>
        </div>
      )}

      {/* Modal إلغاء القبول */}
      {showCancelModal && viewingEventRegistrations && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl p-6" dir="rtl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold" style={{ color: '#2d1f26' }}>إلغاء القبول</h3>
              <Button variant="ghost" size="sm" onClick={() => {
                setShowCancelModal(false)
                setSelectedRegistrationsForCancel([])
              }}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <Card className="rounded-xl border" style={{ borderColor: '#f0e0e4' }}>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold" style={{ color: '#4a7d54' }}>
                    {registrations.filter(r => r.eventId === viewingEventRegistrations.id && r.status === 'confirmed').length}
                  </div>
                  <div className="text-xs" style={{ color: '#6b5a60' }}>مقبولين</div>
                </CardContent>
              </Card>
              <Card className="rounded-xl border" style={{ borderColor: '#f0e0e4' }}>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold" style={{ color: '#a8556f' }}>
                    {toEnglishNumbers(selectedRegistrationsForCancel.length)}
                  </div>
                  <div className="text-xs" style={{ color: '#6b5a60' }}>محددين للإلغاء</div>
                </CardContent>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mb-6 flex-wrap">
              <Button
                onClick={cancelAllConfirmations}
                className="rounded-xl gap-2"
                style={{ background: '#fce8e8', color: '#8a3a3a' }}
              >
                <X className="w-4 h-4" />
                إلغاء قبول الجميع
              </Button>
              <Button
                onClick={cancelSelectedConfirmations}
                disabled={selectedRegistrationsForCancel.length === 0}
                className="rounded-xl gap-2"
                style={{ background: selectedRegistrationsForCancel.length > 0 ? '#fce8e8' : '#f0f0f0', color: selectedRegistrationsForCancel.length > 0 ? '#8a3a3a' : '#999' }}
              >
                <X className="w-4 h-4" />
                إلغاء المحددين ({toEnglishNumbers(selectedRegistrationsForCancel.length)})
              </Button>
              <Button
                onClick={() => {
                  const confirmedRegs = registrations.filter(r => r.eventId === viewingEventRegistrations.id && r.status === 'confirmed')
                  setSelectedRegistrationsForCancel(confirmedRegs.map(r => r.id))
                }}
                variant="outline"
                className="rounded-xl"
              >
                تحديد الكل
              </Button>
              <Button
                onClick={() => setSelectedRegistrationsForCancel([])}
                variant="outline"
                className="rounded-xl"
              >
                إلغاء التحديد
              </Button>
            </div>

            {/* Registrations List */}
            <div className="max-h-96 overflow-y-auto border rounded-xl" style={{ borderColor: '#f0e0e4' }}>
              <Table>
                <TableHeader>
                  <TableRow style={{ background: '#fdf8f9' }}>
                    <TableHead className="text-center w-12">
                      <input
                        type="checkbox"
                        checked={selectedRegistrationsForCancel.length === registrations.filter(r => r.eventId === viewingEventRegistrations.id && r.status === 'confirmed').length && registrations.filter(r => r.eventId === viewingEventRegistrations.id && r.status === 'confirmed').length > 0}
                        onChange={(e) => {
                          const confirmedRegs = registrations.filter(r => r.eventId === viewingEventRegistrations.id && r.status === 'confirmed')
                          if (e.target.checked) {
                            setSelectedRegistrationsForCancel(confirmedRegs.map(r => r.id))
                          } else {
                            setSelectedRegistrationsForCancel([])
                          }
                        }}
                        className="w-4 h-4"
                      />
                    </TableHead>
                    <TableHead className="text-right">الاسم</TableHead>
                    <TableHead className="text-right">الشركة</TableHead>
                    <TableHead className="text-right">المسمى الوظيفي</TableHead>
                    <TableHead className="text-center">الجنس</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registrations
                    .filter(r => r.eventId === viewingEventRegistrations.id && r.status === 'confirmed')
                    .map((reg) => (
                      <TableRow 
                        key={reg.id} 
                        className={selectedRegistrationsForCancel.includes(reg.id) ? 'bg-red-50' : ''}
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                          setSelectedRegistrationsForCancel(prev => 
                            prev.includes(reg.id) 
                              ? prev.filter(id => id !== reg.id)
                              : [...prev, reg.id]
                          )
                        }}
                      >
                        <TableCell className="text-center">
                          <input
                            type="checkbox"
                            checked={selectedRegistrationsForCancel.includes(reg.id)}
                            onChange={() => {}}
                            className="w-4 h-4"
                          />
                        </TableCell>
                        <TableCell style={{ color: '#2d1f26' }}>
                          <Link 
                            href={`/admin/member/${reg.memberId || reg.id}`}
                            className="hover:underline cursor-pointer"
                            style={{ color: '#a8556f' }}
                          >
                            {reg.name}
                          </Link>
                        </TableCell>
                        <TableCell style={{ color: '#6b5a60' }}>{reg.companyName || '-'}</TableCell>
                        <TableCell style={{ color: '#6b5a60' }}>{reg.jobTitle || '-'}</TableCell>
                        <TableCell className="text-center">
                          <span className="text-sm font-medium" style={{ color: reg.gender === 'male' ? '#1e6bb8' : '#a8556f' }}>{reg.gender === 'male' ? 'ذكر' : 'أنثى'}</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  {registrations.filter(r => r.eventId === viewingEventRegistrations.id && r.status === 'confirmed').length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8" style={{ color: '#9a8a90' }}>
                        لا يوجد تسجيلات مقبولة
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-end mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCancelModal(false)
                  setSelectedRegistrationsForCancel([])
                }}
                className="rounded-full px-8"
              >
                إغلاق
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* تنبيه اللقاء المنتهي وغير المنشور */}
      {endedEventAlert.show && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: 'rgba(168, 85, 111, 0.4)' }} dir="rtl">
          <div className="rounded-3xl p-8 max-w-md w-full text-center" style={{ background: 'linear-gradient(135deg, #fdf8f9 0%, #fff 100%)' }}>
            {/* أيقونة التنبيه */}
            <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: '#fef3e0' }}>
              <Calendar className="w-10 h-10" style={{ color: '#9a6b1a' }} />
            </div>
            
            {/* العنوان */}
            <h3 className="text-2xl font-bold mb-2" style={{ color: '#2d1f26' }}>لقاء منتهي وغير منشور</h3>
            <p className="text-lg mb-2" style={{ color: '#a8556f' }}>{endedEventAlert.eventTitle}</p>
            <p className="text-sm mb-8" style={{ color: '#6b5a60' }}>
              انتهى تاريخ هذا اللقاء ولم يتم نشره. هل تريد تحديث تاريخه أو أرشفته؟
            </p>
            
            {/* الأزرار */}
            <div className="flex flex-col gap-3">
              <Button
                onClick={() => {
                  // فتح صفحة تعديل اللقاء
                  const event = events.find(e => e.id === endedEventAlert.eventId)
                  if (event) {
                    openEditEvent(event)
                  }
                  closeEndedEventAlert()
                }}
                className="w-full rounded-full py-6 text-lg font-medium gap-2"
                style={{ background: 'linear-gradient(135deg, #a8556f 0%, #9b7b9a 100%)', color: 'white' }}
              >
                <Edit className="w-5 h-5" />
                حدّث اللقاء
              </Button>
              <Button
                onClick={handleArchiveEndedEvent}
                className="w-full rounded-full py-6 text-lg font-medium gap-2"
                style={{ background: '#e8d8dc', color: '#6b5a60' }}
              >
                <Archive className="w-5 h-5" />
                أرشفه
              </Button>
              <Button
                variant="outline"
                onClick={handleIgnoreEndedEvent}
                className="w-full rounded-full py-6 text-lg font-medium"
                style={{ borderColor: '#e8d8dc', color: '#6b5a60' }}
              >
                تجاهل
              </Button>
            </div>
            
            <p className="text-xs mt-4" style={{ color: '#9a8a90' }}>
              عند التجاهل، سيبقى الإشعار في أيقونة الجرس
            </p>
          </div>
        </div>
      )}

    </div>
  )
}
// Build timestamp: Thu Mar 12 03:14:41 UTC 2026
