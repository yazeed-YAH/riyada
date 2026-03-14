'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Users, Shield, Settings, Crown, LogOut, ArrowRight, Trash2, Edit, Plus,
  Eye, EyeOff, Calendar, UserCheck, Handshake, Lock, Unlock, Download
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// هيكل الصلاحيات التفصيلية
interface PermissionDetail {
  view: boolean
  create: boolean
  edit: boolean
  delete: boolean
}

interface Permissions {
  events: PermissionDetail
  members: PermissionDetail
  registrations: PermissionDetail
  sponsors: PermissionDetail
  settings: PermissionDetail
  export: PermissionDetail
}

interface Admin {
  id: string
  name: string | null
  email: string
  role: string
  permissions?: string
  createdAt: string
}

interface Stats {
  totalMembers: number
  totalEvents: number
  totalSponsors: number
  totalAdmins: number
  totalSuperAdmins: number
}

// تعريف الصلاحيات التفصيلية لكل قسم
const PERMISSION_STRUCTURE = [
  {
    key: 'events',
    label: 'إدارة اللقاءات',
    icon: Calendar,
    color: '#a8556f',
    actions: [
      { key: 'view', label: 'عرض اللقاءات', description: 'القدرة على رؤية جميع اللقاءات والفعاليات' },
      { key: 'create', label: 'إضافة لقاء', description: 'إنشاء لقاء أو فعالية جديدة' },
      { key: 'edit', label: 'تعديل لقاء', description: 'تعديل بيانات اللقاءات الحالية' },
      { key: 'delete', label: 'حذف لقاء', description: 'حذف اللقاءات من النظام نهائياً' }
    ]
  },
  {
    key: 'members',
    label: 'إدارة الأعضاء',
    icon: Users,
    color: '#0891b2',
    actions: [
      { key: 'view', label: 'عرض الأعضاء', description: 'القدرة على رؤية قائمة الأعضاء وبياناتهم' },
      { key: 'create', label: 'إضافة عضو', description: 'إضافة عضو جديد يدوياً للنظام' },
      { key: 'edit', label: 'تعديل بيانات', description: 'تعديل بيانات الأعضاء الحاليين' },
      { key: 'delete', label: 'حذف عضو', description: 'حذف عضو من النظام نهائياً' }
    ]
  },
  {
    key: 'registrations',
    label: 'تسجيلات اللقاءات',
    icon: UserCheck,
    color: '#c9a066',
    actions: [
      { key: 'view', label: 'عرض التسجيلات', description: 'رؤية قوائم المسجلين في اللقاءات' },
      { key: 'create', label: 'إضافة تسجيل', description: 'تسجيل عضو يدوياً في لقاء' },
      { key: 'edit', label: 'تعديل تسجيل', description: 'تعديل بيانات تسجيل عضو' },
      { key: 'delete', label: 'حذف تسجيل', description: 'إلغاء تسجيل عضو من لقاء' }
    ]
  },
  {
    key: 'sponsors',
    label: 'إدارة الرعاة',
    icon: Handshake,
    color: '#2d6b3d',
    actions: [
      { key: 'view', label: 'عرض الرعاة', description: 'رؤية قائمة الرعاة وطلبات الرعاية' },
      { key: 'create', label: 'إضافة راعي', description: 'إضافة راعي جديد للنظام' },
      { key: 'edit', label: 'تعديل راعي', description: 'تعديل بيانات الرعاة الحاليين' },
      { key: 'delete', label: 'حذف راعي', description: 'حذف راعي من النظام نهائياً' }
    ]
  },
  {
    key: 'settings',
    label: 'إعدادات الموقع',
    icon: Settings,
    color: '#6b5a60',
    actions: [
      { key: 'view', label: 'عرض الإعدادات', description: 'رؤية إعدادات الموقع' },
      { key: 'edit', label: 'تعديل الإعدادات', description: 'تعديل إعدادات الموقع العامة' }
    ]
  },
  {
    key: 'export',
    label: 'تصدير البيانات',
    icon: Download,
    color: '#9b7b9a',
    actions: [
      { key: 'view', label: 'عرض البيانات', description: 'رؤية التقارير والإحصائيات' },
      { key: 'create', label: 'تصدير البيانات', description: 'تصدير بيانات الأعضاء والتسجيلات والرعاة' }
    ]
  }
]

const defaultPermissionDetail: PermissionDetail = {
  view: true,
  create: true,
  edit: true,
  delete: true
}

