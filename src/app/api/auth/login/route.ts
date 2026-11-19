import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db/connect";
import User from "@/lib/db/models/User";
import VolunteerProfile from "@/lib/db/models/VolunteerProfile";
import { signJwt } from "@/lib/auth/jwt";
import { AUTH_COOKIE_NAME } from "@/lib/auth/session";
import { sendLoginEmail } from "@/lib/email/mailer";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Please provide both email and password" },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check volunteer profile if applicable
    let volProfileId: string | undefined = undefined;
    if (user.activeVolunteerProfileId) {
      volProfileId = user.activeVolunteerProfileId.toString();
    } else {
      const vol = await VolunteerProfile.findOne({ userId: user._id });
      if (vol) volProfileId = vol._id.toString();
    }

    const token = signJwt({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      ngoId: user.ngoId?.toString(),
      volunteerProfileId: volProfileId,
    });

    // Send Login Notification Email (debounced to avoid duplicates, non-blocking)
    sendLoginEmail(user.email, user.fullName).catch((err) =>
      console.error("[Login] Email notification error:", err)
    );

    const response = NextResponse.json({
      message: "Login successful",
      user: {
        id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        city: user.city,
        profileImage: user.profileImage,
        ngoId: user.ngoId?.toString(),
        volunteerProfileId: volProfileId,
      },
    });

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process login" },
      { status: 500 }
    );
  }
}
