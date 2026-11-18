"use client";

import React from "react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  AlertTriangle,
  PawPrint,
  Heart,
  Shield,
  Stethoscope,
  Building,
  UserCheck,
  FileText,
  Settings,
  Bell,
  LogOut,
  MapPin,
  Sparkles,
  ClipboardList,
  Activity,
} from "lucide-react";

interface SidebarProps {
  role: string;
  userName: string;
}

export default function DashboardSidebar({ role, userName }: SidebarProps) {
  const pathname = usePathname();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  // Build role-specific nav items
  const getNavItems = () => {
    switch (role) {
      case "SUPER_ADMIN":
        return [
          { label: "Platform Overview", href: "/admin/dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
          { label: "Incident Watchdog", href: "/admin/incidents", icon: <AlertTriangle className="w-4 h-4 text-red-500" /> },
          { label: "User Management", href: "/admin/users", icon: <UserCheck className="w-4 h-4 text-primary-500" /> },
          { label: "NGO Network", href: "/admin/ngos", icon: <Building className="w-4 h-4 text-lavender-500" /> },
          { label: "System Analytics", href: "/admin/analytics", icon: <Activity className="w-4 h-4 text-mint-500" /> },
          { label: "System Audit Logs", href: "/admin/audit-logs", icon: <FileText className="w-4 h-4 text-amber-500" /> },
        ];

      case "NGO_ADMIN":
        return [
          { label: "NGO Control Center", href: "/ngo/dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
          { label: "Incident Management", href: "/ngo/incidents", icon: <AlertTriangle className="w-4 h-4 text-red-500" /> },
          { label: "Volunteer Roster", href: "/ngo/volunteers", icon: <Shield className="w-4 h-4 text-primary-500" /> },
          { label: "Active Rescues", href: "/ngo/rescues", icon: <PawPrint className="w-4 h-4 text-amber-500" /> },
          { label: "Feeding Zones", href: "/ngo/feeding", icon: <Sparkles className="w-4 h-4 text-mint-500" /> },
          { label: "Shelter Capacity", href: "/ngo/shelters", icon: <Building className="w-4 h-4 text-lavender-500" /> },
          { label: "Adoption Applications", href: "/ngo/adoption", icon: <Heart className="w-4 h-4 text-rose-500" /> },
          { label: "Financial Reports", href: "/ngo/reports", icon: <FileText className="w-4 h-4" /> },
          { label: "NGO Profile Settings", href: "/ngo/settings", icon: <Settings className="w-4 h-4" /> },
        ];

      case "VETERINARIAN":
        return [
          { label: "Clinic Dashboard", href: "/vet/dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
          { label: "Patients & Animals", href: "/vet/animals", icon: <PawPrint className="w-4 h-4 text-mint-500" /> },
          { label: "Medical Records", href: "/vet/medical-records", icon: <Stethoscope className="w-4 h-4 text-primary-500" /> },
          { label: "Follow-up Schedules", href: "/vet/follow-ups", icon: <ClipboardList className="w-4 h-4 text-lavender-500" /> },
        ];

      case "RESCUE_VOLUNTEER":
      case "MEDICAL_VOLUNTEER":
      case "FOOD_VOLUNTEER":
      case "SHELTER_VOLUNTEER":
      case "GENERAL_VOLUNTEER":
        return [
          { label: "Volunteer Dashboard", href: "/volunteer/dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
          { label: "Available Assignments", href: "/volunteer/assignments", icon: <AlertTriangle className="w-4 h-4 text-red-500" /> },
          { label: "My Active Cases", href: "/volunteer/my-cases", icon: <PawPrint className="w-4 h-4 text-primary-500" /> },
          { label: "Feeding Log & Zones", href: "/volunteer/feeding", icon: <Sparkles className="w-4 h-4 text-mint-500" /> },
          { label: "Service Areas & Map", href: "/volunteer/service-areas", icon: <MapPin className="w-4 h-4 text-lavender-500" /> },
          { label: "Volunteer Profile", href: "/volunteer/profile", icon: <UserCheck className="w-4 h-4" /> },
        ];

      default:
        return [
          { label: "Guardian Dashboard", href: "/user/dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
          { label: "My Reported Cases", href: "/user/my-reports", icon: <PawPrint className="w-4 h-4 text-primary-500" /> },
          { label: "Notifications", href: "/user/notifications", icon: <Bell className="w-4 h-4 text-amber-500" /> },
          { label: "Profile & Location", href: "/user/profile", icon: <UserCheck className="w-4 h-4 text-lavender-500" /> },
          { label: "Account Settings", href: "/user/settings", icon: <Settings className="w-4 h-4" /> },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <aside className="w-full lg:w-64 bento-card-white p-5 space-y-6 flex-shrink-0 h-fit sticky top-24">
      {/* Profile Card Snippet */}
      <div className="pb-4 border-b-[2px] border-[#1B3B2B]/10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-[14px] border-[2px] border-[#1B3B2B] bg-[#FFB703] flex items-center justify-center font-display font-bold text-sm text-[#1B3B2B] shadow-bento-sm">
          {userName.charAt(0) || "U"}
        </div>
        <div>
          <h4 className="text-xs font-bold font-display text-[#1B3B2B] truncate max-w-[140px]">{userName}</h4>
          <span className="inline-block px-2 py-0.5 rounded-[8px] bg-[#2EC4B6]/20 text-[#1B3B2B] font-mono font-bold text-[9px] mt-0.5">
            {role.replace("_", " ")}
          </span>
        </div>
      </div>

      {/* Nav List */}
      <nav className="space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <a
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-[14px] font-display text-xs font-bold transition-all ${
                isActive
                  ? "bg-[#1B3B2B] text-white border-[2px] border-[#1B3B2B] shadow-bento-sm"
                  : "text-[#1B3B2B] hover:bg-[#F5EFE6]"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </a>
          );
        })}
      </nav>

      {/* Sign Out Button */}
      <div className="pt-4 border-t-[2px] border-[#1B3B2B]/10">
        <button
          onClick={handleLogout}
          className="bento-btn w-full flex items-center gap-2.5 px-3 py-2 rounded-[14px] bg-[#FFFBF5] text-[#FF5A4E] text-xs font-bold font-display"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
