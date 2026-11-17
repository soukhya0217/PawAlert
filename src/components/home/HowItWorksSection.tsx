"use client";

import React from "react";
import { Camera, Cpu, ShieldCheck, HeartHandshake } from "lucide-react";

export default function HowItWorksSection() {
  const steps = [
    {
      step: "01",
      title: "Spot & Snap",
      desc: "Capture a photo or video of the animal in distress with 1-click GPS location detection.",
      icon: <Camera className="w-6 h-6 text-primary-500" />,
      color: "from-peach-400 to-primary-500",
    },
    {
      step: "02",
      title: "AI Triage & Match",
      desc: "Platform analyzes injury severity, checks for duplicates, and alerts nearby qualified rescuers.",
      icon: <Cpu className="w-6 h-6 text-lavender-500" />,
      color: "from-lavender-400 to-purple-500",
    },
    {
      step: "03",
      title: "Take Responsibility",
      desc: "A nearby volunteer claims the case with atomic concurrency lock and navigates to the scene.",
      icon: <ShieldCheck className="w-6 h-6 text-mint-500" />,
      color: "from-mint-400 to-emerald-500",
    },
    {
      step: "04",
      title: "Care & Forever Home",
      desc: "Veterinary treatments, medication logs, daily feeding, and adoption to loving families.",
      icon: <HeartHandshake className="w-6 h-6 text-rose-500" />,
      color: "from-rose-400 to-pink-500",
    },
  ];

  return (
    <section className="py-20 bg-cream-100/60 border-y border-cream-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-black uppercase tracking-wider text-lavender-700 bg-lavender-100 px-3 py-1 rounded-full border border-lavender-200">
            Transparent Workflow
          </span>
          <h2 className="text-3xl font-black text-foreground mt-3 tracking-tight">
            How POWER ALERT Works
          </h2>
          <p className="text-sm text-foreground/75 mt-2">
            Engineered so that no report falls through the cracks. Fast, verified, and completely auditable.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {steps.map((st, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-6 border border-cream-200 shadow-soft hover:shadow-card hover:-translate-y-1.5 transition-all relative flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-cream-50 border border-cream-200 flex items-center justify-center shadow-inner">
                    {st.icon}
                  </div>
                  <span className="text-2xl font-black text-cream-300">{st.step}</span>
                </div>

                <h3 className="text-lg font-black text-foreground">{st.title}</h3>
                <p className="text-xs text-foreground/75 mt-2 leading-relaxed">{st.desc}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-cream-100 flex items-center gap-1.5 text-[11px] font-bold text-primary-600">
                <span>Accountable SLA</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
