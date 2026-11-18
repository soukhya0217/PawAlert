import { NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/db/connect";
import User from "@/lib/db/models/User";
import { sendEmail } from "@/lib/email/mailer";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
    }

    await connectDB();

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    // For security, even if user is not found, return generic success message to prevent user enumeration
    if (!user) {
      return NextResponse.json({
        message: "If an account exists with this email, password reset instructions have been dispatched.",
      });
    }

    // Generate secure random reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const tokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.passwordResetToken = resetToken;
    user.passwordResetExpires = tokenExpires;
    await user.save();

    // Construct reset action URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetUrl = `${appUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;

    // Dispatch Password Reset Email via mailer
    await sendEmail({
      to: user.email,
      recipientName: user.fullName,
      template: "PASSWORD_RESET",
      data: {
        recipientName: user.fullName,
        actionUrl: resetUrl,
        token: resetToken,
      },
    });

    console.log(`[PASSWORD RESET] Email dispatched to ${user.email} with token: ${resetToken}`);

    return NextResponse.json({
      message: "If an account exists with this email, password reset instructions have been dispatched.",
      previewResetUrl: process.env.NODE_ENV !== "production" ? resetUrl : undefined,
    });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process password recovery request." },
      { status: 500 }
    );
  }
}
