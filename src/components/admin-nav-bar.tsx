"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Compass,
  LayoutDashboard,
  AlertTriangle,
  Users,
  Building,
  Activity,
  FileText,
  LogOut,
  ExternalLink,
  ShieldCheck,
  Sparkles
} from "lucide-react";

interface AdminNavBarProps {
  user: {
    fullName: string;
    email: string;
    role: string;
    profileImage?: string;
  };
}

export default function AdminNavBar({ user }: AdminNavBarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  const navTabs = [
    { label: "Tactical Dispatch", href: "/admin", icon: Compass },
    { label: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Incidents", href: "/admin/incidents", icon: AlertTriangle },
    { label: "Users & Responders", href: "/admin/users", icon: Users },
    { label: "NGO Network", href: "/admin/ngos", icon: Building },
    { label: "Analytics", href: "/admin/analytics", icon: Activity },
    { label: "Audit Logs", href: "/admin/audit-logs", icon: FileText },
  ];

  return (
    <div className="bg-[#FFF9F0] border-b-[3px] border-[#1E1B4B] sticky top-0 z-30 shadow-pixar-sm">
      {/* Top Banner: Admin Status and Identity */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3 border-b border-[#1E1B4B]/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[12px] bg-[#1E1B4B] text-[#FFB703] flex items-center justify-center font-bold shadow-sm">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-xs font-black text-[#1E1B4B]">
                PawAlert Command Center
              </span>
              <span className="px-2 py-0.5 rounded-[8px] bg-[#FFB703] text-[#1E1B4B] font-mono text-[10px] font-black uppercase">
                {user.role.replace(/_/g, " ")}
              </span>
            </div>
            <p className="font-sans text-[11px] text-[#1E1B4B]/70 truncate max-w-xs sm:max-w-md">
              Commander: <strong>{user.fullName}</strong> ({user.email})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/"
            className="pixar-btn bg-[#FFF1DC] text-[#1E1B4B] border-[2px] border-[#1E1B4B] px-3 py-1.5 rounded-[12px] text-xs font-bold shadow-pixar-sm flex items-center gap-1.5 hover:bg-[#FFE8C2]"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#FF7A00]" />
            <span className="hidden sm:inline">Public Site</span>
          </a>

          <button
            onClick={handleLogout}
            className="pixar-btn bg-[#EF4444] text-white px-3 py-1.5 rounded-[12px] text-xs font-bold shadow-pixar-sm flex items-center gap-1.5 hover:bg-[#DC2626]"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-auto py-2">
        <div className="flex items-center gap-1.5 min-w-max">
          {navTabs.map((tab) => {
            const isActive = pathname === tab.href;
            const Icon = tab.icon;
            return (
              <a
                key={tab.href}
                href={tab.href}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-[14px] text-xs font-display font-bold transition-all ${
                  isActive
                    ? "bg-[#1E1B4B] text-white shadow-pixar-sm border-[2px] border-[#1E1B4B]"
                    : "text-[#1E1B4B] bg-[#FFF1DC]/70 border-[2px] border-transparent hover:bg-[#FFF1DC] hover:border-[#1E1B4B]/20"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#FFB703]" : "text-[#FF7A00]"}`} />
                <span>{tab.label}</span>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
