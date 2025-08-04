import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

cloudinary.config({
  cloud_name: "dwfqbpxfb",
  api_key: "564997124141877",
  api_secret: "A_1m_eF4Mqr90gBeRoUj4Ll4EsQ",
});

export async function POST(req) {
  const formData = await req.formData();
  const file = formData.get("file");

  if (!file) {
    return NextResponse.json(
      { status: "error", message: "No file provided" },
      { status: 400 }
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  try {
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "captured_images" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(buffer);
    });

    return NextResponse.json({
      status: "success",
      url: uploadResult.secure_url,
    });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { status: "error", message: "Upload failed" },
      { status: 500 }
    );
  }
}
