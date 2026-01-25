import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { NextResponse } from 'next/server'

// GET all services (with optional type filter)
export async function GET(request) {
  try {
    const { db } = await connectToDatabase()
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    let query = {}
    if (type) {
      query.type = type
    }

    const services = await db
      .collection('services')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json(services)
  } catch (error) {
    console.error('GET Services Error:', error)
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 })
  }
}

// POST - Create new service
export async function POST(request) {
  try {
    const { db } = await connectToDatabase()
    const { name, type } = await request.json()

    if (!name || !type) {
      return NextResponse.json({ error: 'Name and type are required' }, { status: 400 })
    }

    if (!['photography', 'videography'].includes(type)) {
      return NextResponse.json({ error: 'Invalid type. Must be photography or videography' }, { status: 400 })
    }

    const newService = {
      name: name.trim(),
      type: type,
      images: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await db.collection('services').insertOne(newService)

    return NextResponse.json({
      success: true,
      service: { ...newService, _id: result.insertedId }
    })
  } catch (error) {
    console.error('POST Service Error:', error)
    return NextResponse.json({ error: 'Failed to create service' }, { status: 500 })
  }
}

// DELETE service
export async function DELETE(request) {
  try {
    const { db } = await connectToDatabase()
    const { searchParams } = new URL(request.url)
    const serviceId = searchParams.get('id')

    if (!serviceId) {
      return NextResponse.json({ error: 'Service ID required' }, { status: 400 })
    }

    const result = await db.collection('services').deleteOne({
      _id: new ObjectId(serviceId)
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'Service deleted' })
  } catch (error) {
    console.error('DELETE Service Error:', error)
    return NextResponse.json({ error: 'Failed to delete service' }, { status: 500 })
  }
}
