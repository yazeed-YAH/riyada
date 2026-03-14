'use client'

import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Calendar, Clock, MapPin, Crown, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toEnglishNumbers } from '@/lib/utils'

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

interface Registrant {
  name: string
  companyName: string | null
  jobTitle: string | null
  imageUrl: string | null
  gender: string | null
}

interface PreviewData {
  eventForm: {
    title: string
    description: string | null
    date: string
    startTime: string | null
    endTime: string | null
    location: string | null
    imageUrl: string | null
    guestName: string | null
    guestImage: string | null
    guestOrganization: string | null
    guestPosition: string | null
  }
  registrant?: Registrant
  selectedSponsors: EventSponsorItem[]
  sponsorRequests: SponsorRequest[]
}

// Get preview data from localStorage on client side
function getPreviewData(): PreviewData | null {
  if (typeof window === 'undefined') return null
  const data = localStorage.getItem('invitationPreview')
  return data ? JSON.parse(data) : null
}

export default function InvitationPreviewPage() {
  const [previewData] = useState<PreviewData | null>(() => getPreviewData())
  const [downloading, setDownloading] = useState(false)
  const [fontsLoaded, setFontsLoaded] = useState(false)

  // تحميل الخطوط قبل التصدير
  useEffect(() => {
    const loadFonts = async () => {
      try {
        await document.fonts.ready
        // تحميل خط Cairo
        const font = new FontFace('Cairo', 'url(https://fonts.gstatic.com/s/cairo/v28/SLXgc1nY6HkvangtZmpQdkhzfH5lkSs2SgRjCAGMQ1z0hOA-a1PiKg.woff2)')
        await font.load()
        document.fonts.add(font)
        setFontsLoaded(true)
      } catch (e) {
        console.log('Font loading error, using fallback')
        setFontsLoaded(true)
      }
    }
    loadFonts()
  }, [])

  const handleDownload = async () => {
    const element = document.getElementById('invitation-card')
    if (!element || !previewData) return
    
    setDownloading(true)
    
    try {
      // انتظار تحميل الخطوط
      await document.fonts.ready
      
      // Dynamic import for html2canvas
      const html2canvas = (await import('html2canvas')).default
      
      const canvas = await html2canvas(element, {
        scale: 3,
        backgroundColor: null,
        useCORS: true,
        allowTaint: true,
        logging: false,
        onclone: (clonedDoc) => {
          // التأكد من تطبيق الخط في الصفحة المستنسخة
          const clonedElement = clonedDoc.getElementById('invitation-card')
          if (clonedElement) {
            clonedElement.style.fontFamily = 'Cairo, Arial, sans-serif'
            // تطبيق الخط على جميع العناصر
            const allElements = clonedElement.querySelectorAll('*')
            allElements.forEach((el: Element) => {
              const htmlEl = el as HTMLElement
              if (htmlEl.style) {
                htmlEl.style.fontFamily = 'Cairo, Arial, sans-serif'
              }
            })
          }
        }
      })
      
      const link = document.createElement('a')
      link.download = `دعوة-${previewData.registrant?.name || previewData.eventForm.title || 'لقاء'}.png`
      link.href = canvas.toDataURL('image/png', 1.0)
      link.click()
      
    } catch (error) {
      console.error('Error downloading:', error)
    } finally {
      setDownloading(false)
    }
  }

  if (!previewData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#fdf8f9' }}>
        <div className="text-center">
          <p className="text-lg" style={{ color: '#6b5a60' }}>جاري تحميل المعاينة...</p>
        </div>
      </div>
    )
  }

  const { eventForm, registrant, selectedSponsors, sponsorRequests } = previewData

  // Get sponsor details
  const getSponsorDetails = (sponsorId: string) => {
    return sponsorRequests?.find(s => s.id === sponsorId)
  }

  // Format date to Arabic
  const formatDateArabic = (dateStr: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return toEnglishNumbers(date.toLocaleDateString('ar-SA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }))
  }

  // Get gender label
  const getGenderLabel = (gender: string | null | undefined) => {
    if (gender === 'male') return '👨 رجل'
    if (gender === 'female') return '👩 سيدة'
    return ''
  }

  return (
    <div className="min-h-screen py-8" style={{ background: '#e8e8e8' }} dir="rtl">
      {/* Close and Download Buttons */}
      <div className="fixed top-4 left-4 z-50 flex gap-3">
        <Button 
          onClick={handleDownload}
          disabled={downloading}
          className="rounded-full gap-2 px-6"
          style={{ background: 'linear-gradient(135deg, #a8556f 0%, #9b7b9a 100%)', color: 'white' }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          {downloading ? 'جاري التنزيل...' : 'تنزيل'}
        </Button>
        <Button 
          variant="outline"
          onClick={() => window.close()}
          className="rounded-full px-6"
        >
          إغلاق
        </Button>
      </div>

      {/* Invitation Card */}
      <div className="flex justify-center">
        <div 
          id="invitation-card"
          className="shadow-2xl"
          dir="rtl"
          style={{ 
            width: '600px',
            background: 'linear-gradient(180deg, #fdf8f9 0%, #ffffff 50%, #fdf8f9 100%)',
            padding: '0',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'Cairo, system-ui, -apple-system, sans-serif',
            borderRadius: '24px',
            direction: 'rtl',
            overflow: 'hidden',
            border: '3px solid #f0e0e4'
          }}
        >
          {/* Header with Logos */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '20px 30px',
            background: 'linear-gradient(135deg, #fdf8f9 0%, #fff5f7 100%)',
            borderBottom: '2px solid #f0e0e4'
          }}>
            {/* اليمين - شعار ملتقى ريادة */}
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{ 
                width: '50px', 
                height: '50px', 
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #a8556f 0%, #8b3a52 100%)',
                boxShadow: '0 4px 15px rgba(168, 85, 111, 0.4)'
              }}>
                <Crown style={{ width: '28px', height: '28px', color: 'white' }} />
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '14px', fontWeight: '800', color: '#a8556f', lineHeight: 1.2, fontFamily: 'Cairo, sans-serif', margin: 0 }}>ملتقى ريادة</p>
                <p style={{ fontSize: '10px', fontWeight: '600', color: '#9b7b9a', lineHeight: 1.2, fontFamily: 'Cairo, sans-serif', margin: 0 }}>تجمع سيدات الأعمال</p>
              </div>
            </div>
            
            {/* اليسار - شعار YAH */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '12px',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}>
                <img
                  src="/yah-logo.png"
                  alt="YAH"
                  style={{
                    width: '60px',
                    height: 'auto',
                    maxHeight: '50px',
                    objectFit: 'contain'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div style={{ padding: '30px' }}>
            {/* السطر الأول: دعوة خاصة */}
            <div style={{ textAlign: 'center', marginBottom: '15px' }}>
              <p style={{ 
                fontSize: '18px', 
                fontWeight: '700', 
                color: '#a8556f',
                fontFamily: 'Cairo, sans-serif',
                margin: 0
              }}>
                ✨ دعوة خاصة ✨
              </p>
            </div>

            {/* السطر الثاني: اسم العضو */}
            {registrant?.name && (
              <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                <p style={{ 
                  fontSize: '24px', 
                  fontWeight: '800', 
                  color: '#2d1f26',
                  fontFamily: 'Cairo, sans-serif',
                  margin: 0
                }}>
                  {registrant.name}
                </p>
              </div>
            )}

            {/* السطر الثالث: يسعدنا دعوتكم لحضور */}
            <div style={{ textAlign: 'center', marginBottom: '12px' }}>
              <p style={{ 
                fontSize: '16px', 
                fontWeight: '600', 
                color: '#6b5a60',
                fontFamily: 'Cairo, sans-serif',
                margin: 0
              }}>
                يسعدنا دعوتكم لحضور
              </p>
            </div>

            {/* السطر الرابع: اسم اللقاء */}
            <div style={{ 
              textAlign: 'center', 
              marginBottom: '20px'
            }}>
              <div style={{ 
                display: 'inline-block',
                padding: '12px 30px',
                background: 'linear-gradient(135deg, #a8556f 0%, #8b3a52 100%)',
                borderRadius: '50px',
                boxShadow: '0 4px 15px rgba(168, 85, 111, 0.3)'
              }}>
                <p style={{ 
                  fontSize: '20px', 
                  fontWeight: '700', 
                  color: 'white',
                  fontFamily: 'Cairo, sans-serif',
                  margin: 0
                }}>
                  {eventForm.title || 'عنوان اللقاء'}
                </p>
              </div>
            </div>

            {/* السطر الخامس: اسم الضيف (ضيف الشرف) */}
            {eventForm.guestName && (
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '20px',
                marginBottom: '20px',
                padding: '15px',
                background: 'linear-gradient(135deg, #fdf8f9 0%, #fff5f7 100%)',
                borderRadius: '16px',
                border: '2px solid #f0e0e4'
              }}>
                {/* صورة الضيف على اليمين */}
                <div style={{ 
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '3px solid #a8556f',
                  boxShadow: '0 4px 15px rgba(168, 85, 111, 0.2)',
                  flexShrink: 0
                }}>
                  {eventForm.guestImage ? (
                    <img 
                      src={eventForm.guestImage} 
                      alt={eventForm.guestName}
                      style={{ 
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <div style={{ 
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: '#fdf2f4'
                    }}>
                      <Crown style={{ width: '40px', height: '40px', color: '#a8556f' }} />
                    </div>
                  )}
                </div>
                
                {/* معلومات الضيف على اليسار */}
                <div style={{ textAlign: 'right', flex: 1 }}>
                  <p style={{ 
                    fontSize: '18px', 
                    fontWeight: '700', 
                    color: '#2d1f26',
                    fontFamily: 'Cairo, sans-serif',
                    margin: '0 0 5px 0'
                  }}>
                    {eventForm.guestName}
                  </p>
                  {eventForm.guestOrganization && (
                    <p style={{ 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      color: '#6b5a60',
                      fontFamily: 'Cairo, sans-serif',
                      margin: '0 0 3px 0'
                    }}>
                      {eventForm.guestOrganization}
                    </p>
                  )}
                  {eventForm.guestPosition && (
                    <p style={{ 
                      fontSize: '12px', 
                      fontWeight: '500', 
                      color: '#9a8a90',
                      fontFamily: 'Cairo, sans-serif',
                      margin: 0
                    }}>
                      {eventForm.guestPosition}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* السطر السادس: حياكم الله */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <p style={{ 
                fontSize: '22px', 
                fontWeight: '700', 
                color: '#a8556f',
                fontFamily: 'Cairo, sans-serif',
                margin: 0
              }}>
                حياكم الله
              </p>
            </div>

            {/* السطر السابع: الباركود */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              marginBottom: '20px'
            }}>
              <div style={{ 
                padding: '12px',
                background: 'white',
                borderRadius: '16px',
                border: '2px solid #f0e0e4',
                boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
              }}>
                <QRCodeSVG 
                  value={JSON.stringify({
                    event: eventForm.title,
                    date: eventForm.date,
                    time: `${eventForm.startTime} - ${eventForm.endTime}`,
                    location: eventForm.location,
                    guest: registrant?.name || '',
                    organizer: 'ملتقى ريادة - تجمع سيدات الأعمال',
                    website: 'https://riyada.yplus.ai'
                  })}
                  size={100}
                  level="H"
                  bgColor="#ffffff"
                  fgColor="#a8556f"
                />
              </div>
            </div>

            {/* السطر الثامن: التاريخ، الوقت، الوقت، جنس الحضور (من اليمين إلى اليسار) */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '20px', 
              marginBottom: '20px',
              flexWrap: 'wrap'
            }}>
              {/* التاريخ */}
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                gap: '6px'
              }}>
                <div style={{ 
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, #fdf8f9 0%, #fff5f7 100%)',
                  border: '2px solid #f0e0e4'
                }}>
                  <Calendar style={{ width: '20px', height: '20px', color: '#a8556f' }} />
                </div>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#2d1f26', fontFamily: 'Cairo, sans-serif' }}>التاريخ</span>
                <span style={{ fontSize: '10px', color: '#6b5a60', textAlign: 'center', fontFamily: 'Cairo, sans-serif', maxWidth: '90px' }}>
                  {formatDateArabic(eventForm.date)}
                </span>
              </div>
              
              {/* الوقت - البداية */}
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                gap: '6px'
              }}>
                <div style={{ 
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, #fdf8f9 0%, #fff5f7 100%)',
                  border: '2px solid #f0e0e4'
                }}>
                  <Clock style={{ width: '20px', height: '20px', color: '#a8556f' }} />
                </div>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#2d1f26', fontFamily: 'Cairo, sans-serif' }}>من</span>
                <span style={{ fontSize: '11px', color: '#6b5a60', fontFamily: 'Cairo, sans-serif' }}>
                  {toEnglishNumbers(eventForm.startTime || '18:00')}
                </span>
              </div>
              
              {/* الوقت - النهاية */}
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                gap: '6px'
              }}>
                <div style={{ 
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, #fdf8f9 0%, #fff5f7 100%)',
                  border: '2px solid #f0e0e4'
                }}>
                  <Clock style={{ width: '20px', height: '20px', color: '#a8556f' }} />
                </div>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#2d1f26', fontFamily: 'Cairo, sans-serif' }}>إلى</span>
                <span style={{ fontSize: '11px', color: '#6b5a60', fontFamily: 'Cairo, sans-serif' }}>
                  {toEnglishNumbers(eventForm.endTime || '22:00')}
                </span>
              </div>
              
              {/* جنس الحضور */}
              {registrant?.gender && (
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  gap: '6px'
                }}>
                  <div style={{ 
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #fdf8f9 0%, #fff5f7 100%)',
                    border: '2px solid #f0e0e4'
                  }}>
                    <span style={{ fontSize: '20px' }}>
                      {registrant.gender === 'male' ? '👨' : '👩'}
                    </span>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#2d1f26', fontFamily: 'Cairo, sans-serif' }}>الحضور</span>
                  <span style={{ fontSize: '11px', color: '#6b5a60', fontFamily: 'Cairo, sans-serif' }}>
                    {registrant.gender === 'male' ? 'رجل' : 'سيدة'}
                  </span>
                </div>
              )}
            </div>

            {/* السطر التاسع والعاشر: الرعاة */}
            {selectedSponsors && selectedSponsors.length > 0 && (
              <div style={{ 
                marginBottom: '20px',
                padding: '15px',
                background: 'linear-gradient(135deg, #fdf8f9 0%, #fff5f7 100%)',
                borderRadius: '16px',
                border: '2px solid #f0e0e4'
              }}>
                {/* Sponsors Title */}
                <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                  <p style={{ 
                    fontSize: '14px', 
                    fontWeight: '700', 
                    color: '#a8556f',
                    fontFamily: 'Cairo, sans-serif',
                    margin: 0
                  }}>الرعاة</p>
                </div>
                
                {/* Sponsor Logos */}
                <div style={{ 
                  display: 'flex',
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                  gap: '15px'
                }}>
                  {selectedSponsors.map(sponsor => {
                    const sponsorData = getSponsorDetails(sponsor.sponsorId)
                    return (
                      <a 
                        key={sponsor.sponsorId} 
                        href={`/sponsor/${sponsor.sponsorId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'center', 
                          gap: '6px',
                          textDecoration: 'none',
                          cursor: 'pointer',
                          transition: 'transform 0.2s'
                        }}
                      >
                        {sponsorData?.logoUrl ? (
                          <img 
                            src={sponsorData.logoUrl} 
                            alt={sponsor.sponsorName} 
                            style={{ 
                              width: '50px',
                              height: '50px',
                              borderRadius: '10px',
                              objectFit: 'contain',
                              background: 'white',
                              padding: '5px',
                              border: '2px solid transparent',
                              transition: 'border-color 0.2s'
                            }}
                            crossOrigin="anonymous"
                          />
                        ) : (
                          <div style={{ 
                            width: '50px',
                            height: '50px',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'white'
                          }}>
                            <span style={{ fontSize: '18px' }}>🏢</span>
                          </div>
                        )}
                        <span style={{ 
                          fontSize: '10px', 
                          color: '#2d1f26', 
                          textAlign: 'center', 
                          maxWidth: '60px', 
                          fontFamily: 'Cairo, sans-serif',
                          fontWeight: '600'
                        }}>
                          {sponsor.sponsorName.substring(0, 15)}
                        </span>
                      </a>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{ 
            padding: '15px',
            textAlign: 'center',
            background: 'linear-gradient(135deg, #a8556f 0%, #8b3a52 100%)',
            borderTop: '2px solid #f0e0e4'
          }}>
            <p style={{ 
              fontSize: '13px', 
              color: 'white', 
              fontFamily: 'Cairo, sans-serif',
              fontWeight: '600',
              margin: 0
            }}>
              ملتقى ريادة - تجمع سيدات الأعمال
            </p>
            <p style={{ 
              fontSize: '11px', 
              color: 'rgba(255,255,255,0.8)', 
              fontFamily: 'Cairo, sans-serif',
              marginTop: '4px',
              margin: '4px 0 0 0'
            }}>
              riyada.yplus.ai
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
