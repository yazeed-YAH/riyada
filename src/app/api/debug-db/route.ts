import { NextResponse } from 'next/server'

export async function GET() {
  const dbUrl = process.env.DATABASE_URL

  return NextResponse.json({
    hasDbUrl: !!dbUrl,
    dbUrlLength: dbUrl?.length,
    dbUrlPrefix: dbUrl?.substring(0, 15),
    dbUrlSuffix: dbUrl?.substring(dbUrl.length - 20),
    startsWithPostgres: dbUrl?.startsWith('postgresql://') || dbUrl?.startsWith('postgres://'),
    nodeEnv: process.env.NODE_ENV
  })
}
