import { NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import VolunteerProfile from "@/lib/db/models/VolunteerProfile";
import User from "@/lib/db/models/User";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const category = searchParams.get("category");

    const query: any = {};
    if (status && status !== "ALL") query.status = status;
    if (category && category !== "ALL") query.category = category;

    const volunteers = await VolunteerProfile.find(query)
      .sort({ createdAt: -1 })
      .populate("userId", "fullName email mobile city profileImage role")
      .populate("ngoAffiliationId", "name");

    return NextResponse.json({ volunteers });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch volunteers" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Please log in to apply as a volunteer" }, { status: 401 });
    }

    const body = await req.json();
    const {
      category,
      skills,
      serviceAreaAddress,
      coordinates,
      radiusKm,
      experienceYears,
      vehicleType,
      emergencyContact,
      preferredAnimalTypes,
    } = body;

    await connectDB();

    const existing = await VolunteerProfile.findOne({ userId: user._id });
    if (existing) {
      return NextResponse.json(
        { error: "You have already submitted a volunteer application. Current status: " + existing.status },
        { status: 409 }
      );
    }

    const coords: [number, number] = coordinates && Array.isArray(coordinates) && coordinates.length === 2
      ? [parseFloat(coordinates[0]), parseFloat(coordinates[1])]
      : user.location?.coordinates || [77.5946, 12.9716];

    const profile = await VolunteerProfile.create({
      userId: user._id,
      category: category || "RESCUE",
      status: "PENDING_VERIFICATION",
      skills: Array.isArray(skills) ? skills : [skills || "Animal First Aid"],
      serviceArea: {
        type: "Point",
        coordinates: coords,
        radiusKm: radiusKm || 15,
        address: serviceAreaAddress || user.city || "Bangalore",
      },
      availability: "AVAILABLE",
      experienceYears: experienceYears || 1,
      vehicleType: vehicleType || "TWO_WHEELER",
      emergencyContact: emergencyContact || user.mobile,
      preferredAnimalTypes: preferredAnimalTypes || ["Dog", "Cat"],
    });

    user.activeVolunteerProfileId = profile._id;
    await user.save();

    return NextResponse.json(
      {
        message: "Volunteer application submitted successfully! Pending NGO verification.",
        profile,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Volunteer apply error:", err);
    return NextResponse.json({ error: err.message || "Failed to submit application" }, { status: 500 });
  }
}
