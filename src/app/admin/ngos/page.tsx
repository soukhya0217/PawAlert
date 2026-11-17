"use client";

import React, { useEffect, useState } from "react";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import { Building, Phone, Mail, MapPin, CheckCircle2 } from "lucide-react";

export default function AdminNGOsPage() {
  const [ngos, setNgos] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/ngos")
      .then((r) => r.json())
      .then((d) => setNgos(d.ngos || []));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <DashboardSidebar role="SUPER_ADMIN" userName="Super Admin" />

        <div className="flex-1 space-y-6 w-full">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-lavender-700 bg-lavender-100 px-3 py-1 rounded-full border border-lavender-200">
              NGO Network
            </span>
            <h1 className="text-3xl font-black text-foreground tracking-tight mt-2">
              Partnering Shelter & NGO Organizations
            </h1>
            <p className="text-xs sm:text-sm text-foreground/75 mt-1">
              Isolated multi-tenant NGO organizations operating rescue fleets and shelter facilities.
            </p>
          </div>

          <div className="space-y-4">
            {ngos.map((ngo) => (
              <div key={ngo._id} className="bg-white rounded-3xl p-6 border border-cream-200 shadow-soft space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-foreground">{ngo.name}</h3>
                  <span className="px-3 py-0.5 rounded-full text-xs font-black bg-mint-100 text-mint-800">
                    {ngo.verificationStatus}
                  </span>
                </div>
                <p className="text-xs text-foreground/80">{ngo.description}</p>
                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-1">
                  <span>Reg: {ngo.registrationNumber}</span>
                  <span>Contact: {ngo.phone}</span>
                  <span>Inpatient Capacity: {ngo.shelterCapacity} beds</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
