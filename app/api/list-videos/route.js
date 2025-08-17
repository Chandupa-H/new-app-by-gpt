import { NextResponse } from "next/server";
import cloudinary from "cloudinary";

cloudinary.v2.config({
  cloud_name: "dhhwnmj6e",
  api_key: "588611752873226",
  api_secret: "Y3AnxhGfc0wh3iTIlXS0HnORBOc",
});

export async function GET() {
  try {
    const result = await cloudinary.v2.api.resources({
      type: "upload",
      prefix: "videos/", // Only videos in the "videos" folder
      resource_type: "video",
    });

    const urls = result.resources.map((file) => file.secure_url);
    return NextResponse.json({ files: urls });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
