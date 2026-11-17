"use client";

import React, { useState, useEffect } from "react";
import { X, Bell, Check, CheckCheck, Clock, ExternalLink } from "lucide-react";
import { formatTimeAgo } from "@/lib/utils";

interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  isRead: boolean;
  priority: string;
  createdAt: string;
}

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationDrawer({ isOpen, onClose }: DrawerProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/notifications");
      const data = await res.json();
      if (data.notifications) {
        setNotifications(data.notifications);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const markAsRead = async (id?: string) => {
    try {
      if (id) {
        await fetch("/api/notifications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notificationId: id }),
        });
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
        );
      } else {
        await fetch("/api/notifications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ markAll: true }),
        });
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-cream-200">
          
          {/* Header */}
          <div className="p-6 bg-cream-50 border-b border-cream-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-peach-100 flex items-center justify-center text-primary-600">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-foreground">Notifications</h3>
                <p className="text-xs text-muted-foreground font-medium">Real-time alerts & rescue updates</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => markAsRead()}
                className="p-2 text-xs font-bold text-primary-600 hover:bg-peach-100 rounded-xl transition-colors flex items-center gap-1"
                title="Mark all as read"
              >
                <CheckCheck className="w-4 h-4" />
                <span className="hidden sm:inline">Mark read</span>
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-muted-foreground hover:bg-cream-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-48 space-y-2">
                <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs text-muted-foreground">Loading alerts...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="w-16 h-16 rounded-full bg-cream-100 mx-auto flex items-center justify-center mb-3">
                  <Bell className="w-8 h-8 text-cream-300" />
                </div>
                <h4 className="text-sm font-bold text-foreground">All Caught Up!</h4>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                  You do not have any unread notifications right now. When an animal needs help or your report gets updated, it will appear here.
                </p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  className={`p-4 rounded-2xl border transition-all ${
                    n.isRead
                      ? "bg-white border-cream-200 text-muted-foreground"
                      : "bg-peach-50/60 border-peach-200 shadow-sm text-foreground"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">🐾</span>
                      <h4 className={`text-sm font-bold ${!n.isRead ? "text-primary-950 font-black" : "text-foreground"}`}>
                        {n.title}
                      </h4>
                    </div>
                    {!n.isRead && (
                      <span className="w-2.5 h-2.5 rounded-full bg-primary-500 flex-shrink-0 animate-pulse" />
                    )}
                  </div>

                  <p className="text-xs mt-1.5 leading-relaxed text-foreground/80">{n.message}</p>

                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-cream-200/60 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="w-3 h-3" />
                      {formatTimeAgo(n.createdAt)}
                    </span>

                    <div className="flex items-center gap-3">
                      {!n.isRead && (
                        <button
                          onClick={() => markAsRead(n._id)}
                          className="hover:text-primary-600 font-bold transition-colors"
                        >
                          Mark read
                        </button>
                      )}
                      {n.link && (
                        <a
                          href={n.link}
                          onClick={onClose}
                          className="text-primary-600 hover:text-primary-700 font-bold flex items-center gap-1 transition-colors"
                        >
                          View Case <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-cream-50 border-t border-cream-200 text-center">
            <p className="text-[11px] text-muted-foreground font-medium">
              POWER ALERT Dispatch Center • Active Response 24/7
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
