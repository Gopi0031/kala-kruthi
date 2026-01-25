import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define MONGODB_URI in .env.local');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

// Define Hero Schema
const HeroSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    default: 'Welcome to Kalakruthi'
  },
  subtitle: {
    type: String,
    default: 'Stories of Love & Joy of Memories.'
  },
  image: {
    public_id: String,
    url: String,
    secure_url: String,
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const Hero = mongoose.models.Hero || mongoose.model('Hero', HeroSchema);

// GET - Fetch all hero images
export async function GET() {
  try {
    await connectDB();
    const heroes = await Hero.find().sort({ order: 1, createdAt: -1 });
    return NextResponse.json(heroes);
  } catch (error) {
    console.error('Error fetching heroes:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch hero images',
      details: error.message 
    }, { status: 500 });
  }
}

// POST - Create new hero image
export async function POST(request) {
  try {
    await connectDB();
    const formData = await request.formData();
    
    const title = formData.get('title');
    const subtitle = formData.get('subtitle');
    const image = formData.get('image');
    const order = formData.get('order') || 0;

    if (!image) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 });
    }

    // Check file size (15MB)
    const maxSize = 15 * 1024 * 1024;
    if (image.size > maxSize) {
      return NextResponse.json({ 
        error: 'Image size too large. Maximum size is 15MB.' 
      }, { status: 400 });
    }

    // Convert image to base64
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = `data:${image.type};base64,${buffer.toString('base64')}`;

    // Upload to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(base64Image, {
      folder: 'hero-images',
      resource_type: 'image',
      chunk_size: 6000000,
    });

    // Create hero document
    const hero = await Hero.create({
      title,
      subtitle,
      image: {
        public_id: uploadResponse.public_id,
        url: uploadResponse.url,
        secure_url: uploadResponse.secure_url,
      },
      order,
      isActive: true
    });

    return NextResponse.json({ success: true, hero }, { status: 201 });
  } catch (error) {
    console.error('Error creating hero:', error);
    return NextResponse.json({ 
      error: 'Failed to create hero image', 
      details: error.message 
    }, { status: 500 });
  }
}

// DELETE
export async function DELETE(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Hero ID required' }, { status: 400 });
    }

    const hero = await Hero.findById(id);
    
    if (!hero) {
      return NextResponse.json({ error: 'Hero not found' }, { status: 404 });
    }

    if (hero.image?.public_id) {
      await cloudinary.uploader.destroy(hero.image.public_id);
    }

    await Hero.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: 'Hero deleted successfully' });
  } catch (error) {
    console.error('Error deleting hero:', error);
    return NextResponse.json({ 
      error: 'Failed to delete hero',
      details: error.message 
    }, { status: 500 });
  }
}

// PATCH
export async function PATCH(request) {
  try {
    await connectDB();
    const formData = await request.formData();
    
    const id = formData.get('id');
    const title = formData.get('title');
    const subtitle = formData.get('subtitle');
    const isActive = formData.get('isActive') === 'true';
    const order = formData.get('order');

    if (!id) {
      return NextResponse.json({ error: 'Hero ID required' }, { status: 400 });
    }

    const hero = await Hero.findByIdAndUpdate(
      id, 
      { title, subtitle, isActive, order }, 
      { new: true }
    );

    if (!hero) {
      return NextResponse.json({ error: 'Hero not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, hero });
  } catch (error) {
    console.error('Error updating hero:', error);
    return NextResponse.json({ 
      error: 'Failed to update hero',
      details: error.message 
    }, { status: 500 });
  }
}
