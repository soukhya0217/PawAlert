import { NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import EmailLog from "@/lib/db/models/EmailLog";
import { getCurrentUser } from "@/lib/auth/session";
import { isNGOAdmin } from "@/lib/auth/roles";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !isNGOAdmin(user.role)) {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    await connectDB();
    const logs = await EmailLog.find().sort({ createdAt: -1 }).limit(50);
    const count = await EmailLog.countDocuments();

    return NextResponse.json({ logs, totalCount: count });
  } catch (err: any) {
    console.warn("[Email Logs GET] DB offline or query error:", err.message);
    return NextResponse.json({ logs: [], totalCount: 0 });
  }
}
