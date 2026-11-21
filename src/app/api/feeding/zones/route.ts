import { NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import FeedingZone from "@/lib/db/models/FeedingZone";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET(req: Request) {
  try {
    await connectDB();
    const zones = await FeedingZone.find()
      .populate("assignedVolunteerIds", "fullName email mobile profileImage")
      .sort({ updatedAt: -1 });

    return NextResponse.json({ zones });
  } catch (err: any) {
    console.warn("[Feeding Zones GET] DB offline or query error:", err.message);
    return NextResponse.json({ zones: [] });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await req.json();
    const {
      zoneName,
      coordinates, // [lon, lat]
      address,
      landmark,
      estimatedAnimalCount,
      speciesPresent,
      hasWaterPoint,
      waterBowlCondition,
      dailyFoodKg,
      foodType,
      feedingTimeSlots,
      photos,
    } = body;

    if (!zoneName || !address) {
      return NextResponse.json({ error: "Zone name and address are required" }, { status: 400 });
    }

    await connectDB();

    const coords: [number, number] = coordinates && Array.isArray(coordinates) && coordinates.length === 2
      ? [parseFloat(coordinates[0]), parseFloat(coordinates[1])]
      : [77.5946, 12.9716];

    const zone = await FeedingZone.create({
      zoneName,
      location: {
        type: "Point",
        coordinates: coords,
        address,
        landmark,
      },
      estimatedAnimalCount: estimatedAnimalCount || 6,
      speciesPresent: speciesPresent || ["Dog"],
      hasWaterPoint: hasWaterPoint !== false,
      waterBowlCondition: waterBowlCondition || "CLEAN",
      dailyFoodKg: dailyFoodKg || 4,
      foodType: foodType || "Boiled Rice, Eggs & Kibble",
      feedingTimeSlots: feedingTimeSlots || ["07:30 AM", "06:30 PM"],
      assignedVolunteerIds: [user._id],
      ngoId: user.ngoId,
      photos: photos || [
        "https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=600&q=80",
      ],
    });

    return NextResponse.json(
      { message: "Feeding zone successfully created", zone },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Create feeding zone error:", err);
    return NextResponse.json({ error: err.message || "Failed to create zone" }, { status: 500 });
  }
}