const defaultPermissions: Permissions = {
  events: { view: true, create: true, edit: true, delete: true },
  members: { view: true, create: true, edit: true, delete: true },
  registrations: { view: true, create: true, edit: true, delete: true },
  sponsors: { view: true, create: true, edit: true, delete: true },
  settings: { view: false, create: false, edit: false, delete: false },
  export: { view: false, create: false, edit: false, delete: false }
}

export default function SuperAdminPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [currentAdmin, setCurrentAdmin] = useState<Admin | null>(null)
  const [admins, setAdmins] = useState<Admin[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [showAddAdmin, setShowAddAdmin] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  
  const [adminForm, setAdminForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin',
    permissions: JSON.parse(JSON.stringify(defaultPermissions))
  })

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      console.log('[SuperAdmin] Checking auth...')
      const response = await fetch('/api/admin/check')
      const data = await response.json()
      console.log('[SuperAdmin] Auth response:', data)
      if (data.isAdmin) {
        setCurrentAdmin(data.admin)
        console.log('[SuperAdmin] Admin authenticated, fetching data...')
        fetchData()
      } else {
        console.log('[SuperAdmin] Not authenticated, redirecting to login')
        router.push('/login')
      }
    } catch (error) {
      console.error('[SuperAdmin] Auth error:', error)
      router.push('/login')
    }
  }

  const fetchData = async () => {
    try {
      // جلب الأدمنز
      console.log('[SuperAdmin] Fetching admins...')
      const adminsRes = await fetch('/api/super-admin/admins')
      console.log('[SuperAdmin] Admins response status:', adminsRes.status)
      if (adminsRes.ok) {
        const adminsData = await adminsRes.json()
        console.log('[SuperAdmin] Admins data:', adminsData)
        setAdmins(adminsData.admins || [])
      } else {
        console.error('[SuperAdmin] Error fetching admins:', adminsRes.status)
        const errorData = await adminsRes.json().catch(() => ({}))
        console.error('[SuperAdmin] Error details:', errorData)
      }
      
      // جلب الإحصائيات
      console.log('[SuperAdmin] Fetching stats...')
      const statsRes = await fetch('/api/super-admin/stats')
      console.log('[SuperAdmin] Stats response status:', statsRes.status)
      if (statsRes.ok) {
        const statsData = await statsRes.json()
        console.log('[SuperAdmin] Stats data:', statsData)
        setStats(statsData)
      } else {
        console.error('[SuperAdmin] Error fetching stats:', statsRes.status)
        // تعيين قيم افتراضية
        setStats({
          totalMembers: 0,
          totalEvents: 0,
          totalSponsors: 0,
          totalAdmins: 0,
          totalSuperAdmins: 0
        })
      }
    } catch (error) {
      console.error('[SuperAdmin] Error fetching data:', error)
      // تعيين قيم افتراضية في حالة الخطأ
      setStats({
        totalMembers: 0,
        totalEvents: 0,
        totalSponsors: 0,
        totalAdmins: 0,
        totalSuperAdmins: 0
      })
    } finally {
      setLoading(false)
    }
  }

  const parsePermissions = (permissionsStr?: string): Permissions => {
    if (!permissionsStr) return JSON.parse(JSON.stringify(defaultPermissions))
    try {
      const parsed = JSON.parse(permissionsStr)
      
      // تحويل الصيغة القديمة (boolean) إلى الصيغة الجديدة (object)
      const convertedPerms: Permissions = {
        events: { ...defaultPermissionDetail },
        members: { ...defaultPermissionDetail },
        registrations: { ...defaultPermissionDetail },
        sponsors: { ...defaultPermissionDetail },
        settings: { ...defaultPermissionDetail },
        export: { ...defaultPermissionDetail }
      }
      
      // معالجة كل قسم
      Object.keys(parsed).forEach(key => {
        const validKey = key as keyof Permissions
        if (convertedPerms[validKey]) {
          if (typeof parsed[key] === 'boolean') {
            // صيغة قديمة: { events: true }
            convertedPerms[validKey] = {
              view: parsed[key],
              create: parsed[key],
              edit: parsed[key],
              delete: parsed[key]
            }
          } else if (typeof parsed[key] === 'object' && parsed[key] !== null) {
            // صيغة جديدة: { events: { view: true, create: true, ... } }
            convertedPerms[validKey] = { ...defaultPermissionDetail, ...parsed[key] }
          }
        }
      })
      
      return convertedPerms
    } catch {
      return JSON.parse(JSON.stringify(defaultPermissions))
    }
  }

  const handleFixPermissions = async () => {
    if (!confirm('هل تريد تحديث صلاحيات جميع المشرفين إلى الصيغة الجديدة؟')) return
    
    try {
      const response = await fetch('/api/super-admin/fix-permissions', {
        method: 'POST'
      })
      
      if (response.ok) {
        const data = await response.json()
        toast.success(data.message)
        fetchData() // إعادة جلب البيانات
      } else {
        const error = await response.json()
        toast.error(error.error || 'حدث خطأ')
      }
    } catch {
      toast.error('حدث خطأ في الاتصال')
    }
  }

  const handlePermissionChange = (section: keyof Permissions, action: keyof PermissionDetail, value: boolean) => {
    setAdminForm(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [section]: {
          ...prev.permissions[section],
          [action]: value
        }
      }
    }))
  }

  const handleSelectAllPermissions = (section: keyof Permissions, value: boolean) => {
    setAdminForm(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [section]: {
          view: value,
          create: value,
          edit: value,
          delete: value
        }
      }
    }))
  }

  const countEnabledPermissions = (permissions: Permissions): number => {
    let count = 0
    Object.values(permissions).forEach(section => {
      Object.values(section).forEach(value => {
        if (value) count++
      })
    })
    return count
  }

  const getTotalPermissions = (): number => {
    let total = 0
    PERMISSION_STRUCTURE.forEach(section => {
      total += section.actions.length
    })
    return total
  }

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/super-admin/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...adminForm,
          permissions: adminForm.role === 'admin' ? adminForm.permissions : null
        })
      })
      if (response.ok) {
        toast.success('تم إضافة المشرف بنجاح')
        setShowAddAdmin(false)
        setAdminForm({ name: '', email: '', password: '', role: 'admin', permissions: JSON.parse(JSON.stringify(defaultPermissions)) })
        fetchData()
      } else {
        const error = await response.json()
        toast.error(error.error || 'حدث خطأ')
      }
    } catch {
      toast.error('حدث خطأ')
    }
  }

  const handleUpdateAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingAdmin) return
    try {
      const response = await fetch(`/api/super-admin/admins/${editingAdmin.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: adminForm.name,
          email: adminForm.email,
          password: adminForm.password || undefined,
          role: adminForm.role,
          permissions: adminForm.role === 'admin' ? adminForm.permissions : null
        })
      })
      if (response.ok) {
        toast.success('تم تحديث المشرف بنجاح')
        setEditingAdmin(null)
        setAdminForm({ name: '', email: '', password: '', role: 'admin', permissions: JSON.parse(JSON.stringify(defaultPermissions)) })
        fetchData()
      } else {
        const error = await response.json()
        toast.error(error.error || 'حدث خطأ')
      }
    } catch {
      toast.error('حدث خطأ')
    }
  }

  const handleDeleteAdmin = async (adminId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المشرف؟')) return
    try {
      const response = await fetch(`/api/super-admin/admins/${adminId}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        toast.success('تم حذف المشرف بنجاح')
        fetchData()
      } else {
        const error = await response.json()
        toast.error(error.error || 'حدث خطأ')
      }
    } catch {
      toast.error('حدث خطأ')
    }
  }

  const handleLogout = async () => {
    await fetch('/api/member/logout', { method: 'POST' })
    await fetch('/api/admin/logout', { method: 'POST' })
    router.refresh()
    router.push('/login')
  }

  const startEdit = (admin: Admin) => {
    setEditingAdmin(admin)
    setAdminForm({
      name: admin.name || '',
      email: admin.email,
      password: '',
      role: admin.role,
      permissions: admin.role === 'admin' ? parsePermissions(admin.permissions) : JSON.parse(JSON.stringify(defaultPermissions))
    })
    setShowAddAdmin(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl" style={{ background: '#fdf8f9' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-4" style={{ borderColor: '#e8b4c4', borderTopColor: '#a8556f' }}></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" dir="rtl" style={{ background: '#fdf8f9' }}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm" style={{ borderColor: '#f0e0e4' }}>
        <div className="container">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)' }}>
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold" style={{ color: '#2d1f26' }}>لوحة تحكم السوبر أدمن</h1>
                <p className="text-xs font-medium" style={{ color: '#6b5a60' }}>مرحباً {currentAdmin?.name || 'الأدمن'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button 
                onClick={handleFixPermissions} 
                variant="outline" 
                className="gap-2 rounded-full"
                style={{ borderColor: '#0891b2', color: '#0891b2' }}
              >
                <Settings className="w-4 h-4" />
                إصلاح الصلاحيات
              </Button>
              <Link href="/admin">
                <Button variant="outline" className="gap-2 rounded-full">
                  <Users className="w-4 h-4" />
                  لوحة التحكم الرئيسية
                </Button>
              </Link>
              <Link href="/">
                <Button variant="ghost" className="gap-2 rounded-full">
                  <ArrowRight className="w-4 h-4" />
                  الصفحة الرئيسية
                </Button>
              </Link>
              <Button onClick={handleLogout} variant="ghost" className="gap-2 rounded-full text-red-500">
                <LogOut className="w-4 h-4" />
                تسجيل الخروج
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <Card className="rounded-2xl border-0 shadow-md" style={{ background: 'white' }}>
              <CardContent className="p-6 text-center">
                <Users className="w-8 h-8 mx-auto mb-3" style={{ color: '#a8556f' }} />
                <div className="text-3xl font-bold" style={{ color: '#2d1f26' }}>{stats.totalMembers}</div>
                <div className="text-sm" style={{ color: '#6b5a60' }}>الأعضاء</div>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-0 shadow-md" style={{ background: 'white' }}>
              <CardContent className="p-6 text-center">
                <Crown className="w-8 h-8 mx-auto mb-3" style={{ color: '#a8556f' }} />
                <div className="text-3xl font-bold" style={{ color: '#2d1f26' }}>{stats.totalEvents}</div>
                <div className="text-sm" style={{ color: '#6b5a60' }}>اللقاءات</div>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-0 shadow-md" style={{ background: 'white' }}>
              <CardContent className="p-6 text-center">
                <Handshake className="w-8 h-8 mx-auto mb-3" style={{ color: '#c9a066' }} />
                <div className="text-3xl font-bold" style={{ color: '#2d1f26' }}>{stats.totalSponsors}</div>
                <div className="text-sm" style={{ color: '#6b5a60' }}>طلبات الرعاية</div>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-0 shadow-md" style={{ background: 'white' }}>
              <CardContent className="p-6 text-center">
                <Settings className="w-8 h-8 mx-auto mb-3" style={{ color: '#a8556f' }} />
                <div className="text-3xl font-bold" style={{ color: '#2d1f26' }}>{stats.totalAdmins}</div>
                <div className="text-sm" style={{ color: '#6b5a60' }}>المشرفين</div>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-0 shadow-md" style={{ background: 'white' }}>
              <CardContent className="p-6 text-center">
                <Shield className="w-8 h-8 mx-auto mb-3" style={{ color: '#0891b2' }} />
                <div className="text-3xl font-bold" style={{ color: '#2d1f26' }}>{stats.totalSuperAdmins}</div>
                <div className="text-sm" style={{ color: '#6b5a60' }}>السوبر أدمن</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Admins Management - Two Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Super Admins Card */}
          <Card className="rounded-3xl border-0 shadow-xl" style={{ background: 'white' }}>
            <CardHeader className="p-6 border-b" style={{ borderColor: '#f0e0e4' }}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)' }}>
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg" style={{ color: '#2d1f26' }}>السوبر أدمن</CardTitle>
                  <p className="text-xs" style={{ color: '#6b5a60' }}>صلاحيات كاملة على النظام</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                {admins.filter(a => a.role === 'super_admin').map((admin) => (
                  <div key={admin.id} className="flex items-center justify-between p-4 rounded-2xl" style={{ background: '#fdf8f9' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)' }}>
                        <Shield className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium" style={{ color: '#2d1f26' }}>{admin.name || 'بدون اسم'}</p>
                        <p className="text-xs" style={{ color: '#6b5a60' }}>{admin.email}</p>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => startEdit(admin)}
                      className="rounded-full"
                    >
                      <Edit className="w-4 h-4" style={{ color: '#0891b2' }} />
                    </Button>
                  </div>
                ))}
                {admins.filter(a => a.role === 'super_admin').length === 0 && (
                  <div className="text-center py-8">
                    <Shield className="w-12 h-12 mx-auto mb-3" style={{ color: '#e8d8dc' }} />
                    <p className="text-sm" style={{ color: '#9a8a90' }}>لا يوجد سوبر أدمن</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Regular Admins Card */}
          <Card className="rounded-3xl border-0 shadow-xl" style={{ background: 'white' }}>
            <CardHeader className="p-6 border-b" style={{ borderColor: '#f0e0e4' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #a8556f 0%, #9b7b9a 100%)' }}>
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg" style={{ color: '#2d1f26' }}>المشرفين</CardTitle>
                    <p className="text-xs" style={{ color: '#6b5a60' }}>صلاحيات محددة</p>
                  </div>
                </div>
                <Button 
                  size="sm"
                  onClick={() => { 
                    setShowAddAdmin(true); 
                    setEditingAdmin(null);
                    setAdminForm({ name: '', email: '', password: '', role: 'admin', permissions: JSON.parse(JSON.stringify(defaultPermissions)) });
                  }}
                  className="rounded-full gap-1 h-8"
                  style={{ background: '#a8556f', color: 'white' }}
                >
                  <Plus className="w-4 h-4" />
                  إضافة
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {admins.filter(a => a.role === 'admin').map((admin) => {
                  const adminPerms = parsePermissions(admin.permissions)
                  const enabledCount = countEnabledPermissions(adminPerms)
                  const totalCount = getTotalPermissions()
                  
                  return (
                    <div key={admin.id} className="flex items-center justify-between p-4 rounded-2xl" style={{ background: '#fdf8f9' }}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #a8556f 0%, #9b7b9a 100%)' }}>
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium" style={{ color: '#2d1f26' }}>{admin.name || 'بدون اسم'}</p>
                          <p className="text-xs" style={{ color: '#6b5a60' }}>{admin.email}</p>
                          <div className="flex gap-1 mt-1">
                            <Badge className="rounded-full text-xs px-2 py-0" style={{ background: enabledCount === totalCount ? '#e0f0e4' : '#fdf2f4', color: enabledCount === totalCount ? '#2d6b3d' : '#a8556f' }}>
                              {enabledCount}/{totalCount} صلاحية
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => startEdit(admin)}
                          className="rounded-full w-8 h-8 p-0"
                        >
                          <Edit className="w-4 h-4" style={{ color: '#0891b2' }} />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleDeleteAdmin(admin.id)}
                          className="rounded-full w-8 h-8 p-0"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
                {admins.filter(a => a.role === 'admin').length === 0 && (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 mx-auto mb-3" style={{ color: '#e8d8dc' }} />
                    <p className="text-sm" style={{ color: '#9a8a90' }}>لا يوجد مشرفين</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add/Edit Form */}
        {(showAddAdmin || editingAdmin) && (
          <Card className="rounded-3xl border-0 shadow-xl mb-8" style={{ background: 'white' }}>
            <CardHeader className="p-6 border-b" style={{ borderColor: '#f0e0e4' }}>
              <CardTitle className="text-xl" style={{ color: '#2d1f26' }}>
                {editingAdmin ? 'تعديل المشرف' : 'إضافة مشرف جديد'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={editingAdmin ? handleUpdateAdmin : handleAddAdmin} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label style={{ color: '#2d1f26' }}>الاسم</Label>
                    <Input 
                      value={adminForm.name}
                      onChange={e => setAdminForm(prev => ({ ...prev, name: e.target.value }))}
                      className="mt-2 h-12 rounded-xl"
                      placeholder="اسم المشرف"
                    />
                  </div>
                  <div>
                    <Label style={{ color: '#2d1f26' }}>البريد الإلكتروني *</Label>
                    <Input 
                      type="email"
                      value={adminForm.email}
                      onChange={e => setAdminForm(prev => ({ ...prev, email: e.target.value }))}
                      required
                      className="mt-2 h-12 rounded-xl"
                      placeholder="admin@example.com"
                    />
                  </div>
                  <div>
                    <Label style={{ color: '#2d1f26' }}>{editingAdmin ? 'كلمة المرور الجديدة (اتركه فارغ للإبقاء)' : 'كلمة المرور *'}</Label>
                    <div className="relative mt-2">
                      <Input 
                        type={showPassword ? 'text' : 'password'}
                        value={adminForm.password}
                        onChange={e => setAdminForm(prev => ({ ...prev, password: e.target.value }))}
                        required={!editingAdmin}
                        className="h-12 rounded-xl pr-12"
                        placeholder="••••••••"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute left-3 top-1/2 -translate-y-1/2"
                        style={{ color: '#6b5a60' }}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <Label style={{ color: '#2d1f26' }}>نوع الحساب</Label>
                    <select 
                      value={adminForm.role}
                      onChange={e => setAdminForm(prev => ({ ...prev, role: e.target.value }))}
                      className="w-full h-12 mt-2 rounded-xl px-4 border"
                      style={{ borderColor: '#f0e0e4' }}
                    >
                      <option value="admin">مشرف</option>
                      <option value="super_admin">سوبر أدمن (صلاحيات كاملة)</option>
                    </select>
                  </div>
                </div>

                {/* Permissions Section - Only for regular admin */}
                {adminForm.role === 'admin' && (
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-base font-bold" style={{ color: '#2d1f26' }}>
                        <Lock className="w-4 h-4 inline ml-2" />
                        الصلاحيات التفصيلية
                      </Label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm" style={{ color: '#6b5a60' }}>تكرار صلاحيات مثل:</span>
                        <select 
                          onChange={(e) => {
                            const selectedAdminId = e.target.value
                            if (selectedAdminId) {
                              const selectedAdmin = admins.find(a => a.id === selectedAdminId)
                              if (selectedAdmin && selectedAdmin.permissions) {
                                const perms = parsePermissions(selectedAdmin.permissions)
                                setAdminForm(prev => ({
                                  ...prev,
                                  permissions: perms
                                }))
                                toast.success(`تم نسخ صلاحيات ${selectedAdmin.name || selectedAdmin.email}`)
                              }
                            }
                          }}
                          className="h-9 rounded-lg px-3 text-sm border"
                          style={{ borderColor: '#f0e0e4', background: 'white' }}
                        >
                          <option value="">اختر مشرف</option>
                          {admins
                            .filter(a => a.role === 'admin' && a.id !== editingAdmin?.id)
                            .map(admin => (
                              <option key={admin.id} value={admin.id}>
                                {admin.name || admin.email}
                              </option>
                            ))
                          }
                        </select>
                      </div>
                    </div>
                    <p className="text-sm mb-4" style={{ color: '#6b5a60' }}>
                      حدد الصلاحيات التي يملكها هذا المشرف
                    </p>
                    
                    <div className="space-y-4">
                      {PERMISSION_STRUCTURE.map((section) => {
                        const Icon = section.icon
                        const sectionPerms = adminForm.permissions[section.key as keyof Permissions]
                        const allEnabled = section.actions.every(a => sectionPerms[a.key as keyof PermissionDetail])
                        const someEnabled = section.actions.some(a => sectionPerms[a.key as keyof PermissionDetail])
                        
                        return (
                          <div key={section.key} className="rounded-2xl border p-4" style={{ borderColor: '#f0e0e4', background: '#fdf8f9' }}>
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: section.color }}>
                                  <Icon className="w-5 h-5 text-white" />
                                </div>
                                <span className="font-medium" style={{ color: '#2d1f26' }}>{section.label}</span>
                              </div>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => handleSelectAllPermissions(section.key as keyof Permissions, !allEnabled)}
                                className="rounded-full text-xs"
                              >
                                {allEnabled ? 'إلغاء الكل' : 'تحديد الكل'}
                              </Button>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                              {section.actions.map((action) => {
                                const isEnabled = sectionPerms[action.key as keyof PermissionDetail]
                                return (
                                  <label 
                                    key={action.key}
                                    className="flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all"
                                    title={action.description}
                                  >
                                    <Checkbox
                                      checked={isEnabled}
                                      onCheckedChange={(checked) => 
                                        handlePermissionChange(
                                          section.key as keyof Permissions, 
                                          action.key as keyof PermissionDetail, 
                                          checked as boolean
                                        )
                                      }
                                      className="border-2"
                                      style={{ borderColor: section.color }}
                                    />
                                    <span className="text-sm" style={{ color: '#2d1f26' }}>{action.label}</span>
                                  </label>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Super Admin Notice */}
                {adminForm.role === 'super_admin' && (
                  <div className="mt-4 p-4 rounded-xl" style={{ background: '#e0f7fa', border: '1px solid #0891b2' }}>
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5" style={{ color: '#0891b2' }} />
                      <span className="font-medium" style={{ color: '#0891b2' }}>
                        سوبر أدمن يمتلك جميع الصلاحيات تلقائياً
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <Button type="submit" className="btn btn-primary rounded-full">
                    {editingAdmin ? 'حفظ التعديلات' : 'إضافة المشرف'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => { setShowAddAdmin(false); setEditingAdmin(null); }}
                    className="rounded-full"
                  >
                    إلغاء
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
