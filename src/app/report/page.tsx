"use client";

import React from "react";
import IntakeWizard from "@/components/intake-wizard";
import { ArrowLeft, AlertTriangle } from "lucide-react";

export default function ReportPage() {
  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      
      {/* Top Header */}
      <div className="flex items-center justify-between border-b-[2px] border-[#1B3B2B] pb-4">
        <a
          href="/"
          className="bento-btn inline-flex items-center gap-1.5 rounded-[14px] bg-[#FFFBF5] px-3.5 py-1.5 text-xs text-[#1B3B2B]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Grid</span>
        </a>

        <div className="inline-flex items-center gap-2 rounded-[14px] border-[2px] border-[#1B3B2B] bg-[#FF5A4E] px-3 py-1 text-xs font-display font-bold text-white shadow-bento-sm">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>EMERGENCY DISPATCH INTAKE</span>
        </div>
      </div>

      {/* Main Multi-Step Intake Wizard */}
      <IntakeWizard />

    </div>
  );
}
