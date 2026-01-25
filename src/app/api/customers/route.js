import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

// GET all customers
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('kalakruthi');
    const customers = await db.collection('customers').find({}).toArray();
    
    return NextResponse.json(customers);
  } catch (error) {
    console.error('GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}

// POST new customer
export async function POST(request) {
  try {
    const client = await clientPromise;
    const db = client.db('kalakruthi');
    const body = await request.json();
    
    const result = await db.collection('customers').insertOne({
      ...body,
      createdAt: new Date(),
    });
    
    return NextResponse.json({ success: true, id: result.insertedId });
  } catch (error) {
    console.error('POST Error:', error);
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
  }
}

// PUT update customer
export async function PUT(request) {
  try {
    const client = await clientPromise;
    const db = client.db('kalakruthi');
    const body = await request.json();
    const { _id, id, ...updateData } = body;
    
    // Use _id or id, whichever is provided
    const customerId = _id || id;
    
    if (!customerId) {
      return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 });
    }
    
    if (!ObjectId.isValid(customerId)) {
      return NextResponse.json({ error: 'Invalid customer ID' }, { status: 400 });
    }
    
    const result = await db.collection('customers').updateOne(
      { _id: new ObjectId(customerId) },
      { $set: { ...updateData, updatedAt: new Date() } }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, modified: result.modifiedCount });
  } catch (error) {
    console.error('PUT Error:', error);
    return NextResponse.json({ error: 'Failed to update customer', details: error.message }, { status: 500 });
  }
}

// DELETE customer
export async function DELETE(request) {
  try {
    const client = await clientPromise;
    const db = client.db('kalakruthi');
    const body = await request.json();
    const customerId = body._id || body.id;
    
    if (!customerId) {
      return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 });
    }
    
    if (!ObjectId.isValid(customerId)) {
      return NextResponse.json({ error: 'Invalid customer ID' }, { status: 400 });
    }
    
    const result = await db.collection('customers').deleteOne({ 
      _id: new ObjectId(customerId) 
    });
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE Error:', error);
    return NextResponse.json({ error: 'Failed to delete customer' }, { status: 500 });
  }
}
