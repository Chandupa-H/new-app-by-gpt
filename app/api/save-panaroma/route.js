import { promises as fs } from "fs";
import path from "path";

export async function POST(req) {
  try {
    // Get file from request
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return new Response(JSON.stringify({ error: "No file uploaded" }), {
        status: 400,
      });
    }

    // Create a buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure save dir exists
    const saveDir = path.join(process.cwd(), "public", "panoramas");
    await fs.mkdir(saveDir, { recursive: true });

    // Create filename with timestamp
    const filename = `panorama_${Date.now()}.jpg`;
    const filepath = path.join(saveDir, filename);

    // Save file
    await fs.writeFile(filepath, buffer);

    return new Response(JSON.stringify({ status: "success", filename }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error saving panorama:", error);
    return new Response(JSON.stringify({ error: "Failed to save panorama" }), {
      status: 500,
    });
  }
}
