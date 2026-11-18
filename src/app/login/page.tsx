"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, UserPlus, HeartHandshake, Building2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e?: React.FormEvent, customEmail?: string, customPass?: string) => {
    if (e) e.preventDefault();
    setErrorMsg(null);

    const loginEmail = customEmail || email;
    const loginPass = customPass || password;

    if (!loginEmail || !loginPass) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPass }),
      });

      const data = await res.json();

      if (res.ok) {
        const role = data.user.role;
        if (role === "SUPER_ADMIN") router.push("/admin/dashboard");
        else if (role === "NGO_ADMIN") router.push("/ngo/dashboard");
        else if (role === "VETERINARIAN") router.push("/vet/dashboard");
        else if (role.includes("VOLUNTEER")) router.push("/volunteer/dashboard");
        else router.push("/user/dashboard");

        router.refresh();
      } else {
        setErrorMsg(data.error || "Invalid credentials.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdminLogin = () => {
    const adminEmail = "admin@pawalert.org";
    const adminPass = "AdminPass2026!";
    setEmail(adminEmail);
    setPassword(adminPass);
    handleLogin(undefined, adminEmail, adminPass);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 sm:py-16">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-[22px] border-[3px] border-[#1E1B4B] bg-[#FFB703] flex items-center justify-center text-3xl mx-auto shadow-pixar mb-3">
          🐾
        </div>
        <h1 className="text-3xl font-black font-display text-[#1E1B4B] tracking-tight">
          Sign In to PawAlert
        </h1>
        <p className="text-xs text-[#1E1B4B]/70 mt-1 font-sans">
          Central Animal Rescue Dispatch & Guardian Command
        </p>
      </div>

      {/* Main Login Card */}
      <div className="pixar-card p-6 sm:p-8 space-y-6">
        {errorMsg && (
          <div className="p-3.5 rounded-[16px] border-[2px] border-[#EF4444] bg-[#EF4444]/10 text-[#EF4444] text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="font-display text-xs font-bold text-[#1E1B4B] block mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#1E1B4B]/50 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rescuer@pawalert.org"
                className="w-full pl-10 pr-4 py-2.5 rounded-[16px] border-[2px] border-[#1E1B4B] bg-[#FFF9F0] text-xs font-sans text-[#1E1B4B] focus:outline-none focus:ring-2 focus:ring-[#FF7A00]"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-display text-xs font-bold text-[#1E1B4B]">
                Password
              </label>
              {/* Forgot Password Link */}
              <a
                href="/forgot-password"
                className="text-xs font-display font-bold text-[#FF7A00] hover:text-[#EA580C] underline decoration-[#FF7A00]/40 transition-colors"
              >
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#1E1B4B]/50 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-[16px] border-[2px] border-[#1E1B4B] bg-[#FFF9F0] text-xs font-sans text-[#1E1B4B] focus:outline-none focus:ring-2 focus:ring-[#FF7A00]"
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
        </form>

        {/* Quick Admin Access Button */}
        <div className="pt-4 border-t-[2px] border-[#1E1B4B]/10 space-y-2">
          <button
            type="button"
            onClick={handleQuickAdminLogin}
            className="pixar-btn w-full flex items-center justify-center gap-2 rounded-[16px] bg-[#FFB703] py-2.5 text-xs font-bold text-[#1E1B4B] shadow-pixar-sm"
          >
            <ShieldCheck className="w-4 h-4 text-[#1E1B4B]" />
            <span>Fill Admin Credentials (1-Click)</span>
          </button>
        </div>

        {/* Sign Up / Registration Options */}
        <div className="pt-4 border-t-[2px] border-[#1E1B4B]/10 space-y-3">
          <div className="text-center">
            <span className="font-display text-xs text-[#1E1B4B]/70">
              New to PawAlert?
            </span>
          </div>

          {/* Primary Citizen Sign Up Button */}
          <a
            href="/register"
            className="pixar-btn w-full flex items-center justify-center gap-2 rounded-[16px] bg-[#FFF1DC] py-2.5 text-xs font-bold text-[#1E1B4B] shadow-pixar-sm hover:bg-[#FFE8C2]"
          >
            <UserPlus className="w-4 h-4 text-[#FF7A00]" />
            <span>Create Citizen Account (Sign Up)</span>
          </a>

          {/* Specialized Onboarding Pathways */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <a
              href="/volunteer-register"
              className="pixar-btn rounded-[14px] bg-[#FFF9F0] p-2 text-center text-[11px] font-bold text-[#1E1B4B] shadow-pixar-sm flex items-center justify-center gap-1.5 hover:bg-[#FFF1DC]"
            >
              <HeartHandshake className="w-3.5 h-3.5 text-[#10B981]" />
              <span>Join as Volunteer</span>
            </a>

            <a
              href="/ngo-register"
              className="pixar-btn rounded-[14px] bg-[#FFF9F0] p-2 text-center text-[11px] font-bold text-[#1E1B4B] shadow-pixar-sm flex items-center justify-center gap-1.5 hover:bg-[#FFF1DC]"
            >
              <Building2 className="w-3.5 h-3.5 text-[#1D4ED8]" />
              <span>Register NGO</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
