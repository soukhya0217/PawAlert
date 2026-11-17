"use client";

import React from "react";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import { Activity, TrendingUp, Users, Heart, AlertTriangle } from "lucide-react";

export default function AdminAnalyticsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <DashboardSidebar role="SUPER_ADMIN" userName="Super Admin" />

        <div className="flex-1 space-y-6 w-full">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-mint-800 bg-mint-100 px-3 py-1 rounded-full border border-mint-200">
              System Telemetry
            </span>
            <h1 className="text-3xl font-black text-foreground tracking-tight mt-2">
              Hotspot & Dispatch Velocity Analytics
            </h1>
            <p className="text-xs sm:text-sm text-foreground/75 mt-1">
              AI emergency hotspot density clustering, volunteer mobilization latencies, and resolution efficiency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-soft">
              <span className="text-2xl">🔥</span>
              <p className="text-3xl font-black text-red-600 mt-2">Koramangala & Indiranagar</p>
              <h4 className="text-xs font-bold text-muted-foreground mt-1">Top Emergency Hotspots</h4>
              <p className="text-[11px] text-muted-foreground mt-1">Highest frequency of traffic accident reports</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-soft">
              <span className="text-2xl">⚡</span>
              <p className="text-3xl font-black text-primary-600 mt-2">11.4 Mins</p>
              <h4 className="text-xs font-bold text-muted-foreground mt-1">Median Time to First Responder</h4>
              <p className="text-[11px] text-mint-700 font-bold mt-1">Well within 45-min SLA</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-soft">
              <span className="text-2xl">💖</span>
              <p className="text-3xl font-black text-mint-600 mt-2">96.8%</p>
              <h4 className="text-xs font-bold text-muted-foreground mt-1">Successful Case Closure Rate</h4>
              <p className="text-[11px] text-muted-foreground mt-1">Permanent audit verification</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
