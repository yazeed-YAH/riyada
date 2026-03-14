import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get('admin-session')?.value

  if (!sessionId) {
    redirect('/')
  }

  const admin = await db.admin.findUnique({
    where: { id: sessionId }
  })

  if (!admin) {
    redirect('/')
  }

  return <>{children}</>
}
