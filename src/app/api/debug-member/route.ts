import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')

  if (!email) {
    return NextResponse.json({ error: 'Email required' })
  }

  const member = await db.member.findUnique({
    where: { email: email.toLowerCase().trim() }
  })

  if (!member) {
    return NextResponse.json({ error: 'Member not found', email })
  }

  return NextResponse.json({
    id: member.id,
    name: member.name,
    email: member.email,
    hasPassword: !!member.password,
    passwordPrefix: member.password?.substring(0, 10) || null,
    isBcrypt: member.password?.startsWith('$2') || false
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' })
    }

    const member = await db.member.findUnique({
      where: { email: email.toLowerCase().trim() }
    })

    if (!member) {
      return NextResponse.json({ error: 'Member not found' })
    }

    // Set new password
    const hashedPassword = await bcrypt.hash(password, 10)

    const updated = await db.member.update({
      where: { id: member.id },
      data: { password: hashedPassword }
    })

    return NextResponse.json({
      success: true,
      message: 'Password updated',
      hasPassword: !!updated.password,
      isBcrypt: updated.password?.startsWith('$2') || false
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Failed to update password' })
  }
}
