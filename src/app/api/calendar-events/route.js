// src/app/api/calendar-events/route.js
import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export const dynamic = 'force-dynamic' // ✅ FIXES Next.js caching

export async function GET() {
  const client = await clientPromise
  const db = client.db("kalakruthi")
  const events = await db.collection("calendar-events").find({}).sort({ date: 1 }).toArray()
  return NextResponse.json(events)
}

export async function POST(req) {
  try {
    const body = await req.json()
    console.log("📥 POST body:", body) // ✅ DEBUG
    
    const client = await clientPromise
    const db = client.db("kalakruthi")
    
    const result = await db.collection("calendar-events").insertOne({
      title: body.title,
      date: body.date,
      status: body.status || "Pending",
      customerName: body.customerName,
      customerPhone: body.customerPhone || "",
      location: body.location || "",
      createdAt: new Date(),
    })
    
    console.log("✅ POST created:", result.insertedId)
    return NextResponse.json({ success: true, id: result.insertedId })
  } catch (error) {
    console.error("❌ POST ERROR:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(req) {
  try {
    const body = await req.json()
    console.log("📥 PUT body:", body) // ✅ DEBUG
    
    const { _id, ...updateData } = body
    
    if (!_id) {
      console.error("❌ No _id in PUT")
      return NextResponse.json({ error: "Event ID required" }, { status: 400 })
    }
    
    const client = await clientPromise
    const db = client.db("kalakruthi")
    
    const result = await db.collection("calendar-events").updateOne(
      { _id: new ObjectId(_id) },
      { $set: {
        title: updateData.title,
        date: updateData.date,
        status: updateData.status,
        customerName: updateData.customerName,
        customerPhone: updateData.customerPhone || "",
        location: updateData.location || "",
        updatedAt: new Date()
      }}
    )
    
    console.log("✅ PUT result:", result)
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }
    
    return NextResponse.json({ success: true, matchedCount: result.matchedCount })
  } catch (error) {
    console.error("❌ PUT ERROR:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 })
    
    const client = await clientPromise
    const db = client.db("kalakruthi")
    
    const result = await db.collection("calendar-events").deleteOne({
      _id: new ObjectId(id),
    })
    
    return NextResponse.json({ success: true, deletedCount: result.deletedCount })
  } catch (error) {
    console.error("DELETE error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
