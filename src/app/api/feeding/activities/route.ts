import { NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import FeedingActivity from "@/lib/db/models/FeedingActivity";
import FeedingZone from "@/lib/db/models/FeedingZone";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const zoneId = searchParams.get("zoneId");

    const query: any = {};
    if (zoneId) query.zoneId = zoneId;

    const activities = await FeedingActivity.find(query)
      .sort({ fedAt: -1 })
      .populate("volunteerId", "fullName email profileImage")
      .populate("zoneId", "zoneName location")
      .limit(50);

    return NextResponse.json({ activities });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch activities" }, { status: 500 });
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
      zoneId,
      foodGivenKg,
      waterRefilledLiters,
      animalsCounted,
      proofPhotos,
      notes,
      isWaterBowlCleaned,
      unusualObservations,
    } = body;

    if (!zoneId || !foodGivenKg || !animalsCounted) {
      return NextResponse.json(
        { error: "Zone, food quantity (kg), and number of animals fed are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const activity = await FeedingActivity.create({
      zoneId,
      volunteerId: user._id,
      fedAt: new Date(),
      foodGivenKg: parseFloat(foodGivenKg),
      waterRefilledLiters: waterRefilledLiters ? parseFloat(waterRefilledLiters) : 5,
      animalsCounted: parseInt(animalsCounted, 10),
      proofPhotos: proofPhotos || [
        "https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=600&q=80",
      ],
      notes,
      isWaterBowlCleaned: isWaterBowlCleaned !== false,
      unusualObservations,
    });

    // Update the FeedingZone record's lastFedAt timestamp
    await FeedingZone.findByIdAndUpdate(zoneId, {
      lastFedAt: new Date(),
      lastWaterRefilledAt: new Date(),
      waterBowlCondition: isWaterBowlCleaned ? "CLEAN" : "NEEDS_REFILL",
    });

    return NextResponse.json(
      { message: "Feeding activity logged successfully! Thank you for nourishing our street friends 🐾", activity },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Log feeding activity error:", err);
    return NextResponse.json({ error: err.message || "Failed to log activity" }, { status: 500 });
  }
}
