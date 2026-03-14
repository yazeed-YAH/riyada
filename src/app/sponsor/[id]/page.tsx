'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Crown, Globe, Instagram, ExternalLink, ArrowRight, Building2, User } from 'lucide-react'
import Link from 'next/link'

interface SponsorData {
  id: string
  companyName: string
  contactName: string
  logoUrl: string | null
  websiteUrl: string | null
  instagram: string | null
  twitter: string | null
  snapchat: string | null
  tiktok: string | null
  linkedin: string | null
}

export default function SponsorDetailPage() {
  const params = useParams()
  const [sponsor, setSponsor] = useState<SponsorData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (params.id) {
      fetchSponsor(params.id as string)
    }
  }, [params.id])

  const fetchSponsor = async (id: string) => {
    try {
      const response = await fetch(`/api/sponsors/${id}`)
      const data = await response.json()
      
      if (response.ok) {
        setSponsor(data.sponsor)
      } else {
        setError(data.error || 'حدث خطأ')
      }
    } catch (err) {
      setError('حدث خطأ أثناء جلب البيانات')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl" style={{ background: 'linear-gradient(180deg, #fdf8f9 0%, #ffffff 50%, #fdf8f9 100%)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-4" style={{ borderColor: '#e8b4c4', borderTopColor: '#a8556f' }}></div>
      </div>
    )
  }

  if (error || !sponsor) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl" style={{ background: 'linear-gradient(180deg, #fdf8f9 0%, #ffffff 50%, #fdf8f9 100%)' }}>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4" style={{ color: '#2d1f26' }}>{error || 'الراعي غير موجود'}</h1>
          <Link href="/">
            <Button className="rounded-full px-8" style={{ background: '#a8556f', color: 'white' }}>
              العودة للرئيسية
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const socialLinks = [
    { name: 'Instagram', value: sponsor.instagram, icon: Instagram, color: '#E1306C', baseUrl: 'https://instagram.com/' },
    { name: 'Twitter', value: sponsor.twitter, icon: null, color: '#1DA1F2', baseUrl: 'https://twitter.com/' },
    { name: 'Snapchat', value: sponsor.snapchat, icon: null, color: '#FFFC00', baseUrl: 'https://snapchat.com/add/' },
    { name: 'TikTok', value: sponsor.tiktok, icon: null, color: '#000000', baseUrl: 'https://tiktok.com/@' },
    { name: 'LinkedIn', value: sponsor.linkedin, icon: null, color: '#0077B5', baseUrl: 'https://linkedin.com/in/' },
  ].filter(link => link.value)

  return (
    <div className="min-h-screen" dir="rtl" style={{ background: 'linear-gradient(180deg, #fdf8f9 0%, #ffffff 50%, #fdf8f9 100%)' }}>
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b" style={{ borderColor: 'rgba(240, 224, 228, 0.5)' }}>
        <div className="container">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ background: 'linear-gradient(135deg, #a8556f 0%, #9b7b9a 100%)' }}>
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold" style={{ color: '#2d1f26' }}>ملتقى ريادة</h1>
                <p className="text-xs font-medium" style={{ color: '#6b5a60' }}>تجمع سيدات الأعمال</p>
              </div>
            </Link>
            
            <Link href="/">
              <Button variant="ghost" className="gap-2 rounded-full">
                <ArrowRight className="w-4 h-4" />
                العودة للرئيسية
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-12">
        <div className="max-w-2xl mx-auto">
          {/* Sponsor Card */}
          <Card className="rounded-3xl border-0 shadow-xl overflow-hidden" style={{ background: 'white' }}>
            {/* Header Background */}
            <div className="h-32" style={{ background: 'linear-gradient(135deg, #a8556f 0%, #9b7b9a 100%)' }}></div>
            
            <CardContent className="p-8 pt-0">
              {/* Logo */}
              <div className="flex justify-center -mt-16 mb-6">
                <div className="w-32 h-32 rounded-3xl bg-white shadow-xl flex items-center justify-center overflow-hidden border-4 border-white">
                  {sponsor.logoUrl ? (
                    <img 
                      src={sponsor.logoUrl} 
                      alt={sponsor.companyName}
                      className="w-full h-full object-contain p-2"
                    />
                  ) : (
                    <Building2 className="w-16 h-16" style={{ color: '#a8556f' }} />
                  )}
                </div>
              </div>

              {/* Company Name */}
              <div className="text-center mb-6">
                <h1 className="text-3xl font-bold mb-2" style={{ color: '#2d1f26' }}>{sponsor.companyName}</h1>
                <p className="text-sm" style={{ color: '#9a8a90' }}>
                  راعي ملتقى ريادة
                </p>
              </div>

              {/* Contact Person */}
              <div className="flex items-center justify-center gap-2 mb-8 p-4 rounded-2xl" style={{ background: '#fdf8f9' }}>
                <User className="w-5 h-5" style={{ color: '#a8556f' }} />
                <span style={{ color: '#6b5a60' }}>مسؤول التواصل:</span>
                <span className="font-medium" style={{ color: '#2d1f26' }}>{sponsor.contactName}</span>
              </div>

              {/* Website */}
              {sponsor.websiteUrl && (
                <div className="mb-6">
                  <a 
                    href={sponsor.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 py-3 px-6 rounded-xl transition-all hover:opacity-80"
                    style={{ background: '#fdf2f4', color: '#a8556f' }}
                  >
                    <Globe className="w-5 h-5" />
                    <span className="font-medium">زيارة الموقع الإلكتروني</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}

              {/* Social Links */}
              {socialLinks.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-center mb-4" style={{ color: '#9a8a90' }}>حسابات التواصل الاجتماعي</h3>
                  <div className="flex flex-wrap justify-center gap-3">
                    {socialLinks.map((link, index) => (
                      <a
                        key={index}
                        href={`${link.baseUrl}${link.value?.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 py-2 px-4 rounded-full transition-all hover:scale-105"
                        style={{ background: link.color, color: 'white' }}
                      >
                        {link.name === 'Instagram' && <Instagram className="w-4 h-4" />}
                        {link.name === 'Twitter' && (
                          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                          </svg>
                        )}
                        {link.name === 'Snapchat' && (
                          <span className="text-lg">👻</span>
                        )}
                        {link.name === 'TikTok' && (
                          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                            <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                          </svg>
                        )}
                        {link.name === 'LinkedIn' && (
                          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                          </svg>
                        )}
                        <span className="text-sm font-medium">{link.value}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* No social links message */}
              {socialLinks.length === 0 && !sponsor.websiteUrl && (
                <p className="text-center text-sm" style={{ color: '#9a8a90' }}>
                  لا توجد معلومات تواصل متاحة
                </p>
              )}
            </CardContent>
          </Card>

          {/* Back to home */}
          <div className="text-center mt-8">
            <Link href="/">
              <Button className="rounded-full gap-2 px-8" style={{ background: 'linear-gradient(135deg, #a8556f 0%, #9b7b9a 100%)', color: 'white' }}>
                <Crown className="w-4 h-4" />
                ملتقى ريادة - تجمع سيدات الأعمال
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
