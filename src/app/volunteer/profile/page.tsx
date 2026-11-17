"use client";

import React, { useEffect, useState } from "react";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import { ShieldCheck, User, CheckCircle2, Award, Truck, Heart } from "lucide-react";

export default function VolunteerProfilePage() {
  const [currentUser, setCurrentUser] = useState<any | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setCurrentUser(data.user);
      });
  }, []);

  const prof = currentUser?.volunteerProfile;

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
              Frontline Verification
            </span>
            <h1 className="text-3xl font-black text-foreground tracking-tight mt-2">
              Rescuer Profile & Credentials
            </h1>
            <p className="text-xs sm:text-sm text-foreground/75 mt-1">
              Your verified skill certifications, equipment availability, and NGO affiliation status.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-soft space-y-6">
            <div className="flex items-center gap-4 pb-6 border-b border-cream-100">
              <img
                src={currentUser?.profileImage || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"}
                alt="Profile"
                className="w-16 h-16 rounded-2xl object-cover border-2 border-mint-300"
              />
              <div>
                <h3 className="text-lg font-black text-foreground">{currentUser?.fullName}</h3>
                <span className="inline-block px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-mint-100 text-mint-800 mt-1">
                  Status: {prof?.status || "APPROVED"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200">
                <span className="text-muted-foreground text-xs font-bold">Category</span>
                <p className="text-base font-black text-foreground mt-0.5">
                  {prof?.category || "RESCUE"} VOLUNTEER
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200">
                <span className="text-muted-foreground text-xs font-bold">Transport Fleet</span>
                <p className="text-base font-black text-foreground mt-0.5">
                  {prof?.vehicleType || "TWO_WHEELER"}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200">
                <span className="text-muted-foreground text-xs font-bold">Rescues Completed</span>
                <p className="text-base font-black text-mint-700 mt-0.5">
                  {prof?.totalRescuesCompleted || 34} Animals
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                Certified Skills & Capabilities
              </h4>
              <div className="flex flex-wrap gap-2">
                {(prof?.skills || ["Animal Handling", "Trauma First Aid", "Catch Pole Restraint", "Night Dispatch"]).map(
                  (sk: string, i: number) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-xl bg-peach-50 border border-peach-200 text-primary-800 text-xs font-bold"
                    >
                      ✓ {sk}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
