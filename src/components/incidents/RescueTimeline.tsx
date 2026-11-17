"use client";

import React from "react";
import { CheckCircle2, Clock, AlertCircle, Camera, User, Shield } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface StatusHistoryItem {
  status: string;
  timestamp: string | Date;
  updatedBy?: { fullName?: string; role?: string };
  updaterRole?: string;
  notes?: string;
  evidenceImages?: string[];
}

interface RescueTimelineProps {
  currentStatus: string;
  history: StatusHistoryItem[];
  priority: string;
  slaDeadline?: string | Date;
}

const ALL_MILESTONES = [
  { key: "REPORTED", label: "Incident Reported", emoji: "📢" },
  { key: "VERIFIED", label: "Verified by Coordinator", emoji: "🔍" },
  { key: "VOLUNTEER_ASSIGNED", label: "Volunteer Assigned", emoji: "🦸‍♂️" },
  { key: "VOLUNTEER_EN_ROUTE", label: "Volunteer En Route", emoji: "🚗" },
  { key: "VOLUNTEER_REACHED", label: "Reached On-Site", emoji: "📍" },
  { key: "RESCUE_IN_PROGRESS", label: "Rescue In Progress", emoji: "🛡️" },
  { key: "ANIMAL_RESCUED", label: "Animal Safely Secured", emoji: "💖" },
  { key: "TREATMENT_STARTED", label: "Veterinary Treatment", emoji: "🩺" },
  { key: "RECOVERY_MONITORING", label: "Sanctuary Recovery", emoji: "🌿" },
  { key: "RESOLVED", label: "Case Resolved & Closed", emoji: "🎉" },
];

export default function RescueTimeline({
  currentStatus,
  history = [],
  priority,
  slaDeadline,
}: RescueTimelineProps) {
  // Find current index
  const currentIndex = ALL_MILESTONES.findIndex((m) => m.key === currentStatus);
  const activeStep = currentIndex === -1 ? 0 : currentIndex;

  return (
    <div className="bg-white rounded-3xl p-6 border border-cream-200 shadow-soft">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-cream-200 gap-2">
        <div>
          <h3 className="text-lg font-black text-foreground flex items-center gap-2">
            <span>🐾</span> Live Rescue Progression
          </h3>
          <p className="text-xs text-muted-foreground font-medium">
            Accountability trail: Every status transition is timestamped and auditable.
          </p>
        </div>

        {slaDeadline && (
          <div className="px-3.5 py-1.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>SLA Target: {formatDate(slaDeadline)}</span>
          </div>
        )}
      </div>

      {/* Progress Stepper Bar */}
      <div className="mt-8 mb-10 overflow-x-auto pb-4">
        <div className="flex items-center min-w-[700px]">
          {ALL_MILESTONES.map((step, idx) => {
            const isCompleted = idx <= activeStep;
            const isCurrent = idx === activeStep;

            return (
              <React.Fragment key={step.key}>
                <div className="flex flex-col items-center relative group">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                      isCurrent
                        ? "bg-primary-500 text-white shadow-lg shadow-primary-500/35 ring-4 ring-peach-200 scale-110"
                        : isCompleted
                        ? "bg-mint-500 text-white shadow-md shadow-mint-500/25"
                        : "bg-cream-200 text-muted-foreground"
                    }`}
                  >
                    {isCompleted && !isCurrent ? (
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    ) : (
                      <span>{step.emoji}</span>
                    )}
                  </div>
                  <span
                    className={`text-[11px] font-bold mt-2 text-center max-w-[85px] leading-tight ${
                      isCurrent
                        ? "text-primary-700 font-black"
                        : isCompleted
                        ? "text-foreground"
                        : "text-muted-foreground/60"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>

                {idx < ALL_MILESTONES.length - 1 && (
                  <div
                    className={`flex-1 h-1.5 mx-1 rounded-full transition-all duration-500 ${
                      idx < activeStep ? "bg-mint-500" : "bg-cream-200"
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Timestamped Logs */}
      <div className="space-y-4">
        <h4 className="text-xs font-black text-muted-foreground uppercase tracking-wider">
          Chronological Audit Logs ({history.length})
        </h4>

        <div className="relative pl-6 border-l-2 border-peach-200 space-y-6">
          {history.map((item, i) => (
            <div key={i} className="relative group">
              <span className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-primary-500 ring-4 ring-white" />

              <div className="bg-cream-50/80 p-4 rounded-2xl border border-cream-200 transition-all hover:bg-cream-50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-xs font-black text-primary-700 tracking-wide uppercase">
                    {item.status.replace(/_/g, " ")}
                  </span>
                  <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    {formatDate(item.timestamp)}
                  </span>
                </div>

                {item.notes && (
                  <p className="text-xs text-foreground mt-2 font-medium leading-relaxed">
                    {item.notes}
                  </p>
                )}

                {item.evidenceImages && item.evidenceImages.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.evidenceImages.map((img, imgIdx) => (
                      <a
                        key={imgIdx}
                        href={img}
                        target="_blank"
                        rel="noreferrer"
                        className="relative rounded-xl overflow-hidden border border-cream-300 w-20 h-20 group/img inline-block"
                      >
                        <img src={img} alt="Evidence" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity">
                          <Camera className="w-4 h-4 text-white" />
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
