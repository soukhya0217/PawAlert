"use client";

import React, { useEffect, useRef } from "react";
import { AlertTriangle, Heart, Shield, Sparkles, Navigation, ArrowRight } from "lucide-react";

export default function HeroSection() {
  const floatingContainerRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let isMounted = true;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    // Dynamically import animejs
    import("animejs").then((animeModule) => {
      if (!isMounted) return;
      const anime = animeModule.default || animeModule;

      // Animate floating cute paw stamps
      anime({
        targets: ".anime-floating-paw",
        translateY: function () {
          return anime.random(-15, 15);
        },
        translateX: function () {
          return anime.random(-10, 10);
        },
        rotate: function () {
          return anime.random(-25, 25);
        },
        duration: 3500,
        direction: "alternate",
        loop: true,
        easing: "easeInOutSine",
      });

      // Animate Hero Card floating gently
      anime({
        targets: ".anime-hero-card",
        translateY: [-6, 6],
        duration: 4000,
        direction: "alternate",
        loop: true,
        easing: "easeInOutQuad",
      });

      // Animate Stats counter
      if (counterRef.current) {
        anime({
          targets: counterRef.current,
          innerHTML: [0, 4820],
          round: 1,
          easing: "easeOutExpo",
          duration: 2500,
        });
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="relative overflow-hidden pt-8 pb-20 lg:pt-14 lg:pb-32">
      {/* Background Magical Ambient Circles */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-peach-200/50 via-lavender-200/40 to-mint-100/40 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Floating Animated Paws */}
      <div ref={floatingContainerRef} className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <span className="anime-floating-paw absolute top-12 left-10 text-4xl opacity-20 select-none">🐾</span>
        <span className="anime-floating-paw absolute top-32 right-16 text-3xl opacity-25 select-none text-peach-500">🐾</span>
        <span className="anime-floating-paw absolute bottom-20 left-1/4 text-5xl opacity-15 select-none text-lavender-500">🐾</span>
        <span className="anime-floating-paw absolute top-1/2 right-1/4 text-4xl opacity-20 select-none text-mint-500">🐾</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Mission & Urgent CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-peach-100 border border-peach-200 shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-primary-500 animate-pulse"></span>
              <span className="text-xs font-black uppercase tracking-wider text-primary-700">
                24/7 Community Rescue Grid
              </span>
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-foreground tracking-tight leading-[1.12]">
              Every Life Matters. <br />
              <span className="bg-gradient-to-r from-primary-500 via-peach-500 to-lavender-600 bg-clip-text text-transparent">
                Every Alert Counts.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-foreground/80 font-medium max-w-2xl leading-relaxed mx-auto lg:mx-0">
              When an animal is hit by a vehicle, abandoned, starving, or severely injured on our streets, every minute is precious. 
              <strong> POWER ALERT</strong> instantly pinpoints emergency reports to nearby verified rescuers and partner veterinary hospitals.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <a
                href="/report"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-red-500 via-primary-500 to-rose-600 text-white font-black text-base shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 group"
              >
                <AlertTriangle className="w-5 h-5 text-white group-hover:rotate-12 transition-transform" />
                <span>Report Animal in Distress</span>
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </a>

              <a
                href="/map"
                className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white border-2 border-cream-300 text-foreground font-bold text-base hover:bg-peach-50 hover:border-peach-300 transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <Navigation className="w-5 h-5 text-primary-500" />
                <span>Explore Live Rescue Map</span>
              </a>
            </div>

            {/* Trust Counters */}
            <div className="pt-6 grid grid-cols-3 gap-4 border-t border-cream-200/80 max-w-lg mx-auto lg:mx-0">
              <div className="text-center lg:text-left">
                <p className="text-2xl sm:text-3xl font-black text-primary-600">
                  <span ref={counterRef}>4820</span>+
                </p>
                <p className="text-xs text-muted-foreground font-semibold">Rescues Completed</p>
              </div>

              <div className="text-center lg:text-left">
                <p className="text-2xl sm:text-3xl font-black text-mint-600">12 Mins</p>
                <p className="text-xs text-muted-foreground font-semibold">Avg. Response Time</p>
              </div>

              <div className="text-center lg:text-left">
                <p className="text-2xl sm:text-3xl font-black text-lavender-600">1,240+</p>
                <p className="text-xs text-muted-foreground font-semibold">Active Volunteers</p>
              </div>
            </div>
          </div>

          {/* Right Column: Cute Interactive Rescue Card */}
          <div className="lg:col-span-5 relative flex justify-center">
            
            {/* Main Floating Magical Card */}
            <div className="anime-hero-card w-full max-w-md bg-white rounded-3xl p-6 shadow-magical border border-cream-200/90 relative z-10">
              
              {/* Card Header Badge */}
              <div className="flex items-center justify-between pb-4 border-b border-cream-100">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500 animate-ping"></span>
                  <span className="text-xs font-black uppercase text-red-600 tracking-wider">
                    Live Emergency Alert
                  </span>
                </div>
                <span className="text-xs font-bold text-muted-foreground">Case #PA-2026-104921</span>
              </div>

              {/* Animal Photo with status overlay */}
              <div className="mt-4 relative h-52 rounded-2xl overflow-hidden bg-cream-100">
                <img
                  src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80"
                  alt="Injured Dog Rescue"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-red-600/90 backdrop-blur-md text-white text-[11px] font-black uppercase tracking-wider shadow">
                  Priority: Critical
                </div>
                <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md text-white text-xs font-medium flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-peach-300" />
                  <span>Koramangala, Bangalore</span>
                </div>
              </div>

              {/* Case details summary */}
              <div className="mt-4 space-y-2">
                <h3 className="text-base font-black text-foreground">
                  Hit by car • Urgent trauma care required
                </h3>
                <p className="text-xs text-foreground/75 leading-relaxed line-clamp-2">
                  Community dog bleeding from leg, whined in distress. 3 volunteers notified within 3 km radius.
                </p>
              </div>

              {/* Assignment Call to Action */}
              <div className="mt-5 pt-4 border-t border-cream-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-mint-100 text-mint-700 flex items-center justify-center font-bold text-xs">
                    RV
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">Rohan Varma</p>
                    <p className="text-[10px] text-mint-600 font-semibold">Accepted Responsibility</p>
                  </div>
                </div>

                <a
                  href="/user/incident/PA-2026-104921"
                  className="px-3.5 py-1.5 rounded-xl bg-peach-100 text-primary-700 font-bold text-xs hover:bg-peach-200 transition-colors"
                >
                  Track Live →
                </a>
              </div>
            </div>

            {/* Supplementary Cute Badge: Daily Meals */}
            <div className="hidden sm:flex absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-cream-200 z-20 items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-mint-100 text-mint-600 flex items-center justify-center text-xl">
                🥣
              </div>
              <div>
                <p className="text-xs font-black text-foreground">3,200+ Bowls Refilled</p>
                <p className="text-[11px] text-muted-foreground font-semibold">Street feeding network</p>
              </div>
            </div>

            {/* Supplementary Cute Badge: Loving Adoption */}
            <div className="hidden sm:flex absolute -top-4 -right-4 bg-white p-3.5 rounded-2xl shadow-xl border border-cream-200 z-20 items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-peach-100 text-primary-600 flex items-center justify-center text-lg">
                💖
              </div>
              <div>
                <p className="text-xs font-black text-foreground">148 Forever Homes</p>
                <p className="text-[10px] text-muted-foreground font-semibold">Adoptions this month</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
