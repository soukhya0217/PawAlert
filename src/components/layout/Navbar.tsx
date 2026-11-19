"use client";

import React, { useState, useEffect, useRef } from "react";
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
  ShieldCheck,
  Compass,
  Sparkles
} from "lucide-react";
import NotificationDrawer from "../notifications/NotificationDrawer";
import { animateMascotPerk } from "@/lib/animations";
import PawMark from "../paw-mark";

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

  // Mascot SVG Refs for hover animation
  const earLeftRef = useRef<SVGGElement>(null);
  const earRightRef = useRef<SVGGElement>(null);
  const tailRef = useRef<SVGGElement>(null);

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

  const handleMascotHover = () => {
    animateMascotPerk(earLeftRef.current, earRightRef.current, tailRef.current);
  };

  const navLinks = [
    { label: "Sanctuary Map", href: "/map", icon: Compass },
    { label: "Adoptions", href: "/adoption", icon: Heart },
    { label: "Missing Pets", href: "/missing", icon: Search },
    { label: "Rescue Protocol", href: "/how-it-works", icon: Info },
    { label: "Fund Rescues", href: "/donate", icon: Coins },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 border-b-[3px] border-[#1E1B4B] bg-[#FFF9F0]/95 backdrop-blur-md">
        {/* Mission Sub-Pill Announcement Bar */}
        <div className="bg-[#1E1B4B] text-[#FFF9F0] py-1.5 px-4 text-center border-b border-[#1E1B4B]">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-[11px] sm:text-xs font-display font-bold">
            <span className="text-[#FFB703]">✨</span>
            <span className="tracking-wide">
              THEY CAN&apos;T SPEAK. YOU CAN. • Every Paw Matters
            </span>
            <span className="hidden sm:inline-block text-[#FF7A00] font-mono text-[10px]">
              [24/7 Rapid Sanctuary Dispatch]
            </span>
          </div>
        </div>

        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          
          {/* Brand Logo with 3D Glowing PawMark */}
          <div className="flex items-center gap-3">
            <a 
              href="/" 
              className="inline-flex items-center gap-3 transition-transform hover:scale-105"
              aria-label="PawAlert Home"
            >
              <PawMark size="md" showTagline={true} />
            </a>
          </div>

          {/* Center Navigation Links */}
          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-1.5">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className={`inline-flex h-10 items-center gap-1.5 rounded-[16px] px-4 text-xs font-bold font-display transition-all ${
                        isActive
                          ? "bg-[#1E1B4B] text-white border-[2px] border-[#1E1B4B] shadow-pixar-sm"
                          : "text-[#1E1B4B] hover:bg-[#FFF1DC]"
                      }`}
                    >
                      <link.icon className={`w-3.5 h-3.5 ${isActive ? "text-[#FBBF24]" : "text-[#1E1B4B]"}`} />
                      {link.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Action Hub & Authentication */}
          <div className="flex items-center gap-3">
            {/* Urgent Report Button - Chunky 3D Sunset Tangerine */}
            <a
              href="/report"
              className="pixar-btn bg-gradient-to-r from-[#FF7A00] to-[#F97316] text-white px-5 py-2.5 text-xs shadow-pixar-sm"
            >
              <AlertTriangle className="w-4 h-4 mr-1.5 text-white animate-pulse" />
              <span>Report Animal</span>
            </a>

            {/* Notification Drawer */}
            {currentUser && (
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="pixar-btn bg-[#FFF9F0] text-[#1E1B4B] p-2.5 shadow-pixar-sm"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#EF4444] text-[9px] font-bold text-white border border-[#1E1B4B]">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
            )}

            {/* Profile Dropdown or Sign In */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="pixar-btn bg-[#FFF9F0] text-[#1E1B4B] px-3.5 py-2 text-xs shadow-pixar-sm flex items-center gap-2"
                >
                  <div className="h-6 w-6 rounded-full bg-[#FBBF24] border-[1.5px] border-[#1E1B4B] flex items-center justify-center text-[11px] font-black text-[#1E1B4B]">
                    {currentUser.fullName.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline max-w-[90px] truncate">{currentUser.fullName}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-[22px] border-[3px] border-[#1E1B4B] bg-[#FFF9F0] p-2 shadow-pixar z-50 animate-in fade-in zoom-in-95">
                    <div className="px-3 py-2 border-b-[2px] border-[#1E1B4B]/10">
                      <p className="text-xs font-bold text-[#1E1B4B] truncate">{currentUser.fullName}</p>
                      <p className="text-[10px] font-mono text-[#1E1B4B]/60 truncate">{currentUser.email}</p>
                      <span className="mt-1 inline-block rounded-[10px] bg-[#10B981]/20 px-2 py-0.5 text-[9px] font-mono font-bold text-[#1E1B4B]">
                        {currentUser.role}
                      </span>
                    </div>

                    <div className="py-1">
                      <a
                        href="/admin/dashboard"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex w-full items-center gap-2 rounded-[12px] px-3 py-2 text-xs font-bold font-display text-[#1E1B4B] hover:bg-[#FFF1DC]"
                      >
                        <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                        <span>Command Dashboard</span>
                      </a>
                    </div>

                    <div className="pt-1 border-t-[2px] border-[#1E1B4B]/10">
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 rounded-[12px] px-3 py-2 text-xs font-bold font-display text-[#EF4444] hover:bg-[#EF4444]/10"
                      >
                        <LogOut className="w-4 h-4" />
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
                  className="pixar-btn bg-[#FFF9F0] text-[#1E1B4B] px-3.5 py-2 text-xs shadow-pixar-sm font-bold"
                >
                  Sign In
                </a>
                <a
                  href="/register"
                  className="hidden sm:inline-flex pixar-btn bg-[#FFB703] text-[#1E1B4B] px-3.5 py-2 text-xs shadow-pixar-sm font-bold"
                >
                  Sign Up
                </a>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden pixar-btn bg-[#FFF9F0] text-[#1E1B4B] p-2.5 shadow-pixar-sm"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t-[3px] border-[#1E1B4B] bg-[#FFF9F0] px-4 py-4 space-y-2.5">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 rounded-[16px] px-4 py-2.5 text-xs font-display font-bold ${
                  pathname === link.href
                    ? "bg-[#1E1B4B] text-white"
                    : "text-[#1E1B4B] hover:bg-[#FFF1DC]"
                }`}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </a>
            ))}

            {/* Mobile Auth Actions */}
            {!currentUser ? (
              <div className="pt-3 border-t-[2px] border-[#1E1B4B]/10 grid grid-cols-2 gap-2">
                <a
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="pixar-btn bg-[#FFF9F0] text-[#1E1B4B] py-2.5 text-center text-xs font-bold shadow-pixar-sm"
                >
                  Sign In
                </a>
                <a
                  href="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="pixar-btn bg-[#FFB703] text-[#1E1B4B] py-2.5 text-center text-xs font-bold shadow-pixar-sm"
                >
                  Sign Up
                </a>
              </div>
            ) : (
              <div className="pt-3 border-t-[2px] border-[#1E1B4B]/10 space-y-2">
                <a
                  href="/admin/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="pixar-btn w-full flex items-center justify-center gap-2 bg-[#FFF9F0] text-[#1E1B4B] py-2.5 text-xs font-bold shadow-pixar-sm"
                >
                  <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                  <span>Command Dashboard</span>
                </a>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="pixar-btn w-full flex items-center justify-center gap-2 bg-[#EF4444]/15 text-[#EF4444] py-2 text-xs font-bold shadow-pixar-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}

            <div className="pt-2">
              <a
                href="/report"
                onClick={() => setIsMobileMenuOpen(false)}
                className="pixar-btn w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#FF7A00] to-[#F97316] text-white py-3 text-xs font-bold shadow-pixar-sm"
              >
                <AlertTriangle className="w-4 h-4 text-white animate-pulse" />
                <span>Report Animal in Distress</span>
              </a>
            </div>
          </div>
        )}
      </header>

      <NotificationDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
      />
    </>
  );
}
