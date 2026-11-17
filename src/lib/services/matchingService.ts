import connectDB from "../db/connect";
import VolunteerProfile from "../db/models/VolunteerProfile";
import User from "../db/models/User";
import Incident from "../db/models/Incident";
import RescueAssignment from "../db/models/RescueAssignment";
import Notification from "../db/models/Notification";
import { sendEmail } from "../email/mailer";
import { calculateDistanceKm } from "../utils";

export async function findNearbyVolunteers(
  coordinates: [number, number], // [lon, lat]
  maxDistanceKm = 15
) {
  await connectDB();

  // Find active approved volunteers
  const profiles = await VolunteerProfile.find({
    status: "APPROVED",
    availability: "AVAILABLE",
  }).populate("userId", "fullName email mobile profileImage");

  const matched = [];

  for (const profile of profiles) {
    if (!profile.serviceArea || !profile.serviceArea.coordinates) continue;

    const vLon = profile.serviceArea.coordinates[0];
    const vLat = profile.serviceArea.coordinates[1];
    const distanceKm = calculateDistanceKm(coordinates[1], coordinates[0], vLat, vLon);

    const effectiveRadius = profile.serviceArea.radiusKm || maxDistanceKm;

    if (distanceKm <= effectiveRadius) {
      matched.push({
        profileId: profile._id.toString(),
        userId: profile.userId?._id?.toString(),
        fullName: (profile.userId as any)?.fullName || "Volunteer",
        email: (profile.userId as any)?.email,
        mobile: (profile.userId as any)?.mobile,
        category: profile.category,
        distanceKm,
        skills: profile.skills,
        vehicleType: profile.vehicleType,
      });
    }
  }

  // Sort by closest distance first
  matched.sort((a, b) => a.distanceKm - b.distanceKm);
  return matched;
}

export async function broadcastEmergencyToVolunteers(incident: any) {
  try {
    const nearby = await findNearbyVolunteers(incident.location.coordinates, 20);

    for (const vol of nearby) {
      if (!vol.userId) continue;

      // In-app notification
      await Notification.create({
        recipientUserId: vol.userId,
        title: `🚨 Emergency Near You: ${incident.animalCategory}`,
        message: `${incident.animalCategory} reported at ${incident.location.address} (~${vol.distanceKm} km away). Can you take responsibility?`,
        type: "EMERGENCY_ALERT",
        incidentId: incident._id,
        link: `/volunteer/assignments?incidentId=${incident._id}`,
        priority: incident.priority === "CRITICAL" ? "HIGH" : "NORMAL",
      });

      // Email dispatch if email available
      if (vol.email) {
        await sendEmail({
          to: vol.email,
          recipientName: vol.fullName,
          template: "EMERGENCY_ALERT",
          data: {
            recipientName: vol.fullName,
            incidentId: incident.incidentId,
            animalCategory: incident.animalCategory,
            locationAddress: incident.location.address,
            actionUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/volunteer/assignments?incidentId=${incident._id}`,
            customMessage: `An emergency ${incident.animalCategory} was reported ~${vol.distanceKm} km from your registered service area. Please open the link to accept assignment if available.`,
          },
        });
      }
    }

    return nearby.length;
  } catch (err) {
    console.error("Error broadcasting emergency to volunteers:", err);
    return 0;
  }
}

export async function takeResponsibilityAtomic(incidentId: string, volunteerUserId: string) {
  await connectDB();

  // Find volunteer profile
  const volunteer = await User.findById(volunteerUserId);
  if (!volunteer) {
    return { success: false, message: "Volunteer user not found" };
  }

  const profile = await VolunteerProfile.findOne({ userId: volunteerUserId });

  // Atomic lock: Only assign if assignedVolunteerId is still null
  const now = new Date();
  const updatedIncident = await Incident.findOneAndUpdate(
    {
      _id: incidentId,
      assignedVolunteerId: null,
      status: { $in: ["REPORTED", "VERIFICATION_PENDING", "VERIFIED"] },
    },
    {
      $set: {
        assignedVolunteerId: volunteer._id,
        assignedVolunteerProfileId: profile ? profile._id : undefined,
        assignedAt: now,
        acceptedAt: now,
        status: "VOLUNTEER_ASSIGNED",
      },
      $push: {
        statusHistory: {
          status: "VOLUNTEER_ASSIGNED",
          timestamp: now,
          updatedBy: volunteer._id,
          updaterRole: volunteer.role,
          notes: `Volunteer ${volunteer.fullName} accepted responsibility.`,
        },
      },
    },
    { new: true }
  );

  if (!updatedIncident) {
    return {
      success: false,
      message: "This case has already been accepted by another volunteer or is no longer open.",
    };
  }

  // Create Assignment Record
  await RescueAssignment.create({
    incidentId: updatedIncident._id,
    volunteerId: volunteer._id,
    ngoId: updatedIncident.assignedNgoId,
    status: "ACCEPTED",
    offeredAt: updatedIncident.createdAt,
    respondedAt: now,
    notes: "Accepted via Take Responsibility 1-click action.",
  });

  // Increment active case count
  if (profile) {
    await VolunteerProfile.findByIdAndUpdate(profile._id, {
      $inc: { activeCasesCount: 1 },
    });
  }

  // Notify Reporter
  if (updatedIncident.reporterId || updatedIncident.reporterEmail) {
    const reporterEmail = updatedIncident.reporterEmail;
    if (reporterEmail) {
      await sendEmail({
        to: reporterEmail,
        recipientName: updatedIncident.reporterName,
        template: "VOLUNTEER_ASSIGNED",
        data: {
          recipientName: updatedIncident.reporterName,
          incidentId: updatedIncident.incidentId,
          volunteerName: volunteer.fullName,
          actionUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/user/incident/${updatedIncident._id}`,
        },
      });
    }

    if (updatedIncident.reporterId) {
      await Notification.create({
        recipientUserId: updatedIncident.reporterId,
        title: "🐾 Rescuer Assigned to Your Report!",
        message: `${volunteer.fullName} has taken responsibility for incident #${updatedIncident.incidentId}.`,
        type: "VOLUNTEER_ASSIGNMENT",
        incidentId: updatedIncident._id,
        link: `/user/incident/${updatedIncident._id}`,
        priority: "HIGH",
      });
    }
  }

  return { success: true, incident: updatedIncident };
}
