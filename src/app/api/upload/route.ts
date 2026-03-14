import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const type = formData.get('type') as string | null // 'guest' or 'event' or 'logo' or 'member'
    
    if (!file) {
      return NextResponse.json({ error: 'لم يتم رفع أي ملف' }, { status: 400 })
    }

    console.log('Upload request:', { 
      fileName: file.name, 
      fileType: file.type, 
      fileSize: file.size,
      type: type 
    })

    // التحقق من نوع الملف
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'يُسمح فقط برفع صور (JPG, PNG, GIF, WebP)' }, { status: 400 })
    }

    // التحقق من حجم الملف (الحد الأقصى 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'حجم الملف يجب أن يكون أقل من 10 ميجابايت' }, { status: 400 })
    }

    // تحويل الملف إلى Buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // معالجة الصور باستخدام sharp
    let processedBuffer = sharp(buffer)
    let finalExtension = 'jpg'
    let contentType = 'image/jpeg'
    
    // تحديد الأحجام المطلوبة بناءً على نوع الصورة
    if (type === 'guest' || type === 'member') {
      // صورة الضيف أو العضو - مربعة 400x400
      processedBuffer = processedBuffer.resize(400, 400, {
        fit: 'cover',
        position: 'center'
      })
    } else if (type === 'event') {
      // صورة اللقاء - 1200x800
      processedBuffer = processedBuffer.resize(1200, 800, {
        fit: 'cover',
        position: 'center'
      })
    } else if (type === 'logo') {
      // شعار الراعي - حفظ كـ PNG للحفاظ على الشفافية
      processedBuffer = processedBuffer.resize(300, 300, {
        fit: 'contain',
      })
      finalExtension = 'png'
      contentType = 'image/png'
    } else {
      // صورة عادية - الحد الأقصى 1200px عرض
      processedBuffer = processedBuffer.resize(1200, undefined, {
        fit: 'inside',
        withoutEnlargement: true
      })
    }
    
    // تحويل الصورة إلى Buffer
    let finalBuffer: Buffer
    if (finalExtension === 'png') {
      finalBuffer = await processedBuffer.png({ compressionLevel: 9 }).toBuffer()
    } else {
      finalBuffer = await processedBuffer.jpeg({ quality: 90 }).toBuffer()
    }
    
    // استخدام base64 data URL
    const base64 = finalBuffer.toString('base64')
    const dataUrl = `data:${contentType};base64,${base64}`
    
    console.log('Upload successful using base64, size:', dataUrl.length, 'characters')
    
    return NextResponse.json({ 
      success: true, 
      url: dataUrl,
      fileName: file.name,
      storage: 'base64'
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    const errorMessage = error instanceof Error ? error.message : 'حدث خطأ أثناء رفع الملف'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
