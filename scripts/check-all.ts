import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Admins
  const admins = await prisma.admin.findMany()
  console.log('=== Admins ===')
  admins.forEach(a => console.log(`- ${a.email} (${a.role})`))
  
  // Events
  const events = await prisma.event.findMany()
  console.log('\n=== Events ===')
  events.forEach(e => console.log(`- ${e.title} (${e.date}) - Published: ${e.isPublished}`))
  
  // Sponsors
  const sponsors = await prisma.sponsorRequest.findMany()
  console.log('\n=== Sponsors ===')
  sponsors.forEach(s => console.log(`- ${s.companyName} (${s.status})`))
  
  // Registrations
  const registrations = await prisma.eventRegistration.findMany()
  console.log('\n=== Registrations ===')
  console.log(`Total: ${registrations.length}`)
  
  // Member count
  const memberCount = await prisma.member.count()
  console.log('\n=== Members ===')
  console.log(`Total: ${memberCount}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
