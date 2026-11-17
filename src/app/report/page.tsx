"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import LocationPicker from "@/components/map/LocationPicker";
import {
  AlertTriangle,
  Camera,
  Upload,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Info,
  Phone,
  User,
  Mail,
  Radio,
  Crosshair,
  Activity
} from "lucide-react";

const ANIMAL_CATEGORIES = [
  { label: "Injured Stray Dog", code: "DOG", value: "Injured Dog" },
  { label: "Injured Street Cat", code: "CAT", value: "Injured Cat" },
  { label: "Injured Bird / Avian", code: "AVN", value: "Injured Bird" },
  { label: "Vehicular Trauma / Hit & Run", code: "HIT", value: "Road Accident" },
  { label: "Abandoned Puppy / Kitten", code: "ABN", value: "Abandoned Animal" },
  { label: "Trapped / Ensnared Animal", code: "TRP", value: "Trapped Animal" },
  { label: "Maggot Wound / Infection", code: "MED", value: "Sick Animal" },
  { label: "Starving Community Animal", code: "STR", value: "Starving Animal" },
  { label: "Cruelty / Intentional Abuse", code: "ABU", value: "Animal Abuse" },
  { label: "Stray Bovine / Cattle Trauma", code: "COW", value: "Stray Cattle" },
  { label: "Wildlife Distress", code: "WLD", value: "Wildlife Emergency" },
  { label: "Other Distress Incident", code: "OTH", value: "Other" },
];

