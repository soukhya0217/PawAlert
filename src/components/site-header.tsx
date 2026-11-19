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
  Menu, 
  X, 
  Sparkles,
  ShieldCheck,
  Compass,
  Radio
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

  useEffect(() => {
    fetchUser();
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

  // Crisp navigation links as requested
  const navLinks = [
    { label: "Report Emergency", href: "/report", icon: AlertTriangle, highlight: true },
    { label: "Track Case", href: "/track/live", icon: Radio },
    { label: "Command Center", href: "/map", icon: Compass },
    { label: "Adoptions", href: "/adoption", icon: Heart },
  ];

  return (
    <header className="sticky top-0 z-40 border-b-[3px] border-[#1E1B4B] bg-[#FFF9F0]/95 backdrop-blur-md">
      {/* Top Warm Twilight-to-Sunset Mission Banner with Tagline Pill */}
      <div className="bg-gradient-to-r from-[#1E1B4B] via-[#3B286D] to-[#FF7A00] text-[#FFF9F0] py-1.5 px-4 text-center border-b-[2px] border-[#1E1B4B]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 text-[11px] sm:text-xs font-display font-bold">
          <div className="hidden sm:flex items-center gap-1.5 text-[#FBBF24]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>24/7 Community Animal Rescue & Wildlife Radar</span>
          </div>

          {/* Tagline Pill: "Every Paw Matters" */}
          <div className="mx-auto sm:mx-0 inline-flex items-center gap-1.5 rounded-[12px] bg-[#FFB703] px-3 py-0.5 text-[10px] sm:text-[11px] font-black text-[#1E1B4B] border border-[#1E1B4B] shadow-pixar-sm">
            <span>🐾</span>
            <span className="uppercase tracking-wider">Every Paw Matters</span>
          </div>

          <div className="hidden md:inline-flex items-center gap-1 text-[11px] font-mono text-white/90">
            <span>THEY CAN&apos;T SPEAK. YOU CAN.</span>
          </div>
        </div>
      </div>

      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Glossy 3D-Extruded PAWALERT Brand Logo */}
        <a href="/" aria-label="PawAlert Home" className="transition-transform hover:scale-105">
          <PawMark size="md" showTagline={true} />
        </a>

        {/* Crisp Desktop Navigation */}
        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className={`inline-flex h-10 items-center gap-1.5 rounded-[16px] px-3.5 text-xs font-bold font-display transition-all ${
                      link.highlight
                        ? "bg-gradient-to-r from-[#FF7A00] to-[#F97316] text-white shadow-pixar-sm hover:scale-105"
                        : isActive
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

        {/* Right CTA Actions: Sign In / User Profile */}
        <div className="flex items-center gap-2.5">
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
                      <span>Command Dashboard</span>
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
                className="pixar-btn rounded-[16px] bg-[#1E1B4B] text-white border-[2px] border-[#1E1B4B] px-4 py-2 text-xs font-bold shadow-pixar-sm hover:bg-[#2D1B69]"
              >
                Sign In
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
