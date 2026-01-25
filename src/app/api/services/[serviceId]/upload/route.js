import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'  // ✅ Use clientPromise
import { ObjectId } from 'mongodb'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

export async function POST(request, { params }) {
  try {
    const { serviceId } = await params
    const formData = await request.formData()
    
    const image = formData.get('image')
    const category = formData.get('category') || 'photography'

    console.log('📤 Uploading:', { serviceId, category, hasFile: !!image })

    if (!serviceId || !category) {
      return NextResponse.json(
        { error: 'Service ID and category are required' }, 
        { status: 400 }
      )
    }

    if (!image) {
      return NextResponse.json(
        { error: 'No file provided' }, 
        { status: 400 }
      )
    }

    // ✅ CRITICAL FIX: Connect to database
    const client = await clientPromise
    const db = client.db('kalakruthi')  // ✅ Use your database name

    const bytes = await image.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const dataURI = `data:${image.type};base64,${base64}`

    const resourceType = image.type.startsWith('video/') ? 'video' : 'image'
    
    const uploadResult = await cloudinary.uploader.upload(dataURI, {
      folder: `services/${category}`,
      resource_type: resourceType,
    })

    const newImage = {
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      type: resourceType,
      addedAt: new Date()
    }

    // Update service with category type
    const result = await db.collection('services').updateOne(
      { _id: new ObjectId(serviceId) },
      { 
        $push: { images: newImage },
        $set: { 
          type: category,
          updatedAt: new Date() 
        }
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'File uploaded successfully'
    })
  } catch (error) {
    console.error('❌ Upload Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
