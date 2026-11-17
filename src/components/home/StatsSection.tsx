"use client";

import React from "react";
import { ShieldCheck, Heart, Users, MapPin } from "lucide-react";

export default function StatsSection() {
  const stats = [
    {
      title: "Rescues Dispatched",
      value: "4,820+",
      sub: "Trauma, accident & abuse cases",
      icon: "🚑",
      bgColor: "bg-peach-50",
      textColor: "text-primary-600",
      borderColor: "border-peach-200",
    },
    {
      title: "Community Bowls Fed",
      value: "84,000+",
      sub: "Daily nutrition & fresh water",
      icon: "🥣",
      bgColor: "bg-mint-50",
      textColor: "text-mint-600",
      borderColor: "border-mint-200",
    },
    {
      title: "Loving Adoptions",
      value: "1,150+",
      sub: "Rehabilitated forever companions",
      icon: "🏡",
      bgColor: "bg-lavender-50",
      textColor: "text-lavender-600",
      borderColor: "border-lavender-200",
    },
    {
      title: "Active Volunteers",
      value: "1,240+",
      sub: "First-responders & veterinarians",
      icon: "🦸‍♀️",
      bgColor: "bg-sky-50",
      textColor: "text-sky-600",
      borderColor: "border-sky-200",
    },
  ];

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-black uppercase tracking-wider text-primary-600 bg-peach-100 px-3 py-1 rounded-full border border-peach-200">
            Real Impact Across Our Streets
          </span>
          <h2 className="text-3xl font-black text-foreground mt-3 tracking-tight">
            Accountability in Every Single Step
          </h2>
          <p className="text-sm text-foreground/75 mt-2">
            Every emergency reported on POWER ALERT is tracked, assigned to a verified responder, documented with medical evidence, and preserved in our permanent audit log.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s, idx) => (
            <div
              key={idx}
              className={`rounded-3xl p-6 border ${s.borderColor} ${s.bgColor} shadow-sm hover:shadow-card hover:-translate-y-1 transition-all duration-300`}
            >
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-2xl shadow-sm mb-4">
                {s.icon}
              </div>
              <p className={`text-3xl font-black ${s.textColor} tracking-tight`}>{s.value}</p>
              <h3 className="text-base font-black text-foreground mt-1">{s.title}</h3>
              <p className="text-xs text-muted-foreground font-medium mt-1">{s.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
