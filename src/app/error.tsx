'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-4" dir="rtl" style={{ background: '#fdf8f9' }}>
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ background: '#fce8e8' }}>
          <AlertTriangle className="w-10 h-10" style={{ color: '#a8556f' }} />
        </div>
        
        <h1 className="text-2xl font-bold mb-2" style={{ color: '#2d1f26' }}>
          حدث خطأ غير متوقع
        </h1>
        
        <p className="mb-6" style={{ color: '#6b5a60' }}>
          نعتذر عن هذا الخطأ. يرجى المحاولة مرة أخرى أو العودة للصفحة الرئيسية.
        </p>
        
        {error.digest && (
          <p className="text-xs mb-4 p-2 rounded-lg" style={{ background: '#f0e0e4', color: '#6b5a60' }}>
            رمز الخطأ: {error.digest}
          </p>
        )}
        
        <div className="flex gap-3 justify-center">
          <Button
            onClick={() => reset()}
            className="rounded-full gap-2"
            style={{ background: '#a8556f', color: 'white' }}
          >
            <RefreshCw className="w-4 h-4" />
            إعادة المحاولة
          </Button>
          
          <Button
            onClick={() => window.location.href = '/'}
            variant="outline"
            className="rounded-full gap-2"
          >
            <Home className="w-4 h-4" />
            الصفحة الرئيسية
          </Button>
        </div>
      </div>
    </div>
  )
}
