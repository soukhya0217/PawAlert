"use client";

import React from "react";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import { AlertTriangle, MapPin, CheckCircle2, Shield, Heart } from "lucide-react";

export default function HowItWorksPage() {
  return (
    <div className="space-y-12 py-10 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
        <span className="text-xs font-black uppercase tracking-wider text-[#FF7A00] bg-[#FFF1DC] px-3 py-1 rounded-[14px] border-[2px] border-[#1E1B4B] shadow-pixar-sm font-display">
          Field Protocols
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-[#1E1B4B] tracking-tight font-display">
          How PAWALERT Operates in Emergencies
        </h1>
        <p className="text-xs sm:text-sm text-[#1E1B4B]/75 leading-relaxed font-sans">
          From first reporting to full case resolution, our standard operating procedures ensure that distress reports reach verified rescuers within minutes.
        </p>
      </div>

      <HowItWorksSection />

      {/* Protocols Breakdown */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="pixar-card p-6 sm:p-8 space-y-4">
          <h3 className="text-lg font-black text-[#1E1B4B] flex items-center gap-2 font-display">
            <span>🛡️</span> Concurrency & Take Responsibility Guarantee
          </h3>
          <p className="text-xs text-[#1E1B4B]/80 leading-relaxed font-sans">
            In typical rescue WhatsApp groups or unmoderated forums, confusion reigns: either nobody shows up because everyone assumes someone else went, or multiple rescuers drive to the exact same spot.
          </p>
          <div className="p-4 rounded-[18px] bg-[#FFF1DC] border-[2px] border-[#1E1B4B] text-xs text-[#1E1B4B] font-medium font-sans">
            PAWALERT uses <strong>atomic database-level locking</strong>. Only the first qualified responder who taps "Take Responsibility" is assigned. All other responders immediately see that the case is covered, preserving volunteer bandwidth for other emergencies.
          </div>
        </div>

        <div className="pixar-card p-6 sm:p-8 space-y-4">
          <h3 className="text-lg font-black text-[#1E1B4B] flex items-center gap-2 font-display">
            <span>⏰</span> Automatic SLA Escalation Engine
          </h3>
          <p className="text-xs text-[#1E1B4B]/80 leading-relaxed font-sans">
            If a critical accident case is reported and remains unassigned after 45 minutes, the system triggers an automatic escalation alert directly to NGO regional coordinators and platform administrators.
          </p>
        </div>
      </div>
    </div>
  );
}
