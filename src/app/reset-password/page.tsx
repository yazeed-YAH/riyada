'use client'

import { useState, useEffect, Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Crown, ArrowRight, Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [success, setSuccess] = useState(false)
  const [verifying, setVerifying] = useState(true)
  const [validToken, setValidToken] = useState(false)
  const [email, setEmail] = useState('')

  useEffect(() => {
    verifyToken()
  }, [token])

  const verifyToken = async () => {
    if (!token) {
      setVerifying(false)
      return
    }

    try {
      const response = await fetch('/api/auth/verify-reset-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      })

      const data = await response.json()
      setValidToken(data.valid)
      if (data.email) {
        setEmail(data.email)
      }
    } catch {
      setValidToken(false)
    } finally {
      setVerifying(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!password || !confirmPassword) {
      toast.error('يرجى إدخال كلمة المرور')
      return
    }

    if (password.length < 6) {
      toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
      return
    }

    if (password !== confirmPassword) {
      toast.error('كلمة المرور غير متطابقة')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        toast.success('تم إعادة تعيين كلمة المرور بنجاح')
      } else {
        toast.error(data.error || 'حدث خطأ')
      }
    } catch {
      toast.error('حدث خطأ')
    } finally {
      setLoading(false)
    }
  }

  if (verifying) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" dir="rtl" style={{ background: 'linear-gradient(180deg, #fdf8f9 0%, #ffffff 50%, #fdf8f9 100%)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-4" style={{ borderColor: '#e8b4c4', borderTopColor: '#a8556f' }}></div>
        <p className="mt-4" style={{ color: '#6b5a60' }}>جاري التحقق...</p>
      </div>
    )
  }

  if (!validToken && !verifying) {
    return (
      <div className="min-h-screen flex flex-col" dir="rtl" style={{ background: 'linear-gradient(180deg, #fdf8f9 0%, #ffffff 50%, #fdf8f9 100%)' }}>
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
            </div>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center py-12">
          <div className="w-full max-w-lg px-6">
            <div className="bg-white rounded-3xl shadow-xl p-8 border text-center" style={{ borderColor: '#f0e0e4' }}>
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#fce8e8' }}>
                <Lock className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-xl font-bold mb-2" style={{ color: '#2d1f26' }}>رابط غير صالح</h2>
              <p className="text-sm mb-6" style={{ color: '#6b5a60' }}>
                هذا الرابط غير صالح أو منتهي الصلاحية
                <br />
                يرجى طلب رابط استعادة جديد
              </p>
              <Link href="/login">
                <Button className="btn btn-primary rounded-full px-8">
                  العودة لتسجيل الدخول
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
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
            <h2 className="text-2xl font-bold" style={{ color: '#2d1f26' }}>إعادة تعيين كلمة المرور</h2>
          </div>
        </div>
      </header>

      {/* Reset Form */}
      <div className="flex-1 flex items-center justify-center py-12">
        <div className="w-full max-w-lg px-6">
          {/* Icon */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg"
              style={{ background: success ? 'linear-gradient(135deg, #2d6b3d 0%, #3a7d44 100%)' : 'linear-gradient(135deg, #a8556f 0%, #9b7b9a 100%)' }}>
              {success ? (
                <CheckCircle2 className="w-10 h-10 text-white" />
              ) : (
                <Lock className="w-10 h-10 text-white" />
              )}
            </div>
            
            <h2 className="text-3xl font-bold mb-2" style={{ color: '#2d1f26' }}>
              {success ? 'تم بنجاح!' : 'كلمة المرور الجديدة'}
            </h2>
            <p className="text-base" style={{ color: '#6b5a60' }}>
              {success ? 'تم إعادة تعيين كلمة المرور بنجاح' : 'أدخلي كلمة المرور الجديدة'}
            </p>
          </div>

          {/* Reset Form */}
          <div className="bg-white rounded-3xl shadow-xl p-8 border" style={{ borderColor: '#f0e0e4' }}>
            {success ? (
              <div className="text-center py-4">
                <p className="text-sm mb-6" style={{ color: '#6b5a60' }}>
                  يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة
                </p>
                <div className="flex justify-center">
                  <Link href="/login">
                    <Button 
                      className="px-16 py-4 rounded-full text-lg font-medium"
                      style={{ background: 'linear-gradient(135deg, #a8556f 0%, #9b7b9a 100%)', color: 'white' }}
                    >
                      تسجيل الدخول
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-5">
                <div>
                  <Label className="text-base font-semibold" style={{ color: '#2d1f26' }}>
                    <Lock className="w-4 h-4 inline ml-1" />
                    كلمة المرور الجديدة
                  </Label>
                  <div className="relative mt-2">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
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
                  <Label className="text-base font-semibold" style={{ color: '#2d1f26' }}>
                    <Lock className="w-4 h-4 inline ml-1" />
                    تأكيد كلمة المرور
                  </Label>
                  <div className="relative mt-2">
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
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

                <div className="flex justify-center">
                  <Button
                    type="submit"
                    className="px-16 py-4 rounded-full text-lg font-medium"
                    style={{ background: 'linear-gradient(135deg, #a8556f 0%, #9b7b9a 100%)', color: 'white' }}
                    disabled={loading}
                  >
                    {loading ? 'جاري الحفظ...' : 'حفظ كلمة المرور الجديدة'}
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </div>
              </form>
            )}
          </div>

          {/* Back Link */}
          <div className="text-center mt-8">
            <Link href="/login">
              <Button variant="ghost" className="gap-2 rounded-full" style={{ color: '#6b5a60' }}>
                <ArrowRight className="w-4 h-4" />
                العودة لتسجيل الدخول
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center" dir="rtl" style={{ background: 'linear-gradient(180deg, #fdf8f9 0%, #ffffff 50%, #fdf8f9 100%)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-4" style={{ borderColor: '#e8b4c4', borderTopColor: '#a8556f' }}></div>
        <p className="mt-4" style={{ color: '#6b5a60' }}>جاري التحميل...</p>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}
