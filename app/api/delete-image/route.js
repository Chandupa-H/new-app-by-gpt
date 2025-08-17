import { NextResponse } from "next/server";
import cloudinary from "cloudinary";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dhhwnmj6e",
  api_key: process.env.CLOUDINARY_API_KEY || "588611752873226",
  api_secret:
    process.env.CLOUDINARY_API_SECRET || "Y3AnxhGfc0wh3iTIlXS0HnORBOc",
});

export async function POST(req) {
  try {
    const { file } = await req.json();

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Extract public_id from URL
    // Example URL: https://res.cloudinary.com/demo/image/upload/v1234567890/images/abc123.png
    const parts = file.split("/");
    const filename = parts[parts.length - 1]; // abc123.png
    const publicId = `images/${filename.split(".")[0]}`; // images/abc123

    // Delete from Cloudinary
    const result = await cloudinary.v2.uploader.destroy(publicId, {
      resource_type: "image",
    });

    if (result.result !== "ok") {
      return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }

    return NextResponse.json({ status: "success", publicId });
  } catch (err) {
    console.error("Delete error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
