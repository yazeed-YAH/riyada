import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// بيانات الأعضاء من ملف CSV (40 عضو)
const membersData = [
  { id: "cmmdsfshj0000l504y3lcltv2", name: "يزيد الحمدان", email: "yazeed@yah.sa", phone: "+966583000002", password: "$2b$10$f1FD6oCPQa/3DYShJme1iuB1x9D/c15WQhkTESclE40JJKwPyE9PK", companyName: "YAH | المقلط | Yplus", jobTitle: "المؤسس و الرئيس التنفيذي", gender: "male" },
  { id: "cmmeb8f8x0003kz04b89l6pet", name: "Mohammed Alrasi", email: "leaner_68_handsaw@icloud.com", phone: "+966545242443", password: "$2b$10$HSasnkoXCFWO1WnSQ/hamewehtLtF8xdCBaYylz1v3KZ8Wn.CGlaS", companyName: "Yy", jobTitle: "Yy", gender: "male" },
  { id: "cmmeb8gzz0006kz04q5aqzoy8", name: "ماجد", email: "m.aljomah@plus-events.com", phone: "555992333", password: "$2b$10$mJmdd4ST8AQtkQ3TTb/lvO8or7PsANFnEmEgs9piOwFiDjhE7sJpS", companyName: "+Plus", jobTitle: "CEO", gender: "male" },
  { id: "cmmeb8iww0009kz04c2q796e4", name: "تهاني عبدالله الشنان", email: "majed.aljomah@gmail.com", phone: "+966555004500", password: "$2b$10$ra3x0bBJnvL7Eg.V2Vwcg.hPR/wbGhHNg3MgA68b7dEdnjz.9JBoO", companyName: "+plus", jobTitle: "مدير تطوير الأعمال", gender: "female" },
  { id: "cmmeb8ku0000ckz048z3y3zyy", name: "بهية النصيان", email: "no-email-1772757840778@placeholder.com", phone: "554153541", password: "$2b$10$VUVIiAC59Dq6t2ogUrZxjumRlZJRkfn8Zw5OQ6ZV53ExnqTznW.T6", companyName: "شركة بهية", jobTitle: "الرئيس التنفيذي", gender: "female" },
  { id: "cmmeb8mqe000gkz04cbxjh4zp", name: "ايمان الفريري", email: "no-email-1772757835605@placeholder.com", phone: "562244440", password: "$2b$10$V1yD/BlDoAUwcpDsswAJfO5AnVZGqtX6ahcFUBP/0/SuwlMYMoBIG", companyName: "شركة أماسي للاستشارات", jobTitle: "الرئيس التنفيذي", gender: "female" },
  { id: "cmmeb8okg000kkz04kz35c28r", name: "بدور الحضيف", email: "no-email-1772757838584@placeholder.com", phone: "507882255", password: "$2b$10$lrrQMZeEL3F3KEJ7iqWJXeD44ZliBlQg39A6YFivO0BkIt3RGAPxK", companyName: "شركة هوم ميكر", jobTitle: "الرئيس التنفيذي", gender: "female" },
  { id: "cmmeb8qia000okz04tj6726uy", name: "أريج الهيلا", email: "no-email-1772758359633@placeholder.com", phone: "504447420", password: "$2b$10$78TIiycZhZl8izO5y9VaDOJoizipCZpCrp1ptW6vWXxMtv4RzGt/.", companyName: "مشاهير سوشل ميديا", jobTitle: "مشهورة", gender: "female" },
  { id: "cmmeb8sc5000skz04m0pqphui", name: "سحاب الغامدي", email: "no-email-1772758575972@placeholder.com", phone: "555766659", password: "$2b$10$HssmNgs7GCBamNrJpOLbjOrnL40jnxy8tGTXnV5VPdczuAF5bVpBS", companyName: "وهج الدلال", jobTitle: "الرئيس التنفيذي", gender: "female" },
  { id: "cmmeb8ub4000wkz048k86a9ab", name: "دلال الغامدي", email: "no-email-1772758573924@placeholder.com", phone: "558766659", password: "$2b$10$dIbau0x12u5/qqRP7Ceey.mQA8idjARyXD3y.G8wg.y9wsDQneLmO", companyName: "وهج الدلال", jobTitle: "مساعد الرئيس التنفيذي", gender: "female" },
  { id: "cmmgo3tb40000k104bvq34b6d", name: "طرفة العمر", email: "tarfa.alomar@camco.com.sa", phone: "533396608", password: "$2b$10$7nUPN0SDLHaVaz83sN.EqeNKAw97htmB99SZ3nZvn1e1iCALUIxm.", companyName: "CAMCO", jobTitle: "Human Resources and Interim Stakeholder", gender: "female" },
  { id: "cmmgo3vpx0001k104a2p2e7ui", name: "الجوهره محمد سلطان السلطان", email: "jojosultanj@gmail.com", phone: "+966543271116", password: "$2b$10$YJtJad.Z5cyysBfXnmxjjuoS3ijOXkgSPnZAHOMYQ3EFfjy7PcAJa", companyName: " ", jobTitle: "سيده اعمال", gender: "female" },
  { id: "cmmgo3y4n0003k104cmpazf82", name: "ماجده عبدالقادر", email: "co.majda@gmail.com", phone: "+966555226359", password: "$2b$10$2dbMUXsU5KcW0LjRb4uyWOWbUGA9vpudN0Hxkh/atMGY5e.yIgUqm", companyName: "شي ورركس", jobTitle: "مدير", gender: "female" },
  { id: "cmmgo3zwy0006k1047xft3iwz", name: "عائشه عبدالله الشهري", email: "chefspoon.sa@gmail.com", phone: "+966580671910", password: "$2b$10$qzhLNhUEXnxccWyNJvZN7.ggKs/oCcNh0tHt5lZOYAPPJKwzriWOu", companyName: "مطعم ملعقه الطاهي", jobTitle: "شيف", gender: "female" },
  { id: "cmmgo41tn0009k104wivzq0u9", name: "ارام الخميس", email: "aram.ibhim@gmail.com", phone: "+966507224354", password: "$2b$10$6ljuzFCcyX7iIOF971LMcOJYpqSKHsHWQuXAU4/VHU4dDNGZ0AAc.", companyName: "المملكة القابضه", jobTitle: "مدير مبيعات", gender: "female" },
  { id: "cmmgo43y0000ck1045jmilr92", name: "ريم السيد", email: "reema.alsayed@gmail.com", phone: "+966504440256", password: "$2b$10$XgqYtsizxwiX4c/Xe4kN4OSQ9b1sB/GcyCfPHnuKK8GHScOU9J6XC", companyName: "شي ووركس", jobTitle: "شريك", gender: "female" },
  { id: "cmmgo45qa000fk104thikgzul", name: "نوف عبدالله البرجس", email: "noofabdullah622@gmail.com", phone: "+966546188575", password: "$2b$10$Ea.7eGbRdt3.MkMMmf5wG.RtrUA.VaNQqherMcJd9kuJicg/z2RvC", companyName: "كرم الاعاشه", jobTitle: "اونر", gender: "female" },
  { id: "cmmgo47nl000ik104e0dlgntt", name: "رحمه الزهراني", email: "zxramaxz@gmail.com", phone: "+966556486711", password: "$2b$10$I8TiDHQsCxmNmQOMq1bhHuBIEIVM/N/5ZWoxq1qgy/kwLqW9GI54K", companyName: "RM Consultancy", jobTitle: "Founder & CEO", gender: "female" },
  { id: "cmmgo49ln000lk104pmhv4sgm", name: "ريما الحماد", email: "reemamohammad99@gmail.com", phone: "+966537690726", password: "$2b$10$YTkp/Hga1JuKLNdSRHuM9.eBNXSXjk5nA6CDi5Gne8uCXMFCXwScu", companyName: "الهيئة العامة للمنشآت الصغيرة والمتوسطة", jobTitle: "ريادة اعمال", gender: "female" },
  { id: "cmmgo4dd9000rk1045gp4irol", name: "مها فريد شيرة", email: "maha@sheworks.com.sa", phone: "+966505714747", password: "$2b$10$YYWJ7Ql9LJxXQaVvF26m1.VwZb67N8XPDJNIXsqzyofCBzw.OGZ1m", companyName: "Sheworks", jobTitle: "مؤسس", gender: "female" },
  { id: "cmmgo4f9j000uk10447d47eer", name: "نورة خلف العنزي", email: "nouraa.alonazi@gmail.com", phone: "+966555996724", password: "$2b$10$Eyz4DBWL07ZeS0f4ssYp0u1juATnezD0AeHbwMJx7JFV/WRCGaUbu", companyName: "", jobTitle: "مديرة المشروع", gender: "female" },
  { id: "cmmgo4h8w000xk104r4slth3g", name: "ريم بوسف الغامدي", email: "ryghamdi@gmail.com", phone: "+966558999798", password: "$2b$10$VoSXQrXFIfNQj6lzGOzK2uavM1SsoaGqDjVx4eP4QBoBfGbgwXbyi", companyName: "جامعة الملك سعود", jobTitle: "استاذ مساعد", gender: "female" },
  { id: "cmmgo4j7d0010k104cctuog8e", name: "نوره عبدالله بن سعيدان", email: "jasem-1429@hotmail.com", phone: "+966505998558", password: "$2b$10$IJENptuWBq9zH.W8Iux/qOKiYm.Vc3MeZg1Hys6QVp8o/0vwJSFJS", companyName: "نور نجد لتقنية المعلومات", jobTitle: "مستشار تسويقي", gender: "female" },
  { id: "cmmgo4l3w0013k104j1etg0xp", name: "منال عبدالرزاق خان", email: "econ78078@gmail.com", phone: "+966509878078", password: "$2b$10$6rPwPwmJXNZEGSR6JXdyHudBGNKO5AcJgOu9XilUv8GVqLNeKgUe6", companyName: "الجمعية السعودية لسيدات الاعمال", jobTitle: "المؤسس ورئيس مجلس الادارة", gender: "female" },
  { id: "cmmgo4n2l0016k104ln8qe9hi", name: "الهنوف العيسى", email: "alhanouf.alessa@hotmail.com", phone: "+966544220145", password: "$2b$10$kbrYhPVAVc4.8ZoQG8oaj.C6X27q0f3c.qqYgOmtLKBX.IcvLz4X6", companyName: "غندق", jobTitle: "", gender: "female" },
  { id: "cmmgo4owd0019k1042l8i5gch", name: "Atheer Alahmari", email: "atheeralahmari8@gmail.com", phone: "+966566886210", password: "$2b$10$n9tmtlXByPTl8fqnmum9ree5DnzT8UCGw2/9fkgH6jKYKjxfh5STO", companyName: "Bloom bakery", jobTitle: "رائده اعمال", gender: "female" },
  { id: "cmmgo4qsy001ck104gof5frez", name: "هاله المهناء", email: "loly_naic@outlook.com", phone: "+966551787821", password: "$2b$10$Z6Lr59faHshSdURVAzPKl.5UCUCsSkYhMgSt62i4mg5Xq4rczvy9K", companyName: "جمعية الطعي", jobTitle: "اخصائي اداري", gender: "female" },
  { id: "cmmgo4ss4001fk1046upcztzx", name: "حليمه عبدالله درويش عسيري", email: "confedent2020@gmail.com", phone: "+966548646674", password: "$2b$10$ddY0gJ7mP8vkM6P9yqyym.0lP.cfzP0LT0FTAOXrZM/pqknh1.um2", companyName: "مؤوسسة طاهي طويق للتدريب", jobTitle: "شيف تنفيذي ومرشده سياحيه", gender: "female" },
  { id: "cmmgo4url001ik10405kta9pz", name: "بدريه ناصر", email: "badriyanh@gmail.com", phone: "+966567853476", password: "$2b$10$rS4xCSeJC9gvgMXLxKuhf.dg3z/SvHfK.6puNKOL8i7GBJqExyiAy", companyName: "Zetta Technologies", jobTitle: "رئيس تنفيذي", gender: "female" },
  { id: "cmmgo4wn4001lk104mch7himq", name: "هلا احمد المسعر", email: "hallaalmasaar@gmail.com", phone: "+966555242649", password: "$2b$10$c0WabvcwyK2ffOrMO8BLFOtuboOzbzNtWxy43.SRw0FVXgc1MnQ66", companyName: "Hala station", jobTitle: "رائدة اعمال", gender: "female" },
  { id: "cmmgo4ymn001ok104f8cylcf9", name: "تهاني محمدثالث موسى الهوساوي", email: "alhawsawitahani@gmail.com", phone: "+966582300049", password: "$2b$10$q2bK8VKnwUgKF78ffOoD..q903HwXnNGldKkGDFSBBFzEbNrP6hFq", companyName: "مرستكه", jobTitle: "رائدة اعمال", gender: "female" },
  { id: "cmmgo50gz001rk104m5tsdkr3", name: "عزيزه الشهري", email: "a.alshehri.011@gmail.com", phone: "+966502787944", password: "$2b$10$RhIDtMJSwS6DzzXDj7PIYuTmEGTM.lne8C2UkL1nRcqkiBUe2Wp4S", companyName: "سوار ايفنت", jobTitle: "مدير تنفيذي", gender: "female" },
  { id: "cmmgy22gp0002l504z9mm31nf", name: "عائشة الشهري", email: "aish.abd.sa@gmail.com", phone: "0580670727", password: "$2b$10$tLD86nkH.6g8CIMFzOfqtexMlsbGE6kudN/pi0lS1Utv7kvlYr00.", companyName: "ملعقة الشيف", jobTitle: "المؤسس و الرئيس التنفيذي", gender: "female" },
  { id: "cmmgy24up0003l504sji4lgju", name: "حصه عبدالله البشر", email: "hessahalbesher@gmail.com", phone: "+966505155907", password: "$2b$10$22YGoiLx2g11GiCedU6K5.EGpXd//s/zIxLsbNyfSRlaUXKfSlBcS", companyName: "Dec31restaurant", jobTitle: "رئيس تتفيذي", gender: "female" },
  { id: "cmmgy278g0004l504zm920b1b", name: "بيان المزيد", email: "bayan.almazyad.92@gmail.com", phone: "+966056992263", password: "$2b$10$UDwuG5tqtMf8fuBqpOGx1.2hEkyH1l09zLVcagzx6c39HmYKew1bW", companyName: "كرم الاعاشه", jobTitle: "مدير تنفيذي", gender: "female" },
  { id: "cmmgy2bgz0005l504r1b7giiw", name: "ندى آل جميل", email: "nada.bin.jameel@gmail.com", phone: "+966566638926", password: "$2b$10$qkc1Zcyo7B077tdPV0hLKun80ed93BgnlpPSI0IrJcwd8wBNq8ITO", companyName: "جمعية الطهي", jobTitle: "مديرة التسويق والتطوير", gender: "female" },
  { id: "cmmgy2duw0006l504lmj28xog", name: "الشيف سعديه اليماني", email: "sadiah7571@gmail.com", phone: "+966504767990", password: "$2b$10$6pYOMqJt1lm7R5/jyZ9oRuBvfQAhKX.uWR18yZ3qEG4U2IcYs3.yu", companyName: "سيريوس", jobTitle: "شيف", gender: "female" },
  { id: "cmmgy2g8q0007l504rx5pjd67", name: "ندى الدهيمان", email: "nadaalduhaiman@gmail.com", phone: "+966505119640", password: "$2b$10$iCkDZs7RS4f9ecMv8rBgnOP4LVzNTIX5RpAw42cTshOcQfQYOKVYe", companyName: "", jobTitle: "", gender: "female" },
  { id: "cmmh7pgcq0000l1043nv7hgpm", name: "ساره المليك", email: "sarahazizav@gmail.com", phone: "+966508064956", password: "$2b$10$aAOX0dnz/oY/tSTTgBQ1o..8U3rvHnw96jfQ9BiOkPblWomw8eGZu", companyName: "والم", jobTitle: "طاهي رئيسي", gender: "female" },
  { id: "cmmhga4uy0000jm040egqg4of", name: "شذى احمد الشريف", email: "S_alsharif1@hotmail.com", phone: "+966502972751", password: "$2b$10$xy65mvu8N3d0DXKl8PC2EOG7bHlyeOCbVpM17LTxHEWpY6lOzAeRS", companyName: "شركة سوما الرائدة", jobTitle: "مدير تطوير أعمال", gender: "female" }
]

