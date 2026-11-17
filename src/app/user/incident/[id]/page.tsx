"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import RescueTimeline from "@/components/incidents/RescueTimeline";
import {
  AlertTriangle,
  MapPin,
  Clock,
  Shield,
  Phone,
  User,
  Heart,
  CheckCircle2,
  Camera,
  ArrowLeft,
  Navigation,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function IncidentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [incident, setIncident] = useState<any | null>(null);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Status transition form state
  const [nextStatus, setNextStatus] = useState("");
  const [statusNotes, setStatusNotes] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchIncident = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/incidents/${id}`);
      const data = await res.json();
      if (res.ok && data.incident) {
        setIncident(data.incident);
      } else {
        setErrorMsg(data.error || "Incident not found");
      }
    } catch (e: any) {
      setErrorMsg(e.message || "Failed to load incident");
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.user) setCurrentUser(data.user);
    } catch (e) {}
  };

  useEffect(() => {
    if (id) {
      fetchIncident();
      fetchCurrentUser();
    }
  }, [id]);

  const handleTakeResponsibility = async () => {
    try {
      const res = await fetch(`/api/incidents/${incident._id}/assign`, {
        method: "POST",
      });
      const data = await res.json();

      if (res.ok) {
        setActionSuccess("You have officially accepted responsibility for this case!");
        fetchIncident();
      } else {
        alert(data.error || "Could not assign case");
      }
    } catch (e) {
      alert("Error accepting case");
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nextStatus) return;

    try {
      setUpdatingStatus(true);
      const res = await fetch(`/api/incidents/${incident._id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: nextStatus,
          notes: statusNotes,
          evidenceImages: evidenceUrl ? [evidenceUrl] : [],
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setActionSuccess(`Status transitioned to ${nextStatus}!`);
        setStatusNotes("");
        setEvidenceUrl("");
        setNextStatus("");
        fetchIncident();
      } else {
        alert(data.error || "Failed to update status");
      }
    } catch (e) {
      alert("Error updating status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-muted-foreground mt-3 font-semibold">Retrieving rescue incident file...</p>
      </div>
    );
  }

  if (errorMsg || !incident) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-3xl bg-red-100 mx-auto flex items-center justify-center text-red-600 mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-foreground">Incident Record Not Found</h2>
        <p className="text-xs text-muted-foreground mt-2">{errorMsg || "The requested incident record does not exist."}</p>
        <button
          onClick={() => router.push("/map")}
          className="mt-6 px-6 py-2.5 rounded-2xl bg-primary-500 text-white font-bold text-xs shadow-md"
        >
          Return to Rescue Map
        </button>
      </div>
    );
  }

  const isAssigned = !!incident.assignedVolunteerId;
  const isAssignedToMe =
    currentUser && incident.assignedVolunteerId && currentUser.id === incident.assignedVolunteerId._id;
  const canUpdateStatus =
    currentUser &&
    (isAssignedToMe ||
      currentUser.role === "NGO_ADMIN" ||
      currentUser.role === "SUPER_ADMIN");

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-xs font-bold text-foreground/80 hover:text-primary-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-peach-100 text-primary-700 border border-peach-200">
            {incident.priority} Priority
          </span>
          <span className="text-xs font-bold text-muted-foreground">ID: {incident.incidentId}</span>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-mint-50 border border-mint-200 text-mint-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-mint-600 flex-shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Main Grid: Details Left, Timeline Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Case Information & Assigned Rescuer */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-cream-200 shadow-soft space-y-6">
            
            {/* Main Photo */}
            <div className="relative h-64 rounded-2xl overflow-hidden bg-cream-100">
              <img
                src={incident.images?.[0] || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80"}
                alt={incident.animalCategory}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider">
                {incident.animalCategory}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h2 className="text-xl font-black text-foreground">{incident.animalCategory}</h2>
              <p className="text-xs text-foreground/85 leading-relaxed bg-cream-50/80 p-3.5 rounded-2xl border border-cream-200">
                {incident.conditionDescription}
              </p>
            </div>

            {/* Geolocation */}
            <div className="space-y-1 text-xs">
              <div className="flex items-start gap-2 text-foreground/90">
                <MapPin className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">{incident.location?.address}</p>
                  {incident.location?.landmark && (
                    <p className="text-muted-foreground mt-0.5">Landmark: {incident.location.landmark}</p>
                  )}
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Coordinates: {incident.location?.coordinates?.[1]}, {incident.location?.coordinates?.[0]}
                  </p>
                </div>
              </div>
            </div>

            {/* Reporter details */}
            <div className="pt-4 border-t border-cream-100 text-xs space-y-1.5">
              <p className="font-bold text-muted-foreground uppercase tracking-wider text-[10px]">
                Reported By
              </p>
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground">{incident.reporterName}</span>
                <span className="text-muted-foreground">{incident.reporterPhone}</span>
              </div>
            </div>

            {/* Assigned Volunteer or Claim CTA */}
            <div className="pt-4 border-t border-cream-100">
              {isAssigned ? (
                <div className="p-4 rounded-2xl bg-mint-50 border border-mint-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        incident.assignedVolunteerId.profileImage ||
                        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80"
                      }
                      alt="Rescuer"
                      className="w-10 h-10 rounded-full object-cover border border-mint-300"
                    />
                    <div>
                      <p className="text-xs font-black text-foreground">{incident.assignedVolunteerId.fullName}</p>
                      <p className="text-[10px] text-mint-700 font-bold uppercase tracking-wider">
                        Assigned Rescuer
                      </p>
                    </div>
                  </div>

                  <a
                    href={`tel:${incident.assignedVolunteerId.mobile}`}
                    className="p-2 rounded-xl bg-white text-mint-700 border border-mint-200 hover:bg-mint-100 transition-colors"
                    title="Call volunteer"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 bg-red-50 rounded-2xl border border-red-200 text-xs text-red-800 font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 animate-pulse" />
                    <span>Case is unassigned! Nearest volunteers notified.</span>
                  </div>

                  <button
                    onClick={handleTakeResponsibility}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-red-500 via-primary-500 to-rose-600 text-white font-black text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Take Responsibility for this Rescue</span>
                  </button>
                </div>
              )}
            </div>

            {/* Advance Status Controls for Rescuer / Admin */}
            {canUpdateStatus && (
              <div className="pt-4 border-t border-cream-100 space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-primary-700">
                  Update Rescue Progression
                </h4>

                <form onSubmit={handleUpdateStatus} className="space-y-3">
                  <select
                    value={nextStatus}
                    onChange={(e) => setNextStatus(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-cream-300 bg-cream-50 text-xs font-bold"
                  >
                    <option value="">-- Choose Next Status --</option>
                    <option value="VOLUNTEER_EN_ROUTE">🚗 Volunteer En Route</option>
                    <option value="VOLUNTEER_REACHED">📍 Reached Site</option>
                    <option value="RESCUE_IN_PROGRESS">🛡️ Rescue In Progress</option>
                    <option value="ANIMAL_RESCUED">💖 Animal Safely Rescued</option>
                    <option value="TREATMENT_STARTED">🩺 Treatment Started</option>
                    <option value="RECOVERY_MONITORING">🌿 Recovery Monitoring</option>
                    <option value="RESOLVED">🎉 Resolved & Case Closed</option>
                  </select>

                  <input
                    type="text"
                    value={statusNotes}
                    onChange={(e) => setStatusNotes(e.target.value)}
                    placeholder="Milestone note / field observation..."
                    className="w-full p-2.5 rounded-xl border border-cream-300 bg-cream-50 text-xs"
                  />

                  <input
                    type="url"
                    value={evidenceUrl}
                    onChange={(e) => setEvidenceUrl(e.target.value)}
                    placeholder="Evidence photo URL (e.g. https://...)"
                    className="w-full p-2.5 rounded-xl border border-cream-300 bg-cream-50 text-xs"
                  />

                  <button
                    type="submit"
                    disabled={updatingStatus || !nextStatus}
                    className="w-full py-2.5 rounded-xl bg-primary-500 text-white font-bold text-xs shadow hover:bg-primary-600 transition-colors disabled:opacity-50"
                  >
                    {updatingStatus ? "Submitting Milestone..." : "Save Status Transition"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Stepper & Historical Audit Logs */}
        <div className="lg:col-span-7">
          <RescueTimeline
            currentStatus={incident.status}
            history={incident.statusHistory || []}
            priority={incident.priority}
            slaDeadline={incident.slaDeadline}
          />
        </div>

      </div>
    </div>
  );
}
