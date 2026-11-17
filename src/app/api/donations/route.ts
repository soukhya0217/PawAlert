import { NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import Donation from "@/lib/db/models/Donation";
import { getCurrentUser } from "@/lib/auth/session";
import { sendEmail } from "@/lib/email/mailer";

function generateReceiptNumber(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `REC-${year}-${rand}`;
}

export async function GET(req: Request) {
  try {
    await connectDB();
    const donations = await Donation.find({ paymentStatus: "COMPLETED" })
      .sort({ createdAt: -1 })
      .limit(50);

    const totalRaised = await Donation.aggregate([
      { $match: { paymentStatus: "COMPLETED" } },
      { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]);

    return NextResponse.json({
      donations,
      summary: {
        totalAmount: totalRaised[0]?.total || 0,
        totalDonors: totalRaised[0]?.count || 0,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch donations" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();

    const {
      amount,
      donorName,
      donorEmail,
      donorPhone,
      panNumber,
      isAnonymous,
      campaignTitle,
      category,
      message,
    } = body;

    if (!amount || amount <= 0 || !donorName || !donorEmail) {
      return NextResponse.json(
        { error: "Valid donation amount, donor name, and email are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const receiptNumber = generateReceiptNumber();
    const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    const donation = await Donation.create({
      receiptNumber,
      donorUserId: user ? user._id : undefined,
      donorName: isAnonymous ? "Kind Guardian" : donorName,
      donorEmail,
      donorPhone,
      panNumber,
      isAnonymous: isAnonymous || false,
      amount: parseFloat(amount),
      currency: "INR",
      campaignTitle: campaignTitle || "Emergency Animal Rescue & Care Fund",
      category: category || "EMERGENCY_MEDICAL",
      paymentGateway: "MOCK_GATEWAY",
      paymentId,
      paymentStatus: "COMPLETED",
      message,
      isTaxExempt80G: true,
    });

    // Send instant confirmation email with receipt
    sendEmail({
      to: donorEmail,
      recipientName: isAnonymous ? "Animal Ally" : donorName,
      template: "DONATION_CONFIRMATION",
      data: {
        recipientName: isAnonymous ? "Kind Ally" : donorName,
        amount: donation.amount,
        receiptNumber: donation.receiptNumber,
        actionUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/donate?receipt=${donation.receiptNumber}`,
      },
    }).catch((e) => console.error("Donation email error:", e));

    return NextResponse.json(
      {
        message: "Thank you for your life-saving gift! A digital 80G receipt has been emailed to you.",
        donation,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Donation processing error:", err);
    return NextResponse.json({ error: err.message || "Failed to process donation" }, { status: 500 });
  }
}
