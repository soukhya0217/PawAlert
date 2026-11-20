"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useRecentIncidents } from "@/lib/use-recent-incidents";
import { AlertTriangle, Compass, Heart, Shield } from "lucide-react";

const AdminMap = dynamic(() => import("@/components/admin-map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[520px] rounded-[24px] border-[3px] border-[#1E1B4B] bg-[#FFF1DC] flex flex-col items-center justify-center p-6 text-center shadow-pixar">
      <div className="h-12 w-12 rounded-[16px] bg-[#FF7A00] flex items-center justify-center text-white mb-3 shadow-pixar-sm">
        <Compass className="w-6 h-6 animate-spin" />
      </div>
      <p className="font-display font-bold text-sm text-[#1E1B4B]">
        Connecting to Sanctuary Geospatial Radar...
      </p>
      <p className="font-mono text-xs text-[#1E1B4B]/70 mt-1">
        OpenStreetMap High-Resolution Tile Stream
      </p>
    </div>
  ),
});

export default function ExploreMapPage() {
  const { incidents, loading } = useRecentIncidents();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-[2px] border-[#1E1B4B] pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-[12px] border-[2px] border-[#1E1B4B] bg-[#FFB703] px-3 py-1 font-display text-xs font-bold text-[#1E1B4B] shadow-pixar-sm mb-2">
            <Compass className="w-3.5 h-3.5 text-[#1E1B4B]" />
            <span>Field Command Grid</span>
          </div>
          <h1 className="text-3xl font-black font-display text-[#1E1B4B] tracking-tight">
            Geospatial Animal Rescue Map
          </h1>
          <p className="text-xs sm:text-sm text-[#1E1B4B]/75 mt-1 font-sans">
            Real-time map visualizing authentic animal distress cases and volunteer dispatch perimeters. Zero mock records.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/report"
            className="pixar-btn inline-flex items-center gap-2 rounded-[16px] bg-[#FF7A00] px-4 py-2.5 text-xs font-bold text-white shadow-pixar-sm"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Drop Emergency Pin</span>
          </a>
        </div>
      </div>

      {/* Main Admin Map Component */}
      <AdminMap incidents={incidents} initialZoom={13} className="min-h-[500px]" />

      {/* Map Protocol & Legend */}
      <div className="p-5 rounded-[22px] border-[2px] border-[#1E1B4B] bg-[#FFF1DC] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-display shadow-pixar-sm">
        <div className="flex items-center gap-2.5">
          <span className="w-4 h-4 rounded-full bg-[#EF4444] border-[1.5px] border-[#1E1B4B] flex-shrink-0 animate-ping"></span>
          <div>
            <p className="font-bold text-[#1E1B4B]">🚨 Critical Trauma</p>
            <p className="text-[11px] text-[#1E1B4B]/70 font-sans">Accident, severe laceration</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="w-4 h-4 rounded-full bg-[#FFB703] border-[1.5px] border-[#1E1B4B] flex-shrink-0"></span>
          <div>
            <p className="font-bold text-[#1E1B4B]">🐾 Verified Alert</p>
            <p className="text-[11px] text-[#1E1B4B]/70 font-sans">Distress report awaiting assignment</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="w-4 h-4 rounded-full bg-[#10B981] border-[1.5px] border-[#1E1B4B] flex-shrink-0"></span>
          <div>
            <p className="font-bold text-[#1E1B4B]">🥣 Feeding Basin</p>
            <p className="text-[11px] text-[#1E1B4B]/70 font-sans">Community food & fresh water point</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="w-4 h-4 rounded-full bg-[#06B6D4] border-[1.5px] border-[#1E1B4B] flex-shrink-0"></span>
          <div>
            <p className="font-bold text-[#1E1B4B]">✅ Healed & Rescued</p>
            <p className="text-[11px] text-[#1E1B4B]/70 font-sans">Rehabilitated / sheltered / adopted</p>
          </div>
        </div>
      </div>

    </div>
  );
}
