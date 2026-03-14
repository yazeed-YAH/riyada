import { config } from 'dotenv';

// تحميل متغيرات البيئة من ملف .env مع تجاوز المتغيرات الموجودة
// هذا يتم تنفيذه قبل أي شيء آخر في التطبيق
config({ override: true });

export async function register() {
  // تم تحميل متغيرات البيئة بالفعل
  console.log('🔧 Environment loaded from .env file');
  if (process.env.DATABASE_URL) {
    console.log('📊 DATABASE_URL:', process.env.DATABASE_URL.substring(0, 50) + '...');
  }
}
