"use client";

import React from "react";
import HeroSection from "@/components/home/HeroSection";
import UrgentAlertsBanner from "@/components/home/UrgentAlertsBanner";
import StatsSection from "@/components/home/StatsSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import RescueMap from "@/components/map/RescueMap";
import { 
  Crosshair, 
  ArrowRight, 
  ShieldCheck, 
  Heart, 
  MapPin, 
  Activity,
  Layers
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-16 pb-20">
      {/* 1. Cyber-Tactical Hero Section */}
      <HeroSection />

      {/* 2. Urgent Live Emergencies Ticker (Only appears if real emergencies exist) */}
      <UrgentAlertsBanner />

      {/* 3. Live Tactical Map Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 mb-2 font-mono text-xs uppercase tracking-wider text-[#d4ff3a]">
              <Crosshair className="w-3.5 h-3.5" />
              <span>Geospatial Radar Intelligence</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white font-sans tracking-tight">
              Live Emergency & Rescue Grid
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl font-sans">
              Real-time visualization of animal distress alerts and nearby rescue squad availability. No fake records.
            </p>
          </div>

          <a
            href="/map"
            className="inline-flex items-center gap-2 rounded-md border border-white/20 bg-[#0a0e17] px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-white hover:border-[#d4ff3a]/50 hover:text-[#d4ff3a] transition-all group"
          >
            <span>Full-Screen Radar View</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 group-hover:text-[#d4ff3a] transition-transform" />
          </a>
        </div>

        {/* Tactical Map Container */}
        <RescueMap />
      </section>

      {/* 4. Real-time Platform Telemetry (Dynamic Metrics, 0 Fake Data) */}
      <StatsSection />

      {/* 5. 12-Stage Rescue Protocol Architecture */}
      <HowItWorksSection />

      {/* 6. Tactical Spotlight Modules */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card 1: Adoption Protocol */}
          <div className="rounded-xl border border-white/10 bg-[#0a0e17] p-8 backdrop-blur-md hover:border-[#d4ff3a]/40 transition-all flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-[#d4ff3a]">
                  <Heart className="w-5 h-5" />
                </div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#d4ff3a] border border-[#d4ff3a]/30 bg-[#d4ff3a]/10 px-2.5 py-0.5 rounded">
                  REHABILITATION & PLACEMENT
                </span>
              </div>

              <h3 className="text-xl font-bold font-sans text-white group-hover:text-[#d4ff3a] transition-colors">
                Adopt a Verified Survivor
              </h3>

              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-sans">
                Every rescued animal is sterilized, vaccinated, microchipped, and medically documented. Browse verified profiles and complete the transparent adoption questionnaire online.
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="font-mono text-xs text-slate-400">STATUS: OPEN FOR FOSTER & ADOPTION</span>
              <a
                href="/adoption"
                className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-[#d4ff3a] hover:underline"
              >
                <span>Browse Profiles</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Card 2: Feeding Zones */}
          <div className="rounded-xl border border-white/10 bg-[#0a0e17] p-8 backdrop-blur-md hover:border-[#d4ff3a]/40 transition-all flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-emerald-400">
                  <MapPin className="w-5 h-5" />
                </div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 rounded">
                  COMMUNITY NUTRITION
                </span>
              </div>

              <h3 className="text-xl font-bold font-sans text-white group-hover:text-emerald-400 transition-colors">
                Feeding Grid & Water Points
              </h3>

              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-sans">
                Coordinate daily feeding routes across street zones. Volunteers log timestamps, food inventory, drinking water checks, and health observations with photo proof.
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="font-mono text-xs text-slate-400">COORDINATED VOLUNTEER ZONES</span>
              <a
                href="/map"
                className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-emerald-400 hover:underline"
              >
                <span>Locate Bowls on Grid</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
