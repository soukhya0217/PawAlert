import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import connectDB from "@/lib/db/connect";
import User from "@/lib/db/models/User";
import fs from "fs";
import path from "path";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: Request) {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = (formData.get("file") || formData.get("photo") || formData.get("image")) as File | null;

    if (!file) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid image format (${file.type}). Allowed formats: JPEG, PNG, WebP, GIF.` },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Image file exceeds 5MB size limit. Please upload a smaller image." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadsDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    let ext = path.extname(file.name || "").toLowerCase();
    if (!ext || ext === ".") {
      if (file.type === "image/png") ext = ".png";
      else if (file.type === "image/webp") ext = ".webp";
      else if (file.type === "image/gif") ext = ".gif";
      else ext = ".jpg";
    }

    const fileName = `avatar_${sessionUser._id}_${Date.now()}${ext}`;
    const filePath = path.join(uploadsDir, fileName);

    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/api/media/${fileName}`;

    await connectDB();
    const user = await User.findById(sessionUser._id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    user.profileImage = publicUrl;
    await user.save();

    return NextResponse.json({
      message: "Profile photograph uploaded and saved successfully",
      profileImage: publicUrl,
    });
  } catch (err: any) {
    console.error("[Profile Photo Upload Error]:", err);
    return NextResponse.json(
      { error: err.message || "Failed to upload profile photograph" },
      { status: 500 }
    );
  }
}
