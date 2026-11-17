"use client";

import React from "react";
import { Heart, ShieldCheck, Sparkles, MapPin, Phone, Users } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-black uppercase tracking-wider text-primary-700 bg-peach-100 px-3 py-1 rounded-full border border-peach-200">
          🐾 Our Sanctuary Creed
        </span>
        <h1 className="text-4xl font-black text-foreground tracking-tight">
          Every Life Matters. Every Alert Counts.
        </h1>
        <p className="text-sm text-foreground/80 leading-relaxed">
          POWER ALERT was born out of a critical gap in animal welfare: the tragic delay between when a citizen spots an injured animal and when a rescuer actually arrives.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-cream-200 shadow-soft space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-peach-100 text-primary-600 flex items-center justify-center text-2xl">
            ⚡
          </div>
          <h3 className="text-lg font-black text-foreground">Zero Friction Reporting</h3>
          <p className="text-xs text-foreground/75 leading-relaxed">
            Anyone with a smartphone can pinpoint distress coordinates and snap a photo in 30 seconds. No bureaucratic barriers.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-cream-200 shadow-soft space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-mint-100 text-mint-600 flex items-center justify-center text-2xl">
            🔒
          </div>
          <h3 className="text-lg font-black text-foreground">Atomic Accountability</h3>
          <p className="text-xs text-foreground/75 leading-relaxed">
            Every case is assigned with strict concurrency locks, preventing race conditions. Automatic SLA escalation guarantees cases are never abandoned.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-cream-200 shadow-soft space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-lavender-100 text-lavender-600 flex items-center justify-center text-2xl">
            🌿
          </div>
          <h3 className="text-lg font-black text-foreground">Holistic Lifecycle Care</h3>
          <p className="text-xs text-foreground/75 leading-relaxed">
            From the emergency ambulance rescue to trauma surgery, daily feeding zones, and loving family adoption.
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-peach-100 via-cream-50 to-white rounded-3xl p-8 border border-peach-200/80 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <h3 className="text-2xl font-black text-foreground">Want to join the mission?</h3>
          <p className="text-xs text-foreground/80 max-w-md">
            Whether you are a veterinary surgeon, an experienced animal handler, or a citizen feeding street animals, there is a role for you.
          </p>
        </div>

        <div className="flex gap-3">
          <a
            href="/volunteer-register"
            className="px-6 py-3 rounded-2xl bg-primary-500 text-white font-bold text-xs shadow hover:bg-primary-600 transition-colors"
          >
            Become a Volunteer
          </a>
          <a
            href="/contact"
            className="px-5 py-3 rounded-2xl bg-white border border-cream-300 font-bold text-xs text-foreground hover:bg-cream-100 transition-colors"
          >
            Contact Dispatch
          </a>
        </div>
      </div>
    </div>
  );
}
