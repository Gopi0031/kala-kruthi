// src/app/api/b2b-images/route.js
import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Initialize Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ FETCH FROM CLOUDINARY - No in-memory issues!
export async function GET() {
  try {
    const result = await cloudinary.api.resources({
      resource_type: 'image',
      type: 'upload',
      prefix: 'v1/b2b', // Only b2b folder
      max_results: 100
    });
    
    const b2bImages = result.resources.slice(0, 3).map(img => ({
      public_id: img.public_id,
      secure_url: img.secure_url,
      filename: img.filename || img.public_id.split('/').pop() + '.jpg'
    }));
    
    console.log('✅ GET b2bImages:', b2bImages.map(i => i.filename));
    return NextResponse.json(b2bImages);
  } catch (error) {
    console.error('Cloudinary API error:', error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('images');

    if (files.length === 0) {
      return NextResponse.json({ success: false, error: 'No files provided' }, { status: 400 });
    }

    const uploadedImages = [];
    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const result = await cloudinary.uploader.upload_stream(
        { folder: 'v1/b2b' },
        (error, uploadResult) => {
          if (error) throw error;
          uploadedImages.push({
            public_id: uploadResult.public_id,
            secure_url: uploadResult.secure_url,
            filename: file.name
          });
        }
      ).end(buffer);
      
      await new Promise(resolve => setTimeout(resolve, 100)); // Ensure stream completes
    }

    console.log('✅ UPLOADED:', uploadedImages.map(i => i.filename));
    return NextResponse.json({ 
      success: true, 
      message: `${uploadedImages.length} images uploaded to v1/b2b/`,
      results: uploadedImages 
    });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { publicId } = await request.json();
    if (!publicId) {
      return NextResponse.json({ success: false, error: 'No publicId' }, { status: 400 });
    }

    await cloudinary.uploader.destroy(publicId, { invalidate: true });
    console.log('🗑️ DELETED:', publicId);
    
    return NextResponse.json({ success: true, message: 'Deleted' });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
