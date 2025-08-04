import fs from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

export async function GET() {
  const dir = path.join(process.cwd(), "public", "data", "images");
  const files = await fs.readdir(dir);
  return NextResponse.json({ files });
}
