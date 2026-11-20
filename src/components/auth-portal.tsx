"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Lock, 
  Mail, 
  User, 
  Phone, 
  MapPin, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle, 
  Sparkles,
  HeartHandshake,
  CheckCircle2
} from "lucide-react";
import anime from "animejs";

interface AuthPortalProps {
  onFocusChange?: (focused: boolean) => void;
  className?: string;
}

export default function AuthPortal({ onFocusChange, className = "" }: AuthPortalProps) {
  const router = useRouter();

  const [mode, setMode] = useState<"LOGIN" | "REGISTER">("LOGIN");

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register form state
  const [regFullName, setRegFullName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regMobile, setRegMobile] = useState("");
  const [regCity, setRegCity] = useState("Bangalore");
  const [regPassword, setRegPassword] = useState("");
  const [regRole, setRegRole] = useState<"PUBLIC_USER" | "RESCUE_VOLUNTEER">("PUBLIC_USER");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Animate card entrance with spring physics on mount
  useEffect(() => {
    anime({
      targets: ".auth-portal-card",
      translateY: [30, 0],
      opacity: [0, 1],
      duration: 650,
      easing: "easeOutElastic(1, 0.75)",
    });
  }, []);

  // Tab change animation
  const handleTabChange = (targetMode: "LOGIN" | "REGISTER") => {
    if (mode === targetMode) return;
    setErrorMsg(null);
    setSuccessMsg(null);
    setMode(targetMode);

    anime({
      targets: ".auth-form-container",
      opacity: [0, 1],
      translateY: [12, 0],
      duration: 350,
      easing: "easeOutCubic",
    });
  };

  const handleInputFocus = () => {
    if (onFocusChange) onFocusChange(true);
  };

  const handleInputBlur = () => {
    if (onFocusChange) onFocusChange(false);
  };

  // 1. Real Login
  const handleLoginSubmit = async (e?: React.FormEvent, customEmail?: string, customPass?: string) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const email = customEmail || loginEmail;
    const password = customPass || loginPassword;

    if (!email || !password) {
      setErrorMsg("Please provide both email and password.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMsg("Signed in successfully! Redirecting...");
        const role = data.user?.role;
        setTimeout(() => {
          if (role === "SUPER_ADMIN") router.push("/admin/dashboard");
          else if (role === "NGO_ADMIN") router.push("/ngo/dashboard");
          else if (role === "VETERINARIAN") router.push("/vet/dashboard");
          else if (role && role.includes("VOLUNTEER")) router.push("/volunteer/dashboard");
          else router.push("/user/dashboard");
          router.refresh();
        }, 500);
      } else {
        setErrorMsg(data.error || "Invalid email or password.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Real Registration
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!regFullName || !regEmail || !regMobile || !regPassword) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }

    if (regPassword.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: regFullName.trim(),
          email: regEmail.trim(),
          mobile: regMobile.trim(),
          password: regPassword,
          city: regCity.trim(),
          role: regRole,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMsg("Account created! Welcome email dispatched. Redirecting...");
        setTimeout(() => {
          router.push("/user/dashboard");
          router.refresh();
        }, 800);
      } else {
        setErrorMsg(data.error || "Could not complete registration.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // 1-Click Bootstrap Admin Credential Fill
  const handleFillAdmin = () => {
    const adminEmail = "admin@pawalert.org";
    const adminPass = "AdminPass2026!";
    setLoginEmail(adminEmail);
    setLoginPassword(adminPass);
    handleLoginSubmit(undefined, adminEmail, adminPass);
  };

  return (
    <div
      className={`auth-portal-card pixar-card p-6 sm:p-8 bg-[#FFF9F0] dark:bg-[#17153B] border-[3px] border-[#1E1B4B] dark:border-[#3B286D] rounded-[28px] shadow-pixar transition-colors duration-300 ${className}`}
    >
      {/* Tab Switcher: Sign In vs Join Guardian */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-[20px] border-[2px] border-[#1E1B4B] dark:border-[#3B286D] bg-[#FFF1DC] dark:bg-[#12102E] mb-6 shadow-pixar-sm">
        <button
          type="button"
          onClick={() => handleTabChange("LOGIN")}
          className={`flex-1 py-2 text-xs sm:text-sm font-display font-black rounded-[14px] transition-all ${
            mode === "LOGIN"
              ? "bg-[#1E1B4B] dark:bg-[#3B286D] text-white shadow-pixar-sm"
              : "text-[#1E1B4B] dark:text-[#FFF9F0]/80 hover:bg-[#FFF9F0] dark:hover:bg-[#1E1B4B]"
          }`}
        >
          Sign In
        </button>

        <button
          type="button"
          onClick={() => handleTabChange("REGISTER")}
          className={`flex-1 py-2 text-xs sm:text-sm font-display font-black rounded-[14px] transition-all ${
            mode === "REGISTER"
              ? "bg-[#FF7A00] text-white shadow-pixar-sm"
              : "text-[#1E1B4B] dark:text-[#FFF9F0]/80 hover:bg-[#FFF9F0] dark:hover:bg-[#1E1B4B]"
          }`}
        >
          Join as Guardian
        </button>
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div className="mb-4 p-3.5 rounded-[16px] border-[2px] border-[#EF4444] bg-[#EF4444]/10 text-[#EF4444] text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-4 p-3.5 rounded-[16px] border-[2px] border-[#10B981] bg-[#10B981]/10 text-[#10B981] text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* FORM: Sign In */}
      {mode === "LOGIN" ? (
        <form onSubmit={handleLoginSubmit} className="auth-form-container space-y-4">
          <div>
            <label className="block font-display text-xs font-bold text-[#1E1B4B] dark:text-[#FFF9F0] mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#1E1B4B]/50 dark:text-[#FFF9F0]/50 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={loginEmail}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="rescuer@pawalert.org"
                className="w-full pl-10 pr-4 py-2.5 rounded-[16px] border-[2px] border-[#1E1B4B] dark:border-[#3B286D] bg-[#FFF9F0] dark:bg-[#1E1B4B] text-xs font-sans text-[#1E1B4B] dark:text-[#FFF9F0] focus:outline-none focus:ring-2 focus:ring-[#FF7A00]"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-display text-xs font-bold text-[#1E1B4B] dark:text-[#FFF9F0]">
                Password
              </label>
              <a
                href="/forgot-password"
                className="text-xs font-display font-bold text-[#FF7A00] hover:text-[#EA580C] underline decoration-[#FF7A00]/40 transition-colors"
              >
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#1E1B4B]/50 dark:text-[#FFF9F0]/50 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={loginPassword}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-[16px] border-[2px] border-[#1E1B4B] dark:border-[#3B286D] bg-[#FFF9F0] dark:bg-[#1E1B4B] text-xs font-sans text-[#1E1B4B] dark:text-[#FFF9F0] focus:outline-none focus:ring-2 focus:ring-[#FF7A00]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="pixar-btn w-full flex items-center justify-center gap-2 rounded-[18px] bg-gradient-to-r from-[#FF7A00] to-[#F97316] py-3 text-sm font-bold text-white shadow-pixar disabled:opacity-50 mt-2"
          >
            <span>{loading ? "Authenticating..." : "Sign In to Dispatch"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Quick Admin Access Button */}
          <div className="pt-3 border-t-[2px] border-[#1E1B4B]/10">
            <button
              type="button"
              onClick={handleFillAdmin}
              className="pixar-btn w-full flex items-center justify-center gap-2 rounded-[16px] bg-[#FFB703] py-2 text-xs font-bold text-[#1E1B4B] shadow-pixar-sm"
            >
              <ShieldCheck className="w-4 h-4 text-[#1E1B4B]" />
              <span>Fill Admin Credentials (1-Click)</span>
            </button>
          </div>
        </form>
      ) : (
        /* FORM: Join as Guardian / Register */
        <form onSubmit={handleRegisterSubmit} className="auth-form-container space-y-3">
          <div>
            <label className="block font-display text-xs font-bold text-[#1E1B4B] dark:text-[#FFF9F0] mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#1E1B4B]/50 dark:text-[#FFF9F0]/50 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={regFullName}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                onChange={(e) => setRegFullName(e.target.value)}
                placeholder="Maya Sharma"
                className="w-full pl-10 pr-4 py-2 rounded-[16px] border-[2px] border-[#1E1B4B] dark:border-[#3B286D] bg-[#FFF9F0] dark:bg-[#1E1B4B] text-xs font-sans text-[#1E1B4B] dark:text-[#FFF9F0] focus:outline-none focus:ring-2 focus:ring-[#FF7A00]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block font-display text-xs font-bold text-[#1E1B4B] dark:text-[#FFF9F0] mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#1E1B4B]/50 dark:text-[#FFF9F0]/50 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={regEmail}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="maya@example.com"
                  className="w-full pl-10 pr-4 py-2 rounded-[16px] border-[2px] border-[#1E1B4B] dark:border-[#3B286D] bg-[#FFF9F0] dark:bg-[#1E1B4B] text-xs font-sans text-[#1E1B4B] dark:text-[#FFF9F0] focus:outline-none focus:ring-2 focus:ring-[#FF7A00]"
                />
              </div>
            </div>

            <div>
              <label className="block font-display text-xs font-bold text-[#1E1B4B] dark:text-[#FFF9F0] mb-1">
                Phone
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#1E1B4B]/50 dark:text-[#FFF9F0]/50 absolute left-3.5 top-3.5" />
                <input
                  type="tel"
                  required
                  value={regMobile}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  onChange={(e) => setRegMobile(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-10 pr-4 py-2 rounded-[16px] border-[2px] border-[#1E1B4B] dark:border-[#3B286D] bg-[#FFF9F0] dark:bg-[#1E1B4B] text-xs font-sans text-[#1E1B4B] dark:text-[#FFF9F0] focus:outline-none focus:ring-2 focus:ring-[#FF7A00]"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block font-display text-xs font-bold text-[#1E1B4B] dark:text-[#FFF9F0] mb-1">
                City / Region
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-[#1E1B4B]/50 dark:text-[#FFF9F0]/50 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={regCity}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  onChange={(e) => setRegCity(e.target.value)}
                  placeholder="Bangalore"
                  className="w-full pl-10 pr-4 py-2 rounded-[16px] border-[2px] border-[#1E1B4B] dark:border-[#3B286D] bg-[#FFF9F0] dark:bg-[#1E1B4B] text-xs font-sans text-[#1E1B4B] dark:text-[#FFF9F0] focus:outline-none focus:ring-2 focus:ring-[#FF7A00]"
                />
              </div>
            </div>

            <div>
              <label className="block font-display text-xs font-bold text-[#1E1B4B] dark:text-[#FFF9F0] mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#1E1B4B]/50 dark:text-[#FFF9F0]/50 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={regPassword}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="At least 6 chars"
                  className="w-full pl-10 pr-4 py-2 rounded-[16px] border-[2px] border-[#1E1B4B] dark:border-[#3B286D] bg-[#FFF9F0] dark:bg-[#1E1B4B] text-xs font-sans text-[#1E1B4B] dark:text-[#FFF9F0] focus:outline-none focus:ring-2 focus:ring-[#FF7A00]"
                />
              </div>
            </div>
          </div>

          {/* Role selector: Citizen vs Field Rescuer */}
          <div>
            <label className="block font-display text-xs font-bold text-[#1E1B4B] dark:text-[#FFF9F0] mb-1">
              Guardian Role
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRegRole("PUBLIC_USER")}
                className={`p-2 rounded-[14px] border-[2px] text-xs font-bold font-display text-center transition-all ${
                  regRole === "PUBLIC_USER"
                    ? "border-[#1E1B4B] dark:border-[#FBBF24] bg-[#FFB703] text-[#1E1B4B] shadow-pixar-sm"
                    : "border-[#1E1B4B]/20 dark:border-[#3B286D] bg-[#FFF1DC] dark:bg-[#1E1B4B] text-[#1E1B4B]/70 dark:text-[#FFF9F0]/70"
                }`}
              >
                🐾 Citizen Reporter
              </button>
              <button
                type="button"
                onClick={() => setRegRole("RESCUE_VOLUNTEER")}
                className={`p-2 rounded-[14px] border-[2px] text-xs font-bold font-display text-center transition-all ${
                  regRole === "RESCUE_VOLUNTEER"
                    ? "border-[#1E1B4B] dark:border-[#10B981] bg-[#10B981] text-white shadow-pixar-sm"
                    : "border-[#1E1B4B]/20 dark:border-[#3B286D] bg-[#FFF1DC] dark:bg-[#1E1B4B] text-[#1E1B4B]/70 dark:text-[#FFF9F0]/70"
                }`}
              >
                🚑 Field Rescuer
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="pixar-btn w-full flex items-center justify-center gap-2 rounded-[18px] bg-gradient-to-r from-[#FF7A00] to-[#F97316] py-3 text-sm font-bold text-white shadow-pixar disabled:opacity-50 mt-3"
          >
            <span>{loading ? "Creating Account..." : "Join PawAlert Dispatch"}</span>
            <Sparkles className="w-4 h-4" />
          </button>
        </form>
      )}
    </div>
  );
}
