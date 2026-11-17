"use client";

import React, { useEffect, useState } from "react";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  Mail,
  MapPin,
  Truck,
  Sparkles,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function NGOVolunteersManagementPage() {
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("PENDING_VERIFICATION");
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const loadVolunteers = async () => {
    try {
      setLoading(true);
      const meRes = await fetch("/api/auth/me");
      const meData = await meRes.json();
      setCurrentUser(meData.user);

      const res = await fetch("/api/volunteers");
      const data = await res.json();
      setVolunteers(data.volunteers || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVolunteers();
  }, []);

  const handleVerify = async (profileId: string, decision: "APPROVED" | "REJECTED") => {
    try {
      const res = await fetch("/api/volunteers/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId,
          decision,
          notes: decision === "APPROVED" ? "Approved by NGO field coordinator." : "Does not meet current intake criteria.",
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setActionSuccess(`Volunteer marked as ${decision}! Notification dispatched.`);
        loadVolunteers();
      } else {
        alert(data.error || "Failed to update volunteer");
      }
    } catch (e) {
      alert("Error processing verification");
    }
  };

  const filtered = volunteers.filter((v) => {
    if (activeTab === "ALL") return true;
    return v.status === activeTab;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <DashboardSidebar
          role={currentUser?.role || "NGO_ADMIN"}
          userName={currentUser?.fullName || "Coordinator"}
        />

        <div className="flex-1 space-y-6 w-full">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-peach-100 text-primary-700 text-xs font-black uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5" /> Verification Authority
            </div>
            <h1 className="text-3xl font-black text-foreground tracking-tight">
              Volunteer Verification & Onboarding
            </h1>
            <p className="text-xs sm:text-sm text-foreground/75 mt-1">
              Verify credentials, skills, service operating areas, and grant official rescue privileges.
            </p>
          </div>

          {actionSuccess && (
            <div className="p-4 rounded-2xl bg-mint-50 border border-mint-200 text-mint-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-mint-600 flex-shrink-0" />
              <span>{actionSuccess}</span>
            </div>
          )}

          {/* Filter Tabs */}
          <div className="flex gap-2 border-b border-cream-200 pb-2">
            {[
              { id: "PENDING_VERIFICATION", label: "Pending Review" },
              { id: "APPROVED", label: "Approved Volunteers" },
              { id: "REJECTED", label: "Rejected" },
              { id: "ALL", label: "All Applicants" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? "bg-primary-500 text-white shadow-sm"
                    : "text-muted-foreground hover:bg-cream-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Volunteer Applicants List */}
          {loading ? (
            <div className="py-16 text-center text-xs text-muted-foreground">Loading volunteer roster...</div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-cream-200">
              <p className="text-xs text-muted-foreground">No volunteers found for this filter tab.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((vol) => (
                <div
                  key={vol._id}
                  className="bg-white rounded-3xl p-6 border border-cream-200 shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={vol.userId?.profileImage || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80"}
                      alt="Applicant"
                      className="w-14 h-14 rounded-2xl object-cover border border-cream-300 flex-shrink-0"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-black text-foreground">
                          {vol.userId?.fullName || "Volunteer Candidate"}
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-peach-100 text-primary-700">
                          {vol.category} VOLUNTEER
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            vol.status === "APPROVED"
                              ? "bg-mint-100 text-mint-800"
                              : vol.status === "REJECTED"
                              ? "bg-red-100 text-red-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {vol.status.replace("_", " ")}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5" />
                          {vol.userId?.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5" />
                          {vol.userId?.mobile}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {vol.serviceArea?.address} (Radius: {vol.serviceArea?.radiusKm} km)
                        </span>
                      </div>

                      <div className="pt-2 flex flex-wrap gap-1.5">
                        {vol.skills?.map((sk: string, i: number) => (
                          <span
                            key={i}
                            className="px-2.5 py-0.5 rounded-lg bg-cream-100 text-foreground/80 text-[11px] font-semibold"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end md:self-center">
                    {vol.status === "PENDING_VERIFICATION" && (
                      <>
                        <button
                          onClick={() => handleVerify(vol._id, "APPROVED")}
                          className="px-4 py-2.5 rounded-xl bg-mint-600 text-white font-bold text-xs hover:bg-mint-700 shadow-sm transition-all flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Approve Volunteer</span>
                        </button>
                        <button
                          onClick={() => handleVerify(vol._id, "REJECTED")}
                          className="px-3.5 py-2.5 rounded-xl bg-red-100 text-red-700 font-bold text-xs hover:bg-red-200 transition-colors"
                        >
                          Decline
                        </button>
                      </>
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
