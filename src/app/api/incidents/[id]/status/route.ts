import { NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import Incident, { IncidentStatus } from "@/lib/db/models/Incident";
import AuditLog from "@/lib/db/models/AuditLog";
import Notification from "@/lib/db/models/Notification";
import { getCurrentUser } from "@/lib/auth/session";
import { sendEmail, sendStatusUpdateNotification } from "@/lib/email/mailer";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();
    const { status, notes, evidenceImages, coordinates } = body;

    if (!status) {
      return NextResponse.json({ error: "New status is required" }, { status: 400 });
    }

    await connectDB();
    const incident = await Incident.findById(id);
    if (!incident) {
      return NextResponse.json({ error: "Incident not found" }, { status: 404 });
    }

    const previousStatus = incident.status;
    const now = new Date();

    incident.status = status as IncidentStatus;

    if (status === "VOLUNTEER_EN_ROUTE") incident.enRouteAt = now;
    if (status === "VOLUNTEER_REACHED") incident.reachedAt = now;
    if (status === "ANIMAL_RESCUED") incident.rescuedAt = now;
    if (status === "RESOLVED") {
      incident.resolvedAt = now;
      if (notes) incident.resolutionNotes = notes;
      if (evidenceImages) incident.closureEvidence = evidenceImages;
    }

    incident.statusHistory.push({
      status: status as IncidentStatus,
      timestamp: now,
      updatedBy: user._id,
      updaterRole: user.role,
      notes: notes || `Status transitioned to ${status}`,
      evidenceImages: evidenceImages || [],
      locationSnapshot: coordinates,
    });

    await incident.save();

    // Audit log
    await AuditLog.create({
      actorUserId: user._id,
      actorRole: user.role,
      action: "UPDATE_INCIDENT_STATUS",
      entityType: "INCIDENT",
      entityId: incident._id.toString(),
      previousState: { status: previousStatus },
      newState: { status },
      details: notes,
    });

    // Notify Reporter of status update
    const reporterEmail = incident.reporterEmail;
    if (reporterEmail) {
      try {
        await sendStatusUpdateNotification({
          to: reporterEmail,
          recipientName: incident.reporterName,
          incidentId: incident.incidentId,
          animalCategory: incident.animalCategory,
          previousStatus: previousStatus,
          newStatus: status,
          adminRemarks: notes,
        });
      } catch (e) {
        console.error("[Status Update] Email notification error:", e);
      }
    }

    if (incident.reporterId) {
      await Notification.create({
        recipientUserId: incident.reporterId,
        title: `🐾 Rescue Update: Case #${incident.incidentId}`,
        message: `Status updated to ${status.replace(/_/g, " ")}. ${notes || ""}`,
        type: "STATUS_UPDATE",
        incidentId: incident._id,
        link: `/user/incident/${incident._id}`,
      });
    }

    return NextResponse.json({
      message: `Status successfully updated to ${status}`,
      incident,
    });
  } catch (err: any) {
    console.error("Status update error:", err);
    return NextResponse.json({ error: err.message || "Failed to update status" }, { status: 500 });
  }
}
