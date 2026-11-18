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

  useEffect(() => {
    const fetchIncident = async () => {
      try {
        setLoading(true);
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
            setError("Incident not found. Please verify the tracking code.");
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
      <div className="max-w-md mx-auto my-16 p-6 bento-card text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-[#FF5A4E] mx-auto" />
        <h2 className="text-xl font-black font-display text-[#1B3B2B]">
          Case Not Found
        </h2>
        <p className="text-xs text-[#1B3B2B]/75">
          {error || `No active case matching "${trackingId}".`}
        </p>
        <button
          onClick={() => router.push("/")}
          className="bento-btn rounded-[14px] bg-[#1B3B2B] px-4 py-2 text-xs text-white"
        >
          Return to Headquarters
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      
      {/* Top Header & Tracking ID */}
      <div className="flex items-center justify-between border-b-[3px] border-[#1E1B4B] pb-4">
        <button
          onClick={() => router.push("/")}
          className="pixar-btn flex items-center gap-1.5 rounded-[16px] bg-[#FFF9F0] px-4 py-2 text-xs font-bold text-[#1E1B4B] shadow-pixar-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Home</span>
        </button>

        <div className="text-right">
          <span className="font-mono text-[10px] text-[#1E1B4B]/60 uppercase tracking-widest block font-bold">
            LIVE TRACKER
          </span>
          <span className="font-mono text-sm sm:text-base font-black text-[#FF7A00]">
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
          <span className="inline-block rounded-[14px] border-[2px] border-[#1E1B4B] bg-[#FFB703] px-3.5 py-1 font-display text-xs font-bold text-[#1E1B4B] shadow-pixar-sm mb-2">
            {incident.animalCategory || "Animal in Distress"}
          </span>
          <h1 className="text-3xl font-black font-display text-[#1E1B4B]">
            Rescue Mission Status
          </h1>
          <p className="text-xs text-[#1E1B4B]/75 mt-1 font-sans">
            {incident.conditionDescription}
          </p>
        </div>

        {/* Animated Walking Paw-Trail Tracker */}
        <div className="py-6 border-y-[3px] border-[#1E1B4B] space-y-4">
          <span className="font-mono text-[11px] font-bold text-[#1E1B4B] uppercase tracking-wider block">
            4-STAGE RESCUE TRAIL
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
            {STAGES.map((st, idx) => {
              const isPast = idx < currentStageIdx;
              const isCurrent = idx === currentStageIdx;

              return (
                <div
                  key={st.id}
                  className={`walking-paw-step rounded-[20px] border-[3px] border-[#1E1B4B] p-3.5 transition-all flex flex-col justify-between ${
                    isCurrent
                      ? "bg-[#FF7A00] text-white shadow-pixar scale-[1.02]"
                      : isPast
                      ? "bg-[#10B981] text-white shadow-pixar-sm"
                      : "bg-[#FFF1DC] text-[#1E1B4B]/60"
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
          <div className="rounded-[20px] border-[2px] border-[#1E1B4B] bg-[#FFF9F0] p-4 space-y-1 shadow-pixar-sm">
            <div className="flex items-center gap-2 text-xs font-display font-bold text-[#1E1B4B]">
              <MapPin className="w-4 h-4 text-[#FF7A00]" />
              <span>Location Coordinates</span>
            </div>
            <p className="text-xs text-[#1E1B4B]/80 font-sans truncate">
              {incident.location?.address || "Address logged"}
            </p>
            {incident.location?.coordinates && (
              <p className="font-mono text-[10px] text-[#1E1B4B]/60">
                GPS: {incident.location.coordinates[1]?.toFixed(4)}° N, {incident.location.coordinates[0]?.toFixed(4)}° E
              </p>
            )}
          </div>

          {/* Assigned Volunteer Squad */}
          <div className="rounded-[20px] border-[2px] border-[#1E1B4B] bg-[#FFF9F0] p-4 space-y-1 shadow-pixar-sm">
            <div className="flex items-center gap-2 text-xs font-display font-bold text-[#1E1B4B]">
              <ShieldCheck className="w-4 h-4 text-[#10B981]" />
              <span>Assigned Volunteer Squad</span>
            </div>
            <p className="text-xs text-[#1E1B4B]/80 font-sans">
              {incident.assignedVolunteerId?.fullName || "First eligible responder locking case..."}
            </p>
            {incident.assignedVolunteerId?.mobile && (
              <p className="font-mono text-[10px] text-[#1E1B4B]/60">
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
