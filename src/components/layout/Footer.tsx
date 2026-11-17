"use client";

import React from "react";
import { Phone, ShieldCheck, Mail, MapPin, Radio, AlertTriangle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#05070d] text-slate-400 relative overflow-hidden">
      {/* Top Laser Accent */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#d4ff3a]/50 to-transparent"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <svg width="28" height="28" viewBox="0 0 40 40" aria-hidden="true">
                <path 
                  d="M20 2 36 11v18L20 38 4 29V11z" 
                  fill="rgba(212, 255, 58, 0.05)" 
                  stroke="#d4ff3a" 
                  strokeWidth="2.2" 
                />
                <path 
                  d="M11.5 27 20 18.5 28.5 27" 
                  fill="none" 
                  stroke="#d4ff3a" 
                  strokeWidth="2.5" 
                />
              </svg>
              <span className="font-mono text-lg font-black tracking-[0.14em] text-white">
                POWER<span className="text-[#d4ff3a]">ALERT</span>
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm font-sans">
              Decentralized animal emergency response and welfare accountability network. Zero duplicate assignments, verified rescue milestones, and permanent medical audit logs.
            </p>

            <div className="p-3.5 rounded-lg border border-red-500/20 bg-red-950/20 inline-flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-[#ff3b30] text-white flex items-center justify-center flex-shrink-0 animate-pulse">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <p className="font-mono text-[10px] font-bold text-red-400 uppercase tracking-wider">
                  24/7 Emergency Dispatch
                </p>
                <p className="font-mono text-sm font-black text-white">
                  +91 (800) 425-PAWS
                </p>
              </div>
            </div>
          </div>

          {/* Quick Rescue Links */}
          <div>
            <h4 className="font-mono text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-[#ff3b30]" /> Dispatch Actions
            </h4>
            <ul className="space-y-2 text-xs font-mono">
              <li>
                <a href="/report" className="hover:text-[#d4ff3a] transition-colors">
                  &gt; Report Animal
                </a>
              </li>
              <li>
                <a href="/map" className="hover:text-[#d4ff3a] transition-colors">
                  &gt; Tactical Radar Map
                </a>
              </li>
              <li>
                <a href="/missing" className="hover:text-[#d4ff3a] transition-colors">
                  &gt; Missing Pet Radar
                </a>
              </li>
              <li>
                <a href="/adoption" className="hover:text-[#d4ff3a] transition-colors">
                  &gt; Verified Adoptions
                </a>
              </li>
              <li>
                <a href="/donate" className="hover:text-[#d4ff3a] transition-colors">
                  &gt; Medical Fund
                </a>
              </li>
            </ul>
          </div>

          {/* Community & Roles */}
          <div>
            <h4 className="font-mono text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#d4ff3a]" /> Guardianship
            </h4>
            <ul className="space-y-2 text-xs font-mono">
              <li>
                <a href="/volunteer-register" className="hover:text-[#d4ff3a] transition-colors">
                  &gt; Volunteer Enlistment
                </a>
              </li>
              <li>
                <a href="/ngo-register" className="hover:text-[#d4ff3a] transition-colors">
                  &gt; Register Shelter / NGO
                </a>
              </li>
              <li>
                <a href="/how-it-works" className="hover:text-[#d4ff3a] transition-colors">
                  &gt; Protocol Specification
                </a>
              </li>
              <li>
                <a href="/about" className="hover:text-[#d4ff3a] transition-colors">
                  &gt; Sanctuary Mission
                </a>
              </li>
            </ul>
          </div>

          {/* System & Architecture */}
          <div>
            <h4 className="font-mono text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-emerald-400" /> Platform Architecture
            </h4>
            <div className="space-y-2 text-[11px] font-mono text-slate-400">
              <p>• GEOJSON 2DSPHERE</p>
              <p>• ATOMIC MUTEX DISPATCH</p>
              <p>• 12-STAGE RESCUE AUDIT</p>
              <p>• ZERO FAKE DATA GUARANTEE</p>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px] text-slate-400">
          <p>© {new Date().getFullYear()} POWER ALERT. Every Life Matters. Every Alert Counts.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#d4ff3a]" />
              SECURE PROTOCOL
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
