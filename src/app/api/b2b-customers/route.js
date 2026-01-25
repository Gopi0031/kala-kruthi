// app/api/b2b-customers/route.js  ✅ (keep as .js)
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const customers = await db.collection("b2b_customers").find({}).toArray();
    return NextResponse.json(customers);
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
  }
}

export async function POST(request) {  // ← Removed : Request
  try {
    const { db } = await connectToDatabase();
    const body = await request.json();

    const customerData = {
      studio: body.studio,
      person: body.person || "",
      phone: body.phone,
      date: body.date || "",
      camera: body.camera || "",
      location: body.location || "",
      advance: parseFloat(body.advance) || 0,
      total: parseFloat(body.total),
      balance: (parseFloat(body.total) || 0) - (parseFloat(body.advance) || 0),
      status: (parseFloat(body.advance) || 0) >= (parseFloat(body.total) || 0) ? "Paid" : "Pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("b2b_customers").insertOne(customerData);
    const savedCustomer = { _id: result.insertedId, ...customerData };
    
    return NextResponse.json(savedCustomer, { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ error: "Failed to save customer" }, { status: 500 });
  }
}
