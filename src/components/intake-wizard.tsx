"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  Camera, 
  MapPin, 
  Navigation, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  Heart,
  Upload,
  User,
  Phone,
  Mail,
  Sparkles
} from "lucide-react";
import confetti from "canvas-confetti";
import { animateToeBeanPress, handleCardPointerMove, handleCardPointerLeave } from "@/lib/animations";

const SPECIES = [
  { label: "Stray Dog", emoji: "🐕", value: "Injured Dog" },
  { label: "Community Cat", emoji: "🐈", value: "Injured Cat" },
  { label: "Avian / Bird", emoji: "🕊️", value: "Injured Bird" },
  { label: "Bovine / Cattle", emoji: "🐄", value: "Stray Cattle" },
  { label: "Wildlife Distress", emoji: "🦉", value: "Wildlife Emergency" },
  { label: "Other Animal", emoji: "🐾", value: "Other" },
];

export default function IntakeWizard() {
  const router = useRouter();

  const [step, setStep] = useState<number>(0);
  const [species, setSpecies] = useState("Injured Dog");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  
  // Map coordinates & address
  const [coords, setCoords] = useState<[number, number]>([77.5946, 12.9716]); // [lon, lat]
  const [address, setAddress] = useState("Bangalore City Center, Karnataka");
  const [isLocating, setIsLocating] = useState(false);

  // Paw-Pad Severity State
  const [severity, setSeverity] = useState<"STABLE" | "ABANDONED" | "DEHYDRATED" | "INJURED" | "CRITICAL">("INJURED");

  // Reporter details
  const [reporterName, setReporterName] = useState("");
  const [reporterPhone, setReporterPhone] = useState("");
  const [reporterEmail, setReporterEmail] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Map Refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerInstanceRef = useRef<any>(null);
  const accuracyCircleRef = useRef<any>(null);

  // Handle Photo Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Reverse Geocode Helper
  const reverseGeocode = async (lat: number, lon: number) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
      const data = await res.json();
      if (data && data.display_name) {
        setAddress(data.display_name);
      }
    } catch (e) {
      setAddress(`GPS Coordinates: ${lat.toFixed(5)}, ${lon.toFixed(5)}`);
    }
  };

  // Step 1: Initialize Leaflet Map cleanly
  useEffect(() => {
    if (step !== 1 || typeof window === "undefined" || !mapContainerRef.current) return;

    let isMounted = true;
    let map: any = null;

    import("leaflet").then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      const [lon, lat] = coords;

      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      // Cleanup prior map if container re-rendered
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {}
        mapInstanceRef.current = null;
      }

      map = L.map(mapContainerRef.current, {
        center: [lat, lon],
        zoom: 15,
        zoomControl: false,
      });

      L.control.zoom({ position: "bottomright" }).addTo(map);

      // Fast CartoDB Voyager / OSM tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      // Custom SVG Paw Marker
      const pawPinIcon = L.divIcon({
        className: "paw-marker-container",
        html: `
          <div class="paw-marker-pin" style="background-color: #FF5A4E;">
            <span class="paw-marker-icon">🐾</span>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 36],
      });

      const marker = L.marker([lat, lon], {
        icon: pawPinIcon,
        draggable: true,
      }).addTo(map);

      marker.on("dragend", () => {
        const position = marker.getLatLng();
        setCoords([position.lng, position.lat]);
        reverseGeocode(position.lat, position.lng);
      });

      map.on("click", (e: any) => {
        marker.setLatLng(e.latlng);
        setCoords([e.latlng.lng, e.latlng.lat]);
        map.flyTo(e.latlng, map.getZoom(), { duration: 0.8 });
        reverseGeocode(e.latlng.lat, e.latlng.lng);
      });

      markerInstanceRef.current = marker;
      mapInstanceRef.current = map;

      // Force invalidateSize to cure any partial tile rendering
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 250);

      const resizeObserver = new ResizeObserver(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      });
      resizeObserver.observe(mapContainerRef.current);
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {}
        mapInstanceRef.current = null;
      }
    };
  }, [step]);

  // "Use My GPS" Locator with Pulsing Accuracy Ring
  const handleUseMyGPS = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude, accuracy } = pos.coords;
        setCoords([longitude, latitude]);

        if (mapInstanceRef.current && markerInstanceRef.current) {
          mapInstanceRef.current.flyTo([latitude, longitude], 16, { duration: 1.5 });
          markerInstanceRef.current.setLatLng([latitude, longitude]);

          import("leaflet").then((L) => {
            if (accuracyCircleRef.current) {
              mapInstanceRef.current.removeLayer(accuracyCircleRef.current);
            }
            accuracyCircleRef.current = L.circle([latitude, longitude], {
              radius: accuracy,
              color: "#2EC4B6",
              fillColor: "#2EC4B6",
              fillOpacity: 0.2,
              weight: 2,
            }).addTo(mapInstanceRef.current);
          });
        }
        reverseGeocode(latitude, longitude);
      },
      (err) => {
        setIsLocating(false);
        console.warn("GPS error:", err.message);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Submit Handler
  const handleSubmitReport = async () => {
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          animalCategory: species,
          conditionDescription: description || "Reported via PawAlert Field Intake",
          priority: severity === "CRITICAL" ? "CRITICAL" : severity === "INJURED" ? "HIGH" : "MEDIUM",
          coordinates: coords,
          address,
          images: photoPreview ? [photoPreview] : ["https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80"],
          reporterName: reporterName || "Anonymous Good Samaritan",
          reporterPhone: reporterPhone || "Not provided",
          reporterEmail,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit report");

      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#FF5A4E", "#FFB703", "#2EC4B6", "#1B3B2B"],
      });

      router.push(`/track/${data.incident.incidentId}`);
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  // Cute Mascot Mood Text based on Paw Pad Severity
  const getSeverityMood = () => {
    switch (severity) {
      case "STABLE":
        return { emoji: "🐶", title: "Resting, needs checkup", desc: "No immediate bleeding. Will be scheduled for gentle recovery transit." };
      case "ABANDONED":
        return { emoji: "🥺", title: "Scared & Motherless", desc: "Vulnerable neonates or lonely stray in danger of starvation." };
      case "DEHYDRATED":
        return { emoji: "🥣", title: "Severely Parched", desc: "Extreme heat exhaustion. Immediate clean water basins & glucose needed." };
      case "INJURED":
        return { emoji: "🩹", title: "Physical Trauma", desc: "Visible limping or lacerations. Ambulance splint team alerted." };
      case "CRITICAL":
        return { emoji: "🚨", title: "EMERGENCY: Trauma Alert", desc: "Vehicular accident / severe hemorrhage. Immediate sirens dispatched." };
    }
  };

  const mood = getSeverityMood();

  return (
    <div className="max-w-2xl mx-auto w-full">
      {/* Wizard Step Progress Tracker */}
      <div className="flex items-center justify-between mb-8 px-2">
        {["1. Species & Photo", "2. Pinpoint GPS", "3. Squishy Paw Pad", "4. Contact & Send"].map((title, idx) => (
          <div key={idx} className="flex items-center gap-1.5 sm:gap-2">
            <div
              className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-[14px] border-[2px] border-[#1B3B2B] font-display text-xs font-bold transition-all ${
                step === idx
                  ? "bg-[#FF5A4E] text-white shadow-bento-sm scale-105"
                  : step > idx
                  ? "bg-[#2EC4B6] text-white"
                  : "bg-[#FFFBF5] text-[#1B3B2B]"
              }`}
            >
              {step > idx ? "✓" : idx + 1}
            </div>
            <span className="hidden sm:inline font-display text-xs font-bold text-[#1B3B2B]">
              {title.split(". ")[1]}
            </span>
          </div>
        ))}
      </div>

      {/* Main Bento Form Card */}
      <div className="bento-card-white p-6 sm:p-8 space-y-6">
        
        {errorMsg && (
          <div className="rounded-[16px] border-[2px] border-[#FF5A4E] bg-[#FF5A4E]/10 p-3.5 text-xs font-bold text-[#FF5A4E] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STEP 0: Species & Photo */}
        {step === 0 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <span className="font-mono text-[11px] font-bold text-[#FF5A4E] uppercase tracking-wider">
                STEP 01 // IDENTIFICATION
              </span>
              <h2 className="text-2xl font-black font-display text-[#1B3B2B] mt-0.5">
                Who Needs Our Help?
              </h2>
              <p className="text-xs text-[#1B3B2B]/70 mt-1 font-sans">
                Select the species and upload a photo so our field rescuers know what to expect.
              </p>
            </div>

            {/* Species Bento Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {SPECIES.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setSpecies(item.value)}
                  onPointerMove={(e) => handleCardPointerMove(e, 6)}
                  onPointerLeave={handleCardPointerLeave}
                  className={`rounded-[18px] border-[2px] border-[#1B3B2B] p-3 text-left transition-all ${
                    species === item.value
                      ? "bg-[#FFB703] shadow-bento scale-[1.02]"
                      : "bg-[#FFFBF5] hover:bg-[#F5EFE6]"
                  }`}
                >
                  <span className="text-2xl block mb-1">{item.emoji}</span>
                  <span className="font-display text-xs font-bold text-[#1B3B2B] block">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Photo Upload Area */}
            <div>
              <label className="font-display text-xs font-bold text-[#1B3B2B] block mb-2">
                Snap or Upload Photo Evidence
              </label>
              <div className="rounded-[20px] border-[2px] border-dashed border-[#1B3B2B] bg-[#FFFBF5] p-5 text-center flex flex-col items-center justify-center">
                {photoPreview ? (
                  <div className="relative h-44 w-full rounded-[16px] overflow-hidden border-[2px] border-[#1B3B2B]">
                    <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setPhotoPreview(null)}
                      className="bento-btn absolute top-2 right-2 rounded-[12px] bg-[#FF5A4E] px-2.5 py-1 text-[11px] text-white"
                    >
                      Change Photo
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center gap-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-[16px] border-[2px] border-[#1B3B2B] bg-[#2EC4B6] text-white shadow-bento-sm">
                      <Camera className="w-6 h-6" />
                    </div>
                    <span className="font-display text-xs font-bold text-[#1B3B2B]">
                      Take photo or select from gallery
                    </span>
                    <span className="font-mono text-[10px] text-[#1B3B2B]/60">
                      JPG, PNG, WEBP (Instant WebP compression)
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Condition Description */}
            <div>
              <label className="font-display text-xs font-bold text-[#1B3B2B] block mb-1.5">
                Visible Symptoms & Condition
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="E.g., Limping severely on rear left leg, hiding under auto-rickshaw, whimpering..."
                className="w-full rounded-[16px] border-[2px] border-[#1B3B2B] bg-[#FFFBF5] p-3 text-xs font-sans text-[#1B3B2B] focus:outline-none focus:ring-2 focus:ring-[#FF5A4E]"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="bento-btn flex items-center gap-2 rounded-[18px] bg-[#FF5A4E] px-6 py-3 text-sm text-white"
              >
                <span>Pin Location Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 1: Pinpoint GPS Map */}
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono text-[11px] font-bold text-[#2EC4B6] uppercase tracking-wider">
                  STEP 02 // GEOLOCATION
                </span>
                <h2 className="text-2xl font-black font-display text-[#1B3B2B]">
                  Where is the Animal?
                </h2>
              </div>

              <button
                type="button"
                onClick={handleUseMyGPS}
                disabled={isLocating}
                className="bento-btn flex items-center gap-1.5 rounded-[14px] bg-[#2EC4B6] px-3.5 py-2 text-xs text-white"
              >
                <Navigation className={`w-3.5 h-3.5 ${isLocating ? "animate-spin" : ""}`} />
                <span>{isLocating ? "Locating..." : "Use My GPS"}</span>
              </button>
            </div>

            <p className="text-xs text-[#1B3B2B]/75 leading-tight">
              Click anywhere on the map or drag the paw pin to mark the exact rescue location.
            </p>

            {/* Strict Client Leaflet Map Container with min-height */}
            <div className="rounded-[20px] border-[2px] border-[#1B3B2B] overflow-hidden min-h-[380px] h-[380px] w-full relative z-0 shadow-bento-sm">
              <div ref={mapContainerRef} className="h-full w-full min-h-[380px] relative z-0" />
            </div>

            {/* Address bar */}
            <div className="rounded-[16px] border-[2px] border-[#1B3B2B] bg-[#FFFBF5] p-3 flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-[#FF5A4E] flex-shrink-0" />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Incident address or landmark"
                className="w-full bg-transparent font-sans text-xs text-[#1B3B2B] focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(0)}
                className="bento-btn flex items-center gap-1.5 rounded-[16px] bg-[#FFFBF5] px-4 py-2.5 text-xs text-[#1B3B2B]"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="bento-btn flex items-center gap-2 rounded-[18px] bg-[#FF5A4E] px-6 py-3 text-sm text-white"
              >
                <span>Set Severity Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Anatomical Squishy Paw-Pad Severity Selector */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <span className="font-mono text-[11px] font-bold text-[#FFB703] uppercase tracking-wider">
                STEP 03 // TACTILE PAW-PAD TRIAGE
              </span>
              <h2 className="text-2xl font-black font-display text-[#1B3B2B]">
                How Urgent is the Case?
              </h2>
              <p className="text-xs text-[#1B3B2B]/75 mt-0.5">
                Press each squishy paw bean to set triage severity.
              </p>
            </div>

            {/* Anatomical Paw Pad Selector Container */}
            <div className="rounded-[24px] border-[2px] border-[#1B3B2B] bg-[#FFFBF5] p-6 shadow-bento flex flex-col items-center justify-center relative">
              
              {/* 4 Toe Pads Row */}
              <div className="flex items-center justify-center gap-4 mb-4">
                {[
                  { id: "STABLE", label: "Stable", bg: "#2EC4B6" },
                  { id: "ABANDONED", label: "Abandoned", bg: "#FFB703" },
                  { id: "DEHYDRATED", label: "Dehydrated", bg: "#48CAE4" },
                  { id: "INJURED", label: "Injured", bg: "#F77F00" },
                ].map((bean) => {
                  const isSelected = severity === bean.id;
                  return (
                    <button
                      key={bean.id}
                      type="button"
                      onClick={(e) => {
                        animateToeBeanPress(e.currentTarget);
                        setSeverity(bean.id as any);
                      }}
                      className={`h-16 w-14 rounded-[22px] border-[2px] border-[#1B3B2B] flex flex-col items-center justify-center transition-all ${
                        isSelected
                          ? "shadow-bento scale-110 -translate-y-1"
                          : "opacity-80 hover:opacity-100 hover:scale-105"
                      }`}
                      style={{ backgroundColor: bean.bg }}
                    >
                      <span className="font-display text-[10px] font-bold text-[#1B3B2B] leading-none">
                        {bean.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Central Metacarpal Pad (CRITICAL) */}
              <button
                type="button"
                onClick={(e) => {
                  animateToeBeanPress(e.currentTarget);
                  setSeverity("CRITICAL");
                }}
                className={`h-24 w-40 rounded-[30px] border-[2px] border-[#1B3B2B] flex flex-col items-center justify-center transition-all ${
                  severity === "CRITICAL"
                    ? "bg-[#FF5A4E] text-white shadow-bento scale-105 -translate-y-1"
                    : "bg-[#FF5A4E]/40 text-[#1B3B2B] hover:bg-[#FF5A4E]/60 hover:scale-102"
                }`}
              >
                <span className="text-xl mb-0.5">🚨</span>
                <span className="font-display text-sm font-black uppercase tracking-wider">
                  CRITICAL TRAUMA
                </span>
                <span className="font-mono text-[9px] uppercase">
                  (Immediate Siren SLA)
                </span>
              </button>

            </div>

            {/* Cute Reactive Animal Mood Badge */}
            <div className="rounded-[20px] border-[2px] border-[#1B3B2B] bg-[#F5EFE6] p-4 flex items-center gap-3">
              <span className="text-3xl animate-bounce">{mood.emoji}</span>
              <div>
                <p className="font-display text-xs font-bold text-[#1B3B2B]">
                  {mood.title}
                </p>
                <p className="text-[11px] text-[#1B3B2B]/75 leading-tight font-sans">
                  {mood.desc}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="bento-btn flex items-center gap-1.5 rounded-[16px] bg-[#FFFBF5] px-4 py-2.5 text-xs text-[#1B3B2B]"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(3)}
                className="bento-btn flex items-center gap-2 rounded-[18px] bg-[#FF5A4E] px-6 py-3 text-sm text-white"
              >
                <span>Final Details</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Reporter Contact & Dispatch */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <span className="font-mono text-[11px] font-bold text-[#FF5A4E] uppercase tracking-wider">
                STEP 04 // DISPATCH CONFIRMATION
              </span>
              <h2 className="text-2xl font-black font-display text-[#1B3B2B]">
                Who Should We Update?
              </h2>
              <p className="text-xs text-[#1B3B2B]/75 mt-0.5">
                We will send live status alerts as rescuers arrive on scene.
              </p>
            </div>

            <div className="space-y-3">
              <div className="rounded-[16px] border-[2px] border-[#1B3B2B] bg-[#FFFBF5] p-3 flex items-center gap-2.5">
                <User className="w-4 h-4 text-[#1B3B2B]/60" />
                <input
                  type="text"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  placeholder="Your Full Name (Optional)"
                  className="w-full bg-transparent text-xs font-sans text-[#1B3B2B] focus:outline-none"
                />
              </div>

              <div className="rounded-[16px] border-[2px] border-[#1B3B2B] bg-[#FFFBF5] p-3 flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#1B3B2B]/60" />
                <input
                  type="tel"
                  value={reporterPhone}
                  onChange={(e) => setReporterPhone(e.target.value)}
                  placeholder="Mobile Phone (for rescue ambulance driver)"
                  className="w-full bg-transparent text-xs font-sans text-[#1B3B2B] focus:outline-none"
                />
              </div>

              <div className="rounded-[16px] border-[2px] border-[#1B3B2B] bg-[#FFFBF5] p-3 flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#1B3B2B]/60" />
                <input
                  type="email"
                  value={reporterEmail}
                  onChange={(e) => setReporterEmail(e.target.value)}
                  placeholder="Email Address (for live tracker link)"
                  className="w-full bg-transparent text-xs font-sans text-[#1B3B2B] focus:outline-none"
                />
              </div>
            </div>

            {/* Summary Box */}
            <div className="rounded-[18px] border-[2px] border-[#1B3B2B] bg-[#F5EFE6] p-4 font-mono text-xs space-y-1">
              <p className="font-bold text-[#1B3B2B]">
                SUMMARY: {species} // [{severity}]
              </p>
              <p className="text-[11px] text-[#1B3B2B]/70 truncate">
                LOCATION: {address}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="bento-btn flex items-center gap-1.5 rounded-[16px] bg-[#FFFBF5] px-4 py-2.5 text-xs text-[#1B3B2B]"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={handleSubmitReport}
                disabled={submitting}
                className="bento-btn flex items-center gap-2 rounded-[18px] bg-[#FF5A4E] px-8 py-3.5 text-sm text-white disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{submitting ? "Broadcasting Alert..." : "Dispatch Rescue Team"}</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
