import { NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import VolunteerProfile from "@/lib/db/models/VolunteerProfile";
import User, { UserRole } from "@/lib/db/models/User";
import Notification from "@/lib/db/models/Notification";
import { getCurrentUser } from "@/lib/auth/session";
import { isNGOAdmin } from "@/lib/auth/roles";
import { sendEmail } from "@/lib/email/mailer";

export async function POST(req: Request) {
  try {
    const admin = await getCurrentUser();
    if (!admin || !isNGOAdmin(admin.role)) {
      return NextResponse.json({ error: "Unauthorized. NGO or Super Admin only." }, { status: 403 });
    }

    const { profileId, decision, notes } = await req.json(); // decision: "APPROVED" | "REJECTED"

    if (!profileId || !decision) {
      return NextResponse.json({ error: "profileId and decision are required" }, { status: 400 });
    }

    await connectDB();
    const profile = await VolunteerProfile.findById(profileId).populate("userId");
    if (!profile) {
      return NextResponse.json({ error: "Volunteer profile not found" }, { status: 404 });
    }

    profile.status = decision;
    profile.notes = notes;
    profile.approvedBy = admin._id;
    profile.approvedAt = new Date();
    await profile.save();

    const targetUser = await User.findById(profile.userId);
    if (targetUser && decision === "APPROVED") {
      // Map category to user role
      let assignedRole: UserRole = "RESCUE_VOLUNTEER";
      if (profile.category === "MEDICAL") assignedRole = "MEDICAL_VOLUNTEER";
      else if (profile.category === "FOOD") assignedRole = "FOOD_VOLUNTEER";
      else if (profile.category === "SHELTER") assignedRole = "SHELTER_VOLUNTEER";
      else if (profile.category === "GENERAL") assignedRole = "GENERAL_VOLUNTEER";

      targetUser.role = assignedRole;
      await targetUser.save();

      // Send In-app notification
      await Notification.create({
        recipientUserId: targetUser._id,
        title: "🎉 Congratulations! Volunteer Application Approved",
        message: `Your application as an Animal ${profile.category} Volunteer has been approved. You can now accept emergency assignments!`,
        type: "VOLUNTEER_VERIFICATION",
        link: "/volunteer/dashboard",
        priority: "HIGH",
      });

      // Send Email
      sendEmail({
        to: targetUser.email,
        recipientName: targetUser.fullName,
        template: "VOLUNTEER_APPROVAL",
        data: {
          recipientName: targetUser.fullName,
          customMessage: `Your volunteer application has been formally verified and approved by ${admin.fullName}. You have been granted ${assignedRole} privileges. Welcome to the frontline of animal rescue!`,
          actionUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/volunteer/dashboard`,
        },
      }).catch((e) => console.error("Volunteer approval email error:", e));
    }

    return NextResponse.json({
      message: `Volunteer application marked as ${decision}`,
      profile,
    });
  } catch (err: any) {
    console.error("Volunteer verification error:", err);
    return NextResponse.json({ error: err.message || "Failed to verify volunteer" }, { status: 500 });
  }
}
