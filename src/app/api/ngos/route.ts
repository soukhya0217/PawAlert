import { NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import NGO from "@/lib/db/models/NGO";
import User from "@/lib/db/models/User";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET() {
  try {
    await connectDB();
    const ngos = await NGO.find().populate("adminUserId", "fullName email mobile");
    return NextResponse.json({ ngos });
  } catch (err: any) {
    console.warn("[NGOs GET] DB offline or query error:", err.message);
    return NextResponse.json({ ngos: [] });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required to register NGO" }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      registrationNumber,
      email,
      phone,
      website,
      address,
      city,
      coordinates,
      description,
      shelterCapacity,
    } = body;

    if (!name || !registrationNumber || !email || !phone || !address) {
      return NextResponse.json(
        { error: "Name, registration number, email, phone, and address are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const existing = await NGO.findOne({ registrationNumber });
    if (existing) {
      return NextResponse.json({ error: "An NGO with this registration number already exists" }, { status: 409 });
    }

    const coords: [number, number] = coordinates && Array.isArray(coordinates) && coordinates.length === 2
      ? [parseFloat(coordinates[0]), parseFloat(coordinates[1])]
      : [77.5946, 12.9716];

    const ngo = await NGO.create({
      name,
      registrationNumber,
      email,
      phone,
      website,
      location: {
        type: "Point",
        coordinates: coords,
        address,
        city: city || "Bangalore",
      },
      description: description || "Dedicated to comprehensive animal welfare and emergency response.",
      adminUserId: user._id,
      shelterCapacity: shelterCapacity || 50,
      verificationStatus: "VERIFIED",
    });

    user.role = "NGO_ADMIN";
    user.ngoId = ngo._id;
    await user.save();

    return NextResponse.json(
      { message: "NGO registered successfully! You have been granted NGO_ADMIN access.", ngo },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Register NGO error:", err);
    return NextResponse.json({ error: err.message || "Failed to register NGO" }, { status: 500 });
  }
}
