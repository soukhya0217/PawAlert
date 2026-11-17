"use client";

import React, { useEffect, useState } from "react";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import { Mail, CheckCircle2, AlertCircle, FileText, ArrowLeft, RefreshCw } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function AdminAuditLogsPage() {
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [emailLogs, setEmailLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const meRes = await fetch("/api/auth/me");
      const meData = await meRes.json();
      setCurrentUser(meData.user);

      const res = await fetch("/api/emails/logs");
      const data = await res.json();
      setEmailLogs(data.logs || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <DashboardSidebar
          role="SUPER_ADMIN"
          userName={currentUser?.fullName || "Super Admin"}
        />

        <div className="flex-1 space-y-6 w-full">
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-peach-100 text-primary-700 text-xs font-black uppercase tracking-wider mb-2">
                <FileText className="w-3.5 h-3.5" /> Permanent Deliverability Trail
              </div>
              <h1 className="text-3xl font-black text-foreground tracking-tight">
                Transactional Email Deliveries & Audit Logs
              </h1>
              <p className="text-xs sm:text-sm text-foreground/75 mt-1">
                Inspect every email notification dispatched by the system (Welcome, Alert, Assignment, Rescue Milestone, Receipt).
              </p>
            </div>

            <button
              onClick={fetchLogs}
              className="p-2.5 rounded-2xl bg-white border border-cream-300 text-foreground hover:bg-cream-100 transition-colors"
              title="Refresh Logs"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-cream-200 shadow-soft">
            {loading ? (
              <div className="py-20 text-center text-xs text-muted-foreground font-semibold">
                Loading audit logs...
              </div>
            ) : emailLogs.length === 0 ? (
              <div className="py-20 text-center text-xs text-muted-foreground">
                No logs recorded yet.
              </div>
            ) : (
              <div className="space-y-4">
                {emailLogs.map((log) => (
                  <div
                    key={log._id}
                    className="p-5 rounded-2xl bg-cream-50/70 border border-cream-200 space-y-2 text-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-foreground">
                          {log.recipientEmail}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-peach-100 text-primary-700">
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

                      <span className="text-muted-foreground font-semibold text-[11px]">
                        {formatDate(log.sentAt || log.createdAt)}
                      </span>
                    </div>

                    <p className="text-foreground/90 font-bold">{log.subject}</p>

                    {log.providerMessageId && (
                      <p className="text-[11px] text-muted-foreground font-mono">
                        Provider ID: {log.providerMessageId}
                      </p>
                    )}
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
