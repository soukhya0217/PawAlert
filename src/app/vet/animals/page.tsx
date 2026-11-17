"use client";

import React, { useEffect, useState } from "react";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import { PawPrint, Heart, Stethoscope, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function VetAnimalsPage() {
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [records, setRecords] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setCurrentUser(d.user));

    fetch("/api/medical")
      .then((r) => r.json())
      .then((d) => setRecords(d.records || []));
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
              Inpatient Wards
            </span>
            <h1 className="text-3xl font-black text-foreground tracking-tight mt-2">
              Assigned Animal Patients
            </h1>
            <p className="text-xs sm:text-sm text-foreground/75 mt-1">
              Active inpatients undergoing veterinary trauma stabilization, wound treatment, and orthopedic surgery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {records.map((r) => (
              <div key={r._id} className="bg-white rounded-3xl p-6 border border-cream-200 shadow-soft space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-foreground">
                    {r.animalId?.name || "Rescued Patient"}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-mint-100 text-mint-800">
                    {r.treatmentProgress}
                  </span>
                </div>
                <p className="text-xs text-foreground/80 font-medium">{r.diagnosis}</p>
                <div className="pt-2 border-t border-cream-100 text-[11px] text-muted-foreground flex justify-between">
                  <span>Admitted: {formatDate(r.createdAt)}</span>
                  <span className="font-bold text-mint-700">Follow-up: 3 days</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
