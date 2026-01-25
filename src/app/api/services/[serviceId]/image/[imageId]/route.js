import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// DELETE - Delete specific image from service
export async function DELETE(request, { params }) {
  try {
    const { serviceId, imageId } = await params;
    
    console.log('🗑️ Deleting image:', imageId, 'from service:', serviceId);

    const client = await clientPromise;
    const db = client.db('kalakruthi');

    // Find the service and image
    const service = await db.collection('services').findOne({ 
      _id: new ObjectId(serviceId) 
    });

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    // Find the image in the service
    const image = service.images?.find(img => 
      img._id === imageId || 
      img.publicId === imageId
    );

    if (!image) {
      console.warn('⚠️ Image not found in service');
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    const publicId = image.publicId || image._id;

    // Delete from Cloudinary
    console.log('☁️ Deleting from Cloudinary:', publicId);
    try {
      const cloudinaryResult = await cloudinary.uploader.destroy(publicId, {
        resource_type: 'image',
        invalidate: true,
      });
      console.log('✅ Cloudinary delete result:', cloudinaryResult);
    } catch (cloudError) {
      console.warn('⚠️ Cloudinary delete failed:', cloudError.message);
      // Continue anyway to remove from DB
    }

    // Remove image from service in MongoDB
    const updateResult = await db.collection('services').updateOne(
      { _id: new ObjectId(serviceId) },
      { 
        $pull: { 
          images: { 
            $or: [
              { _id: imageId },
              { publicId: imageId }
            ]
          } 
        } 
      }
    );
    
    console.log('✅ MongoDB update result:', updateResult);

    return NextResponse.json({ 
      success: true, 
      message: 'Image deleted successfully'
    });
  } catch (error) {
    console.error('❌ DELETE Image Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
