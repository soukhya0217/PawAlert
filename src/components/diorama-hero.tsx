"use client";

import React, { useEffect, useRef, useState } from "react";
import { 
  AlertTriangle, 
  MapPin, 
  ShieldCheck, 
  Heart, 
  Sparkles, 
  ArrowRight,
  Compass,
  Radio,
  Sun
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

  // Initialize Three.js Golden-Hour Sanctuary
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
    animateBentoEntrance(".anime-pixar-hero");
  }, []);

  // Rolling Counters
  useEffect(() => {
    if (!loading) {
      animateCounter(activeAlertsRef.current, 0, incidents.length, 1200);
      animateCounter(volunteersRef.current, 0, 0, 1200);
      animateCounter(rescuedRef.current, 0, 0, 1200);
    }
  }, [incidents.length, loading]);

  const handleMascotHover = () => {
    animateMascotPerk(earLeftRef.current, earRightRef.current, tailRef.current);
  };

  return (
    <section className="relative overflow-hidden twilight-hero-gradient rounded-[28px] sm:rounded-[36px] mx-2 sm:mx-4 lg:mx-8 my-3 sm:my-4 p-5 sm:p-10 lg:p-14 border-[3px] sm:border-[4px] border-[#1E1B4B] shadow-2xl">
      
      {/* Golden Sunset Radial Horizon Glow */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute -bottom-20 left-1/2 -translate-x-1/2 w-[750px] h-[450px] twilight-glow-sunset blur-3xl -z-0 opacity-80"
      />

      {/* Floating Stardust Sparkles */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-0 overflow-hidden">
        <span className="animate-firefly absolute top-12 left-[10%] text-[#FBBF24] text-xl opacity-75">✨</span>
        <span className="animate-firefly absolute top-28 right-[15%] text-[#FFB703] text-2xl opacity-60" style={{ animationDelay: "1.2s" }}>✨</span>
        <span className="animate-firefly absolute bottom-16 left-[22%] text-[#F97316] text-lg opacity-80" style={{ animationDelay: "2.4s" }}>🐾</span>
        <span className="animate-firefly absolute top-1/2 right-[25%] text-[#FBBF24] text-sm opacity-50" style={{ animationDelay: "0.8s" }}>✨</span>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto w-full">
        
        {/* Top Storybook Ribbon */}
        <div className="anime-pixar-hero mb-8 flex flex-wrap items-center justify-between gap-4">
          <div 
            onMouseEnter={handleMascotHover}
            className="inline-flex items-center gap-2.5 rounded-[22px] border-[3px] border-[#1E1B4B] bg-[#FFF9F0] px-4 py-2 shadow-pixar-sm cursor-pointer transition-all hover:scale-105"
          >
            {/* Interactive SVG Companion Mascot */}
            <svg width="28" height="28" viewBox="0 0 40 40" className="overflow-visible">
              <g ref={tailRef} style={{ transformOrigin: "10px 30px" }}>
                <path d="M11 28 C5 24, 3 16, 7 12" stroke="#1E1B4B" strokeWidth="3" strokeLinecap="round" fill="none" />
              </g>
              <g ref={earLeftRef} style={{ transformOrigin: "15px 14px" }}>
                <path d="M14 14 C12 5, 7 5, 11 16" fill="#F97316" stroke="#1E1B4B" strokeWidth="2.5" />
              </g>
              <g ref={earRightRef} style={{ transformOrigin: "26px 14px" }}>
                <path d="M26 14 C28 5, 33 5, 29 16" fill="#F97316" stroke="#1E1B4B" strokeWidth="2.5" />
              </g>
              <circle cx="20" cy="22" r="11" fill="#FBBF24" stroke="#1E1B4B" strokeWidth="2.5" />
              <circle cx="16" cy="20" r="2" fill="#1E1B4B" />
              <circle cx="24" cy="20" r="2" fill="#1E1B4B" />
              <circle cx="17" cy="19.2" r="0.6" fill="#FFFFFF" />
              <circle cx="25" cy="19.2" r="0.6" fill="#FFFFFF" />
              <ellipse cx="20" cy="24.5" rx="4.5" ry="3" fill="#FFF9F0" stroke="#1E1B4B" strokeWidth="1.5" />
              <polygon points="18.5,23.5 21.5,23.5 20,25.5" fill="#1E1B4B" />
            </svg>

            <span className="font-display text-xs font-bold text-[#1E1B4B]">
              BE THEIR VOICE
            </span>
            <span className="font-mono text-[10px] text-[#FF7A00] font-black uppercase">
              ● REAL DISPATCH
            </span>
          </div>

          <div className="font-mono text-xs text-[#FBBF24] font-bold flex items-center gap-2 drop-shadow">
            <Sun className="w-4 h-4 text-[#FBBF24] animate-spin" style={{ animationDuration: "16s" }} />
            <span>GOLDEN HOUR SANCTUARY // ZERO FAKE DATA</span>
          </div>
        </div>

        {/* Hero Grid: Storybook Headline + 3D Pixar Diorama */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column (7 cols): Chunky 3D Extruded Title & Actions */}
          <div className="anime-pixar-hero lg:col-span-7 space-y-6">
            
            <div className="space-y-3">
              <span className="inline-block rounded-[16px] border-[2px] border-[#FBBF24] bg-[#FFB703]/20 px-3.5 py-1 font-display text-xs font-bold text-[#FBBF24] backdrop-blur-md">
                🐾 Emergency Animal Rescue & Welfare Network
              </span>

              {/* Chunky 3D Display Header */}
              <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black font-display text-white leading-[1.08] tracking-tight font-pixar-3d break-words">
                BE THEIR VOICE. <br />
                <span className="text-[#FBBF24] font-pixar-gold">
                  PawAlert
                </span>
              </h1>

              <p className="text-base sm:text-xl font-display font-bold text-[#F97316] font-pixar-sunset">
                Because every paw matters.
              </p>

              <p className="text-xs sm:text-base text-slate-200 font-sans leading-relaxed max-w-xl pt-1">
                When an injured, abandoned, or distressed animal cries for help, every second counts. Drop an instant GPS pin on our community radar—connecting verified field rescuers, ambulances, and vet clinics with 100% transparency.
              </p>
            </div>

            {/* Chunky 3D Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <a
                href="/report"
                className="pixar-btn bg-gradient-to-r from-[#FF7A00] to-[#F97316] text-white px-6 sm:px-7 py-3.5 sm:py-4 text-sm sm:text-base font-bold shadow-pixar text-center justify-center"
              >
                <AlertTriangle className="w-5 h-5 mr-2 inline" />
                <span>Report Animal in Distress</span>
              </a>

              <a
                href="/map"
                className="pixar-btn bg-[#FFF9F0] text-[#1E1B4B] px-5 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-bold shadow-pixar hover:bg-[#FFF1DC] text-center justify-center"
              >
                <Compass className="w-4 h-4 text-[#10B981] mr-2 inline" />
                <span>Open Sanctuary Map</span>
                <ArrowRight className="w-4 h-4 ml-2 inline" />
              </a>
            </div>

            {/* Real MongoDB Telemetry Ticker */}
            <div className="pt-5 sm:pt-6 border-t-[2px] border-white/20 grid grid-cols-3 gap-2 sm:gap-4 font-display text-white text-center sm:text-left">
              <div>
                <p className="text-2xl sm:text-4xl font-black text-[#FF7A00] font-pixar-glow">
                  <span ref={activeAlertsRef}>0</span>
                </p>
                <p className="font-mono text-[10px] sm:text-[11px] text-slate-300 uppercase mt-0.5">
                  Active Alerts
                </p>
              </div>

              <div>
                <p className="text-2xl sm:text-4xl font-black text-[#10B981] font-pixar-glow">
                  <span ref={rescuedRef}>0</span>
                </p>
                <p className="font-mono text-[10px] sm:text-[11px] text-slate-300 uppercase mt-0.5">
                  Safely Rescued
                </p>
              </div>

              <div>
                <p className="text-2xl sm:text-4xl font-black text-[#FBBF24] font-pixar-glow">
                  <span ref={volunteersRef}>0</span>
                </p>
                <p className="font-mono text-[10px] sm:text-[11px] text-slate-300 uppercase mt-0.5">
                  Volunteers Ready
                </p>
              </div>
            </div>

          </div>

          {/* Right Column (5 cols): 3D Pixar Miniature Golden-Hour World */}
          <div 
            onPointerMove={(e) => handleCardPointerMove(e, 4)}
            onPointerLeave={handleCardPointerLeave}
            className="anime-pixar-hero lg:col-span-5 pixar-card-gold p-3.5 sm:p-6 flex flex-col justify-between relative overflow-hidden min-h-[340px] sm:min-h-[440px]"
          >
            {/* Diorama Top Bar */}
            <div className="flex items-center justify-between z-10 mb-2">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-[#10B981] animate-ping" />
                <span className="font-display text-xs font-bold text-[#1E1B4B]">
                  Golden-Hour Field Sanctuary
                </span>
              </div>
              <span className="font-mono text-[9px] sm:text-[10px] text-[#1E1B4B] font-bold uppercase bg-[#FFF9F0] px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-[12px] border-[2px] border-[#1E1B4B]">
                Touch/Drag Orbit
              </span>
            </div>

            {/* Three.js Canvas Container */}
            <div 
              ref={dioramaContainerRef} 
              className="w-full h-[260px] sm:h-[350px] relative z-0 cursor-grab active:cursor-grabbing flex items-center justify-center touch-none"
            />

            {/* Diorama Footer */}
            <div className="z-10 pt-2 border-t-[2px] border-[#1E1B4B] flex items-center justify-between text-xs font-display">
              <span className="text-[#1E1B4B] font-bold">
                {incidents.length === 0 ? "🌿 Sunlit Courtyard (Peaceful)" : `🚨 ${incidents.length} Rescue Beacons Active`}
              </span>
              <span className="font-mono text-[11px] text-[#FF7A00] font-black">
                THREE.JS COMPANIONS
              </span>
            </div>
          </div>

        </div>

      </div>

    </section>
  );
}
