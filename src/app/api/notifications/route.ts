import { NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import Notification from "@/lib/db/models/Notification";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ notifications: [], unreadCount: 0 });
    }

    await connectDB();
    const notifications = await Notification.find({ recipientUserId: user._id })
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await Notification.countDocuments({
      recipientUserId: user._id,
      isRead: false,
    });

    return NextResponse.json({ notifications, unreadCount });
  } catch (err: any) {
    console.warn("[Notifications GET] DB offline or query error:", err.message);
    return NextResponse.json({ notifications: [], unreadCount: 0 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { notificationId, markAll } = await req.json();
    await connectDB();

    if (markAll) {
      await Notification.updateMany(
        { recipientUserId: user._id, isRead: false },
        { isRead: true, readAt: new Date() }
      );
    } else if (notificationId) {
      await Notification.findOneAndUpdate(
        { _id: notificationId, recipientUserId: user._id },
        { isRead: true, readAt: new Date() }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update notification" }, { status: 500 });
  }
}
