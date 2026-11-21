import { NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import MissingAnimal from "@/lib/db/models/MissingAnimal";
import { getCurrentUser } from "@/lib/auth/session";
import { matchMissingPetWithRescues } from "@/lib/ai/triage";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "MISSING";
    const species = searchParams.get("species");

    const query: any = {};
    if (status && status !== "ALL") query.status = status;
    if (species && species !== "ALL") query.species = species;

    const animals = await MissingAnimal.find(query).sort({ lostDate: -1 });

    return NextResponse.json({ missingAnimals: animals });
  } catch (err: any) {
    console.warn("[Missing Animals GET] DB offline or query error:", err.message);
    return NextResponse.json({ missingAnimals: [] });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();

    const {
      petName,
      species,
      breed,
      color,
      gender,
      age,
      distinctiveMarks,
      collarDescription,
      microchipNumber,
      photos,
      coordinates, // [lon, lat]
      address,
      city,
      lostDate,
      ownerName,
      ownerPhone,
      ownerEmail,
      rewardAmount,
    } = body;

    if (!petName || !species || !color || !photos || photos.length === 0 || !address) {
      return NextResponse.json(
        { error: "Pet name, species, color, photo, and last-seen address are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const coords: [number, number] = coordinates && Array.isArray(coordinates) && coordinates.length === 2
      ? [parseFloat(coordinates[0]), parseFloat(coordinates[1])]
      : [77.5946, 12.9716];

    const missing = await MissingAnimal.create({
      petName,
      species,
      breed: breed || "Mixed Breed",
      color,
      gender: gender || "Unknown",
      age,
      distinctiveMarks,
      collarDescription,
      microchipNumber,
      photos: Array.isArray(photos) ? photos : [photos],
      lastSeenLocation: {
        type: "Point",
        coordinates: coords,
        address,
        city: city || "Bangalore",
      },
      lostDate: lostDate ? new Date(lostDate) : new Date(),
      ownerUserId: user ? user._id : undefined,
      ownerName: ownerName || user?.fullName || "Pet Parent",
      ownerPhone: ownerPhone || user?.mobile || "Not specified",
      ownerEmail: ownerEmail || user?.email,
      rewardAmount: rewardAmount ? parseFloat(rewardAmount) : 0,
      status: "MISSING",
    });

    // Run AI matching against active rescue incidents
    const potentialMatches = await matchMissingPetWithRescues(missing._id.toString());

    return NextResponse.json(
      {
        message: "Missing pet broadcasted across community alert network!",
        missingAnimal: missing,
        potentialMatches,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Report missing pet error:", err);
    return NextResponse.json({ error: err.message || "Failed to submit missing report" }, { status: 500 });
  }
}
