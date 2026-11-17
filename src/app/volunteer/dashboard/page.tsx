"use client";

import React, { useEffect, useState } from "react";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import {
  AlertTriangle,
  PawPrint,
  CheckCircle2,
  Clock,
  MapPin,
  Shield,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { formatTimeAgo } from "@/lib/utils";

export default function VolunteerDashboardPage() {
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [emergencies, setEmergencies] = useState<any[]>([]);
  const [myCases, setMyCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const meRes = await fetch("/api/auth/me");
        const meData = await meRes.json();
        setCurrentUser(meData.user);

        // Fetch open emergencies
        const incRes = await fetch("/api/incidents?limit=20");
        const incData = await incRes.json();

        if (incData.incidents) {
          const openCases = incData.incidents.filter(
            (i: any) => !i.assignedVolunteerId && i.status !== "RESOLVED"
          );
          setEmergencies(openCases);

          if (meData.user) {
            const mine = incData.incidents.filter(
              (i: any) => i.assignedVolunteerId?._id === meData.user.id
            );
            setMyCases(mine);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Sidebar */}
        <DashboardSidebar
          role={currentUser?.role || "RESCUE_VOLUNTEER"}
          userName={currentUser?.fullName || "Volunteer"}
        />

        {/* Content Area */}
        <div className="flex-1 space-y-8 w-full">
          {/* Welcome Header */}
          <div className="bg-gradient-to-r from-peach-100 via-cream-50 to-white p-8 rounded-3xl border border-peach-200/80 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-peach-200/80 text-primary-800 text-[11px] font-black uppercase tracking-wider mb-2">
                <Shield className="w-3.5 h-3.5" /> Verified Frontline Guardian
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-foreground">
                Hello, {currentUser?.fullName || "Rescuer"}! 🐾
              </h1>
              <p className="text-xs sm:text-sm text-foreground/75 mt-1">
                {emergencies.length} distress cases currently waiting for volunteer assignment in your operating radius.
              </p>
            </div>

            <a
              href="/volunteer/assignments"
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-red-500 to-primary-500 text-white font-black text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Available Assignments ({emergencies.length})</span>
            </a>
          </div>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-soft">
              <span className="text-2xl">🚨</span>
              <p className="text-3xl font-black text-red-600 mt-2">{emergencies.length}</p>
              <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground mt-1">
                Open Emergencies
              </h3>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-soft">
              <span className="text-2xl">🚗</span>
              <p className="text-3xl font-black text-primary-600 mt-2">{myCases.length}</p>
              <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground mt-1">
                My Active Cases
              </h3>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-soft">
              <span className="text-2xl">🏆</span>
              <p className="text-3xl font-black text-mint-600 mt-2">
                {currentUser?.volunteerProfile?.totalRescuesCompleted || 34}
              </p>
              <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground mt-1">
                Total Completed Rescues
              </h3>
            </div>
          </div>

          {/* Urgent Cases Table */}
          <div className="bg-white rounded-3xl p-6 border border-cream-200 shadow-soft space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-cream-100">
              <h3 className="text-base font-black text-foreground flex items-center gap-2">
                <span>⚠️</span> Urgent Unassigned Distressed Animals
              </h3>
              <a
                href="/volunteer/assignments"
                className="text-xs font-bold text-primary-600 hover:underline"
              >
                View all →
              </a>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs text-muted-foreground">Loading cases...</div>
            ) : emergencies.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted-foreground">
                No unassigned emergencies in your sector. All reported animals have active responders!
              </div>
            ) : (
              <div className="space-y-3">
                {emergencies.slice(0, 5).map((inc) => (
                  <div
                    key={inc._id}
                    className="p-4 rounded-2xl bg-cream-50/70 border border-cream-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-cream-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={inc.images?.[0] || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=100&q=80"}
                        alt="Animal"
                        className="w-14 h-14 rounded-2xl object-cover border border-cream-300"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-700">
                            {inc.priority}
                          </span>
                          <span className="text-xs font-bold text-muted-foreground">
                            {inc.incidentId}
                          </span>
                        </div>
                        <h4 className="text-sm font-black text-foreground mt-0.5">
                          {inc.animalCategory}
                        </h4>
                        <p className="text-xs text-muted-foreground line-clamp-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-primary-500" />
                          {inc.location?.address}
                        </p>
                      </div>
                    </div>

                    <a
                      href={`/user/incident/${inc._id}`}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl bg-primary-500 text-white font-bold text-xs shadow-sm hover:bg-primary-600 transition-all text-center"
                    >
                      Inspect & Accept
                    </a>
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
