"use client";

import React from "react";
import DioramaHero from "@/components/diorama-hero";
import AdminMap from "@/components/admin-map";
import { useRecentIncidents } from "@/lib/use-recent-incidents";
import { 
  ArrowRight, 
  Heart, 
  MapPin, 
  ShieldCheck, 
  Sparkles, 
  AlertTriangle,
  Compass,
  Activity
} from "lucide-react";

export default function HomePage() {
  const { incidents, loading } = useRecentIncidents();

  return (
    <div className="space-y-12 pb-20">
      
      {/* 1. Kinetic Diorama Hero (Three.js Sentinel Habitat + Anime.js Mascot) */}
      <DioramaHero />

      {/* 2. Interactive Field Command Map (Strict Client Leaflet + Zero Mock Data) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4 border-b-[3px] border-[#1E1B4B] pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-[14px] border-[2px] border-[#1E1B4B] bg-[#FFB703] px-3 py-1 text-xs font-display font-bold text-[#1E1B4B] shadow-pixar-sm mb-2">
              <Compass className="w-3.5 h-3.5 text-[#1E1B4B]" />
              <span>Real-Time Geospatial Radar</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-display text-[#1E1B4B] tracking-tight">
              Live Field Command Map
            </h2>
            <p className="text-xs sm:text-sm text-[#1E1B4B]/75 mt-0.5 font-sans">
              Visualizes authentic active distress calls and nearby volunteer squads. Zero simulated records.
            </p>
          </div>

          <a
            href="/report"
            className="pixar-btn inline-flex items-center gap-2 rounded-[18px] bg-gradient-to-r from-[#FF7A00] to-[#F97316] px-5 py-3 text-xs font-bold text-white shadow-pixar"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Drop Emergency Pin</span>
          </a>
        </div>

        {/* Leaflet Admin Map Component */}
        <AdminMap incidents={incidents} />
      </section>

      {/* 3. Tactile Pixar Storybook Bento Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: 1-Click Intake */}
          <div className="pixar-card p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-2.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-[18px] border-[3px] border-[#1E1B4B] bg-[#FF7A00] text-white shadow-pixar-sm">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="font-display text-lg font-bold text-[#1E1B4B]">
                Immediate Field Triage
              </h3>
              <p className="font-sans text-xs text-[#1E1B4B]/75 leading-relaxed">
                Snap a photo, press our squishy paw-pad severity selector, and trigger an automated alert to verified local rescuers within seconds.
              </p>
            </div>

            <a
              href="/report"
              className="pixar-btn inline-flex items-center justify-between rounded-[16px] bg-[#FFF1DC] p-3 text-xs text-[#1E1B4B] shadow-pixar-sm font-bold"
            >
              <span>Launch Intake Wizard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Card 2: 12-Stage Recovery */}
          <div className="pixar-card p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-2.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-[18px] border-[3px] border-[#1E1B4B] bg-[#10B981] text-white shadow-pixar-sm">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-display text-lg font-bold text-[#1E1B4B]">
                Atomic Accountability
              </h3>
              <p className="font-sans text-xs text-[#1E1B4B]/75 leading-relaxed">
                Rescuers lock assignments via atomic mutex. Timestamped GPS milestones and medical photographs prevent duplicate confusion.
              </p>
            </div>

            <a
              href="/how-it-works"
              className="pixar-btn inline-flex items-center justify-between rounded-[16px] bg-[#FFF1DC] p-3 text-xs text-[#1E1B4B] shadow-pixar-sm font-bold"
            >
              <span>Explore Rescue Protocol</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Card 3: Sanctuary Adoptions */}
          <div className="pixar-card p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-2.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-[18px] border-[3px] border-[#1E1B4B] bg-[#FFB703] text-[#1E1B4B] shadow-pixar-sm">
                <Heart className="w-6 h-6 fill-[#1E1B4B]" />
              </div>
              <h3 className="font-display text-lg font-bold text-[#1E1B4B]">
                Loving Forever Homes
              </h3>
              <p className="font-sans text-xs text-[#1E1B4B]/75 leading-relaxed">
                Every rehabilitated survivor is vaccinated, sterilized, and medically cleared. Browse profiles and complete adoption applications online.
              </p>
            </div>

            <a
              href="/adoption"
              className="pixar-btn inline-flex items-center justify-between rounded-[16px] bg-[#FFF1DC] p-3 text-xs text-[#1E1B4B] shadow-pixar-sm font-bold"
            >
              <span>Browse Adoptable Pets</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

        </div>
      </section>

    </div>
  );
}
