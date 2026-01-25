import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

// ✅ GET - Fetch all pricing items
export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db('kalakruthi')
    
    // Find the pricing document
    const pricingDoc = await db.collection('quotation-pricing').findOne({ type: 'pricing' })
    
    if (!pricingDoc || !pricingDoc.items) {
      console.log('⚠️ No pricing data found in DB')
      return NextResponse.json({ items: [] })
    }
    
    console.log('✅ GET: Loaded', pricingDoc.items.length, 'items from DB')
    return NextResponse.json({ items: pricingDoc.items })
    
  } catch (error) {
    console.error('❌ GET Error:', error)
    return NextResponse.json({ error: 'Failed to fetch pricing', items: [] }, { status: 500 })
  }
}

// ✅ POST - Save all pricing items (replaces existing)
export async function POST(request) {
  try {
    const body = await request.json()
    const { items } = body
    
    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: 'Items array required' }, { status: 400 })
    }
    
    const client = await clientPromise
    const db = client.db('kalakruthi')
    
    // Update or insert the pricing document
    const result = await db.collection('quotation-pricing').updateOne(
      { type: 'pricing' },
      { 
        $set: { 
          items: items,
          updatedAt: new Date()
        } 
      },
      { upsert: true }
    )
    
    console.log('✅ POST: Saved', items.length, 'items to DB')
    
    return NextResponse.json({ 
      success: true, 
      message: 'Pricing saved successfully',
      itemCount: items.length 
    })
    
  } catch (error) {
    console.error('❌ POST Error:', error)
    return NextResponse.json({ error: 'Failed to save pricing' }, { status: 500 })
  }
}

// ✅ DELETE - Clear all pricing items
export async function DELETE() {
  try {
    const client = await clientPromise
    const db = client.db('kalakruthi')
    
    await db.collection('quotation-pricing').deleteOne({ type: 'pricing' })
    
    console.log('✅ DELETE: Cleared pricing data')
    
    return NextResponse.json({ success: true, message: 'Pricing cleared' })
    
  } catch (error) {
    console.error('❌ DELETE Error:', error)
    return NextResponse.json({ error: 'Failed to clear pricing' }, { status: 500 })
  }
}
