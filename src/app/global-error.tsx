'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global error:', error)
  }, [error])

  return (
    <html lang="ar" dir="rtl">
      <body style={{ margin: 0, background: '#fdf8f9' }}>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ background: '#fce8e8' }}>
              <AlertTriangle className="w-10 h-10" style={{ color: '#a8556f' }} />
            </div>
            
            <h1 className="text-2xl font-bold mb-2" style={{ color: '#2d1f26' }}>
              حدث خطأ في التطبيق
            </h1>
            
            <p className="mb-6" style={{ color: '#6b5a60' }}>
              نعتذر عن هذا الخطأ. يرجى تحديث الصفحة أو المحاولة لاحقاً.
            </p>
            
            {error.digest && (
              <p className="text-xs mb-4 p-2 rounded-lg" style={{ background: '#f0e0e4', color: '#6b5a60' }}>
                رمز الخطأ: {error.digest}
              </p>
            )}
            
            <button
              onClick={() => reset()}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white"
              style={{ background: '#a8556f' }}
            >
              <RefreshCw className="w-4 h-4" />
              إعادة المحاولة
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
