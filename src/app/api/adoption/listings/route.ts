import { NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import AdoptionListing from "@/lib/db/models/AdoptionListing";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const species = searchParams.get("species");
    const status = searchParams.get("status") || "AVAILABLE";

    const query: any = {};
    if (status && status !== "ALL") query.status = status;
    if (species && species !== "ALL") query.species = species;

    const listings = await AdoptionListing.find(query)
      .sort({ featured: -1, createdAt: -1 })
      .populate("ngoId", "name phone logo");

    return NextResponse.json({ listings });
  } catch (err: any) {
    console.warn("[Adoptions GET] DB offline or query error:", err.message);
    return NextResponse.json({ listings: [] });
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
      name,
      species,
      breed,
      age,
      gender,
      size,
      goodWithKids,
      goodWithOtherPets,
      isVaccinated,
      isNeutered,
      story,
      personalityTraits,
      photos,
      location,
    } = body;

    if (!name || !species || !story || !photos || photos.length === 0) {
      return NextResponse.json(
        { error: "Name, species, story, and at least one photo are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const listing = await AdoptionListing.create({
      title: `${name} - ${breed || species} looking for forever home`,
      name,
      species,
      breed: breed || "Rescue Mix",
      age: age || "1 Year",
      gender: gender || "Male",
      size: size || "Medium",
      goodWithKids: goodWithKids !== false,
      goodWithOtherPets: goodWithOtherPets !== false,
      isVaccinated: isVaccinated !== false,
      isNeutered: isNeutered !== false,
      story,
      personalityTraits: personalityTraits || ["Affectionate", "Playful"],
      photos: Array.isArray(photos) ? photos : [photos],
      location: location || user.city || "Bangalore",
      ngoId: user.ngoId,
      status: "AVAILABLE",
    });

    return NextResponse.json(
      { message: "Adoption profile created successfully!", listing },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Create adoption listing error:", err);
    return NextResponse.json({ error: err.message || "Failed to create listing" }, { status: 500 });
  }
}
