"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import LocationPicker from "@/components/map/LocationPicker";
import {
  ShieldCheck,
  Heart,
  Truck,
  Phone,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export default function VolunteerRegisterPage() {
  const router = useRouter();

  const [category, setCategory] = useState("RESCUE");
  const [skills, setSkills] = useState("Animal First Aid, Safe Restraint");
  const [radiusKm, setRadiusKm] = useState(15);
  const [serviceAreaAddress, setServiceAreaAddress] = useState("Koramangala & HSR Sector");
  const [coords, setCoords] = useState<[number, number]>([77.6245, 12.9352]);
  const [vehicleType, setVehicleType] = useState("TWO_WHEELER");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [experienceYears, setExperienceYears] = useState(2);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    try {
      setSubmitting(true);
      const res = await fetch("/api/volunteers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          skills: skills.split(",").map((s) => s.trim()),
          serviceAreaAddress,
          coordinates: coords,
          radiusKm: parseInt(radiusKm as any, 10),
          vehicleType,
          emergencyContact,
          experienceYears: parseInt(experienceYears as any, 10),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
      } else {
        if (res.status === 401) {
          router.push("/login?redirect=/volunteer-register");
        } else {
          setErrorMsg(data.error || "Failed to submit application");
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-mint-100 rounded-3xl mx-auto flex items-center justify-center text-3xl shadow-sm mb-6 animate-bounce">
          🦸‍♂️
        </div>
        <span className="text-xs font-black uppercase tracking-wider text-mint-800 bg-mint-100 px-3 py-1 rounded-full border border-mint-200">
          Application Received
        </span>
        <h2 className="text-3xl font-black text-foreground mt-3 tracking-tight">
          Welcome to the Rescuer Frontline!
        </h2>
        <p className="text-sm text-foreground/80 mt-2 max-w-lg mx-auto">
          Your volunteer profile has been submitted to the coordinating NGO team. You will receive an email and in-app notification upon verification.
        </p>

        <div className="mt-8">
          <a
            href="/volunteer/dashboard"
            className="px-8 py-3.5 rounded-2xl bg-primary-500 text-white font-bold text-sm shadow-md hover:bg-primary-600 transition-colors inline-block"
          >
            Go to Volunteer Dashboard →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center max-w-xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-peach-100 text-primary-700 text-xs font-black uppercase tracking-wider mb-2 border border-peach-200">
          <ShieldCheck className="w-3.5 h-3.5" /> Frontline Enrollment
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
          Apply as a Verified Rescuer / Volunteer
        </h1>
        <p className="text-xs sm:text-sm text-foreground/75 mt-2">
          Help respond to local road accidents, feeding zones, and emergency trauma rescues in your neighborhood.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl p-6 sm:p-10 border border-cream-200 shadow-soft space-y-8 transition-colors"
      >
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 1. Category */}
        <div className="space-y-3">
          <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground">
            1. Select Primary Volunteer Category *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: "RESCUE", label: "Rescue Volunteer", emoji: "🦸", desc: "Trauma handling & field response" },
              { id: "MEDICAL", label: "Medical First Responder", emoji: "🩺", desc: "Wound dressing & vet transport" },
              { id: "FOOD", label: "Feeding Guardian", emoji: "🥣", desc: "Daily feeding zones & water points" },
              { id: "SHELTER", label: "Shelter Volunteer", emoji: "🏡", desc: "Sanctuary care & enrichment" },
              { id: "GENERAL", label: "General Volunteer", emoji: "🐾", desc: "Logistics, foster & awareness" },
            ].map((cat) => (
              <button
                type="button"
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  category === cat.id
                    ? "bg-peach-100 border-primary-500 ring-2 ring-primary-500/20"
                    : "bg-cream-50/50 border-cream-200 hover:bg-cream-100"
                }`}
              >
                <div className="text-xl mb-1">{cat.emoji}</div>
                <p className="text-xs font-black text-foreground">{cat.label}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{cat.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Skills & Experience */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground">
              Skills & Expertise (Comma separated)
            </label>
            <input
              type="text"
              required
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="E.g. Dog Handling, Animal CPR, Catch Pole"
              className="w-full p-3 rounded-2xl border border-cream-300 bg-cream-50/50 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground">
              Vehicle Type for Transport
            </label>
            <select
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              className="w-full p-3 rounded-2xl border border-cream-300 bg-cream-50/50 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="TWO_WHEELER">🛵 Two-Wheeler (Bike / Scooter)</option>
              <option value="FOUR_WHEELER">🚗 Four-Wheeler (Car / Van)</option>
              <option value="AMBULANCE">🚑 Animal Ambulance</option>
              <option value="NONE">🚶 On Foot / Public Transport</option>
            </select>
          </div>
        </div>

        {/* 3. Service Area & Radius */}
        <div className="space-y-3">
          <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground">
            3. Pinpoint Registered Service Area & Operating Radius *
          </label>
          <LocationPicker
            initialCoordinates={coords}
            onLocationSelect={(newCoords, newAddr) => {
              setCoords(newCoords);
              setServiceAreaAddress(newAddr);
            }}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-muted-foreground">
                Max Response Distance Radius: {radiusKm} km
              </label>
              <input
                type="range"
                min={2}
                max={50}
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                className="w-full accent-primary-500 cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-muted-foreground">
                Emergency Contact Phone *
              </label>
              <input
                type="tel"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                placeholder="+91 98765 00000"
                className="w-full p-2.5 rounded-xl border border-cream-300 bg-cream-50/50 text-xs font-medium"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-cream-200 flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-primary-500 to-peach-500 text-white font-black text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <span>{submitting ? "Submitting Application..." : "Submit Volunteer Application"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
