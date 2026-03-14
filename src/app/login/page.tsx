'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Crown, ArrowRight, Lock, Mail, KeyRound, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!form.email || !form.password) {
      toast.error('يرجى إدخال البريد الإلكتروني وكلمة المرور')
      return
    }
    
    setLoading(true)
    
    try {
      // استخدام API مباشر يتجاوز Prisma
      const response = await fetch('/api/auth-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
        credentials: 'include'
      })
      
      const data = await response.json()
      
      if (response.ok && data.success) {
        toast.success('تم تسجيل الدخول بنجاح')
        // تحويل إلى لوحة التحكم
        setTimeout(() => {
          window.location.href = '/admin'
        }, 500)
        return
      }
      
      // رسالة الخطأ
      toast.error(data.error || 'البريد الإلكتروني أو كلمة المرور غير صحيحة')
      
    } catch {
      toast.error('حدث خطأ')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!resetEmail) {
      toast.error('يرجى إدخال البريد الإلكتروني')
      return
    }
    
    setResetLoading(true)
    
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setResetSent(true)
        toast.success('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني')
      } else {
        toast.error(data.error || 'حدث خطأ')
      }
    } catch {
      toast.error('حدث خطأ')
    } finally {
      setResetLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col" dir="rtl" style={{ background: 'linear-gradient(180deg, #fdf8f9 0%, #ffffff 50%, #fdf8f9 100%)' }}>
      {/* Header with Logo */}
      <header className="sticky top-0 z-50 glass border-b" style={{ borderColor: 'rgba(240, 224, 228, 0.5)' }}>
        <div className="container mx-auto px-6">
          <div className="flex flex-row items-center justify-between h-20 w-full">
            <Link href="/" className="flex flex-row items-center gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #a8556f 0%, #9b7b9a 100%)' }}>
                <Crown className="w-6 h-6 text-white relative z-10" />
                <div className="absolute inset-0 bg-white/20"></div>
              </div>
              <div className="text-right">
                <h1 className="text-xl font-bold" style={{ color: '#2d1f26' }}>ملتقى ريادة</h1>
                <p className="text-xs font-medium" style={{ color: '#6b5a60' }}>تجمع سيدات الأعمال</p>
              </div>
            </Link>
            <h2 className="text-2xl font-bold" style={{ color: '#2d1f26' }}>تسجيل الدخول</h2>
          </div>
        </div>
      </header>

      {/* Login Form */}
      <div className="flex-1 flex items-center justify-center py-12">
        <div className="w-full max-w-lg px-6">
          {/* Icon */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg"
              style={{ background: 'linear-gradient(135deg, #a8556f 0%, #9b7b9a 100%)' }}>
              <KeyRound className="w-10 h-10 text-white" />
            </div>
            
            <h2 className="text-3xl font-bold mb-2" style={{ color: '#2d1f26' }}>
              {showForgotPassword ? 'استعادة كلمة المرور' : 'تسجيل الدخول'}
            </h2>
            <p className="text-base" style={{ color: '#6b5a60' }}>
              {showForgotPassword 
                ? 'أدخلي بريدك الإلكتروني لاستعادة كلمة المرور' 
                : 'أدخلي البريد الإلكتروني وكلمة المرور'}
            </p>
          </div>

          {/* Login Form */}
          <div className="bg-white rounded-3xl shadow-xl p-8 border" style={{ borderColor: '#f0e0e4' }}>
            {!showForgotPassword ? (
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
                    className="input mt-2 h-12"
                    placeholder="أدخلي بريدك الإلكتروني"
                    required
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
                
                {/* Forgot Password Link */}
                <div className="text-left">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm font-medium hover:underline"
                    style={{ color: '#a8556f' }}
                  >
                    نسيت كلمة المرور؟
                  </button>
                </div>
                
                <div className="flex justify-center">
                  <Button
                    type="submit"
                    className="btn btn-primary w-full md:w-auto md:px-20 py-6 rounded-full text-lg"
                    disabled={loading}
                  >
                    <ArrowRight className="w-5 h-5" />
                    {loading ? 'جاري التحقق...' : 'تسجيل الدخول'}
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-5">
                {resetSent ? (
                  <div className="text-center py-6">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#e0f0e4' }}>
                      <Mail className="w-8 h-8" style={{ color: '#2d6b3d' }} />
                    </div>
                    <h3 className="text-lg font-bold mb-2" style={{ color: '#2d1f26' }}>تم إرسال البريد</h3>
                    <p className="text-sm mb-6" style={{ color: '#6b5a60' }}>
                      تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني
                      <br />
                      <span className="font-medium" style={{ color: '#a8556f' }}>{resetEmail}</span>
                    </p>
                    <div className="flex justify-center">
                      <Button
                        type="button"
                        onClick={() => {
                          setShowForgotPassword(false)
                          setResetSent(false)
                          setResetEmail('')
                        }}
                        className="btn btn-primary w-full md:w-auto md:px-20 py-6 rounded-full text-lg"
                      >
                        <ArrowRight className="w-5 h-5" />
                        العودة لتسجيل الدخول
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <Label className="text-base font-semibold" style={{ color: '#2d1f26' }}>
                        <Mail className="w-4 h-4 inline ml-1" />
                        البريد الإلكتروني
                      </Label>
                      <Input 
                        type="email" 
                        value={resetEmail}
                        onChange={e => setResetEmail(e.target.value)}
                        className="input mt-2 h-12"
                        placeholder="أدخلي بريدك الإلكتروني"
                        required
                      />
                    </div>
                    
                    <div className="flex justify-center">
                      <Button
                        type="submit"
                        className="btn btn-primary w-full md:w-auto md:px-20 py-6 rounded-full text-lg"
                        disabled={resetLoading}
                      >
                        <ArrowLeft className="w-5 h-5" />
                        {resetLoading ? 'جاري الإرسال...' : 'إرسال رابط الاستعادة'}
                      </Button>
                    </div>
                    
                    <div className="flex justify-center">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowForgotPassword(false)}
                        className="px-12 py-3 rounded-full text-base"
                        style={{ borderColor: '#f0e0e4', color: '#6b5a60' }}
                      >
                        العودة لتسجيل الدخول
                      </Button>
                    </div>
                  </>
                )}
              </form>
            )}

            {!showForgotPassword && (
              <div className="mt-6 text-center">
                <p className="text-sm" style={{ color: '#9a8a90' }}>
                  ليس لديك حساب؟{' '}
                  <Link href="/signup" className="font-medium hover:underline" style={{ color: '#a8556f' }}>
                    إنشاء حساب جديد
                  </Link>
                </p>
              </div>
            )}
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
