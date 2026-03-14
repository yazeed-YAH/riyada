import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Checking PostgreSQL database state...\n');

  try {
    // Get counts
    const admins = await prisma.admin.findMany();
    console.log(`Admins (${admins.length}):`);
    admins.forEach(a => console.log(`  - ${a.email} (${a.name})`));
  } catch (e) {
    console.log('Error fetching admins:', e);
  }

  try {
    const members = await prisma.member.findMany();
    console.log(`\nMembers (${members.length}):`);
    members.forEach(m => console.log(`  - ${m.name} (${m.email})`));
  } catch (e) {
    console.log('Error fetching members:', e);
  }

  try {
    const events = await prisma.event.findMany();
    console.log(`\nEvents (${events.length}):`);
    events.forEach(e => console.log(`  - ${e.title} (${e.status})`));
  } catch (e) {
    console.log('Error fetching events:', e);
  }

  try {
    const registrations = await prisma.eventRegistration.findMany();
    console.log(`\nRegistrations (${registrations.length}):`);
    registrations.forEach(r => console.log(`  - ${r.name} (${r.email}) - ${r.status}`));
  } catch (e) {
    console.log('Error fetching registrations:', e);
  }

  try {
    const sponsors = await prisma.sponsorRequest.findMany();
    console.log(`\nSponsorRequests (${sponsors.length}):`);
    sponsors.forEach(s => console.log(`  - ${s.companyName} (${s.status})`));
  } catch (e) {
    console.log('Error fetching sponsors:', e);
  }
}

main()
  .catch((e) => {
    console.error('Failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
