"use client";

import React, { useEffect, useState } from "react";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import { Bell, CheckCheck, Clock, ExternalLink } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function UserNotificationsPage() {
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setCurrentUser(d.user));

    fetch("/api/notifications")
      .then((r) => r.json())
      .then((d) => {
        setNotifications(d.notifications || []);
        setLoading(false);
      });
  }, []);

  const handleMarkAllRead = async () => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAll: true }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <DashboardSidebar
          role={currentUser?.role || "PUBLIC_USER"}
          userName={currentUser?.fullName || "Guardian"}
        />

        <div className="flex-1 space-y-6 w-full">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-primary-700 bg-peach-100 px-3 py-1 rounded-full border border-peach-200">
                Alerts Center
              </span>
              <h1 className="text-3xl font-black text-foreground tracking-tight mt-2">
                Incident & System Notifications
              </h1>
            </div>

            <button
              onClick={handleMarkAllRead}
              className="px-4 py-2 rounded-xl bg-peach-100 text-primary-700 font-bold text-xs hover:bg-peach-200 transition-colors flex items-center gap-1.5"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Mark all read</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-cream-200 shadow-soft space-y-3">
            {notifications.map((n) => (
              <div
                key={n._id}
                className={`p-4 rounded-2xl border transition-all ${
                  n.isRead ? "bg-white border-cream-200" : "bg-peach-50/70 border-peach-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-foreground">{n.title}</h4>
                  <span className="text-[11px] text-muted-foreground">{formatDate(n.createdAt)}</span>
                </div>
                <p className="text-xs text-foreground/80 mt-1">{n.message}</p>
                {n.link && (
                  <a
                    href={n.link}
                    className="inline-block mt-2 text-xs font-bold text-primary-600 hover:underline"
                  >
                    Open Case Details →
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
