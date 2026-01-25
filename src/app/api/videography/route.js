import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const categories = await db
      .collection("videography")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    return NextResponse.json(categories);
  } catch (error) {
    console.error("❌ Error fetching videography:", error);
    return NextResponse.json(
      { error: "Failed to fetch videography" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { db } = await connectToDatabase();
    const data = await request.json();
    
    const newCategory = {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const result = await db.collection("videography").insertOne(newCategory);
    
    return NextResponse.json(
      { ...newCategory, _id: result.insertedId },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Error creating videography category:", error);
    return NextResponse.json(
      { error: "Failed to create videography category" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const { db } = await connectToDatabase();
    const data = await request.json();
    const { _id, ...updateData } = data;

    if (!_id) {
      return NextResponse.json(
        { error: "Category ID is required" },
        { status: 400 }
      );
    }

    const result = await db.collection("videography").updateOne(
      { _id: new ObjectId(_id) },
      { 
        $set: { 
          ...updateData, 
          updatedAt: new Date() 
        } 
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Error updating videography category:", error);
    return NextResponse.json(
      { error: "Failed to update videography category" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { db } = await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Category ID is required" },
        { status: 400 }
      );
    }

    const result = await db.collection("videography").deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Error deleting videography category:", error);
    return NextResponse.json(
      { error: "Failed to delete videography category" },
      { status: 500 }
    );
  }
}