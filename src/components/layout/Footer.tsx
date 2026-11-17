"use client";

import React from "react";
import { Heart, Phone, ShieldCheck, Mail, MapPin, Sparkles, AlertCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-cream-100 border-t border-cream-200 mt-20 relative overflow-hidden">
      {/* Decorative Warm Top Bar */}
      <div className="h-2 w-full bg-gradient-to-r from-primary-400 via-peach-400 to-lavender-400"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary-500 text-white flex items-center justify-center text-xl shadow-md shadow-primary-500/30">
                🐾
              </div>
              <span className="text-2xl font-black tracking-tight text-foreground">
                POWER<span className="text-primary-500">ALERT</span>
              </span>
            </div>
            <p className="text-sm text-foreground/75 leading-relaxed max-w-sm">
              Connecting citizen reporters, verified rescuers, veterinarians, and animal welfare NGOs in real-time. Speed, reliability, and compassion for every soul in distress.
            </p>

            <div className="p-4 rounded-2xl bg-white border border-cream-300 shadow-sm inline-flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0 animate-pulse">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-red-600 uppercase tracking-wider">24/7 Emergency Dispatch</p>
                <p className="text-base font-black text-foreground">+91 (800) 425-PAWS</p>
              </div>
            </div>
          </div>

          {/* Quick Rescue Links */}
          <div>
            <h4 className="text-sm font-black text-foreground uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-primary-500" /> Rescue Action
            </h4>
            <ul className="space-y-2.5 text-sm text-foreground/80 font-medium">
              <li>
                <a href="/report" className="hover:text-primary-600 transition-colors flex items-center gap-1">
                  Report Distressed Animal
                </a>
              </li>
              <li>
                <a href="/map" className="hover:text-primary-600 transition-colors">
                  Interactive Rescue Map
                </a>
              </li>
              <li>
                <a href="/missing" className="hover:text-primary-600 transition-colors">
                  Missing Pet Alerts
                </a>
              </li>
              <li>
                <a href="/adoption" className="hover:text-primary-600 transition-colors">
                  Adopt a Rescued Pet
                </a>
              </li>
              <li>
                <a href="/donate" className="hover:text-primary-600 transition-colors">
                  Emergency Medical Fund
                </a>
              </li>
            </ul>
          </div>

          {/* Community & Roles */}
          <div>
            <h4 className="text-sm font-black text-foreground uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-lavender-500" /> Guardianship
            </h4>
            <ul className="space-y-2.5 text-sm text-foreground/80 font-medium">
              <li>
                <a href="/volunteer-register" className="hover:text-primary-600 transition-colors">
                  Volunteer Application
                </a>
              </li>
              <li>
                <a href="/ngo-register" className="hover:text-primary-600 transition-colors">
                  Register Shelter / NGO
                </a>
              </li>
              <li>
                <a href="/how-it-works" className="hover:text-primary-600 transition-colors">
                  Rescue Protocols
                </a>
              </li>
              <li>
                <a href="/about" className="hover:text-primary-600 transition-colors">
                  Sanctuary Mission
                </a>
              </li>
              <li>
                <a href="/contact" className="hover:text-primary-600 transition-colors">
                  Contact Dispatch
                </a>
              </li>
            </ul>
          </div>

          {/* Standards & Transparency */}
          <div>
            <h4 className="text-sm font-black text-foreground uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-mint-500" /> Trust & Care
            </h4>
            <ul className="space-y-2.5 text-sm text-foreground/80 font-medium">
              <li className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-mint-500"></span> 100% 80G Tax Deductible
              </li>
              <li className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-sky-500"></span> Concurrency Safe Rescues
              </li>
              <li className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-peach-500"></span> GeoJSON 2dsphere Match
              </li>
              <li className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-lavender-500"></span> Automated SLA Escalations
              </li>
              <li className="pt-2">
                <a
                  href="/login"
                  className="inline-block text-xs font-bold text-primary-600 bg-peach-50 border border-peach-200 px-3 py-1.5 rounded-xl hover:bg-peach-100 transition-colors"
                >
                  Admin & Volunteer Portal →
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="mt-12 pt-8 border-t border-cream-200 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
          <p>© 2026 POWER ALERT Platform. Production-Ready Animal Rescue & Welfare Management.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for every animal in distress.
          </p>
        </div>
      </div>
    </footer>
  );
}
