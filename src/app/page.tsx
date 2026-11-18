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
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4 border-b-[2px] border-[#1B3B2B] pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-[12px] border-[2px] border-[#1B3B2B] bg-[#FFB703] px-2.5 py-0.5 text-xs font-display font-bold text-[#1B3B2B] shadow-bento-sm mb-1.5">
              <Compass className="w-3.5 h-3.5 text-[#1B3B2B]" />
              <span>Real-Time Geospatial Radar</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-display text-[#1B3B2B] tracking-tight">
              Live Field Command Map
            </h2>
            <p className="text-xs sm:text-sm text-[#1B3B2B]/75 mt-0.5 font-sans">
              Visualizes authentic active distress calls and nearby volunteer squads. Zero simulated records.
            </p>
          </div>

          <a
            href="/report"
            className="bento-btn inline-flex items-center gap-2 rounded-[16px] bg-[#FF5A4E] px-4 py-2.5 text-xs text-white"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Drop Emergency Pin</span>
          </a>
        </div>

        {/* Leaflet Admin Map Component */}
        <AdminMap incidents={incidents} />
      </section>

      {/* 3. Tactile Bento Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: 1-Click Intake */}
          <div className="bento-card p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex h-11 w-11 items-center justify-center rounded-[16px] border-[2px] border-[#1B3B2B] bg-[#FF5A4E] text-white shadow-bento-sm">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="font-display text-lg font-bold text-[#1B3B2B]">
                Immediate Field Triage
              </h3>
              <p className="font-sans text-xs text-[#1B3B2B]/75 leading-relaxed">
                Snap a photo, press our squishy paw-pad severity selector, and trigger an automated alert to verified local rescuers within seconds.
              </p>
            </div>

            <a
              href="/report"
              className="bento-btn inline-flex items-center justify-between rounded-[14px] bg-[#FFFBF5] p-3 text-xs text-[#1B3B2B]"
            >
              <span>Launch Intake Wizard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Card 2: 12-Stage Recovery */}
          <div className="bento-card p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex h-11 w-11 items-center justify-center rounded-[16px] border-[2px] border-[#1B3B2B] bg-[#2EC4B6] text-white shadow-bento-sm">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-display text-lg font-bold text-[#1B3B2B]">
                Atomic Accountability
              </h3>
              <p className="font-sans text-xs text-[#1B3B2B]/75 leading-relaxed">
                Rescuers lock assignments via atomic mutex. Timestamped GPS milestones and medical photographs prevent duplicate confusion.
              </p>
            </div>

            <a
              href="/how-it-works"
              className="bento-btn inline-flex items-center justify-between rounded-[14px] bg-[#FFFBF5] p-3 text-xs text-[#1B3B2B]"
            >
              <span>Explore Rescue Protocol</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Card 3: Sanctuary Adoptions */}
          <div className="bento-card p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex h-11 w-11 items-center justify-center rounded-[16px] border-[2px] border-[#1B3B2B] bg-[#FFB703] text-white shadow-bento-sm">
                <Heart className="w-5 h-5 fill-white" />
              </div>
              <h3 className="font-display text-lg font-bold text-[#1B3B2B]">
                Loving Forever Homes
              </h3>
              <p className="font-sans text-xs text-[#1B3B2B]/75 leading-relaxed">
                Every rehabilitated survivor is vaccinated, sterilized, and medically cleared. Browse profiles and complete adoption applications online.
              </p>
            </div>

            <a
              href="/adoption"
              className="bento-btn inline-flex items-center justify-between rounded-[14px] bg-[#FFFBF5] p-3 text-xs text-[#1B3B2B]"
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
