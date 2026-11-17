"use client";

import React, { useEffect, useState } from "react";
import HeroSection from "@/components/home/HeroSection";
import UrgentAlertsBanner from "@/components/home/UrgentAlertsBanner";
import StatsSection from "@/components/home/StatsSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import RescueMap from "@/components/map/RescueMap";
import { AlertTriangle, Heart, Shield, Sparkles, PawPrint, ArrowRight, CheckCircle2 } from "lucide-react";

export default function HomePage() {
  const [seedStatus, setSeedStatus] = useState<string | null>(null);

  useEffect(() => {
    // Auto-trigger seeder on initial mount if empty
    fetch("/api/seed", { method: "POST" })
      .then((res) => res.json())
      .then((data) => {
        if (data.status !== "ALREADY_SEEDED") {
          console.log("Seeding result:", data);
        }
      })
      .catch((e) => console.log("Auto-seed check:", e));
  }, []);

  const handleManualSeed = async () => {
    try {
      setSeedStatus("Seeding demo data...");
      const res = await fetch("/api/seed", { method: "POST" });
      const data = await res.json();
      setSeedStatus(data.message || "Database seeded!");
      setTimeout(() => setSeedStatus(null), 4000);
    } catch (e: any) {
      setSeedStatus("Error: " + e.message);
    }
  };

  return (
    <div className="space-y-12">
      {/* Hero */}
      <HeroSection />

      {/* Urgent Emergency Live Ticker */}
      <UrgentAlertsBanner />

      {/* Real-time Interactive Rescue Map Spotlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-primary-600 bg-peach-100 px-3 py-1 rounded-full border border-peach-200">
              Live Geographic Grid
            </span>
            <h2 className="text-3xl font-black text-foreground mt-3 tracking-tight">
              Interactive Emergency & Sanctuary Map
            </h2>
            <p className="text-sm text-foreground/75 mt-1 max-w-xl">
              Real-time visualization of reported animal distress cases, active rescues in transit, daily feeding points, and veterinary hospitals.
            </p>
          </div>

          <a
            href="/map"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white border border-cream-300 font-bold text-sm text-foreground hover:bg-peach-50 hover:border-peach-300 shadow-sm transition-all"
          >
            <span>Full Screen Map Experience</span>
            <ArrowRight className="w-4 h-4 text-primary-500" />
          </a>
        </div>

        <RescueMap />
      </section>

      {/* Key Stats Counter */}
      <StatsSection />

      {/* How It Works Journey */}
      <HowItWorksSection />

      {/* Compassionate Adoption & Feeding Spotlight Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Card 1: Adoption */}
          <div className="rounded-3xl p-8 bg-gradient-to-br from-peach-100/90 via-peach-50 to-white border border-peach-200/80 shadow-soft flex flex-col justify-between relative overflow-hidden group">
            <div className="space-y-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-white text-rose-500 flex items-center justify-center text-2xl shadow-sm">
                🐶
              </div>
              <span className="text-xs font-black uppercase tracking-wider text-primary-700 bg-white/80 px-3 py-1 rounded-full border border-peach-200">
                Loving Companions
              </span>
              <h3 className="text-2xl font-black text-foreground">
                Adopt a Rescued Survivor
              </h3>
              <p className="text-sm text-foreground/80 leading-relaxed">
                Every rescued animal has a story of resilience. Our vaccinated, sterilized, and medically cleared companions are ready to bring unconditional joy into your family.
              </p>
            </div>

            <div className="mt-8 relative z-10 flex items-center justify-between">
              <a
                href="/adoption"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary-500 text-white font-bold text-sm shadow-md shadow-primary-500/25 hover:bg-primary-600 transition-all"
              >
                <Heart className="w-4 h-4" />
                <span>Meet Adoptable Animals</span>
              </a>
              <span className="text-xs font-bold text-primary-800">100% Free Adoption</span>
            </div>
          </div>

          {/* Card 2: Feeding Network */}
          <div className="rounded-3xl p-8 bg-gradient-to-br from-mint-100/90 via-mint-50 to-white border border-mint-200/80 shadow-soft flex flex-col justify-between relative overflow-hidden group">
            <div className="space-y-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-white text-mint-600 flex items-center justify-center text-2xl shadow-sm">
                🥣
              </div>
              <span className="text-xs font-black uppercase tracking-wider text-mint-800 bg-white/80 px-3 py-1 rounded-full border border-mint-200">
                Community Hunger Relief
              </span>
              <h3 className="text-2xl font-black text-foreground">
                Street Animal Feeding & Water Drives
              </h3>
              <p className="text-sm text-foreground/80 leading-relaxed">
                Join our volunteer network providing daily nutritious meals and clean drinking water bowls to community dogs, cats, and birds across registered feeding zones.
              </p>
            </div>

            <div className="mt-8 relative z-10 flex items-center justify-between">
              <a
                href="/volunteer-register"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-mint-600 text-white font-bold text-sm shadow-md shadow-mint-600/25 hover:bg-mint-700 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Become a Feeding Guardian</span>
              </a>
              <span className="text-xs font-bold text-mint-800">GPS Tracked Daily</span>
            </div>
          </div>

        </div>
      </section>

      {/* Emergency Report Banner CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-4xl p-10 bg-gradient-to-r from-red-500 via-primary-500 to-rose-600 text-white shadow-xl flex flex-col lg:flex-row items-center justify-between gap-8 relative overflow-hidden">
          <div className="space-y-3 max-w-2xl text-center lg:text-left">
            <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-white text-xs font-black uppercase tracking-wider backdrop-blur-sm">
              Urgent Citizen Action
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              See an Animal Suffering on the Road Right Now?
            </h2>
            <p className="text-white/90 text-sm leading-relaxed">
              Do not walk away. Take 30 seconds to snap a picture and submit the GPS location. Nearby rescuers will be mobilized immediately.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
            <a
              href="/report"
              className="px-8 py-4 rounded-2xl bg-white text-red-600 font-black text-base shadow-lg hover:bg-cream-50 hover:scale-105 active:scale-100 transition-all flex items-center justify-center gap-2"
            >
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span>Report Emergency Now</span>
            </a>
          </div>
        </div>
      </section>

      {/* Developer / Demo Quick Seeder Pill */}
      <div className="text-center pb-8">
        <button
          onClick={handleManualSeed}
          className="text-xs font-bold text-muted-foreground/60 hover:text-primary-600 transition-colors"
        >
          {seedStatus || "⚙️ Demo Setup: Click here to populate sample data & demo users"}
        </button>
      </div>
    </div>
  );
}
