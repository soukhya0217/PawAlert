import { NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import MedicalRecord from "@/lib/db/models/MedicalRecord";
import Animal from "@/lib/db/models/Animal";
import Incident from "@/lib/db/models/Incident";
import { getCurrentUser } from "@/lib/auth/session";
import { isVet, isNGOAdmin } from "@/lib/auth/roles";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const animalId = searchParams.get("animalId");
    const incidentId = searchParams.get("incidentId");

    const query: any = {};
    if (animalId) query.animalId = animalId;
    if (incidentId) query.incidentId = incidentId;

    const records = await MedicalRecord.find(query)
      .sort({ createdAt: -1 })
      .populate("animalId")
      .populate("vetId", "fullName email mobile");

    return NextResponse.json({ records });
  } catch (err: any) {
    console.warn("[Medical Records GET] DB offline or query error:", err.message);
    return NextResponse.json({ records: [] });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (!isVet(user.role) && !isNGOAdmin(user.role))) {
      return NextResponse.json({ error: "Veterinarian or Admin authorization required" }, { status: 403 });
    }

    const body = await req.json();
    const {
      animalId,
      incidentId,
      clinicName,
      diagnosis,
      vitals,
      prescriptions,
      surgeries,
      vaccinations,
      medicalImages,
      followUpDate,
      treatmentProgress,
      generalNotes,
    } = body;

    if (!diagnosis || !clinicName) {
      return NextResponse.json({ error: "Clinic name and diagnosis are required" }, { status: 400 });
    }

    await connectDB();

    let targetAnimalId = animalId;
    if (!targetAnimalId && incidentId) {
      // Create or find Animal for this incident
      let animal = await Animal.findOne({ incidentId });
      if (!animal) {
        const inc = await Incident.findById(incidentId);
        animal = await Animal.create({
          name: `${inc?.animalCategory || "Rescued Animal"} #${inc?.incidentId || "Unknown"}`,
          species: inc?.animalCategory?.replace("Injured ", "") || "Canine",
          healthStatus: "UNDER_TREATMENT",
          incidentId,
          images: inc?.images || [],
        });
      }
      targetAnimalId = animal._id;
    }

    const record = await MedicalRecord.create({
      animalId: targetAnimalId,
      incidentId,
      vetId: user._id,
      clinicName: clinicName || "POWER ALERT Partner Veterinary Center",
      diagnosis,
      vitals: vitals || {},
      prescriptions: prescriptions || [],
      surgeries: surgeries || [],
      vaccinations: vaccinations || [],
      medicalImages: medicalImages || [],
      followUpDate: followUpDate ? new Date(followUpDate) : undefined,
      treatmentProgress: treatmentProgress || "IMPROVING",
      generalNotes,
    });

    // Update Incident with vet notes if incidentId provided
    if (incidentId) {
      await Incident.findByIdAndUpdate(incidentId, {
        vetNotes: `${diagnosis}. Progress: ${treatmentProgress || "Under Treatment"}`,
        assignedVetId: user._id,
      });
    }

    return NextResponse.json(
      { message: "Medical record recorded successfully", record },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Medical record error:", err);
    return NextResponse.json({ error: err.message || "Failed to save medical record" }, { status: 500 });
  }
}
