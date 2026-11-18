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
  Compass
} from "lucide-react";
import NotificationDrawer from "../notifications/NotificationDrawer";
import { animateMascotPerk } from "@/lib/animations";

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
    { label: "Tactical Map", href: "/map", icon: Compass },
    { label: "Adoptions", href: "/adoption", icon: Heart },
    { label: "Missing Pets", href: "/missing", icon: Search },
    { label: "Protocol", href: "/how-it-works", icon: Info },
    { label: "Donate", href: "/donate", icon: Coins },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 border-b-[2px] border-[#1B3B2B] bg-[#FFFBF5]/90 backdrop-blur-md">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 py-3">
          
          {/* Brand Logo & Mascot */}
          <div className="flex items-center gap-3">
            <a 
              href="/" 
              onMouseEnter={handleMascotHover}
              className="inline-flex items-center gap-2.5 transition-transform hover:scale-[1.02]"
              aria-label="PawAlert Home"
            >
              {/* Interactive SVG Mascot */}
              <div className="h-11 w-11 rounded-[16px] border-[2px] border-[#1B3B2B] bg-[#FFB703] flex items-center justify-center shadow-bento-sm">
                <svg width="32" height="32" viewBox="0 0 40 40" className="overflow-visible">
                  {/* Tail */}
                  <g ref={tailRef} style={{ transformOrigin: "10px 30px" }}>
                    <path d="M10 28 C5 24, 3 16, 7 12" stroke="#1B3B2B" strokeWidth="3" strokeLinecap="round" fill="none" />
                  </g>
                  {/* Left Ear */}
                  <g ref={earLeftRef} style={{ transformOrigin: "15px 14px" }}>
                    <path d="M14 14 C12 6, 8 6, 11 16" fill="#FFFBF5" stroke="#1B3B2B" strokeWidth="2.5" />
                  </g>
                  {/* Right Ear */}
                  <g ref={earRightRef} style={{ transformOrigin: "26px 14px" }}>
                    <path d="M26 14 C28 6, 32 6, 29 16" fill="#FFFBF5" stroke="#1B3B2B" strokeWidth="2.5" />
                  </g>
                  {/* Head */}
                  <circle cx="20" cy="22" r="11" fill="#FFB703" stroke="#1B3B2B" strokeWidth="2.5" />
                  {/* Eyes */}
                  <circle cx="16" cy="20" r="1.8" fill="#1B3B2B" />
                  <circle cx="24" cy="20" r="1.8" fill="#1B3B2B" />
                  {/* Snout */}
                  <ellipse cx="20" cy="24" rx="4" ry="3" fill="#FFFBF5" stroke="#1B3B2B" strokeWidth="1.5" />
                  <polygon points="18.5,23 21.5,23 20,25" fill="#1B3B2B" />
                </svg>
              </div>

              <div className="flex flex-col">
                <span className="font-display text-xl font-black tracking-tight text-[#1B3B2B]">
                  Paw<span className="text-[#FF5A4E]">Alert</span>
                </span>
                <span className="font-mono text-[9px] uppercase tracking-widest text-[#1B3B2B]/70">
                  Rescue & Dispatch
                </span>
              </div>
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
                      className={`inline-flex h-9 items-center gap-1.5 rounded-[14px] px-3.5 text-xs font-bold font-display transition-all ${
                        isActive
                          ? "bg-[#1B3B2B] text-white border-[2px] border-[#1B3B2B] shadow-bento-sm"
                          : "text-[#1B3B2B] hover:bg-[#F5EFE6]"
                      }`}
                    >
                      <link.icon className={`w-3.5 h-3.5 ${isActive ? "text-[#FFB703]" : "text-[#1B3B2B]"}`} />
                      {link.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Action Hub & Authentication */}
          <div className="flex items-center gap-2.5">
            {/* Urgent Report Button */}
            <a
              href="/report"
              className="bento-btn relative inline-flex items-center gap-2 rounded-[16px] bg-[#FF5A4E] px-4 py-2.5 text-xs text-white"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-white" />
              <span>Report Animal</span>
            </a>

            {/* Notification Drawer Button */}
            {currentUser && (
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="bento-btn relative rounded-[14px] bg-[#FFFBF5] p-2 text-[#1B3B2B]"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#FF5A4E] text-[9px] font-bold text-white">
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
                  className="bento-btn flex items-center gap-2 rounded-[14px] bg-[#FFFBF5] px-3 py-1.5 text-xs text-[#1B3B2B]"
                >
                  <div className="h-6 w-6 rounded-full bg-[#FFB703] border-[1.5px] border-[#1B3B2B] flex items-center justify-center text-[11px] font-bold text-[#1B3B2B]">
                    {currentUser.fullName.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline max-w-[90px] truncate">{currentUser.fullName}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-[18px] border-[2px] border-[#1B3B2B] bg-[#FFFBF5] p-2 shadow-bento z-50">
                    <div className="px-3 py-2 border-b-[2px] border-[#1B3B2B]/10">
                      <p className="text-xs font-bold text-[#1B3B2B] truncate">{currentUser.fullName}</p>
                      <p className="text-[10px] font-mono text-[#1B3B2B]/60 truncate">{currentUser.email}</p>
                      <span className="mt-1 inline-block rounded-[8px] bg-[#2EC4B6]/20 px-1.5 py-0.5 text-[9px] font-mono font-bold text-[#1B3B2B]">
                        {currentUser.role}
                      </span>
                    </div>

                    <div className="py-1">
                      <a
                        href="/admin/dashboard"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex w-full items-center gap-2 rounded-[10px] px-3 py-2 text-xs font-bold font-display text-[#1B3B2B] hover:bg-[#F5EFE6]"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-[#2EC4B6]" />
                        <span>Command Dashboard</span>
                      </a>
                    </div>

                    <div className="pt-1 border-t-[2px] border-[#1B3B2B]/10">
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 rounded-[10px] px-3 py-2 text-xs font-bold font-display text-[#FF5A4E] hover:bg-[#FF5A4E]/10"
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
                  className="bento-btn rounded-[14px] bg-[#FFFBF5] px-3.5 py-2 text-xs text-[#1B3B2B]"
                >
                  Sign In
                </a>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden bento-btn rounded-[14px] bg-[#FFFBF5] p-2 text-[#1B3B2B]"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t-[2px] border-[#1B3B2B] bg-[#FFFBF5] px-4 py-4 space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 rounded-[14px] px-3 py-2 text-xs font-display font-bold ${
                  pathname === link.href
                    ? "bg-[#1B3B2B] text-white"
                    : "text-[#1B3B2B] hover:bg-[#F5EFE6]"
                }`}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </a>
            ))}
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
