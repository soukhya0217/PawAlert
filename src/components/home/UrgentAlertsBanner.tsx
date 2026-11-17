"use client";

import React, { useEffect, useState } from "react";
import { AlertTriangle, Clock, MapPin, ArrowRight, Shield } from "lucide-react";
import { formatTimeAgo } from "@/lib/utils";

interface UrgentIncident {
  _id: string;
  incidentId: string;
  animalCategory: string;
  priority: string;
  status: string;
  conditionDescription: string;
  location: { address: string; city: string };
  images: string[];
  createdAt: string;
  assignedVolunteerId?: any;
}

export default function UrgentAlertsBanner() {
  const [alerts, setAlerts] = useState<UrgentIncident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUrgent = async () => {
      try {
        const res = await fetch("/api/incidents?priority=CRITICAL&limit=4");
        const data = await res.json();
        if (data.incidents && data.incidents.length > 0) {
          setAlerts(data.incidents);
        } else {
          // Fallback to high priority if no critical
          const fallbackRes = await fetch("/api/incidents?limit=4");
          const fallbackData = await fallbackRes.json();
          setAlerts(fallbackData.incidents || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchUrgent();
  }, []);

  if (loading || alerts.length === 0) return null;

  return (
    <section className="bg-gradient-to-r from-red-500/10 via-peach-500/10 to-rose-500/10 py-6 border-y border-red-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
            </span>
            <h3 className="text-base font-black text-red-950 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              Active Emergency Alerts Requiring Volunteer Response
            </h3>
          </div>
          <a
            href="/map"
            className="text-xs font-bold text-red-700 hover:text-red-900 flex items-center gap-1"
          >
            View all on map <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {alerts.slice(0, 4).map((inc) => (
            <div
              key={inc._id}
              className="bg-white rounded-2xl p-4 border border-red-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-700">
                    {inc.priority}
                  </span>
                  <span className="text-[11px] font-bold text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTimeAgo(inc.createdAt)}
                  </span>
                </div>

                <h4 className="text-sm font-black text-foreground line-clamp-1">{inc.animalCategory}</h4>
                <p className="text-xs text-foreground/75 line-clamp-2 mt-1 leading-relaxed">
                  {inc.conditionDescription}
                </p>

                <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                  <span className="truncate">{inc.location?.address || "Address Pinpointed"}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-cream-100 flex items-center justify-between">
                <span className="text-[10px] font-bold text-muted-foreground">
                  {inc.assignedVolunteerId ? (
                    <span className="text-mint-600 font-bold">Assigned</span>
                  ) : (
                    <span className="text-red-600 font-black animate-pulse">Needs Rescuer!</span>
                  )}
                </span>
                <a
                  href={`/user/incident/${inc._id}`}
                  className="px-3 py-1 rounded-xl bg-peach-100 text-primary-700 font-bold text-xs hover:bg-peach-200 transition-colors"
                >
                  Inspect Case →
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
