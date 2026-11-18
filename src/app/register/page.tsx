"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Phone, Lock, MapPin, ArrowRight, AlertCircle, Sparkles, HeartHandshake } from "lucide-react";

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
    <div className="max-w-md mx-auto px-4 py-12 sm:py-16">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-[22px] border-[3px] border-[#1E1B4B] bg-[#FF7A00] text-white flex items-center justify-center text-3xl mx-auto shadow-pixar mb-3">
          🐾
        </div>
        <h1 className="text-3xl font-black font-display text-[#1E1B4B] tracking-tight">
          Join PawAlert
        </h1>
        <p className="text-xs text-[#1E1B4B]/70 mt-1 font-sans">
          Create a Citizen Guardian Account — Be Their Voice
        </p>
      </div>

      <div className="pixar-card p-6 sm:p-8 space-y-6">
        {errorMsg && (
          <div className="p-3.5 rounded-[16px] border-[2px] border-[#EF4444] bg-[#EF4444]/10 text-[#EF4444] text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="font-display text-xs font-bold text-[#1E1B4B] block mb-1">
              Full Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#1E1B4B]/50 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Priya Sharma"
                className="w-full pl-10 pr-4 py-2.5 rounded-[16px] border-[2px] border-[#1E1B4B] bg-[#FFF9F0] text-xs font-sans text-[#1E1B4B] focus:outline-none focus:ring-2 focus:ring-[#FF7A00]"
              />
            </div>
          </div>

          <div>
            <label className="font-display text-xs font-bold text-[#1E1B4B] block mb-1">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#1E1B4B]/50 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="priya@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-[16px] border-[2px] border-[#1E1B4B] bg-[#FFF9F0] text-xs font-sans text-[#1E1B4B] focus:outline-none focus:ring-2 focus:ring-[#FF7A00]"
              />
            </div>
            <span className="text-[10px] text-[#1E1B4B]/60 mt-1 block font-mono">
              ⚡ Welcome confirmation email will be sent automatically
            </span>
          </div>

          <div>
            <label className="font-display text-xs font-bold text-[#1E1B4B] block mb-1">
              Mobile Phone *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-[#1E1B4B]/50 absolute left-3.5 top-3.5" />
              <input
                type="tel"
                required
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full pl-10 pr-4 py-2.5 rounded-[16px] border-[2px] border-[#1E1B4B] bg-[#FFF9F0] text-xs font-sans text-[#1E1B4B] focus:outline-none focus:ring-2 focus:ring-[#FF7A00]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-display text-xs font-bold text-[#1E1B4B] block mb-1">
                City *
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Bangalore"
                className="w-full px-3.5 py-2.5 rounded-[16px] border-[2px] border-[#1E1B4B] bg-[#FFF9F0] text-xs font-sans text-[#1E1B4B] focus:outline-none focus:ring-2 focus:ring-[#FF7A00]"
              />
            </div>

            <div>
              <label className="font-display text-xs font-bold text-[#1E1B4B] block mb-1">
                Password *
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 chars"
                className="w-full px-3.5 py-2.5 rounded-[16px] border-[2px] border-[#1E1B4B] bg-[#FFF9F0] text-xs font-sans text-[#1E1B4B] focus:outline-none focus:ring-2 focus:ring-[#FF7A00]"
              />
            </div>
          </div>

          <div>
            <label className="font-display text-xs font-bold text-[#1E1B4B] block mb-1">
              Local Address / Landmark
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-[#1E1B4B]/50 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="E.g. Indiranagar, 100ft road"
                className="w-full pl-10 pr-4 py-2.5 rounded-[16px] border-[2px] border-[#1E1B4B] bg-[#FFF9F0] text-xs font-sans text-[#1E1B4B] focus:outline-none focus:ring-2 focus:ring-[#FF7A00]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="pixar-btn w-full flex items-center justify-center gap-2 rounded-[18px] bg-gradient-to-r from-[#FF7A00] to-[#F97316] py-3 text-sm font-bold text-white shadow-pixar disabled:opacity-50 mt-4"
          >
            <Sparkles className="w-4 h-4" />
            <span>{loading ? "Creating Account..." : "Join Animal Guardian Network"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t-[2px] border-[#1E1B4B]/10 text-center space-y-2">
          <p className="font-display text-xs text-[#1E1B4B]/75">
            Already registered?{" "}
            <a href="/login" className="font-bold text-[#FF7A00] hover:underline">
              Sign In here
            </a>
          </p>

          <p className="font-display text-xs text-[#1E1B4B]/60">
            Want to be an active rescuer?{" "}
            <a href="/volunteer-register" className="font-bold text-[#10B981] hover:underline">
              Apply as Volunteer →
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
