"use client";

import React, { useEffect, useState } from "react";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import { PawPrint, MapPin, Clock, ExternalLink, CheckCircle2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function VolunteerMyCasesPage() {
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const meRes = await fetch("/api/auth/me");
        const meData = await meRes.json();
        setCurrentUser(meData.user);

        if (meData.user) {
          const incRes = await fetch(`/api/incidents?volunteerId=${meData.user.id}`);
          const incData = await incRes.json();
          setCases(incData.incidents || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <DashboardSidebar
          role={currentUser?.role || "RESCUE_VOLUNTEER"}
          userName={currentUser?.fullName || "Volunteer"}
        />

        <div className="flex-1 space-y-6 w-full">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-primary-700 bg-peach-100 px-3 py-1 rounded-full border border-peach-200">
              Active Roster
            </span>
            <h1 className="text-3xl font-black text-foreground tracking-tight mt-2">
              My Active & Past Rescue Cases
            </h1>
            <p className="text-xs sm:text-sm text-foreground/75 mt-1">
              All animal emergencies where you accepted responsibility and mobilized response.
            </p>
          </div>

          {loading ? (
            <div className="py-20 text-center text-xs text-muted-foreground font-semibold">
              Loading your cases...
            </div>
          ) : cases.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-cream-200 space-y-3">
              <span className="text-4xl">🚗</span>
              <h3 className="text-base font-black text-foreground">No active cases assigned</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Check available assignments in your service area to take responsibility.
              </p>
              <a
                href="/volunteer/assignments"
                className="inline-block px-5 py-2.5 rounded-xl bg-primary-500 text-white font-bold text-xs shadow mt-2"
              >
                Browse Available Assignments
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {cases.map((c) => (
                <div
                  key={c._id}
                  className="bg-white rounded-3xl p-5 border border-cream-200 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:shadow-card transition-all"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={c.images?.[0] || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=100&q=80"}
                      alt={c.animalCategory}
                      className="w-16 h-16 rounded-2xl object-cover border border-cream-300 flex-shrink-0"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-peach-100 text-primary-700">
                          {c.status.replace(/_/g, " ")}
                        </span>
                        <span className="text-xs font-bold text-muted-foreground">{c.incidentId}</span>
                      </div>
                      <h3 className="text-base font-black text-foreground">{c.animalCategory}</h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 line-clamp-1">
                        <MapPin className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
                        {c.location?.address}
                      </p>
                    </div>
                  </div>

                  <a
                    href={`/user/incident/${c._id}`}
                    className="px-4 py-2 rounded-xl bg-primary-500 text-white font-bold text-xs shadow hover:bg-primary-600 transition-colors flex items-center gap-1"
                  >
                    <span>Update Status & Timeline</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
