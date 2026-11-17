"use client";

import React, { useEffect, useState } from "react";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import {
  AlertTriangle,
  MapPin,
  Clock,
  Shield,
  Search,
  Filter,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function NGOIncidentManagementPage() {
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const loadIncidents = async () => {
    try {
      setLoading(true);
      const meRes = await fetch("/api/auth/me");
      const meData = await meRes.json();
      setCurrentUser(meData.user);

      const res = await fetch("/api/incidents?limit=100");
      const data = await res.json();
      setIncidents(data.incidents || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  const filtered = incidents.filter((inc) => {
    if (statusFilter !== "ALL" && inc.status !== statusFilter) return false;
    if (priorityFilter !== "ALL" && inc.priority !== priorityFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchId = inc.incidentId?.toLowerCase().includes(q);
      const matchCat = inc.animalCategory?.toLowerCase().includes(q);
      const matchAddr = inc.location?.address?.toLowerCase().includes(q);
      if (!matchId && !matchCat && !matchAddr) return false;
    }
    return true;
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
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-black uppercase tracking-wider mb-2">
              <AlertTriangle className="w-3.5 h-3.5" /> Incident Command & Dispatch
            </div>
            <h1 className="text-3xl font-black text-foreground tracking-tight">
              Emergency Incident Management
            </h1>
            <p className="text-xs sm:text-sm text-foreground/75 mt-1">
              Oversee open alerts, enforce SLA deadlines, assign field teams, and track resolution outcomes.
            </p>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="bg-white p-4 rounded-3xl border border-cream-200 shadow-soft flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search incident ID, species, address..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-cream-300 bg-cream-50 text-xs"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Filter by incident status"
                className="px-3 py-2 rounded-xl border border-cream-300 bg-cream-50 text-xs font-bold text-foreground"
              >
                <option value="ALL">All Statuses</option>
                <option value="REPORTED">Reported (Pending Claim)</option>
                <option value="VOLUNTEER_ASSIGNED">Volunteer Assigned</option>
                <option value="VOLUNTEER_EN_ROUTE">En Route</option>
                <option value="RESCUE_IN_PROGRESS">Rescue in Progress</option>
                <option value="ANIMAL_RESCUED">Animal Rescued</option>
                <option value="TREATMENT_STARTED">Under Treatment</option>
                <option value="RESOLVED">Resolved & Closed</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                aria-label="Filter by incident priority"
                className="px-3 py-2 rounded-xl border border-cream-300 bg-cream-50 text-xs font-bold text-foreground"
              >
                <option value="ALL">All Priorities</option>
                <option value="CRITICAL">🚨 Critical</option>
                <option value="HIGH">⚠️ High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
          </div>

          {/* Incidents Table */}
          {loading ? (
            <div className="py-16 text-center text-xs text-muted-foreground">Retrieving incident roster...</div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-cream-200">
              <p className="text-xs text-muted-foreground">No incidents matched your query.</p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-cream-200 shadow-soft overflow-hidden">
              <div className="divide-y divide-cream-100">
                {filtered.map((inc) => (
                  <div
                    key={inc._id}
                    className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-cream-50/60 transition-colors"
                  >
                    <div className="flex items-center gap-3.5">
                      <img
                        src={inc.images?.[0] || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=100&q=80"}
                        alt={inc.animalCategory}
                        className="w-14 h-14 rounded-2xl object-cover border border-cream-300 flex-shrink-0"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              inc.priority === "CRITICAL"
                                ? "bg-red-100 text-red-700"
                                : "bg-peach-100 text-primary-700"
                            }`}
                          >
                            {inc.priority}
                          </span>
                          <span className="font-bold text-xs text-muted-foreground">{inc.incidentId}</span>
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-cream-100 text-foreground rounded-full">
                            {inc.status.replace(/_/g, " ")}
                          </span>
                        </div>

                        <h4 className="text-sm font-black text-foreground">{inc.animalCategory}</h4>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 line-clamp-1">
                          <MapPin className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
                          {inc.location?.address}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <div className="text-right hidden md:block">
                        <p className="text-xs font-bold text-foreground">
                          {inc.assignedVolunteerId ? inc.assignedVolunteerId.fullName : "Awaiting Rescuer"}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          Reported: {formatDate(inc.createdAt)}
                        </p>
                      </div>

                      <a
                        href={`/user/incident/${inc._id}`}
                        className="px-4 py-2 rounded-xl bg-peach-100 hover:bg-peach-200 text-primary-800 font-bold text-xs transition-colors flex items-center gap-1"
                      >
                        <span>Dispatch Case</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
