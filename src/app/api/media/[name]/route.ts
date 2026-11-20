import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
  _req: Request,
  { params }: { params: { name: string } }
) {
  try {
    const { name } = params;
    // Prevent directory traversal attacks
    const sanitizedName = path.basename(name);
    const filePath = path.join(process.cwd(), "uploads", sanitizedName);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "Media file not found" }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    const ext = path.extname(sanitizedName).toLowerCase();

    let contentType = "application/octet-stream";
    if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
    else if (ext === ".png") contentType = "image/png";
    else if (ext === ".webp") contentType = "image/webp";
    else if (ext === ".gif") contentType = "image/gif";
    else if (ext === ".svg") contentType = "image/svg+xml";
    else if (ext === ".mp4") contentType = "video/mp4";

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to read media" }, { status: 500 });
  }
}
