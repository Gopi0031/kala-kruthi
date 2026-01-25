import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

/* ================= PUT (UPDATE) ================= */
export async function PUT(request, { params }) {
  try {
    const { id } = await params; // ✅ REQUIRED in Next 15+
    const { db } = await connectToDatabase();
    const body = await request.json();

    // 🔒 Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid customer id" },
        { status: 400 }
      );
    }

    const updateData = {
      studio: body.studio,
      person: body.person || "",
      phone: body.phone,
      date: body.date || "",
      camera: body.camera || "",
      location: body.location || "",
      advance: parseFloat(body.advance) || 0,
      total: parseFloat(body.total) || 0,
      balance:
        (parseFloat(body.total) || 0) -
        (parseFloat(body.advance) || 0),
      status:
        (parseFloat(body.advance) || 0) >=
        (parseFloat(body.total) || 0)
          ? "Paid"
          : "Pending",
      updatedAt: new Date(),
    };

    const result = await db.collection("b2b_customers").updateOne(
      { _id: new ObjectId(id) }, // 🔥 THIS WAS THE REAL BUG
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update customer", details: error.message },
      { status: 500 }
    );
  }
}

/* ================= DELETE ================= */
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const { db } = await connectToDatabase();

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid customer id" },
        { status: 400 }
      );
    }

    const result = await db.collection("b2b_customers").deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete customer" },
      { status: 500 }
    );
  }
}
