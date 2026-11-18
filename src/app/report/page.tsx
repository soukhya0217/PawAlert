"use client";

import React from "react";
import IntakeWizard from "@/components/intake-wizard";
import { ArrowLeft, AlertTriangle } from "lucide-react";

export default function ReportPage() {
  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      
      {/* Top Header */}
      <div className="flex items-center justify-between border-b-[3px] border-[#1E1B4B] pb-4">
        <a
          href="/"
          className="pixar-btn inline-flex items-center gap-1.5 rounded-[16px] bg-[#FFF9F0] px-4 py-2 text-xs font-bold text-[#1E1B4B] shadow-pixar-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </a>

        <div className="inline-flex items-center gap-2 rounded-[16px] border-[3px] border-[#1E1B4B] bg-[#FF7A00] px-4 py-1.5 text-xs font-display font-bold text-white shadow-pixar-sm">
          <AlertTriangle className="w-4 h-4" />
          <span>EMERGENCY DISPATCH INTAKE</span>
        </div>
      </div>

      {/* Main Multi-Step Intake Wizard */}
      <IntakeWizard />

    </div>
  );
}
