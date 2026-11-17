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

    await connectDB();
    const volunteerProfile = await VolunteerProfile.findOne({ userId: user._id });
    let ngo = null;
    if (user.ngoId) {
      ngo = await NGO.findById(user.ngoId);
    }

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        mobile: user.mobile,
        city: user.city,
        address: user.address,
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