// GET - استعادة الأعضاء فوراً
export async function GET() {
  try {
    console.log('🔄 Starting members restore...')
    let imported = 0
    let updated = 0
    let skipped = 0
    const errors: string[] = []

    for (const member of membersData) {
      try {
        // التحقق من وجود العضو
        const existing = await db.member.findUnique({
          where: { email: member.email }
        })

        if (existing) {
          // تحديث العضو الموجود
          await db.member.update({
            where: { id: existing.id },
            data: {
              name: member.name,
              phone: member.phone,
              companyName: member.companyName || null,
              jobTitle: member.jobTitle || null,
              gender: member.gender,
            }
          })
          updated++
        } else {
          // إنشاء عضو جديد
          await db.member.create({
            data: {
              id: member.id,
              name: member.name,
              email: member.email,
              phone: member.phone || null,
              password: member.password,
              companyName: member.companyName || null,
              jobTitle: member.jobTitle || null,
              gender: member.gender,
            }
          })
          imported++
        }
      } catch (error) {
        console.error(`Error processing member ${member.email}:`, error)
        skipped++
        errors.push(`${member.name}: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`)
      }
    }

    // جلب عدد الأعضاء النهائي
    const finalCount = await db.member.count()

    return NextResponse.json({
      success: true,
      message: `✅ تم استعادة الأعضاء بنجاح!\n- مستورد: ${imported}\n- محدث: ${updated}\n- تخطي: ${skipped}\n- إجمالي الأعضاء: ${finalCount}`,
      imported,
      updated,
      skipped,
      totalMembers: finalCount,
      errors: errors.length > 0 ? errors : undefined
    })
  } catch (error) {
    console.error('Error restoring members:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء استعادة الأعضاء', details: error instanceof Error ? error.message : 'خطأ غير معروف' },
      { status: 500 }
    )
  }
}
