"use client";

import React, { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";

const AdminMap = dynamic(() => import("@/components/admin-map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[520px] rounded-[24px] border-[3px] border-[#1E1B4B] dark:border-[#3B286D] bg-[#FFF1DC] dark:bg-[#17153B] flex flex-col items-center justify-center p-6 text-center shadow-pixar">
      <div className="h-12 w-12 rounded-[16px] bg-[#FF7A00] flex items-center justify-center text-white mb-3 shadow-pixar-sm">
        <Compass className="w-6 h-6 animate-spin" />
      </div>
      <p className="font-display font-bold text-sm text-[#1E1B4B] dark:text-[#FFF9F0]">
        Loading Command Map Stream...
      </p>
    </div>
  ),
});
import {
  Shield,
  Users,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Compass,
  MapPin,
  Sparkles,
  Phone,
  UserCheck,
  UserX,
  Send,
  Navigation,
  RefreshCw,
  Check,
  X
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { IncidentData } from "@/lib/use-recent-incidents";

type Incident = IncidentData;

interface Volunteer {
  _id: string;
  userId?: {
    _id: string;
    fullName: string;
    mobile: string;
    email: string;
  };
  category: string;
  status: string;
  vehicleType?: string;
  serviceAreaAddress?: string;
}

export default function AdminConsole() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [selectedVolunteerId, setSelectedVolunteerId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [incRes, volRes] = await Promise.all([
        fetch("/api/incidents?limit=100"),
        fetch("/api/volunteers"),
      ]);
      const incData = await incRes.json();
      const volData = await volRes.json();

      const fetchedIncidents = incData.incidents || [];
      setIncidents(fetchedIncidents);
      setVolunteers(volData.volunteers || []);

      if (fetchedIncidents.length > 0 && !selectedIncident) {
        setSelectedIncident(fetchedIncidents[0]);
      }
    } catch (e: any) {
      showToast("Failed to refresh command center data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 1. Status Transition API Call
  const handleStatusUpdate = async (incidentId: string, newStatus: string) => {
    try {
      setUpdatingId(incidentId);
      const res = await fetch(`/api/incidents/${incidentId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          notes: `Command Center status transition to ${newStatus}`,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast(`Case #${selectedIncident?.incidentId || incidentId} transitioned to ${newStatus.replace(/_/g, " ")}`);
        // Update local state immediately
        setIncidents((prev) =>
          prev.map((inc) => (inc._id === incidentId ? { ...inc, status: newStatus } : inc))
        );
        if (selectedIncident?._id === incidentId) {
          setSelectedIncident((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
      } else {
        showToast(data.error || "Failed to update status", "error");
      }
    } catch (e: any) {
      showToast(e.message || "Network error", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  // 2. Assign Volunteer API Call
  const handleAssignVolunteer = async () => {
    if (!selectedIncident || !selectedVolunteerId) {
      showToast("Please choose a volunteer to assign", "error");
      return;
    }

    try {
      setUpdatingId(selectedIncident._id);
      const res = await fetch(`/api/incidents/${selectedIncident._id}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ volunteerId: selectedVolunteerId }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast(`Case #${selectedIncident.incidentId} assigned successfully!`);
        loadData();
      } else {
        showToast(data.error || "Failed to assign volunteer", "error");
      }
    } catch (e: any) {
      showToast("Error communicating with dispatch mutex", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  // 3. Volunteer Verification Toggle
  const handleVerifyVolunteer = async (profileId: string, decision: "APPROVED" | "REJECTED") => {
    try {
      const res = await fetch("/api/volunteers/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId,
          decision,
          notes: `Verified by Administrator in Command Center`,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast(`Volunteer application marked as ${decision}`);
        setVolunteers((prev) =>
          prev.map((v) => (v._id === profileId ? { ...v, status: decision } : v))
        );
      } else {
        showToast(data.error || "Failed to update volunteer verification", "error");
      }
    } catch (e: any) {
      showToast("Verification request failed", "error");
    }
  };

  // 4. Live GPS Ping Update
  const handlePingGpsLocation = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const { latitude, longitude } = pos.coords;
            const res = await fetch("/api/volunteer/location", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                coordinates: [longitude, latitude],
                address: "Live Field Command GPS Coordinates",
              }),
            });
            if (res.ok) {
              showToast(`GPS Telemetry broadcasted: ${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E`);
            }
          } catch {
            showToast("Failed to transmit GPS coordinates", "error");
          }
        },
        () => {
          // Fallback simulation ping if user denies browser prompt
          fetch("/api/volunteer/location", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              coordinates: [77.5946, 12.9716],
              address: "HQ Sanctuary Central Hub (12.9716° N, 77.5946° E)",
            }),
          }).then(() => showToast("Default Sanctuary GPS Telemetry locked"));
        }
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification Banner */}
      {toast && (
        <div
          className={`fixed top-20 right-4 z-50 rounded-[18px] border-[3px] border-[#1E1B4B] p-4 text-xs font-display font-bold shadow-pixar flex items-center gap-2 animate-in fade-in slide-in-from-top-4 ${
            toast.type === "success"
              ? "bg-[#10B981] text-white"
              : "bg-[#EF4444] text-white"
          }`}
        >
          {toast.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 hover:opacity-75">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Command Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-[3px] border-[#1E1B4B] dark:border-[#3B286D] pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-[12px] border-[2px] border-[#1E1B4B] dark:border-[#3B286D] bg-[#FFB703] px-3 py-1 font-display text-xs font-black text-[#1E1B4B] shadow-pixar-sm mb-2">
            <span>🛡️</span>
            <span>ADMINISTRATIVE COMMAND CENTER</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-[#1E1B4B] dark:text-[#FFF9F0] tracking-tight">
            Field Dispatch & SLA Control
          </h1>
          <p className="text-xs sm:text-sm text-[#1E1B4B]/75 dark:text-[#FFF9F0]/80 mt-1 font-sans">
            Oversee live animal distress emergencies, dispatch nearby volunteers, verify responders, and audit SLA response milestones.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePingGpsLocation}
            className="pixar-btn bg-[#FFB703] text-[#1E1B4B] px-3.5 py-2 text-xs font-bold shadow-pixar-sm flex items-center gap-1.5"
            title="Broadcast Live GPS Ping"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Ping GPS</span>
          </button>

          <button
            onClick={loadData}
            disabled={loading}
            className="pixar-btn bg-[#FFF1DC] dark:bg-[#1E1B4B] text-[#1E1B4B] dark:text-[#FFF9F0] px-3.5 py-2 text-xs font-bold border-[2px] border-[#1E1B4B] dark:border-[#3B286D] shadow-pixar-sm flex items-center gap-1.5"
            title="Refresh Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Interactive Map + Action Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (7 cols): Leaflet Interactive Map */}
        <div className="lg:col-span-7 space-y-4">
          <div className="pixar-card p-3 sm:p-4 bg-[#FFF9F0] dark:bg-[#17153B] border-[3px] border-[#1E1B4B] dark:border-[#3B286D]">
            <div className="flex items-center justify-between px-2 pb-3 border-b-[2px] border-[#1E1B4B]/10 dark:border-white/10 mb-3">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#FF7A00]" />
                <span className="font-display text-xs font-bold text-[#1E1B4B] dark:text-[#FFF9F0]">
                  Live Tactical Grid (Click pins to inspect cases)
                </span>
              </div>
              <span className="font-mono text-[10px] text-[#FF7A00] font-bold">
                {incidents.length} ALERTS LOADED
              </span>
            </div>

            <AdminMap
              incidents={incidents}
              onSelectIncident={(inc) => setSelectedIncident(inc as Incident)}
              className="min-h-[460px]"
            />
          </div>
        </div>

        {/* Right Column (5 cols): Case Inspection & Status Controls */}
        <div className="lg:col-span-5 space-y-4">
          {selectedIncident ? (
            <div className="pixar-card p-5 sm:p-6 bg-[#FFF9F0] dark:bg-[#17153B] border-[3px] border-[#1E1B4B] dark:border-[#3B286D] space-y-4 shadow-pixar">
              <div className="flex items-center justify-between border-b-[2px] border-[#1E1B4B]/10 dark:border-white/10 pb-3">
                <div>
                  <span className="font-mono text-[10px] text-[#1E1B4B]/60 dark:text-[#FFF9F0]/60 uppercase tracking-wider block font-bold">
                    SELECTED CASE
                  </span>
                  <span className="font-mono text-base font-black text-[#FF7A00]">
                    #{selectedIncident.incidentId}
                  </span>
                </div>

                <span
                  className={`px-3 py-1 rounded-[12px] font-display text-[11px] font-black uppercase border-[2px] border-[#1E1B4B] dark:border-[#3B286D] shadow-pixar-sm ${
                    selectedIncident.priority === "CRITICAL"
                      ? "bg-[#EF4444] text-white"
                      : "bg-[#FFB703] text-[#1E1B4B]"
                  }`}
                >
                  {selectedIncident.priority} • {selectedIncident.status.replace(/_/g, " ")}
                </span>
              </div>

              {/* Animal & Condition */}
              <div className="space-y-1">
                <p className="font-display text-sm font-bold text-[#1E1B4B] dark:text-[#FFF9F0]">
                  🐾 {selectedIncident.animalCategory || "Animal in Distress"}
                </p>
                <p className="font-sans text-xs text-[#1E1B4B]/75 dark:text-[#FFF9F0]/80 leading-relaxed">
                  {selectedIncident.conditionDescription}
                </p>
                <div className="flex items-center gap-1.5 text-[11px] text-[#1E1B4B]/60 dark:text-[#FFF9F0]/60 font-mono mt-1">
                  <MapPin className="w-3.5 h-3.5 text-[#FF7A00] flex-shrink-0" />
                  <span className="truncate">{selectedIncident.location?.address || "Address recorded"}</span>
                </div>
              </div>

              {/* Status Transition Control Buttons */}
              <div className="pt-2 border-t-[2px] border-[#1E1B4B]/10 dark:border-white/10 space-y-2">
                <span className="font-display text-xs font-bold text-[#1E1B4B] dark:text-[#FFF9F0] block">
                  Update Mission Status:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleStatusUpdate(selectedIncident._id, "VOLUNTEER_EN_ROUTE")}
                    disabled={updatingId === selectedIncident._id}
                    className="pixar-btn bg-[#FF7A00] text-white p-2 text-[11px] font-bold shadow-pixar-sm disabled:opacity-50"
                  >
                    Dispatch En Route
                  </button>

                  <button
                    onClick={() => handleStatusUpdate(selectedIncident._id, "IN_TREATMENT")}
                    disabled={updatingId === selectedIncident._id}
                    className="pixar-btn bg-[#FFB703] text-[#1E1B4B] p-2 text-[11px] font-bold shadow-pixar-sm disabled:opacity-50"
                  >
                    In Treatment
                  </button>

                  <button
                    onClick={() => handleStatusUpdate(selectedIncident._id, "RESOLVED")}
                    disabled={updatingId === selectedIncident._id}
                    className="pixar-btn bg-[#10B981] text-white p-2 text-[11px] font-bold shadow-pixar-sm disabled:opacity-50"
                  >
                    Mark Rescued ✅
                  </button>
                </div>
              </div>

              {/* Volunteer Assignment Dropdown */}
              <div className="pt-3 border-t-[2px] border-[#1E1B4B]/10 dark:border-white/10 space-y-2">
                <span className="font-display text-xs font-bold text-[#1E1B4B] dark:text-[#FFF9F0] block">
                  Assign Volunteer Squad:
                </span>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedVolunteerId}
                    onChange={(e) => setSelectedVolunteerId(e.target.value)}
                    className="flex-1 rounded-[14px] border-[2px] border-[#1E1B4B] dark:border-[#3B286D] bg-[#FFF1DC] dark:bg-[#1E1B4B] p-2 text-xs font-sans text-[#1E1B4B] dark:text-[#FFF9F0]"
                  >
                    <option value="">Select verified responder...</option>
                    {volunteers
                      .filter((v) => v.status === "APPROVED")
                      .map((v) => (
                        <option key={v._id} value={v.userId?._id || v._id}>
                          {v.userId?.fullName || "Volunteer"} ({v.category} - {v.vehicleType || "Squad"})
                        </option>
                      ))}
                  </select>

                  <button
                    onClick={handleAssignVolunteer}
                    disabled={updatingId === selectedIncident._id || !selectedVolunteerId}
                    className="pixar-btn bg-[#1E1B4B] dark:bg-[#3B286D] text-white px-3.5 py-2 text-xs font-bold shadow-pixar-sm disabled:opacity-40"
                  >
                    Assign
                  </button>
                </div>
                {selectedIncident.assignedVolunteerId && (
                  <p className="text-[11px] font-mono text-[#10B981] font-bold mt-1">
                    ✓ Currently assigned to: {selectedIncident.assignedVolunteerId?.fullName || "Verified Volunteer"}
                  </p>
                )}
              </div>
            </div>
          ) : (
            /* Clean Empty State when 0 incidents exist */
            <div className="pixar-card p-6 bg-[#FFF9F0] dark:bg-[#17153B] border-[3px] border-[#1E1B4B] dark:border-[#3B286D] text-center space-y-3 shadow-pixar">
              <span className="text-3xl">🕊️</span>
              <h3 className="font-display text-base font-bold text-[#1E1B4B] dark:text-[#FFF9F0]">
                All quiet right now — Report an animal in need
              </h3>
              <p className="text-xs text-[#1E1B4B]/70 dark:text-[#FFF9F0]/70 font-sans">
                Zero active distress cases logged. All rescue ambulances are on standby.
              </p>
              <a
                href="/report"
                className="pixar-btn inline-flex items-center gap-1.5 rounded-[16px] bg-[#FF7A00] text-white px-4 py-2 text-xs font-bold shadow-pixar-sm"
              >
                <span>Submit Rescue Alert</span>
              </a>
            </div>
          )}

          {/* Volunteer Verification Widget */}
          <div className="pixar-card p-4 sm:p-5 bg-[#FFF9F0] dark:bg-[#17153B] border-[3px] border-[#1E1B4B] dark:border-[#3B286D] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b-[2px] border-[#1E1B4B]/10 dark:border-white/10">
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#10B981]" />
                <span className="font-display text-xs font-bold text-[#1E1B4B] dark:text-[#FFF9F0]">
                  Responder Roster ({volunteers.length})
                </span>
              </div>
              <span className="font-mono text-[10px] text-[#1E1B4B]/60 dark:text-[#FFF9F0]/60 font-bold">
                VERIFY APPLICANTS
              </span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {volunteers.length === 0 ? (
                <p className="text-xs text-[#1E1B4B]/60 dark:text-[#FFF9F0]/60 text-center py-3 font-sans">
                  Zero pending applicants.
                </p>
              ) : (
                volunteers.map((vol) => (
                  <div
                    key={vol._id}
                    className="p-2.5 rounded-[14px] border-[2px] border-[#1E1B4B]/15 dark:border-white/10 bg-[#FFF1DC] dark:bg-[#1E1B4B] flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-[#1E1B4B] dark:text-[#FFF9F0]">
                        {vol.userId?.fullName || "Applicant"}
                      </p>
                      <p className="text-[10px] text-[#1E1B4B]/70 dark:text-[#FFF9F0]/70 font-mono">
                        {vol.category} • {vol.status}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {vol.status !== "APPROVED" ? (
                        <button
                          onClick={() => handleVerifyVolunteer(vol._id, "APPROVED")}
                          className="pixar-btn bg-[#10B981] text-white p-1 rounded-[8px] text-[10px] font-bold"
                          title="Approve Volunteer"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <span className="text-[10px] text-[#10B981] font-bold">✓ Verified</span>
                      )}

                      {vol.status !== "REJECTED" && (
                        <button
                          onClick={() => handleVerifyVolunteer(vol._id, "REJECTED")}
                          className="pixar-btn bg-[#EF4444] text-white p-1 rounded-[8px] text-[10px] font-bold"
                          title="Reject Volunteer"
                        >
                          <UserX className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Incident Roster Table with Click to Fly Map */}
      <div className="pixar-card p-5 sm:p-6 bg-[#FFF9F0] dark:bg-[#17153B] border-[3px] border-[#1E1B4B] dark:border-[#3B286D] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b-[2px] border-[#1E1B4B]/10 dark:border-white/10">
          <h3 className="font-display text-sm font-bold text-[#1E1B4B] dark:text-[#FFF9F0] flex items-center gap-2">
            <span>📋</span> Active Distress Logs ({incidents.length})
          </h3>
          <span className="font-mono text-[10px] text-[#1E1B4B]/60 dark:text-[#FFF9F0]/60 font-bold">
            CLICK ROW TO FOCUS MAP PIN
          </span>
        </div>

        {incidents.length === 0 ? (
          <div className="text-center py-8 space-y-2">
            <span className="text-3xl">🐾</span>
            <p className="font-display text-xs font-bold text-[#1E1B4B] dark:text-[#FFF9F0]">
              All quiet right now — Report an animal in need
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="border-b-[2px] border-[#1E1B4B]/20 dark:border-white/15 text-[10px] font-mono text-[#1E1B4B]/70 dark:text-[#FFF9F0]/70 uppercase">
                  <th className="py-2.5 px-3">Case ID</th>
                  <th className="py-2.5 px-3">Animal</th>
                  <th className="py-2.5 px-3">Priority</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Location</th>
                  <th className="py-2.5 px-3">Reported</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E1B4B]/10 dark:divide-white/10">
                {incidents.map((inc) => {
                  const isSelected = selectedIncident?._id === inc._id;
                  return (
                    <tr
                      key={inc._id}
                      onClick={() => setSelectedIncident(inc)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-[#FFB703]/25 dark:bg-[#FBBF24]/20 font-bold"
                          : "hover:bg-[#FFF1DC] dark:hover:bg-[#1E1B4B]/60"
                      }`}
                    >
                      <td className="py-3 px-3 font-mono font-bold text-[#FF7A00]">
                        #{inc.incidentId}
                      </td>
                      <td className="py-3 px-3 font-display font-bold text-[#1E1B4B] dark:text-[#FFF9F0]">
                        {inc.animalCategory}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-[8px] text-[10px] font-black uppercase font-mono ${
                            inc.priority === "CRITICAL"
                              ? "bg-[#EF4444] text-white"
                              : "bg-[#FFB703] text-[#1E1B4B]"
                          }`}
                        >
                          {inc.priority}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-display font-bold text-[#1E1B4B] dark:text-[#FFF9F0]">
                        {inc.status.replace(/_/g, " ")}
                      </td>
                      <td className="py-3 px-3 text-[#1E1B4B]/75 dark:text-[#FFF9F0]/80 max-w-xs truncate">
                        {inc.location?.address || "Coordinates Logged"}
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-[#1E1B4B]/60 dark:text-[#FFF9F0]/60">
                        {formatDate(inc.createdAt)}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedIncident(inc);
                          }}
                          className="pixar-btn bg-[#1E1B4B] dark:bg-[#3B286D] text-white px-2.5 py-1 text-[10px] rounded-[8px] shadow-pixar-sm"
                        >
                          Focus
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
