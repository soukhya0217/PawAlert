import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import connectDB from "@/lib/db/connect";
import VolunteerProfile from "@/lib/db/models/VolunteerProfile";
import NGO from "@/lib/db/models/NGO";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ user: null });
    }

    let volunteerProfile = null;
    let ngo = null;

    try {
      await connectDB();
      volunteerProfile = await VolunteerProfile.findOne({ userId: user._id });
      if (user.ngoId) {
        ngo = await NGO.findById(user.ngoId);
      }
    } catch {
      // Database optional for session resolution
    }

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        mobile: user.mobile || "",
        city: user.city || "Bangalore",
        address: user.address || "",
        location: user.location,
        profileImage: user.profileImage,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        volunteerProfile,
        ngo,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ user: null });
  }
}
