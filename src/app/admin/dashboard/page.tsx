"use client";

import React, { useEffect, useState } from "react";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
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
          userName={currentUser?.fullName || "Super Administrator"}
        />

        <div className="flex-1 space-y-8 w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-100 via-peach-50 to-white p-8 rounded-3xl border border-red-200/80 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-red-800 bg-red-200/70 px-3 py-1 rounded-full">
                🛡️ Platform Root Authority
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-foreground mt-2">
                POWER ALERT System Overview
              </h1>
              <p className="text-xs sm:text-sm text-foreground/75 mt-1">
                Full-network oversight, SLA escalation watchdog, transactional email deliverability, and audit trails.
              </p>
            </div>

            <a
              href="/admin/audit-logs"
              className="px-5 py-3 rounded-2xl bg-foreground text-white font-black text-xs shadow hover:bg-black transition-all flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              <span>Inspect Email Delivery Logs</span>
            </a>
          </div>

          {/* Platform KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-cream-200 shadow-soft">
              <span className="text-xl">📢</span>
              <p className="text-2xl font-black text-foreground mt-1">{incidents.length}</p>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mt-0.5">
                Total Emergencies
              </h4>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-cream-200 shadow-soft">
              <span className="text-xl">🦸‍♂️</span>
              <p className="text-2xl font-black text-primary-600 mt-1">{volunteers.length}</p>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mt-0.5">
                Volunteer Guardians
              </h4>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-cream-200 shadow-soft">
              <span className="text-xl">📧</span>
              <p className="text-2xl font-black text-mint-600 mt-1">{emailLogs.length}</p>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mt-0.5">
                Transactional Emails Sent
              </h4>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-cream-200 shadow-soft">
              <span className="text-xl">⚡</span>
              <p className="text-2xl font-black text-lavender-600 mt-1">99.9%</p>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mt-0.5">
                System SLA Uptime
              </h4>
            </div>
          </div>

          {/* Email Delivery Monitor */}
          <div className="bg-white rounded-3xl p-6 border border-cream-200 shadow-soft space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-cream-100">
              <h3 className="text-base font-black text-foreground flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary-500" />
                Live Transactional Email Deliveries (Resend Provider)
              </h3>
              <span className="text-xs font-bold text-mint-700 bg-mint-50 px-3 py-1 rounded-full border border-mint-200">
                Resend API Integrated
              </span>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs text-muted-foreground">Checking delivery logs...</div>
            ) : emailLogs.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted-foreground">
                No email delivery records logged yet.
              </div>
            ) : (
              <div className="divide-y divide-cream-100">
                {emailLogs.slice(0, 6).map((log) => (
                  <div key={log._id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">{log.recipientEmail}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-cream-100 text-foreground">
                          {log.templateName}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            log.status === "SENT" || log.status === "MOCKED"
                              ? "bg-mint-100 text-mint-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {log.status}
                        </span>
                      </div>
                      <p className="text-muted-foreground mt-0.5 text-[11px]">{log.subject}</p>
                    </div>

                    <span className="text-muted-foreground font-semibold text-[11px] flex-shrink-0">
                      {formatDate(log.sentAt || log.createdAt)}
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
