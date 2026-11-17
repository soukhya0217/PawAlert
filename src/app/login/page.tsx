"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight, ShieldCheck, Sparkles, User, AlertCircle } from "lucide-react";

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
        // Redirect based on role
        const role = data.user.role;
        if (role === "SUPER_ADMIN") router.push("/admin/dashboard");
        else if (role === "NGO_ADMIN") router.push("/ngo/dashboard");
        else if (role === "VETERINARIAN") router.push("/vet/dashboard");
        else if (role.includes("VOLUNTEER")) router.push("/volunteer/dashboard");
        else router.push("/user/dashboard");

        router.refresh();
      } else {
        setErrorMsg(data.error || "Invalid email or password.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("password123");
    handleLogin(undefined, demoEmail, "password123");
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-peach-300 to-primary-500 flex items-center justify-center text-3xl mx-auto shadow-md shadow-peach-300/40 mb-3">
          🐾
        </div>
        <h1 className="text-3xl font-black text-foreground tracking-tight">Sign in to POWER ALERT</h1>
        <p className="text-xs text-muted-foreground mt-1 font-medium">
          Guardian Network • Emergency Dispatch & Animal Welfare
        </p>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-cream-200 shadow-soft space-y-6">
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-cream-300 bg-cream-50/50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground">
                Password
              </label>
              <a href="/forgot-password" className="text-xs font-bold text-primary-600 hover:underline">
                Forgot?
              </a>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-cream-300 bg-cream-50/50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-primary-500 to-peach-500 text-white font-black text-sm shadow-md shadow-primary-500/30 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{loading ? "Authenticating..." : "Sign In to Dispatch"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* 1-Click Role Testing Switcher */}
        <div className="pt-4 border-t border-cream-200 space-y-2">
          <p className="text-[11px] font-black uppercase tracking-wider text-center text-muted-foreground">
            ⚡ Quick 1-Click Role Demo Sign In
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs font-bold">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin("volunteer@poweralert.org")}
              className="p-2 rounded-xl bg-peach-50 border border-peach-200 text-primary-800 hover:bg-peach-100 transition-colors"
            >
              🦸 Rescuer Volunteer
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin("ngo@poweralert.org")}
              className="p-2 rounded-xl bg-lavender-50 border border-lavender-200 text-lavender-800 hover:bg-lavender-100 transition-colors"
            >
              🏢 NGO Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin("vet@poweralert.org")}
              className="p-2 rounded-xl bg-mint-50 border border-mint-200 text-mint-800 hover:bg-mint-100 transition-colors"
            >
              🩺 Veterinarian
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin("user@poweralert.org")}
              className="p-2 rounded-xl bg-sky-50 border border-sky-200 text-sky-800 hover:bg-sky-100 transition-colors"
            >
              🐾 Citizen Reporter
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground font-medium pt-2">
          Don't have an account?{" "}
          <a href="/register" className="font-bold text-primary-600 hover:underline">
            Register as Guardian
          </a>
        </p>
      </div>
    </div>
  );
}
