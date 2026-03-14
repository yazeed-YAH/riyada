'use client'

import { useState, Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Crown, ArrowRight, Lock, Mail, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

function AdminLoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const emailParam = searchParams.get('email') || ''
  
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ email: emailParam, password: '' })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!form.email || !form.password) {
      toast.error('يرجى إدخال البريد الإلكتروني وكلمة المرور')
      return
    }
    
    setLoading(true)
    
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      
      if (response.ok) {
        const data = await response.json()
        toast.success('تم تسجيل الدخول بنجاح')
        // تحويل السوبر أدمن إلى لوحة التحكم الخاصة به
        if (data.admin?.role === 'super_admin') {
          router.push('/super-admin')
        } else {
          router.push('/admin')
        }
      } else {
        const error = await response.json()
        toast.error(error.error || 'بيانات الدخول غير صحيحة')
      }
    } catch {
      toast.error('حدث خطأ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 border" style={{ borderColor: '#f0e0e4' }}>
      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <Label className="text-base font-semibold" style={{ color: '#2d1f26' }}>
            <Mail className="w-4 h-4 inline ml-1" />
            البريد الإلكتروني
          </Label>
          <Input 
            type="email" 
            value={form.email}
            onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
            required
            className="input mt-2 h-12"
            placeholder="admin@example.com"
          />
        </div>
        
        <div>
          <Label className="text-base font-semibold" style={{ color: '#2d1f26' }}>
            <Lock className="w-4 h-4 inline ml-1" />
            كلمة المرور
          </Label>
          <div className="relative mt-2">
            <Input 
              type={showPassword ? 'text' : 'password'} 
              value={form.password}
              onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))}
              required
              className="input h-12 pr-12"
              placeholder="••••••••"
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
        
        <Button 
          type="submit" 
          className="btn btn-primary w-full py-7 rounded-full text-lg"
          disabled={loading}
        >
          {loading ? 'جاري التحقق...' : 'دخول لوحة التحكم'}
          <ArrowRight className="w-5 h-5" />
        </Button>
      </form>

      {/* Back to Main Login */}
      <div className="mt-6 pt-4 border-t text-center" style={{ borderColor: '#f0e0e4' }}>
        <Link href="/login" className="text-sm font-medium hover:underline" style={{ color: '#a8556f' }}>
          العودة لتسجيل الدخول الرئيسي
        </Link>
      </div>
    </div>
  )
}

function AdminLoginLoading() {
  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 border animate-pulse" style={{ borderColor: '#f0e0e4' }}>
      <div className="space-y-5">
        <div>
          <div className="h-6 w-32 bg-gray-200 rounded mb-2"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
        <div>
          <div className="h-6 w-32 bg-gray-200 rounded mb-2"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
        <div className="h-14 bg-gray-200 rounded-full"></div>
      </div>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex flex-col" dir="rtl" style={{ background: 'linear-gradient(180deg, #fdf8f9 0%, #ffffff 50%, #fdf8f9 100%)' }}>
      {/* Header with Logo */}
      <header className="sticky top-0 z-50 glass border-b" style={{ borderColor: 'rgba(240, 224, 228, 0.5)' }}>
        <div className="container">
          <div className="flex items-center justify-between h-20">
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
          </div>
        </div>
      </header>

      {/* Login Form */}
      <div className="flex-1 flex items-center justify-center py-12">
        <div className="w-full max-w-lg px-6">
          {/* Icon */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg"
              style={{ background: 'linear-gradient(135deg, #6b5a60 0%, #4a3a40 100%)' }}>
              <Lock className="w-10 h-10 text-white" />
            </div>
            
            <h2 className="text-3xl font-bold mb-2" style={{ color: '#2d1f26' }}>دخول لوحة التحكم</h2>
            <p className="text-base" style={{ color: '#6b5a60' }}>للإداريين فقط</p>
          </div>

          {/* Admin Login Form with Suspense */}
          <Suspense fallback={<AdminLoginLoading />}>
            <AdminLoginForm />
          </Suspense>

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
