'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, User, Briefcase, Building2, Users, Mail, Phone, Calendar } from 'lucide-react'
import { toEnglishNumbers } from '@/lib/utils'

interface Member {
  id: string
  name: string
  email: string
  phone: string | null
  companyName: string | null
  jobTitle: string | null
  gender: string | null
  imageUrl: string | null
  isRegistered: boolean
  eventsCount: number
  createdAt: string
}

export default function JobTitlePage() {
  const params = useParams()
  const router = useRouter()
  const jobTitle = decodeURIComponent(params.title as string)
  
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    registered: 0,
    visitors: 0,
    companies: new Set<string>()
  })

  useEffect(() => {
    fetchMembers()
  }, [jobTitle])

  const fetchMembers = async () => {
    try {
      const response = await fetch(`/api/members/job-title/${encodeURIComponent(jobTitle)}`)
      if (response.ok) {
        const data = await response.json()
        setMembers(data.members)
        
        const registered = data.members.filter((m: Member) => m.isRegistered).length
        const visitors = data.members.filter((m: Member) => !m.isRegistered).length
        const companies = new Set(data.members.map((m: Member) => m.companyName).filter(Boolean))
        
        setStats({
          total: data.members.length,
          registered,
          visitors,
          companies
        })
      }
    } catch (error) {
      console.error('Error fetching members:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #fdf8f9 0%, #ffffff 100%)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-2" style={{ borderColor: '#e8d8dc', borderTopColor: '#a8556f' }}></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" dir="rtl" style={{ background: 'linear-gradient(180deg, #fdf8f9 0%, #ffffff 100%)' }}>
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b" style={{ borderColor: 'rgba(240, 224, 228, 0.5)' }}>
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-1 shadow-md rounded-full text-xs sm:text-sm px-4 py-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                style={{ background: '#fdf2f4', color: '#6b5a60' }}
              >
                <ArrowLeft className="w-4 h-4 rotate-180" />
                رجوع
              </button>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#fdf2f4' }}>
                <Briefcase className="w-5 h-5" style={{ color: '#a8556f' }} />
              </div>
              <div>
                <h1 className="text-lg font-bold" style={{ color: '#2d1f26' }}>{jobTitle}</h1>
                <p className="text-xs" style={{ color: '#6b5a60' }}>
                  {toEnglishNumbers(stats.total)} شخص
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="rounded-2xl border" style={{ borderColor: '#f0e0e4' }}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#fdf2f4' }}>
                  <Users className="w-5 h-5" style={{ color: '#a8556f' }} />
                </div>
                <div>
                  <p className="text-xs" style={{ color: '#9a8a90' }}>إجمالي الأشخاص</p>
                  <p className="text-2xl font-bold" style={{ color: '#2d1f26' }}>{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border" style={{ borderColor: '#f0e0e4' }}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#e0f0e4' }}>
                  <User className="w-5 h-5" style={{ color: '#2d6b3d' }} />
                </div>
                <div>
                  <p className="text-xs" style={{ color: '#9a8a90' }}>أعضاء مسجلين</p>
                  <p className="text-2xl font-bold" style={{ color: '#2d1f26' }}>{stats.registered}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border" style={{ borderColor: '#f0e0e4' }}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#f5f0e0' }}>
                  <Calendar className="w-5 h-5" style={{ color: '#8a6b3a' }} />
                </div>
                <div>
                  <p className="text-xs" style={{ color: '#9a8a90' }}>زوار</p>
                  <p className="text-2xl font-bold" style={{ color: '#2d1f26' }}>{stats.visitors}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border" style={{ borderColor: '#f0e0e4' }}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#e0e8f5' }}>
                  <Building2 className="w-5 h-5" style={{ color: '#3a5a60' }} />
                </div>
                <div>
                  <p className="text-xs" style={{ color: '#9a8a90' }}>شركات</p>
                  <p className="text-2xl font-bold" style={{ color: '#2d1f26' }}>{stats.companies.size}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Members List */}
        <Card className="rounded-2xl border" style={{ borderColor: '#f0e0e4' }}>
          <CardContent className="p-6">
            <h2 className="text-lg font-bold mb-4" style={{ color: '#2d1f26' }}>
              الأشخاص ذو المسمى الوظيفي &quot;{jobTitle}&quot;
            </h2>
            
            {members.length === 0 ? (
              <div className="text-center py-8">
                <User className="w-12 h-12 mx-auto mb-3" style={{ color: '#d8c8cc' }} />
                <p style={{ color: '#9a8a90' }}>لا يوجد أشخاص بهذا المسمى الوظيفي</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 rounded-xl border hover:shadow-md transition-shadow"
                    style={{ background: '#fdf8f9', borderColor: '#f0e0e4' }}
                  >
                    <div className="flex items-center gap-4">
                      {member.imageUrl ? (
                        <img
                          src={member.imageUrl}
                          alt={member.name}
                          className="w-12 h-12 rounded-full object-cover border-2"
                          style={{ borderColor: '#e8d8dc' }}
                        />
                      ) : (
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center border-2"
                          style={{ background: '#fdf2f4', borderColor: '#e8d8dc' }}
                        >
                          <User className="w-6 h-6" style={{ color: '#a8556f' }} />
                        </div>
                      )}
                      
                      <div>
                        <div className="flex items-center gap-2">
                          {member.isRegistered ? (
                            <Link
                              href={`/admin/member/${member.id}`}
                              className="font-bold hover:underline"
                              style={{ color: '#a8556f' }}
                            >
                              {member.name}
                            </Link>
                          ) : (
                            <span className="font-bold" style={{ color: '#2d1f26' }}>{member.name}</span>
                          )}
                          <Badge
                            className="text-xs"
                            style={{
                              background: member.isRegistered ? '#e0f0e4' : '#f5f0e0',
                              color: member.isRegistered ? '#2d6b3d' : '#8a6b3a'
                            }}
                          >
                            {member.isRegistered ? 'عضو مسجل' : 'زائر'}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-3 mt-1">
                          {member.companyName && (
                            <Link
                              href={`/admin/company/${encodeURIComponent(member.companyName)}`}
                              className="text-sm hover:underline flex items-center gap-1"
                              style={{ color: '#6b5a60' }}
                            >
                              <Building2 className="w-3 h-3" />
                              {member.companyName}
                            </Link>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-xs flex items-center gap-1" style={{ color: '#9a8a90', direction: 'ltr', unicodeBidi: 'embed' }}>
                            <Mail className="w-3 h-3" />
                            <span dir="ltr">{toEnglishNumbers(member.email)}</span>
                          </span>
                          {member.phone && (
                            <a
                              href={`https://wa.me/${member.phone.replace(/\D/g, '').startsWith('966') ? member.phone.replace(/\D/g, '') : '966' + member.phone.replace(/\D/g, '').replace(/^0/, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs flex items-center gap-1 hover:text-green-600 cursor-pointer transition-colors"
                              style={{ direction: 'ltr', unicodeBidi: 'embed' }}
                            >
                              <Phone className="w-3 h-3" />
                              <span dir="ltr">{toEnglishNumbers(member.phone)}</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      {member.gender && (
                        <Badge
                          className="text-xs"
                          style={{
                            background: member.gender === 'female' ? '#fdf2f4' : '#e8f4fd',
                            color: member.gender === 'female' ? '#a8556f' : '#1e6bb8'
                          }}
                        >
                          {member.gender === 'female' ? 'سيدة' : 'رجل'}
                        </Badge>
                      )}
                      <span className="text-xs" style={{ color: '#9a8a90' }}>
                        {member.eventsCount} فعالية
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
