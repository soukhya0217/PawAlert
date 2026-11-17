"use client";

import React, { useEffect, useState } from "react";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import {
  AlertTriangle,
  PawPrint,
  Shield,
  Users,
  Building,
  CheckCircle2,
  Clock,
  MapPin,
  TrendingUp,
  FileText,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function NGODashboardPage() {
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNGOData = async () => {
      try {
        setLoading(true);
        const meRes = await fetch("/api/auth/me");
        const meData = await meRes.json();
        setCurrentUser(meData.user);

        const incRes = await fetch("/api/incidents?limit=100");
        const incData = await incRes.json();
        setIncidents(incData.incidents || []);

        const volRes = await fetch("/api/volunteers");
        const volData = await volRes.json();
        setVolunteers(volData.volunteers || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    loadNGOData();
  }, []);

  // Compute metrics
  const totalIncidents = incidents.length;
  const criticalCount = incidents.filter((i) => i.priority === "CRITICAL").length;
  const unassignedCount = incidents.filter((i) => !i.assignedVolunteerId && i.status !== "RESOLVED").length;
  const activeRescues = incidents.filter(
    (i) => i.assignedVolunteerId && !["RESOLVED", "UNABLE_TO_COMPLETE"].includes(i.status)
  ).length;
  const resolvedCount = incidents.filter((i) => i.status === "RESOLVED").length;
  const pendingVolunteers = volunteers.filter((v) => v.status === "PENDING_VERIFICATION").length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <DashboardSidebar
          role={currentUser?.role || "NGO_ADMIN"}
          userName={currentUser?.fullName || "NGO Coordinator"}
        />

        <div className="flex-1 space-y-8 w-full">
          {/* Top Banner */}
          <div className="bg-gradient-to-r from-lavender-100 via-peach-50 to-white p-8 rounded-3xl border border-lavender-200/80 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lavender-200 text-lavender-900 text-[11px] font-black uppercase tracking-wider mb-2">
                <Building className="w-3.5 h-3.5" /> NGO Operations Command
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-foreground">
                {currentUser?.ngo?.name || "Sanctuary Rescue Foundation"}
              </h1>
              <p className="text-xs sm:text-sm text-foreground/75 mt-1">
                Centralized shelter, fleet mobilization, trauma triage, and volunteer verification portal.
              </p>
            </div>

            <div className="flex gap-2">
              <a
                href="/ngo/incidents"
                className="px-4 py-2.5 rounded-2xl bg-primary-500 text-white font-bold text-xs shadow-md hover:bg-primary-600 transition-colors"
              >
                Dispatch Center
              </a>
              <a
                href="/ngo/volunteers"
                className="px-4 py-2.5 rounded-2xl bg-white border border-cream-300 font-bold text-xs text-foreground hover:bg-cream-100 transition-colors"
              >
                Verify ({pendingVolunteers})
              </a>
            </div>
          </div>

          {/* Operational Metrics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-cream-200 shadow-soft">
              <span className="text-xl">🚨</span>
              <p className="text-2xl font-black text-red-600 mt-1">{unassignedCount}</p>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mt-0.5">
                Unassigned Alerts
              </h4>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-cream-200 shadow-soft">
              <span className="text-xl">🚑</span>
              <p className="text-2xl font-black text-primary-600 mt-1">{activeRescues}</p>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mt-0.5">
                Active In-Field Rescues
              </h4>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-cream-200 shadow-soft">
              <span className="text-xl">✅</span>
              <p className="text-2xl font-black text-mint-600 mt-1">{resolvedCount}</p>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mt-0.5">
                Resolved & Healed
              </h4>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-cream-200 shadow-soft">
              <span className="text-xl">👥</span>
              <p className="text-2xl font-black text-lavender-600 mt-1">{volunteers.length}</p>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mt-0.5">
                Registered Rescuers
              </h4>
            </div>
          </div>

          {/* Critical Emergency Queue */}
          <div className="bg-white rounded-3xl p-6 border border-cream-200 shadow-soft space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-cream-100">
              <h3 className="text-base font-black text-foreground flex items-center gap-2">
                <span>⚠️</span> High SLA Critical Incidents Requiring Coordinator Oversight
              </h3>
              <a href="/ngo/incidents" className="text-xs font-bold text-primary-600 hover:underline">
                Manage all ({totalIncidents}) →
              </a>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs text-muted-foreground">Loading queue...</div>
            ) : incidents.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted-foreground">
                No active incidents in queue.
              </div>
            ) : (
              <div className="divide-y divide-cream-100">
                {incidents.slice(0, 6).map((inc) => (
                  <div
                    key={inc._id}
                    className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={inc.images?.[0] || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=100&q=80"}
                        alt={inc.animalCategory}
                        className="w-12 h-12 rounded-xl object-cover border border-cream-300"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              inc.priority === "CRITICAL"
                                ? "bg-red-100 text-red-700"
                                : "bg-peach-100 text-primary-700"
                            }`}
                          >
                            {inc.priority}
                          </span>
                          <span className="font-bold text-muted-foreground">{inc.incidentId}</span>
                        </div>
                        <h4 className="text-sm font-black text-foreground mt-0.5">
                          {inc.animalCategory}
                        </h4>
                        <p className="text-muted-foreground line-clamp-1">{inc.location?.address}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <span className="font-bold text-foreground">
                        {inc.assignedVolunteerId ? (
                          <span className="text-mint-700 font-bold">
                            Rescuer: {inc.assignedVolunteerId.fullName}
                          </span>
                        ) : (
                          <span className="text-red-600 font-black">UNASSIGNED</span>
                        )}
                      </span>

                      <a
                        href={`/user/incident/${inc._id}`}
                        className="px-3.5 py-1.5 rounded-xl bg-peach-100 text-primary-800 font-bold hover:bg-peach-200 transition-colors"
                      >
                        Action →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
