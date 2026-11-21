"use client";

import React, { useEffect, useState } from "react";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import { PawPrint, MapPin, Clock, AlertTriangle, ExternalLink, Plus } from "lucide-react";
import { formatDate, formatTimeAgo } from "@/lib/utils";

export default function MyReportsPage() {
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReports = async () => {
      try {
        setLoading(true);
        const meRes = await fetch("/api/auth/me");
        const meData = await meRes.json();
        setCurrentUser(meData.user);

        if (meData.user) {
          const userParam = meData.user.id ? `reporterId=${meData.user.id}` : "";
          const emailParam = meData.user.email ? `&reporterEmail=${encodeURIComponent(meData.user.email)}` : "";
          const incRes = await fetch(`/api/incidents?${userParam}${emailParam}`);
          const incData = await incRes.json();
          setIncidents(incData.incidents || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <DashboardSidebar
          role={currentUser?.role || "PUBLIC_USER"}
          userName={currentUser?.fullName || "Guardian"}
        />

        <div className="flex-1 space-y-6 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-primary-700 bg-peach-100 px-3 py-1 rounded-full border border-peach-200">
                🐾 Incident Archive
              </span>
              <h1 className="text-3xl font-black text-foreground tracking-tight mt-2">
                My Reported Distressed Animals
              </h1>
              <p className="text-xs sm:text-sm text-foreground/75 mt-1">
                Real-time tracking of all cases you reported into the emergency rescue grid.
              </p>
            </div>

            <a
              href="/report"
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-red-500 to-primary-500 text-white font-black text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Report New Incident</span>
            </a>
          </div>

          {loading ? (
            <div className="py-20 text-center text-xs text-muted-foreground font-semibold">
              Loading your reports...
            </div>
          ) : incidents.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-cream-200 space-y-3">
              <span className="text-4xl">🐾</span>
              <h3 className="text-base font-black text-foreground">No reports found</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Whenever you encounter an animal in distress and file a report, it will be tracked live here.
              </p>
              <a
                href="/report"
                className="inline-block px-5 py-2.5 rounded-xl bg-primary-500 text-white font-bold text-xs shadow mt-2"
              >
                Report an Animal
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {incidents.map((inc) => (
                <div
                  key={inc._id}
                  className="bg-white rounded-3xl p-5 border border-cream-200 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:shadow-card transition-all"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={inc.images?.[0] || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=100&q=80"}
                      alt={inc.animalCategory}
                      className="w-16 h-16 rounded-2xl object-cover border border-cream-300 flex-shrink-0"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-peach-100 text-primary-700">
                          {inc.status.replace(/_/g, " ")}
                        </span>
                        <span className="text-xs font-bold text-muted-foreground">
                          {inc.incidentId}
                        </span>
                      </div>
                      <h3 className="text-base font-black text-foreground">{inc.animalCategory}</h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 line-clamp-1">
                        <MapPin className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
                        {inc.location?.address}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs font-bold text-foreground">
                        {inc.assignedVolunteerId ? (
                          <span className="text-mint-700">Rescuer: {inc.assignedVolunteerId.fullName}</span>
                        ) : (
                          <span className="text-red-600">Pending Assignment</span>
                        )}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {formatTimeAgo(inc.createdAt)}
                      </p>
                    </div>

                    <a
                      href={`/user/incident/${inc._id}`}
                      className="px-4 py-2 rounded-xl bg-peach-100 text-primary-800 font-bold text-xs hover:bg-peach-200 transition-colors flex items-center gap-1"
                    >
                      <span>Track Status</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
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
