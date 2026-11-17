"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { 
  AlertTriangle, 
  MapPin, 
  Heart, 
  Search, 
  Info, 
  Coins, 
  User, 
  LogOut, 
  Bell, 
  Menu, 
  X, 
  ChevronDown,
  Radio,
  ShieldCheck
} from "lucide-react";
import NotificationDrawer from "../notifications/NotificationDrawer";

interface NavUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
  profileImage?: string;
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<NavUser | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.user) {
        setCurrentUser(data.user);
      } else {
        setCurrentUser(null);
      }
    } catch (e) {
      setCurrentUser(null);
    }
  };

  const fetchNotificationsCount = async () => {
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      if (data.unreadCount !== undefined) {
        setUnreadCount(data.unreadCount);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchUser();
    fetchNotificationsCount();
    const interval = setInterval(fetchNotificationsCount, 15000);
    return () => clearInterval(interval);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setCurrentUser(null);
      router.push("/");
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  const getDashboardLink = (role?: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "/admin/dashboard";
      case "NGO_ADMIN":
        return "/ngo/dashboard";
      case "VETERINARIAN":
        return "/vet/dashboard";
      case "RESCUE_VOLUNTEER":
      case "MEDICAL_VOLUNTEER":
      case "FOOD_VOLUNTEER":
      case "SHELTER_VOLUNTEER":
      case "GENERAL_VOLUNTEER":
        return "/volunteer/dashboard";
      default:
        return "/user/dashboard";
    }
  };

  const navLinks = [
    { label: "Tactical Map", href: "/map", icon: MapPin },
    { label: "Adoptions", href: "/adoption", icon: Heart },
    { label: "Missing Pets", href: "/missing", icon: Search },
    { label: "Protocol", href: "/how-it-works", icon: Info },
    { label: "Fund Rescues", href: "/donate", icon: Coins },
  ];

  return (
    <>
      {/* Top Neon Laser Line (Overrank style) */}
      <div 
        aria-hidden="true" 
        className="fixed inset-x-0 top-0 z-[110] h-[2.5px] bg-[#d4ff3a] shadow-[0_0_14px_#d4ff3a]" 
      />

      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#05070d]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          
          {/* Brand Logo & HUD Status */}
          <div className="flex items-center gap-3">
            <a 
              href="/" 
              className="inline-flex items-center gap-2.5 transition-transform hover:scale-[1.02]"
              aria-label="POWER ALERT Home"
            >
              {/* Tactical Hexagon Vector Logo */}
              <svg width="32" height="32" viewBox="0 0 40 40" aria-hidden="true" className="flex-shrink-0">
                <path 
                  d="M20 2 36 11v18L20 38 4 29V11z" 
                  fill="rgba(212, 255, 58, 0.05)" 
                  stroke="#d4ff3a" 
                  strokeWidth="2.2" 
                  strokeLinejoin="round" 
                />
                <path 
                  d="M11.5 27 20 18.5 28.5 27" 
                  fill="none" 
                  stroke="#d4ff3a" 
                  strokeOpacity="0.5" 
                  strokeWidth="2.8" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
                <path 
                  d="M11.5 20 20 11.5 28.5 20" 
                  fill="none" 
                  stroke="#d4ff3a" 
                  strokeWidth="3" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
              </svg>
              <div className="flex flex-col">
                <span className="font-mono text-base font-black tracking-[0.14em] text-white">
                  POWER<span className="text-[#d4ff3a]">ALERT</span>
                </span>
                <span className="font-mono text-[9px] uppercase tracking-widest text-slate-400">
                  RESCUE PROTOCOL
                </span>
              </div>
            </a>

            {/* Tactical Grid Live Status Beacon */}
            <div className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-950/40 px-2.5 py-0.5 text-[10px] font-mono text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>GRID LIVE</span>
            </div>
          </div>

          {/* Center Navigation Links */}
          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className={`inline-flex h-9 items-center gap-1.5 rounded-md px-3.5 text-xs font-medium font-mono uppercase tracking-wider transition-all duration-200 ${
                        isActive
                          ? "bg-white/10 text-[#d4ff3a] border border-[#d4ff3a]/30 shadow-[0_0_12px_rgba(212,255,58,0.15)]"
                          : "text-slate-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <link.icon className={`w-3.5 h-3.5 ${isActive ? "text-[#d4ff3a]" : "text-slate-400"}`} />
                      {link.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Action Hub & Authentication */}
          <div className="flex items-center gap-3">
            {/* Urgent Report Button - High-Visibility Tactical Trigger */}
            <a
              href="/report"
              className="relative inline-flex items-center gap-2 rounded-md bg-[#ff3b30] px-4 py-2 text-xs font-mono font-bold tracking-wider uppercase text-white shadow-[0_0_18px_rgba(255,59,48,0.45)] border border-red-400/40 hover:bg-[#ff4d4d] hover:shadow-[0_0_24px_rgba(255,59,48,0.65)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              <AlertTriangle className="w-3.5 h-3.5 text-white" />
              <span>Report Animal</span>
            </a>

            {/* Notification Drawer Button (If user signed in) */}
            {currentUser && (
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="relative rounded-md border border-white/10 bg-white/5 p-2 text-slate-300 hover:border-white/20 hover:text-white transition-colors"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#d4ff3a] text-[9px] font-black text-black">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
            )}

            {/* User Profile or Sign In Buttons */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-mono text-slate-200 hover:border-[#d4ff3a]/40 transition-all"
                >
                  <div className="h-6 w-6 rounded-full bg-[#d4ff3a]/20 border border-[#d4ff3a]/50 flex items-center justify-center text-[11px] font-bold text-[#d4ff3a]">
                    {currentUser.fullName.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline max-w-[90px] truncate">{currentUser.fullName}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-lg border border-white/10 bg-[#0a0e17] p-1.5 shadow-2xl backdrop-blur-2xl z-50">
                    <div className="px-3 py-2 border-b border-white/10">
                      <p className="text-xs font-bold text-white truncate">{currentUser.fullName}</p>
                      <p className="text-[10px] font-mono text-slate-400 truncate">{currentUser.email}</p>
                      <span className="mt-1 inline-block rounded border border-[#d4ff3a]/30 bg-[#d4ff3a]/10 px-1.5 py-0.5 text-[9px] font-mono text-[#d4ff3a]">
                        {currentUser.role}
                      </span>
                    </div>

                    <div className="py-1">
                      <a
                        href={getDashboardLink(currentUser.role)}
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs font-mono text-slate-300 hover:bg-white/5 hover:text-white"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-[#d4ff3a]" />
                        <span>Command Dashboard</span>
                      </a>
                      <a
                        href="/user/my-reports"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs font-mono text-slate-300 hover:bg-white/5 hover:text-white"
                      >
                        <Radio className="w-3.5 h-3.5 text-slate-400" />
                        <span>My Distress Reports</span>
                      </a>
                    </div>

                    <div className="pt-1 border-t border-white/10">
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs font-mono text-red-400 hover:bg-red-950/40 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <a
                  href="/login"
                  className="rounded-md border border-white/10 bg-transparent px-3 py-1.5 text-xs font-mono font-medium text-slate-300 hover:border-white/30 hover:text-white transition-colors"
                >
                  Sign In
                </a>
                <a
                  href="/volunteer-register"
                  className="hidden sm:inline-flex rounded-md border border-[#d4ff3a]/40 bg-[#d4ff3a]/10 px-3 py-1.5 text-xs font-mono font-bold text-[#d4ff3a] hover:bg-[#d4ff3a]/20 shadow-[0_0_12px_rgba(212,255,58,0.15)] transition-all"
                >
                  Join Guardian
                </a>
              </div>
            )}

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden rounded-md border border-white/10 bg-white/5 p-2 text-slate-300 hover:text-white"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-white/10 bg-[#05070d]/95 backdrop-blur-2xl px-4 py-4 space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 rounded-md px-3 py-2.5 text-xs font-mono uppercase tracking-wider ${
                  pathname === link.href
                    ? "bg-white/10 text-[#d4ff3a] border border-[#d4ff3a]/30"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </a>
            ))}
            {!currentUser && (
              <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
                <a
                  href="/login"
                  className="w-full text-center rounded-md border border-white/10 py-2 text-xs font-mono text-slate-300"
                >
                  Sign In
                </a>
                <a
                  href="/volunteer-register"
                  className="w-full text-center rounded-md bg-[#d4ff3a] py-2 text-xs font-mono font-bold text-black"
                >
                  Join Volunteer Squad
                </a>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Notification Drawer Component */}
      <NotificationDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
      />
    </>
  );
}
