"use client";

import React, { useEffect, useState } from "react";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import RescueMap from "@/components/map/RescueMap";
import { PawPrint, AlertTriangle, MapPin, Clock, ExternalLink } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function NGORescuesPage() {
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [rescues, setRescues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setCurrentUser(d.user));

    fetch("/api/incidents?limit=50")
      .then((r) => r.json())
      .then((d) => {
        if (d.incidents) {
          const inProgress = d.incidents.filter(
            (i: any) => i.assignedVolunteerId && i.status !== "RESOLVED"
          );
          setRescues(inProgress);
        }
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <DashboardSidebar
          role={currentUser?.role || "NGO_ADMIN"}
          userName={currentUser?.fullName || "Coordinator"}
        />

        <div className="flex-1 space-y-6 w-full">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-primary-700 bg-peach-100 px-3 py-1 rounded-full border border-peach-200">
              Active Operations
            </span>
            <h1 className="text-3xl font-black text-foreground tracking-tight mt-2">
              In-Field Mobilized Rescues
            </h1>
            <p className="text-xs sm:text-sm text-foreground/75 mt-1">
              Live monitoring of volunteer rescuers en route, on-site, and transporting distressed animals to trauma centers.
            </p>
          </div>

          <div className="space-y-4">
            {rescues.map((r) => (
              <div
                key={r._id}
                className="bg-white rounded-3xl p-5 border border-cream-200 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5">
                  <img
                    src={r.images?.[0] || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=100&q=80"}
                    alt={r.animalCategory}
                    className="w-14 h-14 rounded-2xl object-cover border border-cream-300 flex-shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-peach-100 text-primary-700">
                        {r.status.replace(/_/g, " ")}
                      </span>
                      <span className="text-xs font-bold text-muted-foreground">{r.incidentId}</span>
                    </div>
                    <h3 className="text-sm font-black text-foreground mt-0.5">{r.animalCategory}</h3>
                    <p className="text-xs text-mint-700 font-bold">
                      Rescuer: {r.assignedVolunteerId?.fullName} ({r.assignedVolunteerId?.mobile})
                    </p>
                  </div>
                </div>

                <a
                  href={`/user/incident/${r._id}`}
                  className="px-4 py-2 rounded-xl bg-primary-500 text-white font-bold text-xs shadow hover:bg-primary-600 transition-colors flex items-center gap-1"
                >
                  <span>Coordinate Case</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
