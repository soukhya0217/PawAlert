"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import PawMark from "./paw-mark";
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
  Sparkles,
  ShieldCheck,
  Compass
} from "lucide-react";

interface NavUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

export default function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<NavUser | null>(null);
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
    } catch {
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
    } catch {}
  };

  useEffect(() => {
    fetchUser();
    fetchNotificationsCount();
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

  const navLinks = [
    { label: "Sanctuary Map", href: "/map", icon: Compass },
    { label: "Adoptions", href: "/adoption", icon: Heart },
    { label: "Missing Pets", href: "/missing", icon: Search },
    { label: "Rescue Protocol", href: "/how-it-works", icon: Info },
    { label: "Fund Rescues", href: "/donate", icon: Coins },
  ];

  return (
    <header className="sticky top-0 z-40 border-b-[3px] border-[#1E1B4B] bg-[#FFF9F0]/95 backdrop-blur-md">
      {/* Top Mission Sub-Pill Announcement Bar */}
      <div className="bg-[#1E1B4B] text-[#FFF9F0] py-1.5 px-4 text-center border-b border-[#1E1B4B]">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-[11px] sm:text-xs font-display font-bold">
          <span className="text-[#FFB703]">✨</span>
          <span className="tracking-wide">
            THEY CAN&apos;T SPEAK. YOU CAN. • Every Paw Matters
          </span>
          <span className="hidden sm:inline-block text-[#FF7A00] font-mono text-[10px]">
            [24/7 Rapid Rescue Dispatch]
          </span>
        </div>
      </div>

      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Global Brand Logo with PawMark */}
        <a href="/" aria-label="PawAlert Home" className="transition-transform hover:scale-102">
          <PawMark size="md" showTagline={true} />
        </a>

        {/* Center Desktop Navigation */}
        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-1.5">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className={`inline-flex h-10 items-center gap-1.5 rounded-[16px] px-3.5 text-xs font-bold font-display transition-all ${
                      isActive
                        ? "bg-[#1E1B4B] text-white shadow-pixar-sm"
                        : "text-[#1E1B4B] hover:bg-[#FFF1DC]"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{link.label}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-2.5">
          {/* Report Animal Pill */}
          <a
            href="/report"
            className="pixar-btn relative inline-flex items-center gap-1.5 rounded-[18px] bg-gradient-to-r from-[#FF7A00] to-[#F97316] px-4 py-2 text-xs font-bold text-white shadow-pixar"
          >
            <span className="h-2 w-2 rounded-full bg-white animate-ping" />
            <AlertTriangle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Report Animal</span>
            <span className="sm:hidden">Report</span>
          </a>

          {/* User Auth Pill */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="pixar-btn inline-flex items-center gap-2 rounded-[16px] bg-[#FFF1DC] px-3 py-2 text-xs font-bold text-[#1E1B4B] shadow-pixar-sm border-[2px] border-[#1E1B4B]"
              >
                <div className="w-5 h-5 rounded-full bg-[#FFB703] flex items-center justify-center text-[10px]">
                  🐾
                </div>
                <span className="max-w-[100px] truncate">{currentUser.fullName}</span>
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-[20px] border-[3px] border-[#1E1B4B] bg-[#FFF9F0] p-2 shadow-pixar z-50">
                  <div className="px-3 py-2 border-b-[2px] border-[#1E1B4B]/10">
                    <p className="text-xs font-bold font-display text-[#1E1B4B] truncate">
                      {currentUser.fullName}
                    </p>
                    <p className="text-[10px] font-mono text-[#D97706] truncate">
                      {currentUser.email}
                    </p>
                  </div>
                  <div className="py-1">
                    <a
                      href={currentUser.role === "SUPER_ADMIN" ? "/admin/dashboard" : "/user/dashboard"}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold font-display text-[#1E1B4B] hover:bg-[#FFF1DC] rounded-[12px]"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Dashboard</span>
                    </a>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-bold font-display text-[#EF4444] hover:bg-[#EF4444]/10 rounded-[12px]"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <a
                href="/login"
                className="pixar-btn rounded-[16px] bg-[#FFF9F0] border-[2px] border-[#1E1B4B] px-3 py-1.5 text-xs font-bold text-[#1E1B4B] shadow-pixar-sm hover:bg-[#FFF1DC]"
              >
                Sign In
              </a>
              <a
                href="/register"
                className="pixar-btn hidden sm:inline-flex rounded-[16px] bg-[#FFB703] border-[2px] border-[#1E1B4B] px-3 py-1.5 text-xs font-bold text-[#1E1B4B] shadow-pixar-sm hover:bg-[#F59E0B]"
              >
                Join
              </a>
            </div>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden pixar-btn rounded-[14px] bg-[#FFF1DC] p-2 text-[#1E1B4B] border-[2px] border-[#1E1B4B]"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t-[3px] border-[#1E1B4B] bg-[#FFF9F0] p-4 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <a
                key={link.href}
                href={link.href}
                className="flex items-center gap-2.5 rounded-[16px] p-2.5 text-xs font-bold font-display text-[#1E1B4B] hover:bg-[#FFF1DC]"
              >
                <Icon className="w-4 h-4 text-[#FF7A00]" />
                <span>{link.label}</span>
              </a>
            );
          })}
        </div>
      )}
    </header>
  );
}
