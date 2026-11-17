"use client";

import React, { useEffect, useState } from "react";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import {
  PawPrint,
  AlertTriangle,
  Heart,
  Clock,
  MapPin,
  CheckCircle2,
  Plus,
  ArrowRight,
  Shield,
} from "lucide-react";
import { formatTimeAgo, formatDate } from "@/lib/utils";

export default function UserDashboardPage() {
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [myIncidents, setMyIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        const meRes = await fetch("/api/auth/me");
        const meData = await meRes.json();
        setCurrentUser(meData.user);

        if (meData.user) {
          const incRes = await fetch(`/api/incidents?reporterId=${meData.user.id}`);
          const incData = await incRes.json();
          setMyIncidents(incData.incidents || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <DashboardSidebar
          role={currentUser?.role || "PUBLIC_USER"}
          userName={currentUser?.fullName || "Animal Guardian"}
        />

        <div className="flex-1 space-y-8 w-full">
          {/* Welcome Card */}
          <div className="bg-gradient-to-r from-peach-100 via-cream-50 to-white p-8 rounded-3xl border border-peach-200/80 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-primary-700 bg-peach-200/70 px-3 py-1 rounded-full">
                🐾 Animal Guardian Portal
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-foreground mt-2">
                Welcome back, {currentUser?.fullName || "Guardian"}!
              </h1>
              <p className="text-xs sm:text-sm text-foreground/75 mt-1 max-w-lg">
                Track your active distress alerts, follow veterinary rehabilitation progress, and connect with local rescuers.
              </p>
            </div>

            <a
              href="/report"
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-red-500 to-primary-500 text-white font-black text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Report Animal in Distress</span>
            </a>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-soft">
              <span className="text-2xl">📢</span>
              <p className="text-3xl font-black text-primary-600 mt-2">{myIncidents.length}</p>
              <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground mt-1">
                Total Incidents Reported
              </h3>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-soft">
              <span className="text-2xl">🚗</span>
              <p className="text-3xl font-black text-amber-600 mt-2">
                {myIncidents.filter((i) => i.status !== "RESOLVED").length}
              </p>
              <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground mt-1">
                Active Rescues in Progress
              </h3>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-soft">
              <span className="text-2xl">✅</span>
              <p className="text-3xl font-black text-mint-600 mt-2">
                {myIncidents.filter((i) => i.status === "RESOLVED").length}
              </p>
              <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground mt-1">
                Cases Safely Resolved
              </h3>
            </div>
          </div>

          {/* My Reported Incidents */}
          <div className="bg-white rounded-3xl p-6 border border-cream-200 shadow-soft space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-cream-100">
              <h3 className="text-base font-black text-foreground flex items-center gap-2">
                <span>🐾</span> My Recent Incident Reports ({myIncidents.length})
              </h3>
              <a href="/report" className="text-xs font-bold text-primary-600 hover:underline">
                + Report New Case
              </a>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs text-muted-foreground">Loading your reports...</div>
            ) : myIncidents.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <span className="text-4xl">🌱</span>
                <p className="text-xs text-muted-foreground font-semibold">
                  You have not submitted any animal reports yet.
                </p>
                <a
                  href="/report"
                  className="inline-block px-5 py-2.5 rounded-xl bg-primary-500 text-white font-bold text-xs shadow"
                >
                  Report First Emergency
                </a>
              </div>
            ) : (
              <div className="space-y-3">
                {myIncidents.map((inc) => (
                  <div
                    key={inc._id}
                    className="p-4 rounded-2xl bg-cream-50/70 border border-cream-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-cream-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={inc.images?.[0] || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=100&q=80"}
                        alt={inc.animalCategory}
                        className="w-14 h-14 rounded-2xl object-cover border border-cream-300"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-peach-100 text-primary-700">
                            {inc.status.replace(/_/g, " ")}
                          </span>
                          <span className="text-xs font-bold text-muted-foreground">
                            {inc.incidentId}
                          </span>
                        </div>
                        <h4 className="text-sm font-black text-foreground mt-0.5">
                          {inc.animalCategory}
                        </h4>
                        <p className="text-xs text-muted-foreground line-clamp-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-primary-500" />
                          {inc.location?.address}
                        </p>
                      </div>
                    </div>

                    <a
                      href={`/user/incident/${inc._id}`}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl bg-primary-500 text-white font-bold text-xs shadow-sm hover:bg-primary-600 transition-all text-center"
                    >
                      Live Tracking →
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Volunteer Application Promo if still Public User */}
          {currentUser?.role === "PUBLIC_USER" && (
            <div className="bg-gradient-to-r from-mint-50 to-cream-50 p-6 rounded-3xl border border-mint-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-sm font-black text-foreground flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-mint-600" /> Want to respond to nearby rescues?
                </h4>
                <p className="text-xs text-muted-foreground">
                  Apply to become a Verified Rescue, Medical, or Feeding Volunteer in your sector.
                </p>
              </div>

              <a
                href="/volunteer-register"
                className="px-5 py-2.5 rounded-2xl bg-mint-600 text-white font-bold text-xs shadow hover:bg-mint-700 transition-all flex-shrink-0"
              >
                Volunteer Application →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
