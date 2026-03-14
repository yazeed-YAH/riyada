import { PrismaClient } from '@prisma/client';
import { Database } from 'bun:sqlite';
import path from 'path';

// الاتصال بقاعدة البيانات المحلية SQLite
const sqlitePath = path.join(process.cwd(), 'db', 'custom.db');
const sqlite = new Database(sqlitePath, { readonly: true });

// الاتصال بقاعدة البيانات البعيدة PostgreSQL
const prisma = new PrismaClient();

async function migrateData() {
  console.log('🚀 بدء ترحيل البيانات من SQLite إلى PostgreSQL...\n');

  try {
    // 1. ترحيل الأدمن
    console.log('📋 ترحيل بيانات الأدمن...');
    const admins = sqlite.query('SELECT * FROM Admin').all() as any[];
    console.log(`   وجدت ${admins.length} أدمن`);
    
    for (const admin of admins) {
      try {
        await prisma.admin.upsert({
          where: { id: admin.id as string },
          update: {
            email: admin.email as string,
            password: admin.password as string,
            name: admin.name as string | null,
            role: (admin.role as string) || 'admin',
            permissions: admin.permissions as string | null,
            createdAt: admin.createdAt ? new Date(admin.createdAt as string) : new Date(),
            updatedAt: admin.updatedAt ? new Date(admin.updatedAt as string) : new Date(),
          },
          create: {
            id: admin.id as string,
            email: admin.email as string,
            password: admin.password as string,
            name: admin.name as string | null,
            role: (admin.role as string) || 'admin',
            permissions: admin.permissions as string | null,
            createdAt: admin.createdAt ? new Date(admin.createdAt as string) : new Date(),
            updatedAt: admin.updatedAt ? new Date(admin.updatedAt as string) : new Date(),
          },
        });
        console.log(`   ✅ تم ترحيل الأدمن: ${admin.email}`);
      } catch (error: any) {
        console.log(`   ❌ خطأ في ترحيل الأدمن ${admin.email}: ${error.message}`);
      }
    }

    // 2. ترحيل الأعضاء
    console.log('\n📋 ترحيل بيانات الأعضاء...');
    const members = sqlite.query('SELECT * FROM Member').all() as any[];
    console.log(`   وجدت ${members.length} عضو`);
    
    for (const member of members) {
      try {
        await prisma.member.upsert({
          where: { id: member.id as string },
          update: {
            name: member.name as string,
            email: member.email as string,
            phone: member.phone as string | null,
            password: member.password as string,
            companyName: member.companyName as string | null,
            jobTitle: member.jobTitle as string | null,
            businessType: member.businessType as string | null,
            interests: member.interests as string | null,
            gender: (member.gender as string) || 'female',
            imageUrl: member.imageUrl as string | null,
            twitter: member.twitter as string | null,
            instagram: member.instagram as string | null,
            linkedin: member.linkedin as string | null,
            snapchat: member.snapchat as string | null,
            wantsSponsorship: member.wantsSponsorship === 1 || member.wantsSponsorship === true,
            sponsorshipTypes: member.sponsorshipTypes as string | null,
            createdAt: member.createdAt ? new Date(member.createdAt as string) : new Date(),
            updatedAt: member.updatedAt ? new Date(member.updatedAt as string) : new Date(),
          },
          create: {
            id: member.id as string,
            name: member.name as string,
            email: member.email as string,
            phone: member.phone as string | null,
            password: member.password as string,
            companyName: member.companyName as string | null,
            jobTitle: member.jobTitle as string | null,
            businessType: member.businessType as string | null,
            interests: member.interests as string | null,
            gender: (member.gender as string) || 'female',
            imageUrl: member.imageUrl as string | null,
            twitter: member.twitter as string | null,
            instagram: member.instagram as string | null,
            linkedin: member.linkedin as string | null,
            snapchat: member.snapchat as string | null,
            wantsSponsorship: member.wantsSponsorship === 1 || member.wantsSponsorship === true,
            sponsorshipTypes: member.sponsorshipTypes as string | null,
            createdAt: member.createdAt ? new Date(member.createdAt as string) : new Date(),
            updatedAt: member.updatedAt ? new Date(member.updatedAt as string) : new Date(),
          },
        });
        console.log(`   ✅ تم ترحيل العضو: ${member.name}`);
      } catch (error: any) {
        console.log(`   ❌ خطأ في ترحيل العضو ${member.name}: ${error.message}`);
      }
    }

    // 3. ترحيل الفعاليات/اللقاءات
    console.log('\n📋 ترحيل بيانات الفعاليات...');
    const events = sqlite.query('SELECT * FROM Event').all() as any[];
    console.log(`   وجدت ${events.length} فعالية`);
    
    for (const event of events) {
      try {
        await prisma.event.upsert({
          where: { id: event.id as string },
          update: {
            title: event.title as string,
            description: event.description as string | null,
            date: event.date ? new Date(event.date as string) : new Date(),
            startTime: event.startTime as string | null,
            endTime: event.endTime as string | null,
            location: event.location as string | null,
            imageUrl: event.imageUrl as string | null,
            status: (event.status as string) || 'open',
            eventType: (event.eventType as string) || 'public',
            isPublished: event.isPublished === 1 || event.isPublished === true,
            registrationDeadline: event.registrationDeadline ? new Date(event.registrationDeadline as string) : null,
            guestName: event.guestName as string | null,
            guestImage: event.guestImage as string | null,
            guestOrganization: event.guestOrganization as string | null,
            guestPosition: event.guestPosition as string | null,
            guestTwitter: event.guestTwitter as string | null,
            guestInstagram: event.guestInstagram as string | null,
            guestLinkedIn: event.guestLinkedIn as string | null,
            guestSnapchat: event.guestSnapchat as string | null,
            capacity: (event.capacity as number) || 50,
            maxCompanions: (event.maxCompanions as number) || 0,
            registrationType: (event.registrationType as string) || 'registration',
            sendQR: event.sendQR === 1 || event.sendQR === true,
            showCountdown: event.showCountdown !== 0 && event.showCountdown !== false,
            showRegistrantCount: event.showRegistrantCount !== 0 && event.showRegistrantCount !== false,
            showGuestProfile: event.showGuestProfile !== 0 && event.showGuestProfile !== false,
            showHospitalityPreference: event.showHospitalityPreference !== 0 && event.showHospitalityPreference !== false,
            valetServiceEnabled: event.valetServiceEnabled === 1 || event.valetServiceEnabled === true,
            parkingCapacity: event.parkingCapacity as number | null,
            carRetrievalTime: event.carRetrievalTime as string | null,
            createdAt: event.createdAt ? new Date(event.createdAt as string) : new Date(),
            updatedAt: event.updatedAt ? new Date(event.updatedAt as string) : new Date(),
          },
          create: {
            id: event.id as string,
            title: event.title as string,
            description: event.description as string | null,
            date: event.date ? new Date(event.date as string) : new Date(),
            startTime: event.startTime as string | null,
            endTime: event.endTime as string | null,
            location: event.location as string | null,
            imageUrl: event.imageUrl as string | null,
            status: (event.status as string) || 'open',
            eventType: (event.eventType as string) || 'public',
            isPublished: event.isPublished === 1 || event.isPublished === true,
            registrationDeadline: event.registrationDeadline ? new Date(event.registrationDeadline as string) : null,
            guestName: event.guestName as string | null,
            guestImage: event.guestImage as string | null,
            guestOrganization: event.guestOrganization as string | null,
            guestPosition: event.guestPosition as string | null,
            guestTwitter: event.guestTwitter as string | null,
            guestInstagram: event.guestInstagram as string | null,
            guestLinkedIn: event.guestLinkedIn as string | null,
            guestSnapchat: event.guestSnapchat as string | null,
            capacity: (event.capacity as number) || 50,
            maxCompanions: (event.maxCompanions as number) || 0,
            registrationType: (event.registrationType as string) || 'registration',
            sendQR: event.sendQR === 1 || event.sendQR === true,
            showCountdown: event.showCountdown !== 0 && event.showCountdown !== false,
            showRegistrantCount: event.showRegistrantCount !== 0 && event.showRegistrantCount !== false,
            showGuestProfile: event.showGuestProfile !== 0 && event.showGuestProfile !== false,
            showHospitalityPreference: event.showHospitalityPreference !== 0 && event.showHospitalityPreference !== false,
            valetServiceEnabled: event.valetServiceEnabled === 1 || event.valetServiceEnabled === true,
            parkingCapacity: event.parkingCapacity as number | null,
            carRetrievalTime: event.carRetrievalTime as string | null,
            createdAt: event.createdAt ? new Date(event.createdAt as string) : new Date(),
            updatedAt: event.updatedAt ? new Date(event.updatedAt as string) : new Date(),
          },
        });
        console.log(`   ✅ تم ترحيل الفعالية: ${event.title}`);
      } catch (error: any) {
        console.log(`   ❌ خطأ في ترحيل الفعالية ${event.title}: ${error.message}`);
      }
    }

    // 4. ترحيل تسجيلات الفعاليات
    console.log('\n📋 ترحيل تسجيلات الفعاليات...');
    const registrations = sqlite.query('SELECT * FROM EventRegistration').all() as any[];
    console.log(`   وجدت ${registrations.length} تسجيل`);
    
    for (const reg of registrations) {
      try {
        await prisma.eventRegistration.upsert({
          where: { id: reg.id as string },
          update: {
            eventId: reg.eventId as string,
            memberId: reg.memberId as string | null,
            name: reg.name as string,
            email: reg.email as string,
            phone: reg.phone as string | null,
            companyName: reg.companyName as string | null,
            jobTitle: reg.jobTitle as string | null,
            gender: (reg.gender as string) || 'female',
            imageUrl: reg.imageUrl as string | null,
            interests: reg.interests as string | null,
            expectations: reg.expectations as string | null,
            status: (reg.status as string) || 'pending',
            notes: reg.notes as string | null,
            registrationSource: (reg.registrationSource as string) || 'manual',
            createdAt: reg.createdAt ? new Date(reg.createdAt as string) : new Date(),
            updatedAt: reg.updatedAt ? new Date(reg.updatedAt as string) : new Date(),
          },
          create: {
            id: reg.id as string,
            eventId: reg.eventId as string,
            memberId: reg.memberId as string | null,
            name: reg.name as string,
            email: reg.email as string,
            phone: reg.phone as string | null,
            companyName: reg.companyName as string | null,
            jobTitle: reg.jobTitle as string | null,
            gender: (reg.gender as string) || 'female',
            imageUrl: reg.imageUrl as string | null,
            interests: reg.interests as string | null,
            expectations: reg.expectations as string | null,
            status: (reg.status as string) || 'pending',
            notes: reg.notes as string | null,
            registrationSource: (reg.registrationSource as string) || 'manual',
            createdAt: reg.createdAt ? new Date(reg.createdAt as string) : new Date(),
            updatedAt: reg.updatedAt ? new Date(reg.updatedAt as string) : new Date(),
          },
        });
        console.log(`   ✅ تم ترحيل التسجيل: ${reg.name}`);
      } catch (error: any) {
        console.log(`   ❌ خطأ في ترحيل التسجيل ${reg.name}: ${error.message}`);
      }
    }

    // 5. ترحيل طلبات الرعاية
    console.log('\n📋 ترحيل طلبات الرعاية...');
    const sponsors = sqlite.query('SELECT * FROM SponsorRequest').all() as any[];
    console.log(`   وجدت ${sponsors.length} طلب رعاية`);
    
    for (const sponsor of sponsors) {
      try {
        await prisma.sponsorRequest.upsert({
          where: { id: sponsor.id as string },
          update: {
            eventId: sponsor.eventId as string | null,
            companyName: sponsor.companyName as string,
            contactName: sponsor.contactName as string,
            email: sponsor.email as string,
            phone: sponsor.phone as string,
            sponsorshipType: sponsor.sponsorshipType as string,
            sponsorType: sponsor.sponsorType as string | null,
            description: sponsor.description as string | null,
            amount: sponsor.amount as number | null,
            logoUrl: sponsor.logoUrl as string | null,
            instagram: sponsor.instagram as string | null,
            twitter: sponsor.twitter as string | null,
            snapchat: sponsor.snapchat as string | null,
            tiktok: sponsor.tiktok as string | null,
            linkedin: sponsor.linkedin as string | null,
            websiteUrl: sponsor.websiteUrl as string | null,
            profileUrl: sponsor.profileUrl as string | null,
            socialLinks: sponsor.socialLinks as string | null,
            status: (sponsor.status as string) || 'new',
            createdAt: sponsor.createdAt ? new Date(sponsor.createdAt as string) : new Date(),
            updatedAt: sponsor.updatedAt ? new Date(sponsor.updatedAt as string) : new Date(),
          },
          create: {
            id: sponsor.id as string,
            eventId: sponsor.eventId as string | null,
            companyName: sponsor.companyName as string,
            contactName: sponsor.contactName as string,
            email: sponsor.email as string,
            phone: sponsor.phone as string,
            sponsorshipType: sponsor.sponsorshipType as string,
            sponsorType: sponsor.sponsorType as string | null,
            description: sponsor.description as string | null,
            amount: sponsor.amount as number | null,
            logoUrl: sponsor.logoUrl as string | null,
            instagram: sponsor.instagram as string | null,
            twitter: sponsor.twitter as string | null,
            snapchat: sponsor.snapchat as string | null,
            tiktok: sponsor.tiktok as string | null,
            linkedin: sponsor.linkedin as string | null,
            websiteUrl: sponsor.websiteUrl as string | null,
            profileUrl: sponsor.profileUrl as string | null,
            socialLinks: sponsor.socialLinks as string | null,
            status: (sponsor.status as string) || 'new',
            createdAt: sponsor.createdAt ? new Date(sponsor.createdAt as string) : new Date(),
            updatedAt: sponsor.updatedAt ? new Date(sponsor.updatedAt as string) : new Date(),
          },
        });
        console.log(`   ✅ تم ترحيل طلب الرعاية: ${sponsor.companyName}`);
      } catch (error: any) {
        console.log(`   ❌ خطأ في ترحيل طلب الرعاية ${sponsor.companyName}: ${error.message}`);
      }
    }

    // 6. ترحيل ملاحظات الرعاة
    console.log('\n📋 ترحيل ملاحظات الرعاة...');
    const sponsorNotes = sqlite.query('SELECT * FROM SponsorNote').all() as any[];
    console.log(`   وجدت ${sponsorNotes.length} ملاحظة`);
    
    for (const note of sponsorNotes) {
      try {
        await prisma.sponsorNote.upsert({
          where: { id: note.id as string },
          update: {
            sponsorId: note.sponsorId as string,
            content: note.content as string,
            authorName: note.authorName as string,
            createdAt: note.createdAt ? new Date(note.createdAt as string) : new Date(),
          },
          create: {
            id: note.id as string,
            sponsorId: note.sponsorId as string,
            content: note.content as string,
            authorName: note.authorName as string,
            createdAt: note.createdAt ? new Date(note.createdAt as string) : new Date(),
          },
        });
        console.log(`   ✅ تم ترحيل الملاحظة`);
      } catch (error: any) {
        console.log(`   ❌ خطأ في ترحيل الملاحظة: ${error.message}`);
      }
    }

    // 7. ترحيل ربط الرعاة بالفعاليات
    console.log('\n📋 ترحيل ربط الرعاة بالفعاليات...');
    const eventSponsors = sqlite.query('SELECT * FROM EventSponsor').all() as any[];
    console.log(`   وجدت ${eventSponsors.length} ربط`);
    
    for (const es of eventSponsors) {
      try {
        await prisma.eventSponsor.upsert({
          where: { id: es.id as string },
          update: {
            eventId: es.eventId as string,
            sponsorId: es.sponsorId as string,
            tasks: es.tasks as string | null,
            notes: es.notes as string | null,
            createdAt: es.createdAt ? new Date(es.createdAt as string) : new Date(),
            updatedAt: es.updatedAt ? new Date(es.updatedAt as string) : new Date(),
          },
          create: {
            id: es.id as string,
            eventId: es.eventId as string,
            sponsorId: es.sponsorId as string,
            tasks: es.tasks as string | null,
            notes: es.notes as string | null,
            createdAt: es.createdAt ? new Date(es.createdAt as string) : new Date(),
            updatedAt: es.updatedAt ? new Date(es.updatedAt as string) : new Date(),
          },
        });
        console.log(`   ✅ تم ترحيل ربط الراعي بالفعالية`);
      } catch (error: any) {
        console.log(`   ❌ خطأ في ترحيل ربط الراعي: ${error.message}`);
      }
    }

    // 8. ترحيل إعدادات الموقع
    console.log('\n📋 ترحيل إعدادات الموقع...');
    const settings = sqlite.query('SELECT * FROM SiteSettings').all() as any[];
    console.log(`   وجدت ${settings.length} إعداد`);
    
    for (const setting of settings) {
      try {
        await prisma.siteSettings.upsert({
          where: { id: setting.id as string },
          update: {
            key: setting.key as string,
            value: setting.value as string,
            description: setting.description as string | null,
            updatedAt: setting.updatedAt ? new Date(setting.updatedAt as string) : new Date(),
          },
          create: {
            id: setting.id as string,
            key: setting.key as string,
            value: setting.value as string,
            description: setting.description as string | null,
            updatedAt: setting.updatedAt ? new Date(setting.updatedAt as string) : new Date(),
          },
        });
        console.log(`   ✅ تم ترحيل الإعداد: ${setting.key}`);
      } catch (error: any) {
        console.log(`   ❌ خطأ في ترحيل الإعداد ${setting.key}: ${error.message}`);
      }
    }

    console.log('\n✅ تم ترحيل جميع البيانات بنجاح!');
    
    // عرض ملخص
    console.log('\n📊 ملخص البيانات المترحلة:');
    console.log(`   - الأدمن: ${admins.length}`);
    console.log(`   - الأعضاء: ${members.length}`);
    console.log(`   - الفعاليات: ${events.length}`);
    console.log(`   - التسجيلات: ${registrations.length}`);
    console.log(`   - طلبات الرعاية: ${sponsors.length}`);
    console.log(`   - ملاحظات الرعاة: ${sponsorNotes.length}`);
    console.log(`   - ربط الرعاة بالفعاليات: ${eventSponsors.length}`);
    console.log(`   - الإعدادات: ${settings.length}`);

  } catch (error) {
    console.error('❌ حدث خطأ أثناء الترحيل:', error);
  } finally {
    sqlite.close();
    await prisma.$disconnect();
  }
}

migrateData();
