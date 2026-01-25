import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request) {
  try {
    const { db } = await connectToDatabase()
    const { serviceId } = await request.json()

    if (!serviceId) {
      return NextResponse.json({ error: 'Service ID required' }, { status: 400 })
    }

    // Get the service to find the image publicId
    const service = await db.collection('homeServices').findOne({
      _id: new ObjectId(serviceId)
    })

    if (!service || !service.image?.publicId) {
      return NextResponse.json({ error: 'No image found' }, { status: 404 })
    }

    // Delete from Cloudinary
    try {
      await cloudinary.uploader.destroy(service.image.publicId)
      console.log('Deleted from Cloudinary:', service.image.publicId)
    } catch (cloudError) {
      console.error('Cloudinary delete error:', cloudError)
    }

    // Remove image from MongoDB
    await db.collection('homeServices').updateOne(
      { _id: new ObjectId(serviceId) },
      {
        $unset: { image: "" },
        $set: { updatedAt: new Date() }
      }
    )

    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully'
    })
  } catch (error) {
    console.error('Delete image error:', error)
    return NextResponse.json({ 
      error: error.message || 'Failed to delete image' 
    }, { status: 500 })
  }
}
