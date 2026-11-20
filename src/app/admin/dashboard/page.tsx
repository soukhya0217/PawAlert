"use client";

import React, { useEffect, useState } from "react";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import AdminMap from "@/components/admin-map";
import {
  Shield,
  Users,
  Building,
  AlertTriangle,
  Mail,
  Activity,
  CheckCircle2,
  Clock,
  Sparkles,
  FileText,
  Compass
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function SuperAdminDashboardPage() {
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [emailLogs, setEmailLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPlatformData = async () => {
      try {
        setLoading(true);
        const meRes = await fetch("/api/auth/me");
        const meData = await meRes.json();
        setCurrentUser(meData.user);

        const incRes = await fetch("/api/incidents?limit=100");
        const incData = await incRes.json();
        setIncidents(incData.incidents || []);

        const volRes = await fetch("/api/volunteers");
        const volData = await volRes.json();
        setVolunteers(volData.volunteers || []);

        const emailRes = await fetch("/api/emails/logs");
        const emailData = await emailRes.json();
        setEmailLogs(emailData.logs || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    loadPlatformData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <DashboardSidebar
          role="SUPER_ADMIN"
          userName={currentUser?.fullName || "Lead Commander"}
        />

        <div className="flex-1 space-y-8 w-full">
          {/* Header Banner */}
          <div className="bento-card p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="inline-block rounded-[12px] border-[2px] border-[#1B3B2B] bg-[#FF5A4E] px-3 py-1 font-display text-[11px] font-bold text-white shadow-bento-sm">
                🛡️ Platform Root Authority
              </span>
              <h1 className="text-2xl sm:text-3xl font-black font-display text-[#1B3B2B] mt-2">
                PawAlert Field Command Center
              </h1>
              <p className="text-xs sm:text-sm text-[#1B3B2B]/75 mt-1 font-sans">
                Full-network oversight, SLA escalation watchdog, transactional email deliverability, and audit trails.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <a
                href="/admin"
                className="pixar-btn inline-flex items-center gap-2 rounded-[14px] bg-[#FF7A00] text-white px-4 py-2.5 text-xs font-bold shadow-pixar-sm hover:bg-[#EA580C]"
              >
                <Compass className="w-4 h-4" />
                <span>Tactical Dispatch Map</span>
              </a>
              <a
                href="/admin/audit-logs"
                className="pixar-btn inline-flex items-center gap-2 rounded-[14px] bg-[#1E1B4B] text-white px-4 py-2.5 text-xs font-bold shadow-pixar-sm"
              >
                <FileText className="w-4 h-4 text-[#FFB703]" />
                <span>Inspect Audit Logs</span>
              </a>
            </div>
          </div>

          {/* Platform KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bento-card-white p-5">
              <span className="text-2xl">📢</span>
              <p className="text-3xl font-black font-display text-[#FF5A4E] mt-1">{incidents.length}</p>
              <h4 className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#1B3B2B]/70 mt-0.5">
                Total Emergencies
              </h4>
            </div>

            <div className="bento-card-white p-5">
              <span className="text-2xl">🦸‍♂️</span>
              <p className="text-3xl font-black font-display text-[#2EC4B6] mt-1">{volunteers.length}</p>
              <h4 className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#1B3B2B]/70 mt-0.5">
                Volunteer Guardians
              </h4>
            </div>

            <div className="bento-card-white p-5">
              <span className="text-2xl">📧</span>
              <p className="text-3xl font-black font-display text-[#FFB703] mt-1">{emailLogs.length}</p>
              <h4 className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#1B3B2B]/70 mt-0.5">
                Transactional Emails
              </h4>
            </div>

            <div className="bento-card-white p-5">
              <span className="text-2xl">⚡</span>
              <p className="text-3xl font-black font-display text-[#1B3B2B] mt-1">100%</p>
              <h4 className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#1B3B2B]/70 mt-0.5">
                Audit Integrity
              </h4>
            </div>
          </div>

          {/* Live Admin Command Map */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-display text-sm font-bold text-[#1B3B2B]">
                <Compass className="w-4 h-4 text-[#2EC4B6]" />
                <span>Geographical Field Command Radar</span>
              </div>
              <span className="font-mono text-[10px] text-[#1B3B2B]/60">
                ACTIVE INCIDENTS: {incidents.length}
              </span>
            </div>
            <AdminMap incidents={incidents} initialZoom={13} className="min-h-[440px]" />
          </div>

          {/* Email Delivery Monitor */}
          <div className="bento-card-white p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b-[2px] border-[#1B3B2B]/10">
              <h3 className="text-sm font-bold font-display text-[#1B3B2B] flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#FF5A4E]" />
                <span>Live Transactional Email Deliveries (Resend Provider)</span>
              </h3>
              <span className="rounded-[8px] bg-[#2EC4B6]/20 px-2.5 py-0.5 font-mono text-[10px] font-bold text-[#1B3B2B]">
                Resend API Integrated
              </span>
            </div>

            {emailLogs.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#1B3B2B]/60 font-sans">
                No outbound transactional emails triggered yet. Email events will be logged here in real time.
              </div>
            ) : (
              <div className="divide-y-[1px] divide-[#1B3B2B]/10">
                {emailLogs.slice(0, 5).map((log: any) => (
                  <div key={log._id} className="py-3 flex items-center justify-between text-xs font-mono">
                    <div>
                      <p className="font-bold text-[#1B3B2B]">{log.subject}</p>
                      <p className="text-[10px] text-[#1B3B2B]/60 font-sans">To: {log.recipientEmail}</p>
                    </div>
                    <span className="rounded-[8px] bg-[#2EC4B6] text-white px-2 py-0.5 text-[10px] font-bold">
                      {log.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
