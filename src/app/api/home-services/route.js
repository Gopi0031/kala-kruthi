import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { NextResponse } from 'next/server'

// GET - Fetch all home services
export async function GET() {
  try {
    const { db } = await connectToDatabase()
    const services = await db
      .collection('homeServices')
      .find({})
      .sort({ order: 1 })
      .toArray()
    
    return NextResponse.json(services)
  } catch (error) {
    console.error('GET Error:', error)
    return NextResponse.json({ error: 'Failed to fetch home services' }, { status: 500 })
  }
}

// POST - Create/Update home service
export async function POST(request) {
  try {
    const { db } = await connectToDatabase()
    const data = await request.json()
    
    const serviceData = {
      title: data.title,
      image: data.image || null,
      link: data.link || '#',
      order: data.order || 0,
      isVisible: data.isVisible !== undefined ? data.isVisible : true,
      updatedAt: new Date()
    }

    if (data._id) {
      // Update existing service
      await db.collection('homeServices').updateOne(
        { _id: new ObjectId(data._id) },
        { $set: serviceData }
      )
      return NextResponse.json({ success: true, service: { ...serviceData, _id: data._id } })
    } else {
      // Create new service
      serviceData.createdAt = new Date()
      const result = await db.collection('homeServices').insertOne(serviceData)
      return NextResponse.json({ success: true, service: { ...serviceData, _id: result.insertedId } })
    }
  } catch (error) {
    console.error('POST Error:', error)
    return NextResponse.json({ error: error.message || 'Failed to save service' }, { status: 500 })
  }
}

// DELETE - Delete home service
export async function DELETE(request) {
  try {
    const { db } = await connectToDatabase()
    const { id } = await request.json()
    
    const result = await db.collection('homeServices').deleteOne({ 
      _id: new ObjectId(id) 
    })
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'Service deleted successfully' })
  } catch (error) {
    console.error('DELETE Error:', error)
    return NextResponse.json({ error: error.message || 'Failed to delete' }, { status: 500 })
  }
}
