import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db/connect";
import User from "@/lib/db/models/User";
import { signJwt } from "@/lib/auth/jwt";
import { AUTH_COOKIE_NAME } from "@/lib/auth/session";
import { sendEmail } from "@/lib/email/mailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fullName, email, mobile, password, city, address, coordinates, role } = body;

    if (!fullName || !email || !mobile || !password || !city) {
      return NextResponse.json(
        { error: "Please fill in all required fields (Name, Email, Mobile, Password, City)" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    await connectDB();

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email address already exists" },
        { status: 409 }
      );
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Default coordinates if not provided (e.g. Bangalore center)
    const coords: [number, number] = coordinates && Array.isArray(coordinates) && coordinates.length === 2
      ? [coordinates[0], coordinates[1]]
      : [77.5946, 12.9716];

    const newUser = await User.create({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      mobile: mobile.trim(),
      passwordHash,
      city: city.trim(),
      address: address?.trim() || `${city}, India`,
      location: {
        type: "Point",
        coordinates: coords,
      },
      role: role || "PUBLIC_USER",
      isEmailVerified: false,
    });

    // Send Welcome Email
    sendEmail({
      to: newUser.email,
      recipientName: newUser.fullName,
      template: "WELCOME",
      data: {
        recipientName: newUser.fullName,
        actionUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/user/dashboard`,
      },
    }).catch((err) => console.error("Welcome email trigger error:", err));

    // Sign JWT
    const token = signJwt({
      userId: newUser._id.toString(),
      email: newUser.email,
      role: newUser.role,
      fullName: newUser.fullName,
    });

    const response = NextResponse.json(
      {
        message: "Registration successful! Welcome to POWER ALERT.",
        user: {
          id: newUser._id.toString(),
          fullName: newUser.fullName,
          email: newUser.email,
          role: newUser.role,
          city: newUser.city,
        },
      },
      { status: 201 }
    );

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to complete registration" },
      { status: 500 }
    );
  }
}
