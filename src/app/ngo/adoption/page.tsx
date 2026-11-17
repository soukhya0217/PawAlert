"use client";

import React, { useEffect, useState } from "react";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import { Heart, CheckCircle2, XCircle, Home, Phone, Mail, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function NGOAdoptionManagementPage() {
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const meRes = await fetch("/api/auth/me");
      const meData = await meRes.json();
      setCurrentUser(meData.user);

      const res = await fetch("/api/adoption/applications");
      const data = await res.json();
      setApplications(data.applications || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const handleUpdateStatus = async (appId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/adoption/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: appId,
          status: newStatus,
          notes: `Updated to ${newStatus} by NGO coordinator.`,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatusMsg(`Application marked as ${newStatus}!`);
        loadApplications();
      } else {
        alert(data.error || "Failed to update status");
      }
    } catch (e) {
      alert("Error updating status");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <DashboardSidebar
          role={currentUser?.role || "NGO_ADMIN"}
          userName={currentUser?.fullName || "Coordinator"}
        />

        <div className="flex-1 space-y-6 w-full">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-rose-700 bg-rose-100 px-3 py-1 rounded-full border border-rose-200">
              Forever Placements
            </span>
            <h1 className="text-3xl font-black text-foreground tracking-tight mt-2">
              Adoption Applications Review
            </h1>
            <p className="text-xs sm:text-sm text-foreground/75 mt-1">
              Verify prospective adoptive families, schedule home visits, and grant forever approvals.
            </p>
          </div>

          {statusMsg && (
            <div className="p-4 rounded-2xl bg-mint-50 border border-mint-200 text-mint-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-mint-600 flex-shrink-0" />
              <span>{statusMsg}</span>
            </div>
          )}

          {loading ? (
            <div className="py-20 text-center text-xs text-muted-foreground font-semibold">
              Loading applications...
            </div>
          ) : applications.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-cream-200 space-y-2">
              <span className="text-4xl">🏡</span>
              <h3 className="text-base font-black text-foreground">No applications currently in queue</h3>
              <p className="text-xs text-muted-foreground">Applications submitted on the public portal will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <div
                  key={app._id}
                  className="bg-white rounded-3xl p-6 border border-cream-200 shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-foreground">
                        {app.applicantName}
                      </span>
                      <span className="text-xs text-muted-foreground">applying for</span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-100 text-rose-800">
                        {app.listingId?.name || "Companion"}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-cream-100 text-foreground">
                        {app.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 font-semibold">
                        <Phone className="w-3.5 h-3.5" />
                        {app.applicantPhone}
                      </span>
                      <span className="flex items-center gap-1">
                        <Home className="w-3.5 h-3.5" />
                        {app.homeType} • {app.address}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Submitted {formatDate(app.createdAt)}
                      </span>
                    </div>

                    <p className="text-xs text-foreground/80 italic bg-cream-50 p-2.5 rounded-xl border border-cream-200">
                      Experience: "{app.petExperienceDetails}"
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center">
                    {app.status !== "APPROVED" && (
                      <button
                        onClick={() => handleUpdateStatus(app._id, "APPROVED")}
                        className="px-4 py-2 rounded-xl bg-mint-600 text-white font-bold text-xs hover:bg-mint-700 shadow-sm transition-all"
                      >
                        Approve Adoption
                      </button>
                    )}
                    {app.status !== "REJECTED" && (
                      <button
                        onClick={() => handleUpdateStatus(app._id, "REJECTED")}
                        className="px-3 py-2 rounded-xl bg-red-100 text-red-700 font-bold text-xs hover:bg-red-200 transition-colors"
                      >
                        Decline
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
