"use client";

import React, { useState, useEffect } from "react";
import Link from "next/navigation";
import { usePathname, useRouter } from "next/navigation";
import { 
  Heart, 
  AlertTriangle, 
  MapPin, 
  User, 
  LogOut, 
  Bell, 
  Menu, 
  X, 
  Shield, 
  Sparkles,
  PawPrint,
  ChevronDown
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

  return (
    <header className="sticky top-0 z-40 w-full bg-cream-50/90 backdrop-blur-md border-b border-cream-200 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand */}
          <a href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-peach-400 to-primary-500 flex items-center justify-center shadow-md shadow-peach-300/40 group-hover:scale-105 transition-transform duration-300">
              <span className="text-2xl animate-wiggle inline-block">🐾</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-black tracking-tight text-primary-900 group-hover:text-primary-600 transition-colors">
                  POWER<span className="text-primary-500">ALERT</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-peach-100 text-primary-700 rounded-full border border-peach-200">
                  24/7 Rescue
                </span>
              </div>
              <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                Every Life Matters <Sparkles className="w-3 h-3 text-amber-500 inline" /> Every Alert Counts
              </p>
            </div>
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            <a
              href="/map"
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
                pathname === "/map"
                  ? "bg-peach-100/70 text-primary-700 shadow-sm"
                  : "text-foreground/80 hover:bg-cream-200/60 hover:text-foreground"
              }`}
            >
              <MapPin className="w-4 h-4 text-primary-500" />
              Rescue Map
            </a>

            <a
              href="/adoption"
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
                pathname === "/adoption"
                  ? "bg-peach-100/70 text-primary-700 shadow-sm"
                  : "text-foreground/80 hover:bg-cream-200/60 hover:text-foreground"
              }`}
            >
              <Heart className="w-4 h-4 text-rose-500" />
              Adopt Pet
            </a>

            <a
              href="/missing"
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
                pathname === "/missing"
                  ? "bg-peach-100/70 text-primary-700 shadow-sm"
                  : "text-foreground/80 hover:bg-cream-200/60 hover:text-foreground"
              }`}
            >
              <PawPrint className="w-4 h-4 text-amber-500" />
              Missing Pets
            </a>

            <a
              href="/how-it-works"
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                pathname === "/how-it-works"
                  ? "bg-peach-100/70 text-primary-700 shadow-sm"
                  : "text-foreground/80 hover:bg-cream-200/60 hover:text-foreground"
              }`}
            >
              How It Works
            </a>

            <a
              href="/donate"
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
                pathname === "/donate"
                  ? "bg-mint-100 text-mint-700 shadow-sm"
                  : "text-foreground/80 hover:bg-mint-50 hover:text-mint-700"
              }`}
            >
              <Sparkles className="w-4 h-4 text-mint-500" />
              Donate
            </a>
          </nav>

          {/* Action CTAs & Auth */}
          <div className="flex items-center gap-3">
            {/* Primary Report Button */}
            <a
              href="/report"
              className="relative inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-red-500 via-primary-500 to-rose-600 text-white font-bold text-sm shadow-md shadow-red-500/25 hover:shadow-lg hover:shadow-red-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 group"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
              </span>
              <AlertTriangle className="w-4 h-4 text-white group-hover:rotate-12 transition-transform" />
              <span>Report Animal</span>
            </a>

            {/* Notification Bell */}
            {currentUser && (
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="relative p-2.5 rounded-xl bg-white border border-cream-200 text-foreground/70 hover:text-primary-600 hover:bg-peach-50 transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 text-white text-[11px] font-black rounded-full flex items-center justify-center animate-bounce">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
            )}

            {/* User Profile / Login */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1.5 pl-2.5 pr-2 rounded-2xl bg-white border border-cream-300 shadow-sm hover:border-peach-300 transition-all"
                >
                  <img
                    src={currentUser.profileImage || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80"}
                    alt={currentUser.fullName}
                    className="w-8 h-8 rounded-full object-cover border border-peach-200"
                  />
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-bold text-foreground leading-tight line-clamp-1 max-w-[100px]">
                      {currentUser.fullName}
                    </p>
                    <p className="text-[10px] text-primary-600 font-semibold uppercase tracking-wider">
                      {currentUser.role.replace("_", " ")}
                    </p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </button>

                {isUserMenuOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-cream-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                    onMouseLeave={() => setIsUserMenuOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-cream-100">
                      <p className="text-xs text-muted-foreground font-medium">Signed in as</p>
                      <p className="text-sm font-bold text-foreground truncate">{currentUser.email}</p>
                    </div>

                    <a
                      href={getDashboardLink(currentUser.role)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-peach-50 hover:text-primary-700 transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Shield className="w-4 h-4 text-primary-500" />
                      Role Dashboard
                    </a>

                    <a
                      href="/user/my-reports"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-peach-50 hover:text-primary-700 transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <PawPrint className="w-4 h-4 text-amber-500" />
                      My Reported Cases
                    </a>

                    <a
                      href="/user/profile"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-peach-50 hover:text-primary-700 transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <User className="w-4 h-4 text-lavender-500" />
                      Profile & Location
                    </a>

                    <div className="border-t border-cream-100 my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <a
                  href="/login"
                  className="px-4 py-2 rounded-xl text-sm font-bold text-foreground/80 hover:text-primary-600 hover:bg-peach-50 transition-all"
                >
                  Sign In
                </a>
                <a
                  href="/register"
                  className="hidden sm:inline-flex px-4 py-2 rounded-xl bg-peach-100 text-primary-700 font-bold text-sm hover:bg-peach-200 transition-colors border border-peach-200 shadow-sm"
                >
                  Join Guardian
                </a>
              </div>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-xl bg-white border border-cream-200 text-foreground"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-cream-200 space-y-2">
            <a
              href="/map"
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-foreground hover:bg-peach-50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <MapPin className="w-4 h-4 text-primary-500" />
              Live Rescue Map
            </a>
            <a
              href="/adoption"
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-foreground hover:bg-peach-50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Heart className="w-4 h-4 text-rose-500" />
              Adopt Companion
            </a>
            <a
              href="/missing"
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-foreground hover:bg-peach-50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <PawPrint className="w-4 h-4 text-amber-500" />
              Missing Pets
            </a>
            <a
              href="/volunteer-register"
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-foreground hover:bg-peach-50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Shield className="w-4 h-4 text-mint-500" />
              Volunteer Registration
            </a>
            <a
              href="/donate"
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-foreground hover:bg-peach-50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Sparkles className="w-4 h-4 text-primary-500" />
              Donate to Sanctuary
            </a>
          </div>
        )}
      </div>

      {/* Notification Drawer */}
      <NotificationDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </header>
  );
}
