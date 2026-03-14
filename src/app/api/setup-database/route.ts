import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - التحقق من حالة قاعدة البيانات
export async function GET() {
  try {
    // محاولة الاتصال بقاعدة البيانات
    await db.$queryRaw`SELECT 1`
    
    return NextResponse.json({
      success: true,
      message: 'قاعدة البيانات متصلة'
    })
  } catch (error) {
    console.error('Database connection error:', error)
    return NextResponse.json({
      success: false,
      error: String(error)
    }, { status: 500 })
  }
}

// POST - إنشاء جداول قاعدة البيانات باستخدام SQL مباشرة
export async function POST() {
  try {
    console.log('🔄 Creating database tables...')
    
    // إنشاء جدول Admin
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Admin" (
        "id" TEXT PRIMARY KEY,
        "email" TEXT NOT NULL UNIQUE,
        "password" TEXT NOT NULL,
        "name" TEXT,
        "role" TEXT NOT NULL DEFAULT 'admin',
        "permissions" TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `)
    
    // إنشاء جدول Event
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Event" (
        "id" TEXT PRIMARY KEY,
        "title" TEXT NOT NULL,
        "description" TEXT,
        "date" TIMESTAMP NOT NULL,
        "startTime" TEXT,
        "endTime" TEXT,
        "location" TEXT,
        "imageUrl" TEXT,
        "status" TEXT NOT NULL DEFAULT 'open',
        "eventType" TEXT NOT NULL DEFAULT 'public',
        "isPublished" BOOLEAN NOT NULL DEFAULT false,
        "registrationDeadline" TIMESTAMP,
        "guestName" TEXT,
        "guestImage" TEXT,
        "guestOrganization" TEXT,
        "guestPosition" TEXT,
        "guestTwitter" TEXT,
        "guestInstagram" TEXT,
        "guestLinkedIn" TEXT,
        "guestSnapchat" TEXT,
        "capacity" INTEGER NOT NULL DEFAULT 50,
        "maxCompanions" INTEGER NOT NULL DEFAULT 0,
        "registrationType" TEXT NOT NULL DEFAULT 'registration',
        "sendQR" BOOLEAN NOT NULL DEFAULT false,
        "showCountdown" BOOLEAN NOT NULL DEFAULT true,
        "showRegistrantCount" BOOLEAN NOT NULL DEFAULT true,
        "showGuestProfile" BOOLEAN NOT NULL DEFAULT true,
        "showHospitalityPreference" BOOLEAN NOT NULL DEFAULT true,
        "valetServiceEnabled" BOOLEAN NOT NULL DEFAULT false,
        "parkingCapacity" INTEGER,
        "carRetrievalTime" TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `)
    
    // إنشاء جدول Member
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Member" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "email" TEXT NOT NULL UNIQUE,
        "phone" TEXT,
        "password" TEXT NOT NULL,
        "companyName" TEXT,
        "jobTitle" TEXT,
        "businessType" TEXT,
        "interests" TEXT,
        "gender" TEXT DEFAULT 'female',
        "imageUrl" TEXT,
        "wantsSponsorship" BOOLEAN NOT NULL DEFAULT false,
        "sponsorshipTypes" TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `)
    
    // إنشاء جدول EventRegistration
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "EventRegistration" (
        "id" TEXT PRIMARY KEY,
        "eventId" TEXT NOT NULL,
        "memberId" TEXT,
        "name" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "phone" TEXT,
        "companyName" TEXT,
        "jobTitle" TEXT,
        "interests" TEXT,
        "expectations" TEXT,
        "status" TEXT NOT NULL DEFAULT 'pending',
        "notes" TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        CONSTRAINT "EventRegistration_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "EventRegistration_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE
      )
    `)
    
    // إنشاء جدول SponsorRequest
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "SponsorRequest" (
        "id" TEXT PRIMARY KEY,
        "eventId" TEXT,
        "companyName" TEXT NOT NULL,
        "contactName" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "phone" TEXT NOT NULL,
        "sponsorshipType" TEXT NOT NULL,
        "sponsorType" TEXT,
        "description" TEXT,
        "amount" DOUBLE PRECISION,
        "logoUrl" TEXT,
        "instagram" TEXT,
        "twitter" TEXT,
        "snapchat" TEXT,
        "tiktok" TEXT,
        "linkedin" TEXT,
        "websiteUrl" TEXT,
        "profileUrl" TEXT,
        "socialLinks" TEXT,
        "status" TEXT NOT NULL DEFAULT 'new',
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        CONSTRAINT "SponsorRequest_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE
      )
    `)
    
    // إنشاء جدول SponsorNote
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "SponsorNote" (
        "id" TEXT PRIMARY KEY,
        "sponsorId" TEXT NOT NULL,
        "content" TEXT NOT NULL,
        "authorName" TEXT NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        CONSTRAINT "SponsorNote_sponsorId_fkey" FOREIGN KEY ("sponsorId") REFERENCES "SponsorRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `)
    
    // إنشاء جدول EventSponsor
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "EventSponsor" (
        "id" TEXT PRIMARY KEY,
        "eventId" TEXT NOT NULL,
        "sponsorId" TEXT NOT NULL,
        "tasks" TEXT,
        "notes" TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        CONSTRAINT "EventSponsor_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "EventSponsor_sponsorId_fkey" FOREIGN KEY ("sponsorId") REFERENCES "SponsorRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `)
    
    // إنشاء جدول SiteSettings
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "SiteSettings" (
        "id" TEXT PRIMARY KEY,
        "key" TEXT NOT NULL UNIQUE,
        "value" TEXT NOT NULL,
        "description" TEXT,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `)
    
    console.log('✅ Database tables created successfully')
    
    return NextResponse.json({
      success: true,
      message: 'تم إنشاء جداول قاعدة البيانات بنجاح'
    })
  } catch (error) {
    console.error('❌ Error creating tables:', error)
    return NextResponse.json({
      success: false,
      error: String(error)
    }, { status: 500 })
  }
}
