"use client";

import React, { useEffect, useState } from "react";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import { FileText, Download, TrendingUp, Heart, Shield, CheckCircle2 } from "lucide-react";

export default function NGOReportsPage() {
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
          role={currentUser?.role || "NGO_ADMIN"}
          userName={currentUser?.fullName || "Coordinator"}
        />

        <div className="flex-1 space-y-6 w-full">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-primary-700 bg-peach-100 px-3 py-1 rounded-full border border-peach-200">
              Accountability Analytics
            </span>
            <h1 className="text-3xl font-black text-foreground tracking-tight mt-2">
              Rescue Metrics & Impact Reports
            </h1>
            <p className="text-xs sm:text-sm text-foreground/75 mt-1">
              Export verified operational reports, donor fund utilization statistics, and volunteer response velocity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-soft space-y-2">
              <span className="text-2xl">📊</span>
              <p className="text-2xl font-black text-foreground mt-1">412 Rescues</p>
              <h4 className="text-xs font-bold text-muted-foreground">Annual Trauma Rescues</h4>
              <p className="text-[11px] text-mint-700 font-bold pt-1">94.2% successful recovery rate</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-soft space-y-2">
              <span className="text-2xl">⏱️</span>
              <p className="text-2xl font-black text-primary-600 mt-1">14.8 Mins</p>
              <h4 className="text-xs font-bold text-muted-foreground">Avg. SLA Arrival Time</h4>
              <p className="text-[11px] text-primary-700 font-bold pt-1">Down 22% vs previous quarter</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-soft space-y-2">
              <span className="text-2xl">💖</span>
              <p className="text-2xl font-black text-rose-600 mt-1">148 Adoptions</p>
              <h4 className="text-xs font-bold text-muted-foreground">Placed into Loving Homes</h4>
              <p className="text-[11px] text-rose-700 font-bold pt-1">Post-adoption check compliance 100%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
