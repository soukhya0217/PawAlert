"use client";

import React from "react";
import AdminMap from "@/components/admin-map";
import { useRecentIncidents } from "@/lib/use-recent-incidents";
import { AlertTriangle, Compass, Heart, Shield } from "lucide-react";

export default function ExploreMapPage() {
  const { incidents, loading } = useRecentIncidents();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-[2px] border-[#1B3B2B] pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-[12px] border-[2px] border-[#1B3B2B] bg-[#FFB703] px-3 py-1 font-display text-xs font-bold text-[#1B3B2B] shadow-bento-sm mb-2">
            <Compass className="w-3.5 h-3.5 text-[#1B3B2B]" />
            <span>Field Command Grid</span>
          </div>
          <h1 className="text-3xl font-black font-display text-[#1B3B2B] tracking-tight">
            Geospatial Animal Rescue Map
          </h1>
          <p className="text-xs sm:text-sm text-[#1B3B2B]/75 mt-1 font-sans">
            Real-time map visualizing authentic animal distress cases and volunteer dispatch perimeters. Zero mock records.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/report"
            className="bento-btn inline-flex items-center gap-2 rounded-[16px] bg-[#FF5A4E] px-4 py-2.5 text-xs text-white"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Drop Emergency Pin</span>
          </a>
        </div>
      </div>

      {/* Main Admin Map Component */}
      <AdminMap incidents={incidents} initialZoom={13} className="min-h-[500px]" />

      {/* Map Protocol & Legend */}
      <div className="p-5 rounded-[22px] border-[2px] border-[#1B3B2B] bg-[#F5EFE6] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-display shadow-bento-sm">
        <div className="flex items-center gap-2.5">
          <span className="w-4 h-4 rounded-full bg-[#FF5A4E] border-[1.5px] border-[#1B3B2B] flex-shrink-0 animate-ping"></span>
          <div>
            <p className="font-bold text-[#1B3B2B]">🚨 Critical Trauma</p>
            <p className="text-[11px] text-[#1B3B2B]/70 font-sans">Accident, severe laceration</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="w-4 h-4 rounded-full bg-[#FFB703] border-[1.5px] border-[#1B3B2B] flex-shrink-0"></span>
          <div>
            <p className="font-bold text-[#1B3B2B]">🐾 Verified Alert</p>
            <p className="text-[11px] text-[#1B3B2B]/70 font-sans">Distress report awaiting assignment</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="w-4 h-4 rounded-full bg-[#2EC4B6] border-[1.5px] border-[#1B3B2B] flex-shrink-0"></span>
          <div>
            <p className="font-bold text-[#1B3B2B]">🥣 Feeding Basin</p>
            <p className="text-[11px] text-[#1B3B2B]/70 font-sans">Community food & fresh water point</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="w-4 h-4 rounded-full bg-[#48CAE4] border-[1.5px] border-[#1B3B2B] flex-shrink-0"></span>
          <div>
            <p className="font-bold text-[#1B3B2B]">✅ Healed & Rescued</p>
            <p className="text-[11px] text-[#1B3B2B]/70 font-sans">Rehabilitated / sheltered / adopted</p>
          </div>
        </div>
      </div>

    </div>
  );
}
