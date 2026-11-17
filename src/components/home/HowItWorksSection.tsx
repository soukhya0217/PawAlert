"use client";

import React from "react";
import { Camera, Cpu, ShieldCheck, HeartHandshake, ArrowRight } from "lucide-react";

export default function HowItWorksSection() {
  const steps = [
    {
      step: "01",
      title: "Spot & Pinpoint",
      desc: "Capture distress photo or video with 1-click GPS location lock and instant severity classification.",
      icon: Camera,
      tag: "GPS TELEMETRY",
    },
    {
      step: "02",
      title: "AI Triage & Match",
      desc: "Analyzes injury severity, eliminates duplicate submissions, and broadcasts to nearby verified rescuers.",
      icon: Cpu,
      tag: "2DSPHERE ENGINE",
    },
    {
      step: "03",
      title: "Atomic Responsibility",
      desc: "First eligible responder locks the assignment with atomic concurrency mutex. Reporter notified instantly.",
      icon: ShieldCheck,
      tag: "MUTEX LOCK",
    },
    {
      step: "04",
      title: "12-Stage Recovery",
      desc: "En route tracking, veterinary hospitalization records, medication schedules, and verified adoption.",
      icon: HeartHandshake,
      tag: "FULL AUDIT TRAIL",
    },
  ];

  return (
    <section className="py-20 border-y border-white/10 bg-[#05070d]/80 relative overflow-hidden">
      {/* Background Grid Lines */}
      <div className="grid-lines absolute inset-0 opacity-40 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="max-w-2xl mb-14">
          <div className="inline-flex items-center gap-2 mb-2 font-mono text-xs uppercase tracking-wider text-[#d4ff3a]">
            <span>ENGINEERED ARCHITECTURE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white font-sans tracking-tight">
            How The Rescue Grid Operates
          </h2>
          <p className="text-sm text-slate-400 mt-2 font-sans leading-relaxed">
            Engineered for high velocity and zero duplicate conflicts. Every alert follows a verifiable 12-stage operational protocol.
          </p>
        </div>

        {/* 4-Step Tactical Flow */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((st, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-white/10 bg-[#0a0e17] p-6 backdrop-blur-md hover:border-[#d4ff3a]/40 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-[#d4ff3a] group-hover:border-[#d4ff3a]/40 group-hover:scale-105 transition-all">
                    <st.icon className="w-5 h-5" />
                  </div>
                  <span className="font-mono text-2xl font-black text-white/20 group-hover:text-[#d4ff3a]/60 transition-colors">
                    {st.step}
                  </span>
                </div>

                <span className="font-mono text-[9px] uppercase tracking-wider text-[#d4ff3a] block mb-1">
                  {st.tag}
                </span>

                <h3 className="font-sans text-base font-bold text-white group-hover:text-[#d4ff3a] transition-colors">
                  {st.title}
                </h3>

                <p className="font-sans text-xs text-slate-400 mt-2 leading-relaxed">
                  {st.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between font-mono text-[10px] text-slate-400">
                <span>STAGE PROTOCOL</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#d4ff3a] group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
