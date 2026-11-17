"use client";

import React, { useEffect, useState } from "react";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import { AlertTriangle, MapPin, Clock, ExternalLink } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function AdminIncidentsPage() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/incidents?limit=100")
      .then((r) => r.json())
      .then((d) => {
        setIncidents(d.incidents || []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <DashboardSidebar role="SUPER_ADMIN" userName="Super Admin" />

        <div className="flex-1 space-y-6 w-full">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-red-700 bg-red-100 px-3 py-1 rounded-full border border-red-200">
              Platform Watchdog
            </span>
            <h1 className="text-3xl font-black text-foreground tracking-tight mt-2">
              Cross-Network Incident Oversight
            </h1>
            <p className="text-xs sm:text-sm text-foreground/75 mt-1">
              Audit all emergency alerts across all regions, NGOs, and field responders.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-cream-200 shadow-soft divide-y divide-cream-100 overflow-hidden">
            {incidents.map((inc) => (
              <div key={inc._id} className="p-4 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground">{inc.incidentId}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-peach-100 text-primary-700">
                      {inc.priority}
                    </span>
                    <span className="text-muted-foreground">{inc.animalCategory}</span>
                  </div>
                  <p className="text-muted-foreground mt-0.5">{inc.location?.address}</p>
                </div>

                <a
                  href={`/user/incident/${inc._id}`}
                  className="px-3.5 py-1.5 rounded-xl bg-cream-100 hover:bg-cream-200 font-bold text-foreground transition-colors"
                >
                  View File →
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
