"use client";

import React, { useState } from "react";
import PipWelcomeScene from "@/components/pip-welcome-scene";
import AuthPortal from "@/components/auth-portal";
import { HeartHandshake, Building2, Compass, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const [isInputFocused, setIsInputFocused] = useState(false);

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#FFF9F0] dark:bg-[#0F0E26] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Storybook Header & Sub-Pill */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 rounded-[16px] border-[2px] border-[#1E1B4B] dark:border-[#3B286D] bg-[#FFB703] px-3.5 py-1 text-xs font-display font-black text-[#1E1B4B] shadow-pixar-sm">
            <span>✨</span>
            <span>PIXAR STORYBOOK GUARDIAN PORTAL</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display text-[#1E1B4B] dark:text-[#FFF9F0] tracking-tight font-pixar-3d">
            Welcome to <span className="text-[#FF7A00]">PawAlert</span>
          </h1>
          <p className="text-xs sm:text-sm font-sans font-bold text-[#1E1B4B]/75 dark:text-[#FFF9F0]/80">
            Log in to manage live rescue dispatches, monitor veterinary telemetry, and care for community animals.
          </p>
        </div>

        {/* Split-Screen Interactive Stage: Pip's 3D Morning (Left) + Tactile Auth Card (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch max-w-6xl mx-auto">
          
          {/* Left Column (7 cols): Pip's Joyful Morning 3D Scene */}
          <div className="lg:col-span-7 flex flex-col justify-center min-h-[440px] sm:min-h-[520px]">
            <PipWelcomeScene isInputFocused={isInputFocused} />
          </div>

          {/* Right Column (5 cols): Tactile Storybook Auth Portal */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <AuthPortal onFocusChange={setIsInputFocused} />

            {/* Specialized Onboarding Pathways */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              <a
                href="/volunteer-register"
                className="pixar-btn rounded-[16px] bg-[#FFF1DC] dark:bg-[#17153B] p-2.5 text-center text-[11px] font-bold text-[#1E1B4B] dark:text-[#FFF9F0] shadow-pixar-sm flex items-center justify-center gap-1.5 border-[2px] border-[#1E1B4B] dark:border-[#3B286D] hover:bg-[#FFE8C2] dark:hover:bg-[#28235C]"
              >
                <HeartHandshake className="w-3.5 h-3.5 text-[#10B981]" />
                <span>Join as Volunteer</span>
              </a>

              <a
                href="/ngo-register"
                className="pixar-btn rounded-[16px] bg-[#FFF1DC] dark:bg-[#17153B] p-2.5 text-center text-[11px] font-bold text-[#1E1B4B] dark:text-[#FFF9F0] shadow-pixar-sm flex items-center justify-center gap-1.5 border-[2px] border-[#1E1B4B] dark:border-[#3B286D] hover:bg-[#FFE8C2] dark:hover:bg-[#28235C]"
              >
                <Building2 className="w-3.5 h-3.5 text-[#1D4ED8]" />
                <span>Register NGO</span>
              </a>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
