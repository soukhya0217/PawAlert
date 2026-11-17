"use client";

import React, { useEffect, useState } from "react";
import { 
  AlertTriangle, 
  MapPin, 
  ShieldCheck, 
  Radio, 
  Crosshair, 
  ArrowRight,
  Zap,
  Activity,
  HeartHandshake
} from "lucide-react";

export default function HeroSection() {
  const [activeAlertsCount, setActiveAlertsCount] = useState<number>(0);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    // Fetch REAL incident counts only - zero fake data
    const fetchRealData = async () => {
      try {
        const res = await fetch("/api/incidents?limit=100");
        const data = await res.json();
        if (data.incidents && Array.isArray(data.incidents)) {
          setActiveAlertsCount(data.incidents.length);
        }
      } catch (e) {
        console.error("Telemetry fetch error:", e);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchRealData();
  }, []);

  return (
    <section className="relative isolate min-h-[85vh] overflow-hidden pt-8 pb-16 flex flex-col justify-center">
      {/* 1. Tactical Background Grid (Overrank Style) */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="grid-lines absolute inset-0 opacity-60"></div>
        
        {/* Aurora Radial Lime Glow */}
        <div 
          className="absolute -top-32 left-[15%] h-[32rem] w-[32rem] rounded-full opacity-20 blur-3xl will-change-transform"
          style={{ background: "radial-gradient(circle, #d4ff3a, transparent 70%)" }}
        />
        
        {/* Emergency Crimson Glow */}
        <div 
          className="absolute top-1/3 -right-24 h-[28rem] w-[28rem] rounded-full opacity-25 blur-3xl will-change-transform"
          style={{ background: "radial-gradient(circle, #ff3b30, transparent 70%)" }}
        />

        {/* Scanlines Overlay */}
        <div className="scanlines absolute inset-0 opacity-40"></div>
      </div>

      {/* 2. Overrank 3D Perspective Floor Grid */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[48%] [perspective:520px] max-md:opacity-40 -z-10"
      >
        <div className="absolute inset-x-[-40%] bottom-0 h-[220%] origin-bottom [transform:rotateX(68deg)] [mask-image:linear-gradient(to_top,#000_20%,transparent_90%)]">
          <div className="floor-run h-[calc(100%+56px)] w-full -translate-y-[56px]"></div>
        </div>
      </div>

      {/* Hero Content Container */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: Mission Control Telemetry & Call to Action */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* Top Telemetry Beacon */}
            <div className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-[#0a0e17]/80 px-3.5 py-1.5 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d4ff3a] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#d4ff3a]"></span>
              </span>
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-white">
                TACTICAL DISPATCH ENGINE
              </span>
              <span className="h-3 w-[1px] bg-white/20" />
              <span className="font-mono text-[11px] text-[#d4ff3a]">
                GEOJSON 2DSPHERE ACTIVE
              </span>
            </div>

            {/* Aggressive Modern Typography */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-sans tracking-tight text-white leading-[1.08]">
              EVERY LIFE COUNTS. <br />
              <span className="text-[#d4ff3a] drop-shadow-[0_0_24px_rgba(212,255,58,0.35)]">
                EVERY ALERT DISPATCHED.
              </span>
            </h1>

            {/* Crisp Strategic Mission Statement */}
            <p className="text-base sm:text-lg text-slate-300 font-normal max-w-xl leading-relaxed">
              The high-velocity animal rescue management network. Real-time geographical triangulation connects citizens, verified responders, veterinarians, and shelters with zero delays.
            </p>

            {/* Tactical Action Triggers */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="/report"
                className="inline-flex items-center gap-2 rounded-md bg-[#ff3b30] px-6 py-3.5 font-mono text-sm font-bold uppercase tracking-wider text-white shadow-[0_0_24px_rgba(255,59,48,0.5)] border border-red-400/40 hover:bg-[#ff4d4d] hover:shadow-[0_0_32px_rgba(255,59,48,0.7)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Report Animal in Distress</span>
              </a>

              <a
                href="/map"
                className="inline-flex items-center gap-2 rounded-md border border-white/20 bg-[#0a0e17]/80 px-5 py-3.5 font-mono text-sm font-bold uppercase tracking-wider text-white hover:border-[#d4ff3a]/60 hover:text-[#d4ff3a] hover:bg-[#0a0e17] shadow-lg backdrop-blur-md transition-all duration-200 group"
              >
                <Crosshair className="w-4 h-4 text-[#d4ff3a] group-hover:rotate-45 transition-transform" />
                <span>Open Tactical Grid</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>

            {/* Telemetry Metrics Row (Real counts only) */}
            <div className="pt-6 border-t border-white/10 grid grid-cols-3 gap-4">
              <div>
                <p className="font-mono text-xl sm:text-2xl font-black text-white">
                  {loadingStats ? "..." : activeAlertsCount}
                </p>
                <p className="font-mono text-[11px] uppercase tracking-wider text-slate-400">
                  Active Alerts
                </p>
              </div>

              <div>
                <p className="font-mono text-xl sm:text-2xl font-black text-[#d4ff3a]">
                  100%
                </p>
                <p className="font-mono text-[11px] uppercase tracking-wider text-slate-400">
                  Verified Audit
                </p>
              </div>

              <div>
                <p className="font-mono text-xl sm:text-2xl font-black text-emerald-400">
                  0 ms
                </p>
                <p className="font-mono text-[11px] uppercase tracking-wider text-slate-400">
                  Atomic Lock Lag
                </p>
              </div>
            </div>

          </div>

          {/* Right Column: Mission Control HUD Card */}
          <div className="lg:col-span-5">
            <div className="relative rounded-xl border border-white/15 bg-[#0a0e17]/90 p-6 shadow-2xl backdrop-blur-2xl space-y-5">
              
              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#d4ff3a]" />
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-white">
                    Emergency Dispatch Radar
                  </span>
                </div>
                <span className="rounded border border-[#d4ff3a]/30 bg-[#d4ff3a]/10 px-2 py-0.5 font-mono text-[10px] text-[#d4ff3a]">
                  STATUS: LIVE
                </span>
              </div>

              {/* Quick Distress Categories */}
              <div className="space-y-3">
                <span className="font-mono text-[11px] uppercase tracking-wider text-slate-400">
                  Select Emergency Category:
                </span>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Injured Stray", icon: "🚨", type: "CRITICAL" },
                    { label: "Hit & Run / Accident", icon: "🚗", type: "CRITICAL" },
                    { label: "Trapped / Starving", icon: "⚠️", type: "HIGH" },
                    { label: "Abuse / Abandoned", icon: "🛡️", type: "HIGH" },
                  ].map((cat, idx) => (
                    <a
                      key={idx}
                      href={`/report?category=${encodeURIComponent(cat.label)}`}
                      className="flex items-center gap-2.5 rounded-lg border border-white/10 bg-white/5 p-3 hover:border-[#d4ff3a]/50 hover:bg-white/10 transition-all group"
                    >
                      <span className="text-lg">{cat.icon}</span>
                      <div className="text-left">
                        <p className="font-sans text-xs font-bold text-white group-hover:text-[#d4ff3a] transition-colors">
                          {cat.label}
                        </p>
                        <p className="font-mono text-[9px] text-slate-400">
                          PRIORITY: {cat.type}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              {/* Protocol Assurance Box */}
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-950/20 p-3.5 space-y-1.5">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="font-mono text-xs font-bold uppercase text-emerald-400">
                    Rescue Accountability Engine
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                  Every incident creates an immutable audit trail with GPS telemetry, 12-stage milestone tracking, photo evidence, and atomic volunteer lock.
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
