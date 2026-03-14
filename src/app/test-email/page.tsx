'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CheckCircle2, Loader2, Mail, Send } from 'lucide-react'
import { toast } from 'sonner'

export default function TestEmailPage() {
  const [testEmailSending, setTestEmailSending] = useState(false)
  const [testEmail, setTestEmail] = useState('yazeed@yah.sa')
  const [testName, setTestName] = useState('يزيد')

  const sendTestEmail = async () => {
    if (!testEmail) {
      toast.error('يرجى إدخال البريد الإلكتروني')
      return
    }

    setTestEmailSending(true)
    try {
      toast.info('جاري إرسال الإيميل...')

      const response = await fetch('/api/test-send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail, name: testName })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast.success('تم إرسال الإيميل بنجاح! تحقق من صندوق الوارد')
      } else {
        console.error('Email error:', data)
        toast.error(data.error || 'حدث خطأ أثناء الإرسال', { duration: 8000 })
      }
    } catch (error) {
      console.error('Connection error:', error)
      toast.error('حدث خطأ في الاتصال بالخادم')
    } finally {
      setTestEmailSending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #fdf8f9 0%, #f5f5f9 100%)' }}>
      <Card className="w-full max-w-md rounded-2xl border" style={{ borderColor: '#c8e6c9', background: 'linear-gradient(135deg, #f1f8e9 0%, #fff 100%)' }}>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: '#e8f5e9' }}>
              <CheckCircle2 className="w-6 h-6" style={{ color: '#3a7d44' }} />
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{ color: '#2d1f26' }}>اختبار إيميل تأكيد القبول</h1>
              <p className="text-sm" style={{ color: '#6b5a60' }}>إرسال إيميل تجريبي لتأكيد القبول</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block" style={{ color: '#2d1f26' }}>الاسم</Label>
              <Input
                value={testName}
                onChange={e => setTestName(e.target.value)}
                className="h-11 rounded-xl"
                style={{ borderColor: '#e8d8dc' }}
                placeholder="اسم المستلم"
              />
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block" style={{ color: '#2d1f26' }}>البريد الإلكتروني</Label>
              <Input
                value={testEmail}
                onChange={e => setTestEmail(e.target.value)}
                type="email"
                className="h-11 rounded-xl"
                style={{ borderColor: '#e8d8dc' }}
                placeholder="email@example.com"
                dir="ltr"
              />
            </div>

            <Button
              onClick={sendTestEmail}
              disabled={testEmailSending}
              className="w-full h-12 rounded-xl gap-2 text-base"
              style={{ background: 'linear-gradient(135deg, #3a7d44 0%, #2d6b3d 100%)', color: 'white' }}
            >
              {testEmailSending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  جاري الإرسال...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  إرسال إيميل تأكيد تجريبي
                </>
              )}
            </Button>

            <div className="p-4 rounded-xl text-center" style={{ background: '#e8f5e9', border: '1px solid #c8e6c9' }}>
              <Mail className="w-8 h-8 mx-auto mb-2" style={{ color: '#3a7d44' }} />
              <p className="text-sm" style={{ color: '#2e7d32' }}>
                💡 هذا الإيميل يحاكي الإيميل الذي يصل للأعضاء عند قبول تسجيلهم في اللقاء
              </p>
            </div>

            <div className="text-center">
              <a
                href="/admin"
                className="text-sm hover:underline"
                style={{ color: '#a8556f' }}
              >
                ← العودة للوحة التحكم
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
