import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function POST(req) {
  try {
    const { publicId, resourceType } = await req.json();

    if (!publicId) {
      return NextResponse.json(
        { error: "No public ID provided" },
        { status: 400 }
      );
    }

    console.log("🗑️ Deleting from Cloudinary:", publicId, "Type:", resourceType);

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType || "image",
      invalidate: true,
    });

    console.log("✅ Delete successful:", result);

    return NextResponse.json({
      success: true,
      result: result.result,
    });
  } catch (error) {
    console.error("❌ Cloudinary delete error:", error);
    return NextResponse.json(
      { error: error.message || "Delete failed" },
      { status: 500 }
    );
  }
}
