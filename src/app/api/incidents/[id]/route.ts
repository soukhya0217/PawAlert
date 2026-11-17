import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db/connect";
import Incident from "@/lib/db/models/Incident";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const { id } = params;

    let incident;
    if (mongoose.Types.ObjectId.isValid(id)) {
      incident = await Incident.findById(id)
        .populate("assignedVolunteerId", "fullName email mobile profileImage role city")
        .populate("assignedNgoId", "name phone email logo address")
        .populate("assignedVetId", "fullName email mobile")
        .populate("statusHistory.updatedBy", "fullName role");
    } else {
      incident = await Incident.findOne({ incidentId: id })
        .populate("assignedVolunteerId", "fullName email mobile profileImage role city")
        .populate("assignedNgoId", "name phone email logo address")
        .populate("assignedVetId", "fullName email mobile")
        .populate("statusHistory.updatedBy", "fullName role");
    }

    if (!incident) {
      return NextResponse.json({ error: "Incident not found" }, { status: 404 });
    }

    return NextResponse.json({ incident });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch incident" }, { status: 500 });
  }
}
