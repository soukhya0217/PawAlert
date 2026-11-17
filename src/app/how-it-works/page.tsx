"use client";

import React from "react";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import { AlertTriangle, MapPin, CheckCircle2, Shield, Heart } from "lucide-react";

export default function HowItWorksPage() {
  return (
    <div className="space-y-12 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
        <span className="text-xs font-black uppercase tracking-wider text-primary-700 bg-peach-100 px-3 py-1 rounded-full border border-peach-200">
          Field Protocols
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
          How POWER ALERT Operates in Emergencies
        </h1>
        <p className="text-xs sm:text-sm text-foreground/75 leading-relaxed">
          From first reporting to full case resolution, our standard operating procedures ensure that distress reports reach verified rescuers within minutes.
        </p>
      </div>

      <HowItWorksSection />

      {/* Protocols Breakdown */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-soft space-y-4">
          <h3 className="text-lg font-black text-foreground flex items-center gap-2">
            <span>🛡️</span> Concurrency & Take Responsibility Guarantee
          </h3>
          <p className="text-xs text-foreground/80 leading-relaxed">
            In typical rescue WhatsApp groups or unmoderated forums, confusion reigns: either nobody shows up because everyone assumes someone else went, or multiple rescuers drive to the exact same spot.
          </p>
          <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200 text-xs text-foreground/90 font-medium">
            POWER ALERT uses <strong>atomic database-level locking</strong>. Only the first qualified responder who taps "Take Responsibility" is assigned. All other responders immediately see that the case is covered, preserving volunteer bandwidth for other emergencies.
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-soft space-y-4">
          <h3 className="text-lg font-black text-foreground flex items-center gap-2">
            <span>⏰</span> Automatic SLA Escalation Engine
          </h3>
          <p className="text-xs text-foreground/80 leading-relaxed">
            If a critical accident case is reported and remains unassigned after 45 minutes, the system triggers an automatic escalation alert directly to NGO regional coordinators and platform administrators.
          </p>
        </div>
      </div>
    </div>
  );
}
