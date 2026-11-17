"use client";

import React, { useEffect, useState } from "react";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import { Settings, Building, Save, CheckCircle2 } from "lucide-react";

export default function NGOSettingsPage() {
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [saved, setSaved] = useState(false);

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
            <span className="text-xs font-black uppercase tracking-wider text-lavender-700 bg-lavender-100 px-3 py-1 rounded-full border border-lavender-200">
              NGO Configuration
            </span>
            <h1 className="text-3xl font-black text-foreground tracking-tight mt-2">
              Organization Profile & Operating Radius
            </h1>
            <p className="text-xs sm:text-sm text-foreground/75 mt-1">
              Configure organizational dispatch limits, partner veterinary clinics, and bank account details for donations.
            </p>
          </div>

          {saved && (
            <div className="p-4 rounded-2xl bg-mint-50 border border-mint-200 text-mint-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-mint-600 flex-shrink-0" />
              <span>NGO settings saved!</span>
            </div>
          )}

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-soft space-y-4">
            <h3 className="text-base font-black text-foreground">NGO Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground">NGO Name</label>
                <input
                  type="text"
                  defaultValue={currentUser?.ngo?.name || "Paws & Hope Animal Rescue Foundation"}
                  className="w-full p-2.5 rounded-xl border border-cream-300 bg-cream-50 text-xs font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground">Emergency Dispatch Phone</label>
                <input
                  type="text"
                  defaultValue={currentUser?.ngo?.phone || "+91 80 2525 8899"}
                  className="w-full p-2.5 rounded-xl border border-cream-300 bg-cream-50 text-xs font-bold"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setSaved(true);
                  setTimeout(() => setSaved(false), 3000);
                }}
                className="px-6 py-2.5 rounded-2xl bg-primary-500 text-white font-bold text-xs shadow hover:bg-primary-600 transition-colors"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
