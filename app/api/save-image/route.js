import { writeFile } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { NextResponse } from "next/server";

export async function POST(req) {
  const formData = await req.formData();
  const file = formData.get("file");
  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `capture_${uuidv4()}.png`;

  const dir = path.join(process.cwd(), "public", "data", "images");
  await writeFile(path.join(dir, filename), buffer);

  return NextResponse.json({ status: "success", filename });
}
