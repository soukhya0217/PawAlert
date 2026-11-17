import { NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import Incident from "@/lib/db/models/Incident";
import AuditLog from "@/lib/db/models/AuditLog";
import { getCurrentUser } from "@/lib/auth/session";
import { analyzeIncidentDescription, detectDuplicateIncidents } from "@/lib/ai/triage";
import { broadcastEmergencyToVolunteers } from "@/lib/services/matchingService";
import { sendEmail } from "@/lib/email/mailer";

function generateIncidentId(): string {
  const year = new Date().getFullYear();
  const randomPart = Math.floor(100000 + Math.random() * 900000);
  return `PA-${year}-${randomPart}`;
}

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const animalCategory = searchParams.get("category");
    const city = searchParams.get("city");
    const reporterId = searchParams.get("reporterId");
    const volunteerId = searchParams.get("volunteerId");
    const ngoId = searchParams.get("ngoId");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const query: any = {};

    if (status && status !== "ALL") query.status = status;
    if (priority && priority !== "ALL") query.priority = priority;
    if (animalCategory && animalCategory !== "ALL") query.animalCategory = animalCategory;
    if (city) query["location.city"] = new RegExp(city, "i");
    if (reporterId) query.reporterId = reporterId;
    if (volunteerId) query.assignedVolunteerId = volunteerId;
    if (ngoId) query.assignedNgoId = ngoId;

    if (search) {
      query.$or = [
        { incidentId: new RegExp(search, "i") },
        { conditionDescription: new RegExp(search, "i") },
        { "location.address": new RegExp(search, "i") },
        { reporterName: new RegExp(search, "i") },
      ];
    }

    const incidents = await Incident.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("assignedVolunteerId", "fullName email mobile profileImage role")
      .populate("assignedNgoId", "name phone logo");

    return NextResponse.json({ incidents, count: incidents.length });
  } catch (err: any) {
    console.error("GET /api/incidents error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch incidents" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();

    const {
      animalCategory,
      conditionDescription,
      priority: manualPriority,
      coordinates, // [longitude, latitude]
      address,
      landmark,
      city,
      images,
      videoUrl,
      reporterName,
      reporterPhone,
      reporterEmail,
    } = body;

    if (!animalCategory || !conditionDescription || !address || !images || images.length === 0) {
      return NextResponse.json(
        { error: "Animal category, condition, address, and at least one photograph are required." },
        { status: 400 }
      );
    }

    await connectDB();

    const coords: [number, number] = coordinates && Array.isArray(coordinates) && coordinates.length === 2
      ? [parseFloat(coordinates[0]), parseFloat(coordinates[1])]
      : [77.5946, 12.9716];

    // Run AI Triage Analysis
    const triage = analyzeIncidentDescription(conditionDescription, animalCategory);
    const resolvedPriority = manualPriority || triage.recommendedPriority || "HIGH";

    // Calculate SLA deadline
    const now = new Date();
    let slaMinutes = 120; // 2 hours default
    if (resolvedPriority === "CRITICAL") slaMinutes = 45;
    else if (resolvedPriority === "HIGH") slaMinutes = 90;
    else if (resolvedPriority === "MEDIUM") slaMinutes = 360;
    else if (resolvedPriority === "LOW") slaMinutes = 1440;

    const slaDeadline = new Date(now.getTime() + slaMinutes * 60 * 1000);

    // Duplicate check
    const duplicates = await detectDuplicateIncidents(coords, animalCategory, 6, 0.5);

    const incidentId = generateIncidentId();

    const newIncident = await Incident.create({
      incidentId,
      animalCategory,
      conditionDescription,
      priority: resolvedPriority,
      status: "REPORTED",
      location: {
        type: "Point",
        coordinates: coords,
        address,
        landmark,
        city: city || "City Center",
      },
      images: Array.isArray(images) ? images : [images],
      videoUrl,
      reporterId: user ? user._id : undefined,
      reporterName: reporterName || user?.fullName || "Anonymous Guardian",
      reporterPhone: reporterPhone || user?.mobile || "Not Provided",
      reporterEmail: reporterEmail || user?.email,
      slaDeadline,
      isEscalated: false,
      statusHistory: [
        {
          status: "REPORTED",
          timestamp: now,
          updatedBy: user ? user._id : undefined,
          updaterRole: user ? user.role : "PUBLIC",
          notes: `Incident reported. AI Priority Recommendation: ${resolvedPriority}. Action: ${triage.suggestedAction}`,
          locationSnapshot: coords,
        },
      ],
      aiTriage: {
        identifiedSpecies: triage.detectedSpecies,
        confidenceScore: triage.urgencyScore,
        severityTag: resolvedPriority,
        possibleDuplicateOf: duplicates.length > 0 ? duplicates[0].incidentId : undefined,
      },
    });

    // Create Audit Log
    await AuditLog.create({
      actorUserId: user ? user._id : undefined,
      actorRole: user ? user.role : "ANONYMOUS",
      action: "CREATE_INCIDENT",
      entityType: "INCIDENT",
      entityId: newIncident._id.toString(),
      newState: { incidentId, priority: resolvedPriority, address },
      details: `New emergency report created for ${animalCategory}`,
    });

    // Send confirmation email to reporter
    const notifyEmail = reporterEmail || user?.email;
    if (notifyEmail) {
      sendEmail({
        to: notifyEmail,
        recipientName: newIncident.reporterName,
        template: "INCIDENT_REPORTED",
        data: {
          recipientName: newIncident.reporterName,
          incidentId: newIncident.incidentId,
          animalCategory: newIncident.animalCategory,
          locationAddress: newIncident.location.address,
          actionUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/user/incident/${newIncident._id}`,
        },
      }).catch((e) => console.error("Report confirmation email error:", e));
    }

    // Broadcast in background to nearby volunteers
    broadcastEmergencyToVolunteers(newIncident).catch((e) =>
      console.error("Broadcast to volunteers error:", e)
    );

    return NextResponse.json(
      {
        message: "Emergency report successfully submitted! Rescuers are being mobilized.",
        incident: newIncident,
        possibleDuplicates: duplicates,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("POST /api/incidents error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to create incident report" },
      { status: 500 }
    );
  }
}
