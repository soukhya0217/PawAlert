import { NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import Incident from "@/lib/db/models/Incident";

export async function GET(
  _req: Request,
  { params }: { params: { trackingId: string } }
) {
  try {
    const { trackingId } = params;
    if (!trackingId) {
      return NextResponse.json({ error: "Tracking ID is required" }, { status: 400 });
    }

    await connectDB();

    // Check special 'live' alias for most recent case
    if (trackingId.toLowerCase() === "live") {
      const recent = await Incident.findOne()
        .sort({ createdAt: -1 })
        .populate("assignedVolunteerId", "fullName mobile email");
      return NextResponse.json({
        incident: recent || null,
        status: recent ? "FOUND" : "EMPTY",
      });
    }

    // Search by incidentId or _id
    let query: any = { incidentId: trackingId.trim().toUpperCase() };
    if (trackingId.match(/^[0-9a-fA-F]{24}$/)) {
      query = { $or: [{ incidentId: trackingId }, { _id: trackingId }] };
    }

    const incident = await Incident.findOne(query)
      .populate("assignedVolunteerId", "fullName mobile email");

    if (!incident) {
      return NextResponse.json(
        { error: `No active rescue case found matching "${trackingId}".` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      incident,
      trackingId: incident.incidentId,
      status: incident.status,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to query tracking status" },
      { status: 500 }
    );
  }
}
