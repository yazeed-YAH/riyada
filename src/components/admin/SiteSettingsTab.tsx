'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Settings, ImageIcon, Globe, Mail, Phone, Instagram, Twitter, Linkedin, 
  Camera, X, Save, Loader2
} from 'lucide-react'
import { toast } from 'sonner'

interface SiteSettings {
  siteName: string
  siteDescription: string
  logoUrl: string
  email: string
  phone: string
  website: string
  twitter: string
  instagram: string
  linkedin: string
  snapchat: string
  tiktok: string
}

export default function SiteSettingsTab() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: 'ملتقى ريادة',
    siteDescription: 'تجمع سيدات الأعمال',
    logoUrl: '',
    email: 'info@riyada-women.com',
    phone: '',
    website: 'www.riyada-women.com',
    twitter: '',
    instagram: '',
    linkedin: '',
    snapchat: '',
    tiktok: '',
  })
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/site-settings')
      if (response.ok) {
        const data = await response.json()
        setSettings(prev => ({ ...prev, ...data.settings }))
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast.error('حدث خطأ في جلب الإعدادات')
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    if (!file.type.startsWith('image/')) {
      toast.error('يرجى اختيار ملف صورة صالح')
      return
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('حجم الصورة كبير جداً. الحد الأقصى 5 ميجابايت')
      return
    }
    
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        const data = await response.json()
        setSettings(prev => ({ ...prev, logoUrl: data.url }))
        toast.success('تم رفع الشعار بنجاح')
      } else {
        toast.error('حدث خطأ أثناء رفع الشعار')
      }
    } catch {
      toast.error('حدث خطأ في الاتصال بالخادم')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/site-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })
      
      if (response.ok) {
        toast.success('تم حفظ الإعدادات بنجاح')
      } else {
        toast.error('حدث خطأ في حفظ الإعدادات')
      }
    } catch {
      toast.error('حدث خطأ في الاتصال بالخادم')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#a8556f' }} />
      </div>
    )
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* العنوان */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #a8556f 0%, #9b7b9a 100%)' }}>
            <Settings className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold" style={{ color: '#2d1f26' }}>إعدادات الموقع</h2>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="rounded-full gap-2 px-6"
          style={{ background: 'linear-gradient(135deg, #a8556f 0%, #9b7b9a 100%)', color: 'white' }}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          حفظ الإعدادات
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* شعار الموقع */}
        <Card className="rounded-2xl border" style={{ borderColor: '#f0e0e4' }}>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2" style={{ color: '#2d1f26' }}>
              <ImageIcon className="w-5 h-5" style={{ color: '#a8556f' }} />
              شعار الموقع
            </CardTitle>
          </CardHeader>
          <CardContent>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <div 
              className="relative w-full h-40 rounded-2xl border-2 border-dashed cursor-pointer overflow-hidden group"
              style={{ borderColor: settings.logoUrl ? '#a8556f' : '#e8d8dc', background: '#fdf8f9' }}
              onClick={() => fileInputRef.current?.click()}
            >
              {settings.logoUrl ? (
                <>
                  <img 
                    src={settings.logoUrl} 
                    alt="شعار الموقع" 
                    className="w-full h-full object-contain p-4"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Camera className="w-6 h-6 text-white" />
                    <span className="text-white text-sm font-medium">تغيير الشعار</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setSettings(prev => ({ ...prev, logoUrl: '' })); }}
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
                      <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#a8556f' }} />
                    ) : (
                      <Camera className="w-8 h-8" style={{ color: '#a8556f' }} />
                    )}
                  </div>
                  {uploading ? (
                    <span className="text-sm font-medium" style={{ color: '#6b5a60' }}>جاري رفع الشعار...</span>
                  ) : (
                    <>
                      <span className="text-sm font-medium" style={{ color: '#6b5a60' }}>اضغط لرفع شعار الموقع</span>
                      <span className="text-xs" style={{ color: '#9a8a90' }}>PNG, JPG, SVG (الحد الأقصى 5 ميجابايت)</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* معلومات الموقع */}
        <Card className="rounded-2xl border" style={{ borderColor: '#f0e0e4' }}>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2" style={{ color: '#2d1f26' }}>
              <Globe className="w-5 h-5" style={{ color: '#a8556f' }} />
              معلومات الموقع
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block" style={{ color: '#2d1f26' }}>اسم الموقع</Label>
              <Input 
                value={settings.siteName}
                onChange={e => setSettings(prev => ({ ...prev, siteName: e.target.value }))}
                className="h-11 rounded-xl"
                style={{ borderColor: '#e8d8dc' }}
              />
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block" style={{ color: '#2d1f26' }}>وصف الموقع</Label>
              <Input 
                value={settings.siteDescription}
                onChange={e => setSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
                className="h-11 rounded-xl"
                style={{ borderColor: '#e8d8dc' }}
              />
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block" style={{ color: '#2d1f26' }}>الموقع الإلكتروني</Label>
              <Input 
                value={settings.website}
                onChange={e => setSettings(prev => ({ ...prev, website: e.target.value }))}
                className="h-11 rounded-xl"
                style={{ borderColor: '#e8d8dc' }}
                placeholder="www.example.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* معلومات التواصل */}
        <Card className="rounded-2xl border" style={{ borderColor: '#f0e0e4' }}>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2" style={{ color: '#2d1f26' }}>
              <Mail className="w-5 h-5" style={{ color: '#a8556f' }} />
              معلومات التواصل
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block" style={{ color: '#2d1f26' }}>البريد الإلكتروني</Label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9a8a90' }} />
                <Input 
                  value={settings.email}
                  onChange={e => setSettings(prev => ({ ...prev, email: e.target.value }))}
                  className="h-11 rounded-xl pr-10"
                  style={{ borderColor: '#e8d8dc' }}
                  placeholder="info@example.com"
                  type="email"
                />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block" style={{ color: '#2d1f26' }}>رقم الهاتف</Label>
              <div className="relative">
                <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9a8a90' }} />
                <Input 
                  value={settings.phone}
                  onChange={e => setSettings(prev => ({ ...prev, phone: e.target.value }))}
                  className="h-11 rounded-xl pr-10"
                  style={{ borderColor: '#e8d8dc' }}
                  placeholder="+966 5X XXX XXXX"
                  dir="ltr"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* السوشل ميديا */}
        <Card className="rounded-2xl border" style={{ borderColor: '#f0e0e4' }}>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2" style={{ color: '#2d1f26' }}>
              <Instagram className="w-5 h-5" style={{ color: '#a8556f' }} />
              السوشل ميديا
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block" style={{ color: '#2d1f26' }}>انستغرام</Label>
              <div className="relative">
                <Instagram className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#E4405F' }} />
                <Input 
                  value={settings.instagram}
                  onChange={e => setSettings(prev => ({ ...prev, instagram: e.target.value }))}
                  className="h-11 rounded-xl pr-10"
                  style={{ borderColor: '#e8d8dc' }}
                  placeholder="@username"
                  dir="ltr"
                />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block" style={{ color: '#2d1f26' }}>تويتر (X)</Label>
              <div className="relative">
                <Twitter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#1DA1F2' }} />
                <Input 
                  value={settings.twitter}
                  onChange={e => setSettings(prev => ({ ...prev, twitter: e.target.value }))}
                  className="h-11 rounded-xl pr-10"
                  style={{ borderColor: '#e8d8dc' }}
                  placeholder="@username"
                  dir="ltr"
                />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block" style={{ color: '#2d1f26' }}>لينكد إن</Label>
              <div className="relative">
                <Linkedin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#0A66C2' }} />
                <Input 
                  value={settings.linkedin}
                  onChange={e => setSettings(prev => ({ ...prev, linkedin: e.target.value }))}
                  className="h-11 rounded-xl pr-10"
                  style={{ borderColor: '#e8d8dc' }}
                  placeholder="linkedin.com/in/username"
                  dir="ltr"
                />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block" style={{ color: '#2d1f26' }}>سناب شات</Label>
              <div className="relative">
                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-sm" style={{ background: '#FFFC00' }} />
                <Input 
                  value={settings.snapchat}
                  onChange={e => setSettings(prev => ({ ...prev, snapchat: e.target.value }))}
                  className="h-11 rounded-xl pr-10"
                  style={{ borderColor: '#e8d8dc' }}
                  placeholder="@username"
                  dir="ltr"
                />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block" style={{ color: '#2d1f26' }}>تيك توك</Label>
              <div className="relative">
                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full" style={{ background: '#000000' }} />
                <Input 
                  value={settings.tiktok}
                  onChange={e => setSettings(prev => ({ ...prev, tiktok: e.target.value }))}
                  className="h-11 rounded-xl pr-10"
                  style={{ borderColor: '#e8d8dc' }}
                  placeholder="@username"
                  dir="ltr"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
