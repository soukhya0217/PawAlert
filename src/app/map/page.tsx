"use client";

import React from "react";
import RescueMap from "@/components/map/RescueMap";
import { AlertTriangle, Crosshair, Radio, ShieldCheck } from "lucide-react";

export default function ExploreMapPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-xs uppercase tracking-wider text-[#d4ff3a] mb-2">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>Tactical Radar Intelligence</span>
          </div>
          <h1 className="text-3xl font-black font-sans text-white tracking-tight">
            Geospatial Emergency Rescue Grid
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-sans">
            Real-time geospatial visualization indexing animal distress alerts, feeding points, and volunteer dispatch sectors. Zero simulated records.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/report"
            className="rounded-md bg-[#ff3b30] px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_18px_rgba(255,59,48,0.45)] border border-red-400/40 hover:bg-[#ff4d4d] transition-all flex items-center gap-2"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Report Animal in Distress</span>
          </a>
        </div>
      </div>

      {/* Main Tactical Map */}
      <RescueMap initialZoom={13} />

      {/* Map Protocol Specs & Legend */}
      <div className="p-4 rounded-xl border border-white/10 bg-[#0a0e17] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
        <div className="flex items-center gap-2.5">
          <span className="w-3.5 h-3.5 rounded-full bg-[#ff3b30] flex-shrink-0 animate-ping"></span>
          <div>
            <p className="font-bold text-white uppercase">Critical Trauma</p>
            <p className="text-[10px] text-slate-400">Road accident, severe injury</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="w-3.5 h-3.5 rounded-full bg-[#d4ff3a] flex-shrink-0"></span>
          <div>
            <p className="font-bold text-white uppercase">Verified Alert</p>
            <p className="text-[10px] text-slate-400">Distress report awaiting assignment</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 flex-shrink-0"></span>
          <div>
            <p className="font-bold text-white uppercase">Feeding Point</p>
            <p className="text-[10px] text-slate-400">Community water and nutrition</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="w-3.5 h-3.5 rounded-full bg-cyan-400 flex-shrink-0"></span>
          <div>
            <p className="font-bold text-white uppercase">Resolved Mission</p>
            <p className="text-[10px] text-slate-400">Successfully rehabilitated / adopted</p>
          </div>
        </div>
      </div>

    </div>
  );
}
