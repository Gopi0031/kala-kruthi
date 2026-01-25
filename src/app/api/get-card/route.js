import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    console.log("🔍 Searching for slug:", slug);

    if (!slug) {
      return NextResponse.json(
        { error: "Slug is required" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Get all cards for debugging
    const allCards = await db.collection("generated_cards").find({}).toArray();
    console.log("📊 Total cards in DB:", allCards.length);
    
    if (allCards.length > 0) {
      console.log("📦 Sample card structure:", {
        shareableLink: allCards[0].shareableLink,
        customerSlug: allCards[0].customerSlug,
        customerIdentifier: allCards[0].customerIdentifier
      });
    }

    // Try to find the card - search in shareableLink field
    const card = await db.collection("generated_cards").findOne({
      $or: [
        { shareableLink: { $regex: slug, $options: 'i' } },
        { customerSlug: { $regex: slug, $options: 'i' } },
        { shareableLink: { $regex: slug.replace(/-/g, ''), $options: 'i' } }
      ]
    });

    if (!card) {
      console.log("❌ Card not found with slug:", slug);
      console.log("📋 Available links:", allCards.map(c => c.shareableLink));
      
      return NextResponse.json(
        { 
          error: "Card not found",
          debug: {
            searchedSlug: slug,
            totalCardsInDB: allCards.length,
            availableLinks: allCards.slice(0, 3).map(c => c.shareableLink)
          }
        },
        { status: 404 }
      );
    }

    console.log("✅ Card found!");
    return NextResponse.json(card);

  } catch (error) {
    console.error("❌ Error:", error);
    return NextResponse.json(
      { error: error.message, stack: error.stack },
      { status: 500 }
    );
  }
}
