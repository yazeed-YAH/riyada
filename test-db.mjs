import { PrismaClient } from '@prisma/client'

// Test with user's connection string
const prisma = new PrismaClient({
  datasourceUrl: 'postgresql://postgres.tiizhntjyddvkyaqcimc:Yazeedah1234$@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres'
})

async function main() {
  try {
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ Connection successful:', result)
  } catch (error) {
    console.error('❌ Connection failed:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

main()
