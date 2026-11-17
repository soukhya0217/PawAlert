"use client";

import React, { useEffect, useState } from "react";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import { AlertTriangle, MapPin, Clock, Shield, CheckCircle2, Navigation } from "lucide-react";
import { formatTimeAgo } from "@/lib/utils";

export default function AvailableAssignmentsPage() {
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const meRes = await fetch("/api/auth/me");
      const meData = await meRes.json();
      setCurrentUser(meData.user);

      const incRes = await fetch("/api/incidents?limit=50");
      const incData = await incRes.json();

      if (incData.incidents) {
        // Filter unassigned
        const unassigned = incData.incidents.filter(
          (i: any) => !i.assignedVolunteerId && i.status !== "RESOLVED"
        );
        setIncidents(unassigned);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  const handleClaim = async (incidentId: string) => {
    try {
      setClaimingId(incidentId);
      setStatusMsg(null);
      const res = await fetch(`/api/incidents/${incidentId}/assign`, {
        method: "POST",
      });
      const data = await res.json();

      if (res.ok) {
        setStatusMsg("Successfully assigned! Case is now locked to your profile.");
        loadAssignments();
      } else {
        alert(data.error || "Failed to claim case");
      }
    } catch (e) {
      alert("Error accepting case");
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <DashboardSidebar
          role={currentUser?.role || "RESCUE_VOLUNTEER"}
          userName={currentUser?.fullName || "Volunteer"}
        />

        <div className="flex-1 space-y-6 w-full">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-black uppercase tracking-wider mb-2">
              <AlertTriangle className="w-3.5 h-3.5" /> Emergency Dispatch Queue
            </div>
            <h1 className="text-3xl font-black text-foreground tracking-tight">
              Available Rescue Assignments
            </h1>
            <p className="text-xs sm:text-sm text-foreground/75 mt-1">
              Select any open emergency in your operating radius to claim responsibility and deploy.
            </p>
          </div>

          {statusMsg && (
            <div className="p-4 rounded-2xl bg-mint-50 border border-mint-200 text-mint-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-mint-600 flex-shrink-0" />
              <span>{statusMsg}</span>
            </div>
          )}

          {loading ? (
            <div className="p-16 text-center text-xs text-muted-foreground font-semibold">
              Scanning dispatch network for open incidents...
            </div>
          ) : incidents.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-cream-200">
              <span className="text-4xl">🎉</span>
              <h3 className="text-base font-black text-foreground mt-3">All Clear!</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                No unassigned emergencies currently waiting. Great job to the responder network!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {incidents.map((inc) => (
                <div
                  key={inc._id}
                  className="bg-white rounded-3xl p-5 border border-cream-200 shadow-soft flex flex-col justify-between hover:shadow-card transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-700">
                        {inc.priority} Priority
                      </span>
                      <span className="text-xs font-bold text-muted-foreground">
                        {inc.incidentId}
                      </span>
                    </div>

                    <div className="h-44 rounded-2xl overflow-hidden bg-cream-100 relative">
                      <img
                        src={inc.images?.[0] || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80"}
                        alt={inc.animalCategory}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3 text-peach-300" />
                        <span>Reported {formatTimeAgo(inc.createdAt)}</span>
                      </div>
                    </div>

                    <h3 className="text-base font-black text-foreground">{inc.animalCategory}</h3>
                    <p className="text-xs text-foreground/80 line-clamp-2 leading-relaxed">
                      {inc.conditionDescription}
                    </p>

                    <div className="flex items-start gap-1.5 text-xs text-muted-foreground pt-1">
                      <MapPin className="w-3.5 h-3.5 text-primary-500 flex-shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{inc.location?.address}</span>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-cream-100 flex items-center justify-between gap-3">
                    <a
                      href={`/user/incident/${inc._id}`}
                      className="px-4 py-2.5 rounded-xl bg-cream-100 hover:bg-cream-200 text-foreground font-bold text-xs transition-colors"
                    >
                      Case Details
                    </a>

                    <button
                      onClick={() => handleClaim(inc._id)}
                      disabled={claimingId === inc._id}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-primary-500 text-white font-black text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Shield className="w-3.5 h-3.5" />
                      <span>{claimingId === inc._id ? "Claiming..." : "Take Responsibility"}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
