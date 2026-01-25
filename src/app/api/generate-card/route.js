import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function POST(request) {
  try {
    console.log("📥 API route hit - generate-card");
    
    const body = await request.json();
    console.log("📦 Request body received");

    const {
      customerIdentifier,
      templateType,
      formData,
      designId,
      designColors,
      shareableLink,
      createdAt,
    } = body;

    // Validate required fields
    if (!customerIdentifier || !templateType || !formData || !shareableLink) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Extract customer slug from shareableLink
    const customerSlug = shareableLink.split('/card/')[1];
    console.log("🏷️ Customer slug:", customerSlug);

    // Connect to MongoDB
    console.log("🔌 Connecting to MongoDB...");
    const { db } = await connectToDatabase();
    console.log("✅ MongoDB connected");

    // Save to generated_cards collection
    console.log("💾 Inserting card data...");
    const result = await db.collection("generated_cards").insertOne({
      customerIdentifier,
      templateType,
      formData,
      designId,
      designColors,
      shareableLink,
      customerSlug,
      imageUrl: null, // We'll add canvas generation later
      createdAt: createdAt || new Date().toISOString(),
      status: "active",
    });

    console.log("✅ Card saved with ID:", result.insertedId);

    // Verify it was saved
    const savedCard = await db.collection("generated_cards").findOne({
      _id: result.insertedId
    });
    console.log("✅ Verified card exists:", savedCard ? "YES" : "NO");

    return NextResponse.json({
      success: true,
      cardId: result.insertedId.toString(),
      shareableLink,
      customerSlug,
      message: "Card generated and saved successfully!",
    });

  } catch (error) {
    console.error("❌ API Error:", error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
