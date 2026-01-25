import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

export async function POST(request) {
  try {
    const { db } = await connectToDatabase()
    const formData = await request.formData()
    const image = formData.get('image')
    const serviceId = formData.get('serviceId')

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    // Get Cloudinary credentials from environment
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    // Log to check if credentials are loaded
    console.log('Cloudinary config:', {
      cloudName: cloudName || 'MISSING',
      apiKey: apiKey ? 'Set' : 'MISSING',
      apiSecret: apiSecret ? 'Set' : 'MISSING'
    })

    // Configure Cloudinary
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true
    })

    // Convert image to buffer
    const bytes = await image.arrayBuffer()
    const buffer = Buffer.from(bytes)

    console.log('Starting Cloudinary upload...')

    // Upload to Cloudinary using upload_stream
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'kalakruthi-home-services',
          resource_type: 'image',
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error)
            reject(error)
          } else {
            console.log('Upload successful:', result.public_id)
            resolve(result)
          }
        }
      )
      
      uploadStream.end(buffer)
    })

    const imageData = {
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
    }

    // Update service in MongoDB if serviceId provided
    if (serviceId) {
      await db.collection('homeServices').updateOne(
        { _id: new ObjectId(serviceId) },
        {
          $set: { 
            image: imageData,
            updatedAt: new Date() 
          }
        }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Image uploaded successfully',
      image: imageData,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ 
      error: error.message || 'Failed to upload image' 
    }, { status: 500 })
  }
}
