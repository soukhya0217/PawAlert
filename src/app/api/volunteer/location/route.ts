import { NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import VolunteerProfile from "@/lib/db/models/VolunteerProfile";
import { getCurrentUser } from "@/lib/auth/session";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await req.json();
    const { coordinates, address } = body;

    if (!Array.isArray(coordinates) || coordinates.length !== 2) {
      return NextResponse.json(
        { error: "Valid [longitude, latitude] coordinates are required" },
        { status: 400 }
      );
    }

    await connectDB();
    const profile = await VolunteerProfile.findOne({ userId: user._id });
    if (profile) {
      profile.serviceArea.coordinates = [Number(coordinates[0]), Number(coordinates[1])];
      if (address) {
        profile.serviceArea.address = address;
      }
      await profile.save();
    }

    return NextResponse.json({
      success: true,
      message: "Volunteer location updated successfully",
      coordinates,
      updatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("[Volunteer Location Error]:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update location" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();
    const activeVolunteers = await VolunteerProfile.find({
      status: "APPROVED",
      availability: "AVAILABLE",
    })
      .populate("userId", "fullName mobile email")
      .select("category vehicleType serviceArea");

    return NextResponse.json({
      volunteers: activeVolunteers,
      count: activeVolunteers.length,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch locations" },
      { status: 500 }
    );
  }
}
