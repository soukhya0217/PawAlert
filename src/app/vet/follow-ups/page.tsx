"use client";

import React, { useEffect, useState } from "react";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import { ClipboardList, Clock, CheckCircle2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function VetFollowUpsPage() {
  const [currentUser, setCurrentUser] = useState<any | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setCurrentUser(d.user));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <DashboardSidebar
          role={currentUser?.role || "VETERINARIAN"}
          userName={currentUser?.fullName || "Veterinarian"}
        />

        <div className="flex-1 space-y-6 w-full">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-mint-800 bg-mint-100 px-3 py-1 rounded-full border border-mint-200">
              Schedules
            </span>
            <h1 className="text-3xl font-black text-foreground tracking-tight mt-2">
              Post-Op & Follow-up Consultations
            </h1>
            <p className="text-xs sm:text-sm text-foreground/75 mt-1">
              Upcoming suture removals, antibiotic re-checks, and orthopedic gait evaluations.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-cream-200 shadow-soft space-y-3">
            <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200 flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-foreground">Sheru (Indie Mix) • Maggot Wound Re-check</p>
                <p className="text-muted-foreground mt-0.5">Surgical debridement check & antiseptic re-dressing</p>
              </div>
              <span className="px-3 py-1 bg-peach-100 text-primary-800 font-bold rounded-full">
                Scheduled in 2 days
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
