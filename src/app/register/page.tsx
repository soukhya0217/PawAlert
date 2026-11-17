"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Phone, Lock, MapPin, ArrowRight, AlertCircle, Sparkles } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [city, setCity] = useState("Bangalore");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName || !email || !mobile || !password || !city) {
      setErrorMsg("Please fill out all mandatory fields.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          mobile,
          password,
          city,
          address: address || `${city}, India`,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push("/user/dashboard");
        router.refresh();
      } else {
        setErrorMsg(data.error || "Registration failed. Please try again.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-peach-300 to-primary-500 flex items-center justify-center text-3xl mx-auto shadow-md shadow-peach-300/40 mb-3">
          🐾
        </div>
        <h1 className="text-3xl font-black text-foreground tracking-tight">Become an Animal Guardian</h1>
        <p className="text-xs text-muted-foreground mt-1 font-medium">
          Join the POWER ALERT community network to report and protect lives.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-cream-200 shadow-soft space-y-6">
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground">
              Full Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Priya Sharma"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-cream-300 bg-cream-50/50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="priya@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-cream-300 bg-cream-50/50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground">
              Mobile Number *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3.5" />
              <input
                type="tel"
                required
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-cream-300 bg-cream-50/50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground">
                City *
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Bangalore"
                className="w-full px-3.5 py-2.5 rounded-2xl border border-cream-300 bg-cream-50/50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground">
                Password *
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 chars"
                className="w-full px-3.5 py-2.5 rounded-2xl border border-cream-300 bg-cream-50/50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground">
              Local Address / Sector
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="E.g. Indiranagar, 100ft road"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-cream-300 bg-cream-50/50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-primary-500 to-peach-500 text-white font-black text-sm shadow-md shadow-primary-500/30 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
          >
            <span>{loading ? "Creating Account..." : "Join Animal Guardian Network"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground font-medium pt-2">
          Already registered?{" "}
          <a href="/login" className="font-bold text-primary-600 hover:underline">
            Sign In here
          </a>
        </p>
      </div>
    </div>
  );
}
