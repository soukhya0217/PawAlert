"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  MapPin,
  ShieldCheck,
  ArrowLeft,
  Copy,
  Check,
  AlertTriangle,
  Heart,
  Navigation,
  RefreshCw
} from "lucide-react";
import confetti from "canvas-confetti";
import { animatePawTrail, animateRescueStamp } from "@/lib/animations";

const STAGES = [
  { id: "REPORTED", label: "Reported & Triaged", desc: "Coordinates logged in central dispatch" },
  { id: "DISPATCHED", label: "Rescuer Dispatched", desc: "Volunteer en route to distress location" },
  { id: "IN_TREATMENT", label: "Medical Treatment", desc: "Veterinary stabilization & first aid" },
  { id: "RESOLVED", label: "Safely Rescued!", desc: "Rehabilitated & placed in sanctuary/foster" },
];

interface TrackViewProps {
  trackingId?: string;
}

export default function TrackView({ trackingId: initialTrackingId }: TrackViewProps) {
  const router = useRouter();
  const [trackingId, setTrackingId] = useState(initialTrackingId || "live");
  const [incident, setIncident] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [searchInput, setSearchInput] = useState("");

  const stampRef = useRef<HTMLDivElement>(null);

  const fetchIncident = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/track/${encodeURIComponent(id)}`);
      const data = await res.json();

      if (res.ok && data.incident) {
        setIncident(data.incident);
      } else {
        setIncident(null);
        setError(data.error || `No active rescue case found matching "${id}".`);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load incident telemetry");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialTrackingId) {
      setTrackingId(initialTrackingId);
      fetchIncident(initialTrackingId);
    }
  }, [initialTrackingId]);

  // Stage Index Calculation (0-3)
  const getStageIndex = () => {
    if (!incident) return 0;
    const s = incident.status || "REPORTED";
    if (s === "RESOLVED") return 3;
    if (["IN_TREATMENT", "RECOVERY_MONITORING", "TREATMENT_STARTED"].includes(s)) return 2;
    if (["VOLUNTEER_ASSIGNED", "VOLUNTEER_EN_ROUTE", "VOLUNTEER_REACHED", "RESCUE_IN_PROGRESS", "ANIMAL_RESCUED"].includes(s)) return 1;
    return 0;
  };

  const currentStageIdx = getStageIndex();

  useEffect(() => {
    if (!loading && incident) {
      animatePawTrail(".walking-paw-step");
      if (currentStageIdx === 3) {
        try {
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.5 },
            colors: ["#10B981", "#FF7A00", "#FFB703", "#1E1B4B"],
          });
          animateRescueStamp(stampRef.current);
        } catch {
          // ignore
        }
      }
    }
  }, [loading, incident, currentStageIdx]);

  const handleCopyId = () => {
    const idToCopy = incident?.incidentId || trackingId;
    navigator.clipboard.writeText(idToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      const clean = searchInput.trim().toUpperCase();
      setTrackingId(clean);
      fetchIncident(clean);
      router.push(`/track/${clean}`);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b-[3px] border-[#1E1B4B] dark:border-[#3B286D] pb-5">
        <a
          href="/"
          className="pixar-btn inline-flex items-center gap-1.5 rounded-[16px] bg-[#FFF9F0] dark:bg-[#1E1B4B] px-3.5 py-2 text-xs font-bold text-[#1E1B4B] dark:text-[#FFF9F0] border-[2px] border-[#1E1B4B] dark:border-[#3B286D] shadow-pixar-sm w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Home</span>
        </a>

        {/* Search Input Form */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 max-w-sm sm:justify-end">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search Case ID (e.g. PAW-...)"
            className="flex-1 rounded-[16px] border-[2px] border-[#1E1B4B] dark:border-[#3B286D] bg-[#FFF9F0] dark:bg-[#1E1B4B] px-3 py-2 text-xs font-mono font-bold text-[#1E1B4B] dark:text-[#FFF9F0] placeholder:text-[#1E1B4B]/40 dark:placeholder:text-[#FFF9F0]/40 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]"
          />
          <button
            type="submit"
            className="pixar-btn bg-[#FF7A00] text-white px-3.5 py-2 text-xs font-bold shadow-pixar-sm flex-shrink-0"
          >
            Lookup
          </button>
        </form>
      </div>

      {loading ? (
        <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center space-y-3">
          <div className="h-12 w-12 rounded-[18px] border-[3px] border-[#1E1B4B] dark:border-[#3B286D] bg-[#FFB703] flex items-center justify-center text-2xl shadow-pixar animate-bounce">
            🐾
          </div>
          <p className="font-display text-sm font-bold text-[#1E1B4B] dark:text-[#FFF9F0]">
            Connecting to Live Rescue Radar...
          </p>
        </div>
      ) : incident ? (
        <div className="pixar-card p-6 sm:p-8 bg-[#FFF9F0] dark:bg-[#17153B] border-[3px] border-[#1E1B4B] dark:border-[#3B286D] space-y-6 relative overflow-hidden shadow-pixar">
          
          {/* Resolved Stamp Badge */}
          {currentStageIdx === 3 && (
            <div
              ref={stampRef}
              className="absolute top-4 right-4 sm:top-6 sm:right-8 z-30 pointer-events-none rounded-[18px] border-[4px] border-[#10B981] bg-[#10B981]/15 px-4 py-2 text-center text-[#10B981] font-display font-black text-lg sm:text-xl uppercase tracking-wider rotate-[-12deg] shadow-lg"
            >
              🐾 SAFELY RESCUED!
            </div>
          )}

          {/* Heading & Copy ID Pill */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-[2px] border-[#1E1B4B]/10 dark:border-white/10 pb-4">
            <div>
              <span className="inline-block rounded-[14px] border-[2px] border-[#1E1B4B] dark:border-[#3B286D] bg-[#FFB703] px-3.5 py-1 font-display text-xs font-bold text-[#1E1B4B] shadow-pixar-sm mb-2">
                {incident.animalCategory || "Animal in Distress"}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black font-display text-[#1E1B4B] dark:text-[#FFF9F0]">
                Rescue Mission Telemetry
              </h1>
              <p className="text-xs text-[#1E1B4B]/75 dark:text-[#FFF9F0]/80 mt-1 font-sans">
                {incident.conditionDescription}
              </p>
            </div>

            {/* Copy Tracking ID Button */}
            <button
              onClick={handleCopyId}
              className="pixar-btn bg-[#FFF1DC] dark:bg-[#1E1B4B] text-[#1E1B4B] dark:text-[#FFF9F0] border-[2px] border-[#1E1B4B] dark:border-[#3B286D] px-3.5 py-2 text-xs font-mono font-bold shadow-pixar-sm inline-flex items-center gap-2 self-start sm:self-center"
              title="Click to copy tracking ID"
            >
              <span>#{incident.incidentId || trackingId}</span>
              {copied ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5 text-[#FF7A00]" />}
            </button>
          </div>

          {/* 4-Stage Walking Paw Trail */}
          <div className="py-5 border-y-[3px] border-[#1E1B4B] dark:border-[#3B286D] space-y-4">
            <span className="font-mono text-[11px] font-bold text-[#1E1B4B] dark:text-[#FFF9F0] uppercase tracking-wider block">
              4-STAGE RESCUE TRAIL
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
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

          {/* Location & Volunteer Squad Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-[20px] border-[2px] border-[#1E1B4B] dark:border-[#3B286D] bg-[#FFF9F0] dark:bg-[#1E1B4B] p-4 space-y-1 shadow-pixar-sm">
              <div className="flex items-center gap-2 text-xs font-display font-bold text-[#1E1B4B] dark:text-[#FFF9F0]">
                <MapPin className="w-4 h-4 text-[#FF7A00]" />
                <span>Distress Coordinates</span>
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

            <div className="rounded-[20px] border-[2px] border-[#1E1B4B] dark:border-[#3B286D] bg-[#FFF9F0] dark:bg-[#1E1B4B] p-4 space-y-1 shadow-pixar-sm">
              <div className="flex items-center gap-2 text-xs font-display font-bold text-[#1E1B4B] dark:text-[#FFF9F0]">
                <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                <span>Assigned Squad</span>
              </div>
              <p className="text-xs text-[#1E1B4B]/80 dark:text-[#FFF9F0]/80 font-sans">
                {incident.assignedVolunteerId?.fullName || "Dispatch team en route"}
              </p>
              {incident.assignedVolunteerId?.mobile && (
                <p className="font-mono text-[10px] text-[#1E1B4B]/60 dark:text-[#FFF9F0]/60">
                  Direct Line: {incident.assignedVolunteerId.mobile}
                </p>
              )}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <a
              href="/map"
              className="pixar-btn rounded-[16px] bg-[#10B981] px-5 py-2.5 text-xs font-bold text-white shadow-pixar-sm text-center"
            >
              View on Command Map
            </a>

            <a
              href="/report"
              className="pixar-btn rounded-[16px] bg-[#FF7A00] px-5 py-2.5 text-xs font-bold text-white shadow-pixar-sm text-center"
            >
              Report Another Animal
            </a>
          </div>

        </div>
      ) : (
        /* Empty State */
        <div className="pixar-card p-8 bg-[#FFF9F0] dark:bg-[#17153B] border-[3px] border-[#1E1B4B] dark:border-[#3B286D] text-center space-y-4 shadow-pixar">
          <div className="w-16 h-16 rounded-[22px] border-[3px] border-[#1E1B4B] dark:border-[#3B286D] bg-[#FFF1DC] dark:bg-[#1E1B4B] flex items-center justify-center text-3xl mx-auto shadow-pixar-sm">
            🐶
          </div>
          <h2 className="text-xl font-black font-display text-[#1E1B4B] dark:text-[#FFF9F0]">
            {error || "No active rescue case found."}
          </h2>
          <p className="text-xs text-[#1E1B4B]/70 dark:text-[#FFF9F0]/70 max-w-sm mx-auto font-sans">
            Enter a valid tracking ID above or report a new animal in need.
          </p>
          <a
            href="/report"
            className="pixar-btn inline-flex items-center gap-1.5 rounded-[16px] bg-[#FF7A00] text-white px-5 py-2.5 text-xs font-bold shadow-pixar-sm"
          >
            <span>Report Animal in Need</span>
          </a>
        </div>
      )}
    </div>
  );
}
