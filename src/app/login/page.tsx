"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";

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
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-[18px] border-[2px] border-[#1B3B2B] bg-[#FFB703] flex items-center justify-center text-2xl mx-auto shadow-bento mb-3">
          🐾
        </div>
        <h1 className="text-3xl font-black font-display text-[#1B3B2B] tracking-tight">
          Sign In to PawAlert
        </h1>
        <p className="text-xs text-[#1B3B2B]/70 mt-1 font-sans">
          Central Field Dispatch & Guardian Network
        </p>
      </div>

      <div className="bento-card-white p-6 sm:p-8 space-y-6">
        {errorMsg && (
          <div className="p-3.5 rounded-[14px] border-[2px] border-[#FF5A4E] bg-[#FF5A4E]/10 text-[#FF5A4E] text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="font-display text-xs font-bold text-[#1B3B2B] block mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#1B3B2B]/50 absolute left-3 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="commander@pawalert.org"
                className="w-full pl-9 pr-3 py-2.5 rounded-[14px] border-[2px] border-[#1B3B2B] bg-[#FFFBF5] text-xs font-sans text-[#1B3B2B] focus:outline-none focus:ring-2 focus:ring-[#FF5A4E]"
              />
            </div>
          </div>

          <div>
            <label className="font-display text-xs font-bold text-[#1B3B2B] block mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#1B3B2B]/50 absolute left-3 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-[14px] border-[2px] border-[#1B3B2B] bg-[#FFFBF5] text-xs font-sans text-[#1B3B2B] focus:outline-none focus:ring-2 focus:ring-[#FF5A4E]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bento-btn w-full flex items-center justify-center gap-2 rounded-[16px] bg-[#FF5A4E] py-3 text-sm text-white disabled:opacity-50 mt-2"
          >
            <span>{loading ? "Authenticating..." : "Sign In to Dispatch"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Admin Access Button */}
        <div className="pt-4 border-t-[2px] border-[#1B3B2B]/10 space-y-2">
          <button
            type="button"
            onClick={handleQuickAdminLogin}
            className="bento-btn w-full flex items-center justify-center gap-2 rounded-[14px] bg-[#FFB703] py-2 text-xs text-[#1B3B2B]"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Fill Admin Credentials</span>
          </button>
        </div>
      </div>
    </div>
  );
}
