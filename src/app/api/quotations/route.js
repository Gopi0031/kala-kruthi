// /app/api/quotations/route.js - FIXED VERSION
import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

// GET all quotations
// GET all quotations - WITH DETAILED DEBUGGING
export async function GET(request) {
  try {
    console.log("================================")
    console.log("📋 QUOTATIONS API - GET Request")
    console.log("================================")

    const client = await clientPromise
    const db = client.db("kalakruthi")

    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get("customerId")

    console.log("🔍 Query Parameters:")
    console.log("   - customerId:", customerId)

    let query = {}
    if (customerId) {
      console.log("🔄 Converting customerId to ObjectId...")
      
      // Convert string to ObjectId if valid
      if (ObjectId.isValid(customerId)) {
        query.customerId = new ObjectId(customerId)
        console.log("✅ ObjectId created:", query.customerId)
      } else {
        console.warn("❌ Invalid customerId format:", customerId)
        console.log("⚠️ Returning empty array")
        return NextResponse.json([])
      }
    }

    console.log("📊 MongoDB Query:", JSON.stringify(query))

    const quotations = await db
      .collection("quotations")
      .find(query)
      .sort({ createdAt: -1 })
      .toArray()

    console.log(`✅ Found ${quotations.length} quotations`)

    if (quotations.length > 0) {
      console.log("📝 Sample quotation structure:")
      console.log("   - _id:", quotations[0]._id)
      console.log("   - customerId:", quotations[0].customerId)
      console.log("   - createdAt:", quotations[0].createdAt)
      console.log("   - pdfFiles exists:", !!quotations[0].pdfFiles)
    }

    console.log("================================")
    console.log("✅ GET Request Completed Successfully")
    console.log("================================\n")

    return NextResponse.json(quotations)
    
  } catch (error) {
    console.error("================================")
    console.error("❌ GET QUOTATIONS ERROR")
    console.error("================================")
    console.error("Error Type:", error.constructor.name)
    console.error("Error Message:", error.message)
    console.error("Error Stack:", error.stack)
    console.error("================================\n")

    return NextResponse.json(
      { 
        error: 'Failed to fetch quotations', 
        details: error.message,
        type: error.constructor.name
      },
      { status: 500 }
    )
  }
}

// POST new quotation (from Quotation.jsx)
export async function POST(request) {
  try {
    const client = await clientPromise;
    const db = client.db('kalakruthi');
    
    const body = await request.json();
    
    const {
      customerId,
      quotationData,
      pdfData, // { ownerPdfBase64, customerPdfBase64, fileName }
      totals
    } = body;
    
    console.log("📝 Saving quotation for customer:", customerId)

    if (!customerId || !quotationData) {
      return NextResponse.json(
        { error: 'Missing customerId or quotationData' },
        { status: 400 }
      );
    }

    // Validate and convert customerId to ObjectId
    let customerObjectId;
    if (ObjectId.isValid(customerId)) {
      customerObjectId = new ObjectId(customerId)
    } else {
      console.error("Invalid customerId:", customerId)
      return NextResponse.json(
        { error: "Invalid customerId format" },
        { status: 400 }
      )
    }

    // Build quotation record
    const quotationRecord = {
      customerId: customerObjectId,
      quotationData: {
        ...quotationData,
        createdAt: new Date()
      },
      totals: totals || {},
      pdfFiles: pdfData ? {
        ownerPdf: pdfData.ownerPdfBase64,
        customerPdf: pdfData.customerPdfBase64,
        fileName: pdfData.fileName || `Quotation_${Date.now()}`,
        savedAt: new Date(),
      } : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    console.log("💾 Inserting quotation record...")

    const result = await db.collection('quotations').insertOne(quotationRecord);

    console.log("✅ Quotation saved with ID:", result.insertedId)

    return NextResponse.json({ 
      success: true, 
      quotationId: result.insertedId,
      message: 'Quotation saved successfully'
    });
  } catch (error) {
    console.error('❌ POST Quotation Error:', error);
    return NextResponse.json({ 
      error: 'Failed to save quotation', 
      details: error.message 
    }, { status: 500 });
  }
}

// PUT update quotation
export async function PUT(request) {
  try {
    const client = await clientPromise;
    const db = client.db('kalakruthi');
    const body = await request.json();
    const { _id, quotationId, ...updateData } = body;
    
    const id = _id || quotationId;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Quotation ID is required' },
        { status: 400 }
      );
    }
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid quotation ID' },
        { status: 400 }
      );
    }
    
    const result = await db.collection('quotations').updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updateData, updatedAt: new Date() } }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Quotation not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      modified: result.modifiedCount 
    });
  } catch (error) {
    console.error('❌ PUT Quotation Error:', error);
    return NextResponse.json({ 
      error: 'Failed to update quotation',
      details: error.message 
    }, { status: 500 });
  }
}

// DELETE quotation
export async function DELETE(request) {
  try {
    const client = await clientPromise;
    const db = client.db('kalakruthi');
    const body = await request.json();
    const id = body._id || body.quotationId;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Quotation ID is required' },
        { status: 400 }
      );
    }
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid quotation ID' },
        { status: 400 }
      );
    }
    
    const result = await db.collection('quotations').deleteOne({
      _id: new ObjectId(id)
    });
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Quotation not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ DELETE Quotation Error:', error);
    return NextResponse.json({ 
      error: 'Failed to delete quotation' 
    }, { status: 500 });
  }
}