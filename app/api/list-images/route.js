import { NextResponse } from "next/server";
import cloudinary from "cloudinary";

cloudinary.v2.config({
  cloud_name: "dwfqbpxfb",
  api_key: "564997124141877",
  api_secret: "A_1m_eF4Mqr90gBeRoUj4Ll4EsQ",
});

export async function GET() {
  try {
    const result = await cloudinary.v2.api.resources({
      type: "upload",
      prefix: "images/", // Only images in the "images" folder
      resource_type: "image",
    });

    const urls = result.resources.map((file) => file.secure_url);
    return NextResponse.json({ files: urls });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
