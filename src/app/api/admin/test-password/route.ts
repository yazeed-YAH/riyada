import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { password } = body
    
    const admin = await db.admin.findFirst({
      where: { email: 'yazeed@yplus.ai' }
    })
    
    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' })
    }
    
    // اختبار المقارنة
    const testResult = await bcrypt.compare(password, admin.password)
    
    return NextResponse.json({
      inputPassword: password,
      storedHashPrefix: admin.password.substring(0, 30),
      bcryptCompareResult: testResult,
      admin: {
        email: admin.email,
        role: admin.role
      }
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) })
  }
}
