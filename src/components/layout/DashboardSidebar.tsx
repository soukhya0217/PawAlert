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
    <aside className="w-full lg:w-64 bg-white rounded-3xl p-5 border border-cream-200 shadow-soft h-fit sticky top-24">
      {/* Profile Card Snippet */}
      <div className="pb-5 mb-5 border-b border-cream-100 flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-peach-200 to-primary-100 flex items-center justify-center text-primary-700 font-black text-lg border border-peach-200 shadow-sm">
          {userName.charAt(0) || "U"}
        </div>
        <div>
          <h4 className="text-sm font-black text-foreground truncate max-w-[140px]">{userName}</h4>
          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-peach-100 text-primary-700 mt-0.5">
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
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                isActive
                  ? "bg-primary-500 text-white shadow-md shadow-primary-500/25"
                  : "text-foreground/80 hover:bg-peach-50 hover:text-primary-700"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </a>
          );
        })}
      </nav>

      {/* Sign Out Button */}
      <div className="mt-8 pt-4 border-t border-cream-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-2xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
