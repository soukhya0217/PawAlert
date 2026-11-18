"use client";

import React from "react";
import { Phone, ShieldCheck, Mail, MapPin, Heart, AlertTriangle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t-[2px] border-[#1B3B2B] bg-[#FFFBF5] text-[#1B3B2B] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-[14px] border-[2px] border-[#1B3B2B] bg-[#FFB703] flex items-center justify-center text-lg shadow-bento-sm">
                🐾
              </div>
              <span className="font-display text-2xl font-black tracking-tight text-[#1B3B2B]">
                Paw<span className="text-[#FF5A4E]">Alert</span>
              </span>
            </div>

            <p className="text-xs text-[#1B3B2B]/75 leading-relaxed max-w-sm font-sans">
              Decentralized animal rescue dispatch and field sanctuary network. Zero duplicate assignments, verified rescue milestones, and permanent medical accountability logs.
            </p>

            <div className="p-3 rounded-[16px] border-[2px] border-[#1B3B2B] bg-[#F5EFE6] inline-flex items-center gap-3 shadow-bento-sm">
              <div className="w-8 h-8 rounded-[10px] bg-[#FF5A4E] text-white flex items-center justify-center flex-shrink-0 animate-pulse">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <p className="font-display text-[10px] font-bold text-[#FF5A4E] uppercase tracking-wider">
                  24/7 Emergency Dispatch
                </p>
                <p className="font-mono text-sm font-black text-[#1B3B2B]">
                  +91 (800) 425-PAWS
                </p>
              </div>
            </div>
          </div>

          {/* Quick Rescue Links */}
          <div>
            <h4 className="font-display text-xs font-bold text-[#1B3B2B] uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-[#FF5A4E]" /> Field Actions
            </h4>
            <ul className="space-y-2 text-xs font-display">
              <li>
                <a href="/report" className="hover:text-[#FF5A4E] transition-colors">
                  Report Animal
                </a>
              </li>
              <li>
                <a href="/map" className="hover:text-[#FF5A4E] transition-colors">
                  Field Command Map
                </a>
              </li>
              <li>
                <a href="/missing" className="hover:text-[#FF5A4E] transition-colors">
                  Missing Pet Radar
                </a>
              </li>
              <li>
                <a href="/adoption" className="hover:text-[#FF5A4E] transition-colors">
                  Adopt a Survivor
                </a>
              </li>
            </ul>
          </div>

          {/* Sanctuary Roles */}
          <div>
            <h4 className="font-display text-xs font-bold text-[#1B3B2B] uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2EC4B6]" /> Volunteers
            </h4>
            <ul className="space-y-2 text-xs font-display">
              <li>
                <a href="/volunteer-register" className="hover:text-[#2EC4B6] transition-colors">
                  Join Rescue Squad
                </a>
              </li>
              <li>
                <a href="/ngo-register" className="hover:text-[#2EC4B6] transition-colors">
                  Register Shelter / NGO
                </a>
              </li>
              <li>
                <a href="/how-it-works" className="hover:text-[#2EC4B6] transition-colors">
                  Rescue Protocol
                </a>
              </li>
            </ul>
          </div>

          {/* System & Architecture */}
          <div>
            <h4 className="font-display text-xs font-bold text-[#1B3B2B] uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-[#FF5A4E]" /> Platform Ethics
            </h4>
            <div className="space-y-1.5 text-[11px] font-mono text-[#1B3B2B]/70">
              <p>• 100% UNBIASED INTAKE</p>
              <p>• REAL MONGODB ONLY</p>
              <p>• ZERO FAKE / SEEDED DATA</p>
              <p>• 12-STAGE RESCUE AUDIT</p>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-4 border-t-[2px] border-[#1B3B2B] flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px] text-[#1B3B2B]/60">
          <p>© {new Date().getFullYear()} PawAlert. Every Life Matters. Every Alert Counts.</p>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#2EC4B6]" />
            <span>DISPATCH NETWORK ONLINE</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
