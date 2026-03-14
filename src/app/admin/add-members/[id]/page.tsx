'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  X, Search, Users, CheckCheck, ArrowRight,
  Calendar, MapPin, Clock, Crown
} from 'lucide-react'
import { toast } from 'sonner'
import { toEnglishNumbers } from '@/lib/utils'

interface Event {
  id: string
  title: string
  date: string
  location: string | null
  startTime: string | null
  endTime: string | null
}

interface Member {
  id: string
  name: string
  email: string
  phone: string | null
  companyName: string | null
  jobTitle: string | null
  gender: string | null
  imageUrl: string | null
}

interface Registration {
  id: string
  eventId: string
  email: string
  status: string
}

export default function AddMembersPage() {
  const router = useRouter()
  const params = useParams()
  const eventId = params.id as string

  const [event, setEvent] = useState<Event | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all')
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    fetchData()
  }, [eventId])

  const fetchData = async () => {
    try {
      const [eventsRes, membersRes, regsRes] = await Promise.all([
        fetch('/api/events?admin=true'),
        fetch('/api/members'),
        fetch('/api/registrations')
      ])

      const eventsData = await eventsRes.json()
      const membersData = await membersRes.json()
      const regsData = await regsRes.json()

      const foundEvent = (eventsData.events || []).find((e: Event) => e.id === eventId)
      setEvent(foundEvent || null)
      setMembers(membersData.members || [])
      setRegistrations(regsData.registrations || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('حدث خطأ في تحميل البيانات')
    } finally {
      setLoading(false)
    }
  }

  const filteredMembers = members.filter(m => {
    const matchesSearch = search === '' || 
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase())
    const matchesGender = genderFilter === 'all' || m.gender === genderFilter
    return matchesSearch && matchesGender
  })

  const handleSelectAll = () => {
    const availableMembers = filteredMembers.filter(m => 
      !registrations.some(r => r.eventId === eventId && r.email === m.email)
    )
    const allSelected = availableMembers.every(m => selectedMembers.includes(m.id))
    if (allSelected) {
      setSelectedMembers([])
    } else {
      setSelectedMembers(availableMembers.map(m => m.id))
    }
  }

  const handleAddMembers = async () => {
    if (selectedMembers.length === 0) return

    setAdding(true)
    try {
      let added = 0
      for (const memberId of selectedMembers) {
        const member = members.find(m => m.id === memberId)
        if (!member) continue

        const response = await fetch('/api/registrations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventId,
            memberId: member.id,
            name: member.name,
            email: member.email,
            phone: member.phone,
            companyName: member.companyName,
            jobTitle: member.jobTitle,
            gender: member.gender,
            status: 'confirmed',
            registrationSource: 'manual'
          })
        })

        if (response.ok) added++
      }

      toast.success(`تم إضافة ${toEnglishNumbers(added)} عضو للقاء`)
      router.push('/admin?tab=events')
    } catch (error) {
      console.error('Error adding members:', error)
      toast.error('حدث خطأ أثناء إضافة الأعضاء')
    } finally {
      setAdding(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  }

  const formatTime = (time: string | null) => {
    if (!time) return ''
    const [hours, minutes] = time.split(':').map(Number)
    const period = hours >= 12 ? 'م' : 'ص'
    const hour12 = hours % 12 || 12
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #fdf8f9 0%, #ffffff 100%)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 mx-auto" style={{ borderColor: '#e8b4c4', borderTopColor: '#a8556f' }}></div>
          <p className="mt-4" style={{ color: '#6b5a60' }}>جاري التحميل...</p>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #fdf8f9 0%, #ffffff 100%)' }}>
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4" style={{ color: '#2d1f26' }}>اللقاء غير موجود</h2>
          <Link href="/admin?tab=events">
            <Button className="rounded-full gap-2" style={{ background: '#a8556f', color: 'white' }}>
              <ArrowRight className="w-4 h-4" />
              العودة للقاءات
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" dir="rtl" style={{ background: 'linear-gradient(180deg, #fdf8f9 0%, #ffffff 50%, #fdf8f9 100%)' }}>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b" style={{ background: 'rgba(255, 255, 255, 0.95)', borderColor: '#f0e0e4' }}>
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md" style={{ background: 'linear-gradient(135deg, #a8556f 0%, #9b7b9a 100%)' }}>
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold" style={{ color: '#2d1f26' }}>إضافة أعضاء للقاء</h1>
              <p className="text-xs" style={{ color: '#6b5a60' }}>{event.title}</p>
            </div>
          </div>
          <Link href="/admin?tab=events">
            <Button variant="ghost" className="rounded-full gap-2" style={{ color: '#6b5a60' }}>
              <X className="w-5 h-5" />
              إغلاق
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 pb-24">
        {/* Event Info Card */}
        <Card className="rounded-2xl border mb-6" style={{ borderColor: '#f0e0e4' }}>
          <CardContent className="p-5">
            <div className="flex flex-wrap items-center gap-4 text-sm" style={{ color: '#6b5a60' }}>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" style={{ color: '#a8556f' }} />
                {toEnglishNumbers(formatDate(event.date))}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" style={{ color: '#a8556f' }} />
                {toEnglishNumbers(formatTime(event.startTime || '18:00'))} - {toEnglishNumbers(formatTime(event.endTime || '22:00'))}
              </div>
              {event.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" style={{ color: '#a8556f' }} />
                  {event.location}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Search and Filter */}
        <Card className="rounded-2xl border mb-6" style={{ borderColor: '#f0e0e4' }}>
          <CardContent className="p-5">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9a8a90' }} />
                <Input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="بحث بالاسم أو البريد..."
                  className="h-11 pr-10 rounded-xl"
                  style={{ borderColor: '#e8d8dc' }}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium" style={{ color: '#2d1f26' }}>الجنس:</span>
                <Button
                  size="sm"
                  variant={genderFilter === 'all' ? 'default' : 'outline'}
                  onClick={() => setGenderFilter('all')}
                  className="rounded-full"
                  style={genderFilter === 'all' ? { background: '#d8c0c8', color: '#5a4a50' } : { borderColor: '#e8d8dc', color: '#6b5a60' }}
                >
                  الكل
                </Button>
                <Button
                  size="sm"
                  variant={genderFilter === 'female' ? 'default' : 'outline'}
                  onClick={() => setGenderFilter('female')}
                  className="rounded-full"
                  style={genderFilter === 'female' ? { background: '#d8c0c8', color: '#5a4a50' } : { borderColor: '#e8d8dc', color: '#6b5a60' }}
                >
                  سيدات
                </Button>
                <Button
                  size="sm"
                  variant={genderFilter === 'male' ? 'default' : 'outline'}
                  onClick={() => setGenderFilter('male')}
                  className="rounded-full"
                  style={genderFilter === 'male' ? { background: '#d8c0c8', color: '#5a4a50' } : { borderColor: '#e8d8dc', color: '#6b5a60' }}
                >
                  رجال
                </Button>
              </div>

              <Button
                size="sm"
                onClick={handleSelectAll}
                className="rounded-xl gap-2 whitespace-nowrap"
                style={{ background: '#e8d8dc', color: '#6b5a60' }}
              >
                <CheckCheck className="w-4 h-4" />
                تحديد الكل
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Members List */}
        <Card className="rounded-2xl border mb-6" style={{ borderColor: '#f0e0e4' }}>
          <CardContent className="p-0">
            <div className="max-h-[50vh] overflow-y-auto">
              {filteredMembers.length > 0 ? (
                filteredMembers.map(member => {
                  const isAlreadyRegistered = registrations.some(
                    r => r.eventId === eventId && r.email === member.email
                  )
                  const isSelected = selectedMembers.includes(member.id)

                  return (
                    <label
                      key={member.id}
                      className={`flex items-center gap-4 p-4 cursor-pointer transition-colors border-b ${
                        isAlreadyRegistered ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                      } ${isSelected ? 'bg-pink-50' : ''}`}
                      style={{ borderColor: '#f0e0e4' }}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={isAlreadyRegistered}
                        onChange={e => {
                          if (e.target.checked) {
                            setSelectedMembers(prev => [...prev, member.id])
                          } else {
                            setSelectedMembers(prev => prev.filter(id => id !== member.id))
                          }
                        }}
                        className="w-5 h-5 rounded"
                        style={{ accentColor: '#a8556f' }}
                      />
                      <div className="flex-1">
                        <p className="font-medium" style={{ color: '#2d1f26' }}>
                          {member.name}
                          {isAlreadyRegistered && (
                            <Badge className="mr-2 text-xs" style={{ background: '#d4edda', color: '#3a7d44' }}>
                              مسجل بالفعل
                            </Badge>
                          )}
                        </p>
                        <p className="text-sm" style={{ color: '#6b5a60' }}>
                          {member.email}
                          {member.companyName && ` • ${member.companyName}`}
                        </p>
                      </div>
                      <span className="text-sm font-medium px-3 py-1 rounded-full" 
                        style={{ 
                          background: member.gender === 'male' ? '#e0f0ff' : '#fdf2f4',
                          color: member.gender === 'male' ? '#1e6bb8' : '#a8556f' 
                        }}>
                        {member.gender === 'male' ? 'ذكر' : 'أنثى'}
                      </span>
                    </label>
                  )
                })
              ) : (
                <div className="p-12 text-center" style={{ color: '#9a8a90' }}>
                  <Users className="w-12 h-12 mx-auto mb-3" style={{ color: '#e8d8dc' }} />
                  <p className="text-lg font-medium">لا يوجد نتائج</p>
                  <p className="text-sm mt-1">
                    {genderFilter !== 'all' ? (genderFilter === 'female' ? 'لسيدات' : 'لرجال') : ''} 
                    {search && ` للبحث "${search}"`}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Footer Actions */}
        <div className="fixed bottom-0 left-0 right-0 p-4 border-t" style={{ background: 'rgba(255, 255, 255, 0.95)', borderColor: '#f0e0e4' }}>
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <p className="text-sm" style={{ color: '#6b5a60' }}>
              تم تحديد <span className="font-bold" style={{ color: '#a8556f' }}>{toEnglishNumbers(selectedMembers.length)}</span> عضو
            </p>
            <div className="flex gap-3">
              <Link href="/admin?tab=events">
                <Button variant="outline" className="rounded-xl h-12 px-6">
                  إلغاء
                </Button>
              </Link>
              <Button
                onClick={handleAddMembers}
                disabled={selectedMembers.length === 0 || adding}
                className="rounded-xl h-12 px-6 gap-2"
                style={{ 
                  background: selectedMembers.length > 0 ? 'linear-gradient(135deg, #a8556f 0%, #8b3a52 100%)' : '#e8d8dc', 
                  color: selectedMembers.length > 0 ? 'white' : '#9a8a90' 
                }}
              >
                <Users className="w-5 h-5" />
                {adding ? 'جاري الإضافة...' : `إضافة ${toEnglishNumbers(selectedMembers.length)} عضو`}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
// Build v2 - riyada.yplus.ai
