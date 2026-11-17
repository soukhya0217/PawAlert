"use client";

import React, { useEffect, useState } from "react";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import { Stethoscope, FileText, Plus } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function VetMedicalRecordsPage() {
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
              Clinical Archive
            </span>
            <h1 className="text-3xl font-black text-foreground tracking-tight mt-2">
              Veterinary Medical Records & Prescriptions
            </h1>
          </div>

          <div className="space-y-4">
            {records.map((r) => (
              <div key={r._id} className="bg-white rounded-3xl p-6 border border-cream-200 shadow-soft space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black text-foreground">
                    {r.animalId?.name || "Patient Record"}
                  </h3>
                  <span className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</span>
                </div>
                <p className="text-xs text-foreground/90 font-medium">Diagnosis: {r.diagnosis}</p>
                <div className="p-3 bg-cream-50 rounded-xl border border-cream-200 text-xs">
                  <p className="font-bold text-foreground mb-1">Prescribed Pharmacotherapy:</p>
                  {r.prescriptions?.map((p: any, i: number) => (
                    <p key={i} className="text-muted-foreground">
                      • {p.medicineName} ({p.dosage}) - {p.frequency} for {p.durationDays} days
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
