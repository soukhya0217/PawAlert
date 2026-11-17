"use client";

import React, { useEffect, useState } from "react";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import { Settings, Shield, Bell, Lock, CheckCircle2 } from "lucide-react";

export default function UserSettingsPage() {
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
          role={currentUser?.role || "PUBLIC_USER"}
          userName={currentUser?.fullName || "Guardian"}
        />

        <div className="flex-1 space-y-6 w-full">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-primary-700 bg-peach-100 px-3 py-1 rounded-full border border-peach-200">
              Preferences
            </span>
            <h1 className="text-3xl font-black text-foreground tracking-tight mt-2">
              Notification & Security Settings
            </h1>
            <p className="text-xs sm:text-sm text-foreground/75 mt-1">
              Configure communication channels, privacy filters, and emergency broadcast alerts.
            </p>
          </div>

          {saved && (
            <div className="p-4 rounded-2xl bg-mint-50 border border-mint-200 text-mint-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-mint-600 flex-shrink-0" />
              <span>Settings saved!</span>
            </div>
          )}

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-soft space-y-6">
            <h3 className="text-base font-black text-foreground flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary-500" /> Emergency Alert Configuration
            </h3>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-peach-50/70 border border-peach-200 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-black text-foreground">🚨 Critical Trauma Animal Alerts</p>
                    <span className="text-[10px] font-black uppercase bg-primary-100 text-primary-800 px-2 py-0.5 rounded-full">
                      Mandatory
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Cannot be disabled. Life-saving road accident and trauma emergencies in your immediate vicinity.
                  </p>
                </div>
                <input type="checkbox" checked disabled className="w-4 h-4 accent-primary-500 cursor-not-allowed" />
              </div>

              <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-black text-foreground">Transactional Email Notifications</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Receive progress emails when your reported incident receives a volunteer, moves en route, or closes.
                  </p>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-primary-500 cursor-pointer" />
              </div>

              <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-black text-foreground">Daily Feeding Zone Reminders</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Notifications when community feeding bowls need replenishment.
                  </p>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-primary-500 cursor-pointer" />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setSaved(true);
                  setTimeout(() => setSaved(false), 3000);
                }}
                className="px-6 py-2.5 rounded-2xl bg-primary-500 text-white font-bold text-xs shadow hover:bg-primary-600 transition-colors"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
