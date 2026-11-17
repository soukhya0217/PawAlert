"use client";

import React, { useEffect, useState } from "react";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import { Building, Phone, Mail, Users, CheckCircle2 } from "lucide-react";

export default function NGOSheltersPage() {
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
            <span className="text-xs font-black uppercase tracking-wider text-lavender-700 bg-lavender-100 px-3 py-1 rounded-full border border-lavender-200">
              Inpatient Sanctuaries
            </span>
            <h1 className="text-3xl font-black text-foreground tracking-tight mt-2">
              Shelter & Trauma Inpatient Management
            </h1>
            <p className="text-xs sm:text-sm text-foreground/75 mt-1">
              Sanctuary ward capacity, quarantine status, and post-surgery rehabilitation beds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-cream-200 shadow-soft space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-foreground">
                  Paws & Hope Rehabilitation Sanctuary
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-mint-100 text-mint-800">
                  Operational
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-cream-100">
                  <span className="text-muted-foreground font-semibold">Total Capacity:</span>
                  <span className="font-bold text-foreground">60 Animal Beds</span>
                </div>
                <div className="flex justify-between py-1 border-b border-cream-100">
                  <span className="text-muted-foreground font-semibold">Current Occupancy:</span>
                  <span className="font-bold text-primary-600">28 Inpatients (46%)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-cream-100">
                  <span className="text-muted-foreground font-semibold">Quarantine Ward:</span>
                  <span className="font-bold text-mint-700">8 Available Beds</span>
                </div>
              </div>

              <div className="pt-2">
                <p className="text-xs font-bold text-muted-foreground mb-1.5">Specialized Facilities:</p>
                <div className="flex flex-wrap gap-1.5 text-[11px]">
                  <span className="px-2 py-0.5 bg-cream-100 rounded-lg">Surgical Trauma Theatre</span>
                  <span className="px-2 py-0.5 bg-cream-100 rounded-lg">Canine Hydrotherapy Pool</span>
                  <span className="px-2 py-0.5 bg-cream-100 rounded-lg">Avian Recovery Aviary</span>
                  <span className="px-2 py-0.5 bg-cream-100 rounded-lg">Cat Isolation Ward</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
