"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  ArrowLeft,
  Share2,
  AlertTriangle,
  Heart
} from "lucide-react";
import confetti from "canvas-confetti";
import { animatePawTrail, animateRescueStamp } from "@/lib/animations";

const STAGES = [
  { id: "REPORTED", label: "Reported & Triaged", desc: "Coordinates logged in central dispatch" },
  { id: "DISPATCHED", label: "Rescuer Dispatched", desc: "Volunteer en route to distress location" },
  { id: "IN_TREATMENT", label: "Medical Treatment", desc: "Veterinary stabilization & first aid" },
  { id: "RESOLVED", label: "Safely Rescued!", desc: "Rehabilitated & placed in shelter/foster" },
];

export default function TrackingPage() {
  const params = useParams();
  const router = useRouter();
  const trackingId = params?.trackingId as string;

  const [incident, setIncident] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const stampRef = useRef<HTMLDivElement>(null);

  const [customSearchId, setCustomSearchId] = useState("");

  useEffect(() => {
    const fetchIncident = async () => {
      try {
        setLoading(true);
        setError(null);

        // Special handling if user clicked "Track Case" in navbar (/track/live)
        if (trackingId === "live") {
          const recentRes = await fetch("/api/incidents?limit=1");
          const recentData = await recentRes.json();
          if (recentData.incidents && recentData.incidents.length > 0) {
            setIncident(recentData.incidents[0]);
            setLoading(false);
            return;
          }
          // If no active cases in DB, show empty tracker search UI gracefully
          setIncident(null);
          setLoading(false);
          return;
        }

        // Search by incidentId or _id
        const res = await fetch(`/api/incidents?search=${encodeURIComponent(trackingId)}`);
        const data = await res.json();
        if (data.incidents && data.incidents.length > 0) {
          setIncident(data.incidents[0]);
        } else {
          // Direct by id fallback
          const directRes = await fetch(`/api/incidents/${trackingId}`);
          if (directRes.ok) {
            const directData = await directRes.json();
            setIncident(directData.incident || null);
          } else {
            setError(`No distress case found matching "${trackingId}".`);
          }
        }
      } catch (err: any) {
        setError(err.message || "Failed to load incident");
      } finally {
        setLoading(false);
      }
    };

    if (trackingId) {
      fetchIncident();
    }
  }, [trackingId]);

  // Determine current stage index (0-3)
  const getStageIndex = () => {
    if (!incident) return 0;
    const s = incident.status || "REPORTED";
    if (s === "RESOLVED") return 3;
    if (["IN_TREATMENT", "RECOVERY_MONITORING", "TREATMENT_STARTED"].includes(s)) return 2;
    if (["VOLUNTEER_ASSIGNED", "VOLUNTEER_EN_ROUTE", "VOLUNTEER_REACHED", "RESCUE_IN_PROGRESS", "ANIMAL_RESCUED"].includes(s)) return 1;
    return 0;
  };

  const currentStageIdx = getStageIndex();

  // Trigger sequential paw trail stamping animation
  useEffect(() => {
    if (!loading && incident) {
      animatePawTrail(".walking-paw-step");

      if (currentStageIdx === 3) {
        confetti({
          particleCount: 150,
          spread: 90,
          origin: { y: 0.5 },
          colors: ["#2EC4B6", "#FF5A4E", "#FFB703", "#1B3B2B"],
        });
        animateRescueStamp(stampRef.current);
      }
    }
  }, [loading, incident, currentStageIdx]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="h-12 w-12 rounded-[16px] border-[2px] border-[#1B3B2B] bg-[#FFB703] flex items-center justify-center text-xl shadow-bento animate-bounce mb-3">
          🐾
        </div>
        <p className="font-display text-sm font-bold text-[#1B3B2B]">
          Loading Live Rescue Telemetry...
        </p>
      </div>
    );
  }

  if (error || !incident) {
    return (
      <div className="max-w-lg mx-auto my-12 px-4 space-y-6">
        <div className="pixar-card p-6 sm:p-8 text-center space-y-5">
          {/* Sleeping Puppy SVG Mascot */}
          <div className="relative mx-auto w-16 h-16 rounded-[22px] border-[3px] border-[#1E1B4B] dark:border-[#3B286D] bg-[#FFF1DC] dark:bg-[#1E1B4B] flex items-center justify-center shadow-pixar-sm">
            <svg viewBox="0 0 40 40" className="w-10 h-10">
              <circle cx="20" cy="22" r="12" fill="#FBBF24" stroke="#1E1B4B" strokeWidth="2.5" />
              <path d="M 14 20 Q 17 23 20 20" fill="none" stroke="#1E1B4B" strokeWidth="2" strokeLinecap="round" />
              <path d="M 21 20 Q 24 23 27 20" fill="none" stroke="#1E1B4B" strokeWidth="2" strokeLinecap="round" />
              <path d="M 10 16 C 6 22, 10 26, 12 20" fill="#F59E0B" stroke="#1E1B4B" strokeWidth="2" />
              <path d="M 30 16 C 34 22, 30 26, 28 20" fill="#F59E0B" stroke="#1E1B4B" strokeWidth="2" />
              <ellipse cx="20.5" cy="24.5" rx="4" ry="2.8" fill="#FFF9F0" stroke="#1E1B4B" strokeWidth="1.5" />
              <polygon points="19.5,23.5 21.5,23.5 20.5,25" fill="#1E1B4B" />
            </svg>
            <span className="absolute -top-3 -right-2 font-display text-xs font-black text-[#FF7A00] animate-bounce">
              Zzz
            </span>
          </div>

          <div className="space-y-1.5">
            <h2 className="text-2xl font-black font-display text-[#1E1B4B] dark:text-[#FFF9F0]">
              {trackingId === "live" ? "Sanctuary Radar is Quiet" : "Rescue Case Lookup"}
            </h2>
            <p className="text-xs text-[#1E1B4B]/75 dark:text-[#FFF9F0]/80 max-w-sm mx-auto font-sans">
              {trackingId === "live"
                ? "Zero active distress emergencies in flight. Enter a specific tracking number below or submit a new rescue."
                : (error || `No active rescue found matching "${trackingId}".`)}
            </p>
          </div>

          {/* Quick Tracking Search Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (customSearchId.trim()) {
                router.push(`/track/${customSearchId.trim().toUpperCase()}`);
              }
            }}
            className="flex items-center gap-2 max-w-sm mx-auto pt-2"
          >
            <input
              type="text"
              placeholder="e.g. PAW-20261118-8842"
              value={customSearchId}
              onChange={(e) => setCustomSearchId(e.target.value)}
              className="flex-1 rounded-[16px] border-[2px] border-[#1E1B4B] dark:border-[#3B286D] bg-[#FFF9F0] dark:bg-[#1E1B4B] px-3.5 py-2.5 text-xs font-mono font-bold text-[#1E1B4B] dark:text-[#FFF9F0] placeholder:text-[#1E1B4B]/40 dark:placeholder:text-[#FFF9F0]/40 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]"
            />
            <button
              type="submit"
              className="pixar-btn bg-[#FF7A00] text-white px-4 py-2.5 text-xs font-bold shadow-pixar-sm"
            >
              Lookup
            </button>
          </form>

          <div className="pt-3 border-t-[2px] border-[#1E1B4B]/10 dark:border-white/10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="/report"
              className="pixar-btn w-full sm:w-auto bg-gradient-to-r from-[#FF7A00] to-[#F97316] text-white px-5 py-2.5 text-xs shadow-pixar-sm font-bold"
            >
              🚨 Report Animal in Need
            </a>
            <a
              href="/map"
              className="pixar-btn w-full sm:w-auto bg-[#FFF1DC] dark:bg-[#1E1B4B] text-[#1E1B4B] dark:text-[#FFF9F0] border-[2px] border-[#1E1B4B] dark:border-[#3B286D] px-5 py-2.5 text-xs shadow-pixar-sm font-bold"
            >
              🧭 Command Center Map
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      
      {/* Top Header & Tracking ID */}
      <div className="flex items-center justify-between border-b-[3px] border-[#1E1B4B] dark:border-[#3B286D] pb-4">
        <button
          onClick={() => router.push("/")}
          className="pixar-btn flex items-center gap-1.5 rounded-[16px] bg-[#FFF9F0] dark:bg-[#1E1B4B] px-4 py-2 text-xs font-bold text-[#1E1B4B] dark:text-[#FFF9F0] border-[2px] border-[#1E1B4B] dark:border-[#3B286D] shadow-pixar-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Home</span>
        </button>

        <div className="text-right">
          <span className="font-mono text-[10px] text-[#1E1B4B]/60 dark:text-[#FFF9F0]/60 uppercase tracking-widest block font-bold">
            LIVE TRACKER
          </span>
          <span className="font-mono text-sm sm:base font-black text-[#FF7A00]">
            {incident.incidentId || trackingId}
          </span>
        </div>
      </div>

      {/* Main Status Bento Card */}
      <div className="pixar-card p-6 sm:p-8 space-y-6 relative overflow-hidden">
        
        {/* Ink Stamp Overlay if RESOLVED */}
        {currentStageIdx === 3 && (
          <div
            ref={stampRef}
            className="absolute top-4 right-4 sm:top-6 sm:right-8 z-30 pointer-events-none rounded-[18px] border-[4px] border-[#10B981] bg-[#10B981]/15 px-4 py-2 text-center text-[#10B981] font-display font-black text-xl uppercase tracking-wider rotate-[-12deg] shadow-lg"
          >
            🐾 SAFELY RESCUED!
          </div>
        )}

        <div>
          <span className="inline-block rounded-[14px] border-[2px] border-[#1E1B4B] dark:border-[#3B286D] bg-[#FFB703] px-3.5 py-1 font-display text-xs font-bold text-[#1E1B4B] shadow-pixar-sm mb-2">
            {incident.animalCategory || "Animal in Distress"}
          </span>
          <h1 className="text-3xl font-black font-display text-[#1E1B4B] dark:text-[#FFF9F0]">
            Rescue Mission Status
          </h1>
          <p className="text-xs text-[#1E1B4B]/75 dark:text-[#FFF9F0]/80 mt-1 font-sans">
            {incident.conditionDescription}
          </p>
        </div>

        {/* Animated Walking Paw-Trail Tracker */}
        <div className="py-6 border-y-[3px] border-[#1E1B4B] dark:border-[#3B286D] space-y-4">
          <span className="font-mono text-[11px] font-bold text-[#1E1B4B] dark:text-[#FFF9F0] uppercase tracking-wider block">
            4-STAGE RESCUE TRAIL
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
            {STAGES.map((st, idx) => {
              const isPast = idx < currentStageIdx;
              const isCurrent = idx === currentStageIdx;

              return (
                <div
                  key={st.id}
                  className={`walking-paw-step rounded-[20px] border-[3px] border-[#1E1B4B] dark:border-[#3B286D] p-3.5 transition-all flex flex-col justify-between ${
                    isCurrent
                      ? "bg-[#FF7A00] text-white shadow-pixar scale-[1.02]"
                      : isPast
                      ? "bg-[#10B981] text-white shadow-pixar-sm"
                      : "bg-[#FFF1DC] dark:bg-[#1E1B4B] text-[#1E1B4B]/60 dark:text-[#FFF9F0]/60"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg">
                      {isPast ? "🐾" : isCurrent ? "🚨" : "⏳"}
                    </span>
                    <span className="font-mono text-[10px] font-bold">
                      0{idx + 1}
                    </span>
                  </div>

                  <div>
                    <p className="font-display text-xs font-bold leading-tight">
                      {st.label}
                    </p>
                    <p className="text-[10px] opacity-80 mt-1 leading-tight font-sans">
                      {st.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Location & Volunteer Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Location */}
          <div className="rounded-[20px] border-[2px] border-[#1E1B4B] dark:border-[#3B286D] bg-[#FFF9F0] dark:bg-[#1E1B4B] p-4 space-y-1 shadow-pixar-sm">
            <div className="flex items-center gap-2 text-xs font-display font-bold text-[#1E1B4B] dark:text-[#FFF9F0]">
              <MapPin className="w-4 h-4 text-[#FF7A00]" />
              <span>Location Coordinates</span>
            </div>
            <p className="text-xs text-[#1E1B4B]/80 dark:text-[#FFF9F0]/80 font-sans truncate">
              {incident.location?.address || "Address logged"}
            </p>
            {incident.location?.coordinates && (
              <p className="font-mono text-[10px] text-[#1E1B4B]/60 dark:text-[#FFF9F0]/60">
                GPS: {incident.location.coordinates[1]?.toFixed(4)}° N, {incident.location.coordinates[0]?.toFixed(4)}° E
              </p>
            )}
          </div>

          {/* Assigned Volunteer Squad */}
          <div className="rounded-[20px] border-[2px] border-[#1E1B4B] dark:border-[#3B286D] bg-[#FFF9F0] dark:bg-[#1E1B4B] p-4 space-y-1 shadow-pixar-sm">
            <div className="flex items-center gap-2 text-xs font-display font-bold text-[#1E1B4B] dark:text-[#FFF9F0]">
              <ShieldCheck className="w-4 h-4 text-[#10B981]" />
              <span>Assigned Volunteer Squad</span>
            </div>
            <p className="text-xs text-[#1E1B4B]/80 dark:text-[#FFF9F0]/80 font-sans">
              {incident.assignedVolunteerId?.fullName || "First eligible responder locking case..."}
            </p>
            {incident.assignedVolunteerId?.mobile && (
              <p className="font-mono text-[10px] text-[#1E1B4B]/60 dark:text-[#FFF9F0]/60">
                Direct Contact: {incident.assignedVolunteerId.mobile}
              </p>
            )}
          </div>
        </div>

        {/* Action Bar */}
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <a
            href="/map"
            className="pixar-btn rounded-[16px] bg-[#10B981] px-5 py-2.5 text-xs font-bold text-white shadow-pixar-sm text-center"
          >
            View Live on Tactical Map
          </a>

          <a
            href="/report"
            className="pixar-btn rounded-[16px] bg-[#FF7A00] px-5 py-2.5 text-xs font-bold text-white shadow-pixar-sm text-center"
          >
            Report Another Incident
          </a>
        </div>

      </div>

    </div>
  );
}
