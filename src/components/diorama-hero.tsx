"use client";

import React, { useEffect, useRef, useState } from "react";
import { 
  AlertTriangle, 
  MapPin, 
  ShieldCheck, 
  Heart, 
  Navigation, 
  Sparkles, 
  ArrowRight,
  Activity,
  Compass
} from "lucide-react";
import { initThreeDiorama } from "@/lib/three-diorama";
import { 
  animateBentoEntrance, 
  animateCounter, 
  handleCardPointerMove, 
  handleCardPointerLeave, 
  animateMascotPerk 
} from "@/lib/animations";
import { useRecentIncidents } from "@/lib/use-recent-incidents";

export default function DioramaHero() {
  const dioramaContainerRef = useRef<HTMLDivElement>(null);
  const { incidents, loading } = useRecentIncidents();

  // Metric refs for Anime.js rolling counter
  const activeAlertsRef = useRef<HTMLSpanElement>(null);
  const volunteersRef = useRef<HTMLSpanElement>(null);
  const rescuedRef = useRef<HTMLSpanElement>(null);

  // Mascot Ear / Tail SVG refs for interactive perk
  const earLeftRef = useRef<SVGGElement>(null);
  const earRightRef = useRef<SVGGElement>(null);
  const tailRef = useRef<SVGGElement>(null);

  // Initialize 3D Three.js Diorama
  useEffect(() => {
    if (!dioramaContainerRef.current) return;
    const cleanup = initThreeDiorama({
      container: dioramaContainerRef.current,
      activeIncidentsCount: incidents.length,
    });
    return () => {
      cleanup();
    };
  }, [incidents.length]);

  // Trigger Anime.js Staggered Entrance on Load
  useEffect(() => {
    animateBentoEntrance(".anime-bento-hero");
  }, []);

  // Trigger Rolling Number Counters when incidents change
  useEffect(() => {
    if (!loading) {
      animateCounter(activeAlertsRef.current, 0, incidents.length, 1000);
      animateCounter(volunteersRef.current, 0, 0, 1000); // Authentic 0 when empty
      animateCounter(rescuedRef.current, 0, 0, 1000); // Authentic 0 when empty
    }
  }, [incidents.length, loading]);

  const handleMascotHover = () => {
    animateMascotPerk(earLeftRef.current, earRightRef.current, tailRef.current);
  };

  return (
    <section className="relative overflow-hidden pt-6 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      
      {/* Top Banner Tag */}
      <div className="anime-bento-hero mb-6 flex flex-wrap items-center justify-between gap-3">
        <div 
          onMouseEnter={handleMascotHover}
          className="inline-flex items-center gap-2.5 rounded-[18px] border-[2px] border-[#1B3B2B] bg-[#FFFBF5] px-3.5 py-1.5 shadow-bento-sm cursor-pointer transition-all hover:bg-[#F5EFE6]"
        >
          {/* Interactive SVG Mascot with Ears & Tail */}
          <svg width="26" height="26" viewBox="0 0 40 40" className="overflow-visible">
            {/* Tail */}
            <g ref={tailRef} style={{ transformOrigin: "10px 30px" }}>
              <path d="M12 28 C6 24, 4 16, 8 12" stroke="#1B3B2B" strokeWidth="3" strokeLinecap="round" fill="none" />
            </g>
            {/* Left Ear */}
            <g ref={earLeftRef} style={{ transformOrigin: "15px 14px" }}>
              <path d="M14 14 C12 6, 8 6, 11 16" fill="#FFB703" stroke="#1B3B2B" strokeWidth="2.5" />
            </g>
            {/* Right Ear */}
            <g ref={earRightRef} style={{ transformOrigin: "26px 14px" }}>
              <path d="M26 14 C28 6, 32 6, 29 16" fill="#FFB703" stroke="#1B3B2B" strokeWidth="2.5" />
            </g>
            {/* Dog Head */}
            <circle cx="20" cy="22" r="11" fill="#FFB703" stroke="#1B3B2B" strokeWidth="2.5" />
            {/* Eyes */}
            <circle cx="16" cy="20" r="1.8" fill="#1B3B2B" />
            <circle cx="24" cy="20" r="1.8" fill="#1B3B2B" />
            {/* Cute Snout & Nose */}
            <ellipse cx="20" cy="24" rx="4" ry="3" fill="#FFFBF5" stroke="#1B3B2B" strokeWidth="1.5" />
            <polygon points="18.5,23 21.5,23 20,25" fill="#1B3B2B" />
          </svg>

          <span className="font-display text-xs font-bold text-[#1B3B2B]">
            PawAlert Field Sentinel
          </span>
          <span className="font-mono text-[10px] text-[#2EC4B6] font-bold">
            ● GPS ACTIVE
          </span>
        </div>

        <div className="font-mono text-xs font-bold text-[#1B3B2B]/75 flex items-center gap-2">
          <span>COORDINATES: 12.9716° N, 77.5946° E</span>
        </div>
      </div>

      {/* Main Hero Bento Grid (Kinetic Overrank Layout in Warm Sanctuary Styling) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Column (7 cols): Punchy Headline, Actions, Telemetry */}
        <div 
          onPointerMove={(e) => handleCardPointerMove(e, 4)}
          onPointerLeave={handleCardPointerLeave}
          className="anime-bento-hero lg:col-span-7 bento-card p-6 sm:p-10 flex flex-col justify-between space-y-6"
        >
          <div className="space-y-4">
            <span className="inline-block rounded-[14px] border-[2px] border-[#1B3B2B] bg-[#FFB703] px-3 py-1 font-display text-xs font-bold text-[#1B3B2B] shadow-bento-sm">
              24/7 Community Animal Rescue & Wildlife Care
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-display text-[#1B3B2B] leading-[1.08] tracking-tight">
              Every Life Matters. <br />
              <span className="text-[#FF5A4E] underline decoration-[#1B3B2B] decoration-wavy decoration-2">
                Every Alert Counts.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-[#1B3B2B]/80 font-sans leading-relaxed max-w-xl">
              Spot an injured, abandoned, or distressed animal? Drop a 1-click GPS pin. Our verified volunteers, trauma vans, and partnered veterinarians coordinate immediate medical triage with end-to-end accountability.
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href="/report"
              className="bento-btn inline-flex items-center gap-2 rounded-[18px] bg-[#FF5A4E] px-6 py-3.5 text-sm text-white"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Report Animal in Distress</span>
            </a>

            <a
              href="/map"
              className="bento-btn inline-flex items-center gap-2 rounded-[18px] bg-[#FFFBF5] px-5 py-3.5 text-sm text-[#1B3B2B]"
            >
              <Compass className="w-4 h-4 text-[#2EC4B6]" />
              <span>Explore Tactical Map</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* Real Live Telemetry Counters (Anime.js Rolling Counter) */}
          <div className="pt-6 border-t-[2px] border-[#1B3B2B] grid grid-cols-3 gap-4 font-display">
            <div>
              <p className="text-2xl sm:text-3xl font-black text-[#FF5A4E]">
                <span ref={activeAlertsRef}>0</span>
              </p>
              <p className="font-mono text-[11px] text-[#1B3B2B]/75 uppercase">
                Active Emergencies
              </p>
            </div>

            <div>
              <p className="text-2xl sm:text-3xl font-black text-[#2EC4B6]">
                <span ref={rescuedRef}>0</span>
              </p>
              <p className="font-mono text-[11px] text-[#1B3B2B]/75 uppercase">
                Safely Rescued
              </p>
            </div>

            <div>
              <p className="text-2xl sm:text-3xl font-black text-[#FFB703]">
                <span ref={volunteersRef}>0</span>
              </p>
              <p className="font-mono text-[11px] text-[#1B3B2B]/75 uppercase">
                Ready Volunteers
              </p>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Interactive 3D Three.js Diorama */}
        <div 
          onPointerMove={(e) => handleCardPointerMove(e, 4)}
          onPointerLeave={handleCardPointerLeave}
          className="anime-bento-hero lg:col-span-5 bento-card-white p-4 sm:p-6 flex flex-col justify-between relative overflow-hidden min-h-[420px]"
        >
          {/* Diorama Header HUD */}
          <div className="flex items-center justify-between z-10 mb-2">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#2EC4B6] animate-pulse" />
              <span className="font-display text-xs font-bold text-[#1B3B2B]">
                3D Sentinel Habitat Island
              </span>
            </div>
            <span className="font-mono text-[10px] text-[#1B3B2B]/60 uppercase bg-[#F5EFE6] px-2 py-0.5 rounded-[10px] border border-[#1B3B2B]/20">
              Drag to Orbit 360°
            </span>
          </div>

          {/* Three.js Canvas Container */}
          <div 
            ref={dioramaContainerRef} 
            className="w-full h-[320px] sm:h-[350px] relative z-0 cursor-grab active:cursor-grabbing flex items-center justify-center"
          />

          {/* Habitat Status Footer */}
          <div className="z-10 pt-2 border-t-[2px] border-[#1B3B2B] flex items-center justify-between text-xs font-display">
            <span className="text-[#1B3B2B]/80 font-bold">
              {incidents.length === 0 ? "🌿 Sunlit Meadow (All Clear)" : `🚨 ${incidents.length} Emergency Beacons Active`}
            </span>
            <span className="font-mono text-[11px] text-[#FF5A4E] font-bold">
              THREE.JS 60FPS
            </span>
          </div>
        </div>

      </div>

    </section>
  );
}
