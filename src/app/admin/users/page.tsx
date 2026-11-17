"use client";

import React, { useEffect, useState } from "react";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import { UserCheck, Shield, Mail, Phone } from "lucide-react";

export default function AdminUsersPage() {
  const [volunteers, setVolunteers] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/volunteers")
      .then((r) => r.json())
      .then((d) => setVolunteers(d.volunteers || []));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <DashboardSidebar role="SUPER_ADMIN" userName="Super Admin" />

        <div className="flex-1 space-y-6 w-full">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-primary-700 bg-peach-100 px-3 py-1 rounded-full border border-peach-200">
              Identity Management
            </span>
            <h1 className="text-3xl font-black text-foreground tracking-tight mt-2">
              Platform User & Rescuer Directory
            </h1>
            <p className="text-xs sm:text-sm text-foreground/75 mt-1">
              Complete account directory across Public, Volunteer, Veterinarian, and NGO Administrator tiers.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-cream-200 shadow-soft divide-y divide-cream-100 overflow-hidden">
            {volunteers.map((v) => (
              <div key={v._id} className="p-4 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <img
                    src={v.userId?.profileImage || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80"}
                    alt="User"
                    className="w-10 h-10 rounded-full object-cover border border-cream-300"
                  />
                  <div>
                    <p className="font-black text-foreground">{v.userId?.fullName}</p>
                    <p className="text-muted-foreground">{v.userId?.email} • {v.userId?.mobile}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-peach-100 text-primary-700">
                    {v.category}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-mint-100 text-mint-800">
                    {v.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
