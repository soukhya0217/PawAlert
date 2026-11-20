"use client";

import React from "react";
import { Phone, ShieldCheck, Mail, MapPin, Heart, AlertTriangle, Sparkles } from "lucide-react";
import PawMark from "@/components/paw-mark";

export default function Footer() {
  return (
    <footer className="border-t-[3px] border-[#1E1B4B] bg-[#FFF9F0] text-[#1E1B4B] relative overflow-hidden transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Brand Info & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <a href="/" className="inline-block transition-transform hover:scale-105">
              <PawMark size="md" showTagline={true} />
            </a>

            <p className="text-xs text-[#1E1B4B]/75 leading-relaxed max-w-sm font-sans">
              Decentralized animal rescue dispatch and field sanctuary network. Zero duplicate assignments, verified rescue milestones, and permanent medical accountability logs.
            </p>

            <div className="p-3.5 rounded-[20px] border-[2px] border-[#1E1B4B] bg-[#FFF1DC] inline-flex items-center gap-3 shadow-pixar-sm">
              <div className="w-9 h-9 rounded-[14px] bg-[#FF7A00] text-white flex items-center justify-center flex-shrink-0 animate-pulse shadow-sm">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <p className="font-display text-[10px] font-bold text-[#FF7A00] uppercase tracking-wider">
                  24/7 Emergency Dispatch
                </p>
                <p className="font-mono text-sm font-black text-[#1E1B4B]">
                  +91 (800) 425-PAWS
                </p>
              </div>
            </div>
          </div>

          {/* Quick Rescue Links */}
          <div>
            <h4 className="font-display text-xs font-bold text-[#1E1B4B] uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-[#FF7A00]" /> Field Actions
            </h4>
            <ul className="space-y-2.5 text-xs font-display">
              <li>
                <a href="/report" className="text-[#1E1B4B]/80 hover:text-[#FF7A00] transition-colors">
                  Report Animal in Need
                </a>
              </li>
              <li>
                <a href="/map" className="text-[#1E1B4B]/80 hover:text-[#FF7A00] transition-colors">
                  Field Command Map
                </a>
              </li>
              <li>
                <a href="/missing" className="text-[#1E1B4B]/80 hover:text-[#FF7A00] transition-colors">
                  Missing Pet Radar
                </a>
              </li>
              <li>
                <a href="/adoption" className="text-[#1E1B4B]/80 hover:text-[#FF7A00] transition-colors">
                  Adopt a Survivor
                </a>
              </li>
            </ul>
          </div>

          {/* Sanctuary Roles */}
          <div>
            <h4 className="font-display text-xs font-bold text-[#1E1B4B] uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" /> Volunteers & NGOs
            </h4>
            <ul className="space-y-2.5 text-xs font-display">
              <li>
                <a href="/volunteer-register" className="text-[#1E1B4B]/80 hover:text-[#10B981] transition-colors">
                  Join Rescue Squad
                </a>
              </li>
              <li>
                <a href="/ngo-register" className="text-[#1E1B4B]/80 hover:text-[#10B981] transition-colors">
                  Register Shelter / NGO
                </a>
              </li>
              <li>
                <a href="/how-it-works" className="text-[#1E1B4B]/80 hover:text-[#10B981] transition-colors">
                  Field Rescue Protocol
                </a>
              </li>
            </ul>
          </div>

          {/* System & Architecture */}
          <div>
            <h4 className="font-display text-xs font-bold text-[#1E1B4B] uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-[#EF4444]" /> Platform Ethics
            </h4>
            <div className="space-y-2 text-[11px] font-mono text-[#1E1B4B]/70">
              <p className="flex items-center gap-1.5">
                <span className="text-[#FF7A00]">🐾</span> 100% Unbiased Intake
              </p>
              <p className="flex items-center gap-1.5">
                <span className="text-[#10B981]">🛡️</span> Real MongoDB Only
              </p>
              <p className="flex items-center gap-1.5">
                <span className="text-[#FBBF24]">✨</span> Zero Fake / Seeded Data
              </p>
              <p className="flex items-center gap-1.5">
                <span className="text-[#06B6D4]">🔒</span> 12-Stage Rescue Audit
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-5 border-t-[2px] border-[#1E1B4B]/15 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px] text-[#1E1B4B]/60">
          <p>© {new Date().getFullYear()} PawAlert. Every Life Matters. Every Alert Counts.</p>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#10B981] animate-ping" />
            <span className="font-bold text-[#10B981]">DISPATCH NETWORK ONLINE</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
