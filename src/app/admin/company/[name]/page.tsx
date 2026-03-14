'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Building2, ArrowRight, Users, Mail, Phone, User
} from 'lucide-react'
import Link from 'next/link'

interface Member {
  id: string
  name: string
  email: string
  phone: string | null
  companyName: string | null
  jobTitle: string | null
  gender: string | null
  imageUrl: string | null
  createdAt: string
  _count?: { registrations: number }
}

export default function CompanyProfilePage() {
  const params = useParams()
  const router = useRouter()
  const companyName = decodeURIComponent(params.name as string)
  
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCompanyMembers = async () => {
      try {
        const response = await fetch(`/api/members`)
        const data = await response.json()
        
        // Filter members by company name
        const companyMembers = (data.members || []).filter(
          (m: Member) => m.companyName === companyName
        )
        setMembers(companyMembers)
      } catch (error) {
        console.error('Error fetching company members:', error)
      } finally {
        setLoading(false)
      }
    }

    if (companyName) {
      fetchCompanyMembers()
    }
  }, [companyName])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#fdf8f9' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-4" style={{ borderColor: '#e8d8dc', borderTopColor: '#a8556f' }}></div>
      </div>
    )
  }

  // Group members by job title
  const membersByPosition = members.reduce((acc, member) => {
    const position = member.jobTitle || 'بدون منصب'
    if (!acc[position]) {
      acc[position] = []
    }
    acc[position].push(member)
    return acc
  }, {} as Record<string, Member[]>)

  return (
    <div className="min-h-screen" style={{ background: '#fdf8f9' }} dir="rtl">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 shadow-md rounded-full text-xs sm:text-sm px-4 py-2 mb-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
            style={{ background: '#fdf2f4', color: '#6b5a60' }}
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            رجوع
          </button>
          
          <div className="flex items-center gap-4 p-6 rounded-2xl" style={{ background: '#fff', border: '1px solid #f0e0e4' }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: '#fdf2f4' }}>
              <Building2 className="w-8 h-8" style={{ color: '#a8556f' }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: '#2d1f26' }}>{companyName}</h1>
              <p className="text-sm mt-1" style={{ color: '#6b5a60' }}>
                {members.length} {members.length === 1 ? 'عضو' : 'أعضاء'}
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="rounded-2xl border" style={{ borderColor: '#f0e0e4' }}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: '#fdf2f4' }}>
                  <Users className="w-6 h-6" style={{ color: '#a8556f' }} />
                </div>
                <div>
                  <p className="text-2xl font-bold" style={{ color: '#2d1f26' }}>{members.length}</p>
                  <p className="text-sm" style={{ color: '#6b5a60' }}>إجمالي الأعضاء</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="rounded-2xl border" style={{ borderColor: '#f0e0e4' }}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: '#e8d8dc' }}>
                  <User className="w-6 h-6" style={{ color: '#6b5a60' }} />
                </div>
                <div>
                  <p className="text-2xl font-bold" style={{ color: '#2d1f26' }}>{members.filter(m => m.gender === 'female').length}</p>
                  <p className="text-sm" style={{ color: '#6b5a60' }}>سيدات</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="rounded-2xl border" style={{ borderColor: '#f0e0e4' }}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: '#e8f4fd' }}>
                  <User className="w-6 h-6" style={{ color: '#1e6bb8' }} />
                </div>
                <div>
                  <p className="text-2xl font-bold" style={{ color: '#2d1f26' }}>{members.filter(m => m.gender === 'male').length}</p>
                  <p className="text-sm" style={{ color: '#6b5a60' }}>رجال</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Members by Position */}
        <Card className="rounded-2xl border mb-8" style={{ borderColor: '#f0e0e4' }}>
          <CardContent className="p-6">
            <h2 className="text-lg font-bold mb-4" style={{ color: '#2d1f26' }}>الأعضاء حسب المنصب</h2>
            
            {Object.entries(membersByPosition).map(([position, positionMembers]) => (
              <div key={position} className="mb-6 last:mb-0">
                <div className="flex items-center gap-2 mb-3">
                  <Badge 
                    className="px-3 py-1 rounded-full"
                    style={{ background: '#fdf2f4', color: '#a8556f' }}
                  >
                    {position}
                  </Badge>
                  <span className="text-sm" style={{ color: '#9a8a90' }}>
                    ({positionMembers.length} {positionMembers.length === 1 ? 'عضو' : 'أعضاء'})
                  </span>
                </div>
                
                <div className="grid gap-3">
                  {positionMembers.map(member => (
                    <Link 
                      key={member.id} 
                      href={`/admin/member/${member.id}`}
                      className="flex items-center justify-between p-4 rounded-xl hover:shadow-md transition-shadow"
                      style={{ background: '#fdf8f9' }}
                    >
                      <div className="flex items-center gap-3">
                        {member.imageUrl ? (
                          <img 
                            src={member.imageUrl} 
                            alt={member.name} 
                            className="w-10 h-10 rounded-full object-cover" 
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#fdf2f4' }}>
                            <User className="w-5 h-5" style={{ color: '#a8556f' }} />
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-sm" style={{ color: '#a8556f' }}>{member.name}</p>
                          <div className="flex items-center gap-3 mt-1">
                            {member.email && (
                              <span className="text-xs flex items-center gap-1" style={{ color: '#6b5a60' }}>
                                <Mail className="w-3 h-3" />
                                {member.email}
                              </span>
                            )}
                            {member.phone && (
                              <a
                                href={`https://wa.me/${member.phone.replace(/\D/g, '').startsWith('966') ? member.phone.replace(/\D/g, '') : '966' + member.phone.replace(/\D/g, '').replace(/^0/, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs flex items-center gap-1 hover:text-green-600 cursor-pointer transition-colors"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Phone className="w-3 h-3" />
                                {member.phone}
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
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
                        <ArrowRight className="w-4 h-4 rotate-180" style={{ color: '#9a8a90' }} />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
            
            {members.length === 0 && (
              <p className="text-center py-8" style={{ color: '#9a8a90' }}>لا يوجد أعضاء في هذه الشركة</p>
            )}
          </CardContent>
        </Card>

        {/* All Members Table */}
        <Card className="rounded-2xl border" style={{ borderColor: '#f0e0e4' }}>
          <CardContent className="p-6">
            <h2 className="text-lg font-bold mb-4" style={{ color: '#2d1f26' }}>جميع الأعضاء</h2>
            
            <div className="overflow-x-auto">
              <Table dir="rtl">
                <TableHeader>
                  <TableRow style={{ background: '#fdf8f9' }}>
                    <TableHead className="font-semibold text-right" style={{ color: '#2d1f26' }}>الاسم</TableHead>
                    <TableHead className="font-semibold text-right" style={{ color: '#2d1f26' }}>المنصب</TableHead>
                    <TableHead className="font-semibold text-right" style={{ color: '#2d1f26' }}>البريد الإلكتروني</TableHead>
                    <TableHead className="font-semibold text-right" style={{ color: '#2d1f26' }}>رقم الجوال</TableHead>
                    <TableHead className="font-semibold text-right" style={{ color: '#2d1f26' }}>الجنس</TableHead>
                    <TableHead className="font-semibold text-right" style={{ color: '#2d1f26' }}>عدد اللقاءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map(member => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium text-right">
                        <Link 
                          href={`/admin/member/${member.id}`}
                          className="hover:underline"
                          style={{ color: '#a8556f' }}
                        >
                          <div className="flex items-center gap-2">
                            {member.imageUrl ? (
                              <img src={member.imageUrl} alt={member.name} className="w-6 h-6 rounded-full object-cover" />
                            ) : (
                              <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: '#fdf2f4' }}>
                                <User className="w-3 h-3" style={{ color: '#a8556f' }} />
                              </div>
                            )}
                            {member.name}
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell className="text-right" style={{ color: '#6b5a60' }}>{member.jobTitle || '-'}</TableCell>
                      <TableCell className="text-right" style={{ color: '#6b5a60' }}>{member.email}</TableCell>
                      <TableCell className="text-right" style={{ color: '#6b5a60' }}>{member.phone || '-'}</TableCell>
                      <TableCell className="text-right">
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
                      </TableCell>
                      <TableCell className="text-right" style={{ color: '#6b5a60' }}>
                        {member._count?.registrations || 0}
                      </TableCell>
                    </TableRow>
                  ))}
                  {members.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8" style={{ color: '#9a8a90' }}>
                        لا يوجد أعضاء
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
