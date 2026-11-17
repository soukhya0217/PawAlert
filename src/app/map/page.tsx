"use client";

import React from "react";
import RescueMap from "@/components/map/RescueMap";
import { AlertTriangle, MapPin, Heart, Shield, Sparkles } from "lucide-react";

export default function ExploreMapPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-peach-100 text-primary-700 text-xs font-black uppercase tracking-wider mb-2 border border-peach-200">
            <MapPin className="w-3.5 h-3.5 text-primary-500" /> Live Grid Intelligence
          </div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">
            Geographical Rescue & Welfare Map
          </h1>
          <p className="text-xs sm:text-sm text-foreground/75 mt-1">
            Real-time geospatial map indexing active distress alerts, feeding points, shelters, and verified rescuers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/report"
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-red-500 via-primary-500 to-rose-600 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Report Distress Alert</span>
          </a>
        </div>
      </div>

      {/* Main Full-Size Map */}
      <RescueMap initialZoom={13} />

      {/* Map Legend & Privacy Safeguards */}
      <div className="p-5 bg-white rounded-3xl border border-cream-200 shadow-soft grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="flex items-center gap-2.5">
          <span className="w-4 h-4 rounded-full bg-rose-500 flex-shrink-0 animate-pulse"></span>
          <div>
            <p className="font-black text-foreground">🚨 Critical Emergency</p>
            <p className="text-[11px] text-muted-foreground">Hit by car, severe fracture, trauma</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="w-4 h-4 rounded-full bg-orange-500 flex-shrink-0"></span>
          <div>
            <p className="font-black text-foreground">⚠️ High Priority</p>
            <p className="text-[11px] text-muted-foreground">Limping, open wounds, puppies</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="w-4 h-4 rounded-full bg-mint-500 flex-shrink-0"></span>
          <div>
            <p className="font-black text-foreground">🥣 Feeding Zone</p>
            <p className="text-[11px] text-muted-foreground">Daily meals & clean water basins</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="w-4 h-4 rounded-full bg-emerald-600 flex-shrink-0"></span>
          <div>
            <p className="font-black text-foreground">✅ Resolved Rescue</p>
            <p className="text-[11px] text-muted-foreground">Healed, fostered or sheltered</p>
          </div>
        </div>
      </div>
    </div>
  );
}