export default function ReportAnimalPage() {
  const router = useRouter();

  const [category, setCategory] = useState("Injured Dog");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"CRITICAL" | "HIGH" | "MEDIUM" | "LOW">("HIGH");
  const [coords, setCoords] = useState<[number, number]>([77.5946, 12.9716]);
  const [address, setAddress] = useState("Bangalore City Center");
  const [landmark, setLandmark] = useState("");
  const [city, setCity] = useState("Bangalore");
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [reporterName, setReporterName] = useState("");
  const [reporterPhone, setReporterPhone] = useState("");
  const [reporterEmail, setReporterEmail] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [createdIncident, setCreatedIncident] = useState<any | null>(null);
  const [duplicates, setDuplicates] = useState<any[]>([]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const chosenImage = imagePreview || imageUrl || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80";

    if (!category || !description || !address) {
      setErrorMsg("Please fill out animal category, condition description, and location.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          animalCategory: category,
          conditionDescription: description,
          priority,
          coordinates: coords,
          address,
          landmark,
          city,
          images: [chosenImage],
          videoUrl,
          reporterName: reporterName || "Anonymous Guardian",
          reporterPhone: reporterPhone || "Not provided",
          reporterEmail,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setCreatedIncident(data.incident);
        setDuplicates(data.possibleDuplicates || []);
      } else {
        setErrorMsg(data.error || "Failed to submit report. Please try again.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected network error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  if (createdIncident) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-full border border-emerald-500/40 bg-emerald-950/40 mx-auto flex items-center justify-center text-emerald-400 shadow-[0_0_24px_rgba(16,185,129,0.3)]">
          <ShieldCheck className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="font-mono text-xs uppercase tracking-wider text-emerald-400 border border-emerald-500/30 bg-emerald-950/40 px-3 py-1 rounded">
            EMERGENCY BROADCAST ACTIVE
          </span>
          <h2 className="text-3xl font-black font-sans text-white tracking-tight pt-2">
            Incident Registered: {createdIncident.incidentId}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
            Your alert has been entered into the live rescue network. Nearby verified volunteers in the {createdIncident.location?.city} sector have received push telemetry.
          </p>
        </div>

        {duplicates.length > 0 && (
          <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-950/20 text-left font-mono text-xs space-y-1 text-amber-300">
            <div className="flex items-center gap-2 font-bold text-amber-400">
              <Info className="w-4 h-4 flex-shrink-0" />
              <span>Duplicate Advisory Detected Nearby</span>
            </div>
            <p className="text-[11px] text-slate-300 font-sans">
              Similar case <strong>{duplicates[0].incidentId}</strong> is {duplicates[0].distanceMeters}m away (Status: {duplicates[0].status}). Dispatch coordinators will verify.
            </p>
          </div>
        )}

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={`/user/incident/${createdIncident._id}`}
            className="w-full sm:w-auto px-6 py-3 rounded-md bg-[#d4ff3a] font-mono text-xs font-bold text-black hover:bg-[#c2ef2c] shadow-[0_0_16px_rgba(212,255,58,0.3)] transition-all flex items-center justify-center gap-2"
          >
            <span>Open Real-Time Case Telemetry</span>
            <ArrowRight className="w-4 h-4" />
          </a>

          <a
            href="/map"
            className="w-full sm:w-auto px-6 py-3 rounded-md border border-white/20 bg-[#0a0e17] font-mono text-xs font-bold text-white hover:border-[#d4ff3a]/50 transition-colors"
          >
            Track on Tactical Map
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="border-b border-white/10 pb-6">
        <div className="inline-flex items-center gap-2 mb-2 font-mono text-xs uppercase tracking-wider text-[#ff3b30]">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span>Emergency Incident Intake Protocol</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black font-sans text-white tracking-tight">
          Report Animal in Distress
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl font-sans">
          This form initiates a high-priority dispatch broadcast to verified rescue responders and emergency trauma vans. Zero simulated or false records.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-white/10 bg-[#0a0e17] p-6 sm:p-8 backdrop-blur-xl space-y-8 shadow-2xl"
      >
        {errorMsg && (
          <div className="p-3.5 rounded-lg border border-red-500/40 bg-red-950/30 text-red-300 font-mono text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#ff3b30] flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 1. Category Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="font-mono text-xs font-bold uppercase tracking-wider text-white">
              01 // Animal Category
            </label>
            <span className="font-mono text-[10px] text-[#d4ff3a]">
              ACTIVE: {category.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {ANIMAL_CATEGORIES.map((cat) => {
              const isSelected = category === cat.value;
              return (
                <button
                  type="button"
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={`p-3 rounded-lg border text-left transition-all font-mono text-xs ${
                    isSelected
                      ? "border-[#d4ff3a] bg-[#d4ff3a]/15 text-[#d4ff3a] shadow-[0_0_12px_rgba(212,255,58,0.2)]"
                      : "border-white/10 bg-white/5 text-slate-300 hover:border-white/25 hover:text-white"
                  }`}
                >
                  <span className="text-[10px] opacity-60 block font-mono">[{cat.code}]</span>
                  <span className="font-bold leading-tight block mt-1">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Photo / Visual Evidence */}
        <div className="space-y-3">
          <label className="font-mono text-xs font-bold uppercase tracking-wider text-white block">
            02 // Photographic & Injury Evidence
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-dashed border-white/20 rounded-lg p-6 text-center hover:border-[#d4ff3a]/50 transition-colors bg-white/5 flex flex-col items-center justify-center">
              <Camera className="w-8 h-8 text-[#d4ff3a] mb-2" />
              <p className="font-mono text-xs font-bold text-white">Upload Incident Photo</p>
              <p className="font-mono text-[10px] text-slate-400 mt-0.5">PNG, JPG, or WEBP up to 10MB</p>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="mt-3 block w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:font-mono file:text-xs file:font-bold file:bg-[#d4ff3a] file:text-black cursor-pointer"
              />
            </div>

            <div className="space-y-2 flex items-center justify-center">
              {imagePreview ? (
                <div className="relative h-44 w-full rounded-lg overflow-hidden border border-white/20">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setImageUrl("");
                    }}
                    className="absolute top-2 right-2 rounded bg-black/80 border border-white/20 px-2 py-1 font-mono text-[10px] text-white hover:bg-red-900"
                  >
                    Clear Photo
                  </button>
                </div>
              ) : (
                <div className="h-44 w-full rounded-lg border border-white/10 bg-white/5 flex flex-col items-center justify-center text-slate-400 font-mono text-xs p-4 text-center">
                  <Upload className="w-6 h-6 mb-2 text-slate-500" />
                  <span>No image selected yet. Clear photos enable faster triage by veterinary teams.</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3. Description & Priority */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-2">
            <label className="font-mono text-xs font-bold uppercase tracking-wider text-white block">
              03 // Clinical Condition & Visual Symptoms *
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe condition: e.g. severe limp on left hind leg, open bleeding laceration, whimpering in pain, sheltered near tree..."
              className="w-full p-3.5 rounded-lg border border-white/10 bg-white/5 font-mono text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#d4ff3a] transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="font-mono text-xs font-bold uppercase tracking-wider text-white block">
              Emergency Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="w-full p-3.5 rounded-lg border border-white/10 bg-[#05070d] font-mono text-xs text-white focus:outline-none focus:border-[#d4ff3a]"
            >
              <option value="CRITICAL">🚨 CRITICAL (SLA: 45 min)</option>
              <option value="HIGH">⚠️ HIGH (SLA: 2 hr)</option>
              <option value="MEDIUM">MEDIUM (SLA: 6 hr)</option>
              <option value="LOW">LOW (SLA: 24 hr)</option>
            </select>
            <p className="font-mono text-[10px] text-slate-400 leading-tight pt-1">
              AI Triage correlates symptom severity and automatically verifies dispatch priority.
            </p>
          </div>
        </div>

        {/* 4. Geolocation Pinpointing */}
        <div className="space-y-3">
          <label className="font-mono text-xs font-bold uppercase tracking-wider text-white block">
            04 // Incident Geolocation Pinpoint *
          </label>
          <LocationPicker
            initialCoordinates={coords}
            onLocationSelect={(newCoords, newAddr) => {
              setCoords(newCoords);
              setAddress(newAddr);
            }}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
            <input
              type="text"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              placeholder="Nearby Landmark (e.g. Metro Pillar 182 / Near Cafe)"
              className="p-3 rounded-lg border border-white/10 bg-white/5 font-mono text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#d4ff3a]"
            />
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City (e.g. Bangalore)"
              className="p-3 rounded-lg border border-white/10 bg-white/5 font-mono text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#d4ff3a]"
            />
          </div>
        </div>

        {/* 5. Reporter Information */}
        <div className="space-y-3">
          <label className="font-mono text-xs font-bold uppercase tracking-wider text-white block">
            05 // Reporter Details (Confidential)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              value={reporterName}
              onChange={(e) => setReporterName(e.target.value)}
              placeholder="Your Full Name"
              className="p-3 rounded-lg border border-white/10 bg-white/5 font-mono text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#d4ff3a]"
            />
            <input
              type="tel"
              value={reporterPhone}
              onChange={(e) => setReporterPhone(e.target.value)}
              placeholder="Mobile Phone (for rescue driver)"
              className="p-3 rounded-lg border border-white/10 bg-white/5 font-mono text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#d4ff3a]"
            />
            <input
              type="email"
              value={reporterEmail}
              onChange={(e) => setReporterEmail(e.target.value)}
              placeholder="Email Address"
              className="p-3 rounded-lg border border-white/10 bg-white/5 font-mono text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#d4ff3a]"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto px-8 py-3.5 rounded-md bg-[#ff3b30] font-mono text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_24px_rgba(255,59,48,0.5)] border border-red-400/40 hover:bg-[#ff4d4d] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>{submitting ? "Broadcasting Emergency..." : "Broadcast Distress Alert"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
