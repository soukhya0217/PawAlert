"use client";

import React, { useState, useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import { useRouter } from "next/navigation";
import { 
  Camera, 
  MapPin, 
  Navigation, 
  AlertTriangle, 
  ArrowRight, 
  ArrowLeft,
  Sparkles,
  User,
  Phone,
  Mail,
  Compass
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

/* -------------------------------------------------------------
   REACTIVE ILLUSTRATED COMPANION MASCOT (PIXAR STORYBOOK SVG)
   Dynamically morphs facial expressions, eye shapes, and accessories
   based on current wizard step (0-3) and severity selection.
------------------------------------------------------------- */
function MascotCompanion({
  step,
  severity,
}: {
  step: number;
  severity: "STABLE" | "ABANDONED" | "DEHYDRATED" | "INJURED" | "CRITICAL";
}) {
  // Determine speech bubble text
  let speech = "Who needs our help today?";
  if (step === 1) speech = "Pinpoint where they are waiting!";
  else if (step === 2) {
    switch (severity) {
      case "STABLE":
        speech = "Resting calmly. Scheduling gentle transit!";
        break;
      case "ABANDONED":
        speech = "Vulnerable neonates! Sending rescue squad!";
        break;
      case "DEHYDRATED":
        speech = "Severely parched! Hydration team alerted!";
        break;
      case "INJURED":
        speech = "Visible physical trauma. Splint squad en route!";
        break;
      case "CRITICAL":
        speech = "CODE RED! Emergency siren ambulance dispatched!";
        break;
    }
  } else if (step === 3) {
    speech = "Almost there! Rescuers are standing by!";
  }

  return (
    <div className="flex items-center gap-3.5 rounded-[24px] border-[3px] border-[#1E1B4B] bg-[#FFF1DC] p-3.5 shadow-pixar-sm mb-6 transition-all duration-300">
      {/* Pixar Style Interactive SVG Mascot Avatar */}
      <div className="relative flex-shrink-0 w-16 h-16 rounded-[20px] border-[2px] border-[#1E1B4B] bg-[#FFF9F0] overflow-hidden flex items-center justify-center shadow-pixar-sm">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            {/* Soft Warm Radial Fur Gradient */}
            <radialGradient id="furGrad" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#FDBA74" />
              <stop offset="70%" stopColor="#FB923C" />
              <stop offset="100%" stopColor="#EA580C" />
            </radialGradient>
            <radialGradient id="earGrad" cx="50%" cy="30%" r="50%">
              <stop offset="0%" stopColor="#F472B6" />
              <stop offset="100%" stopColor="#E11D48" />
            </radialGradient>
          </defs>

          {/* Left Floppy Ear */}
          <path
            d={
              step === 2 && severity === "ABANDONED"
                ? "M 20 35 Q 8 60 18 72 Q 28 65 26 40 Z" // Droopy sad ear
                : step === 2 && severity === "CRITICAL"
                ? "M 22 35 Q 5 15 15 8 Q 28 20 26 38 Z" // Perked alarmed ear
                : "M 22 35 Q 10 25 15 50 Q 25 45 26 38 Z" // Standard floppy ear
            }
            fill="url(#furGrad)"
            stroke="#1E1B4B"
            strokeWidth="3"
          />
          <path
            d={
              step === 2 && severity === "ABANDONED"
                ? "M 18 42 Q 12 58 18 64 Q 23 58 22 42 Z"
                : "M 18 34 Q 13 28 17 44 Q 22 40 22 34 Z"
            }
            fill="url(#earGrad)"
            opacity="0.75"
          />

          {/* Right Floppy Ear */}
          <path
            d={
              step === 2 && severity === "ABANDONED"
                ? "M 80 35 Q 92 60 82 72 Q 72 65 74 40 Z"
                : step === 2 && severity === "CRITICAL"
                ? "M 78 35 Q 95 15 85 8 Q 72 20 74 38 Z"
                : "M 78 35 Q 90 25 85 50 Q 75 45 74 38 Z"
            }
            fill="url(#furGrad)"
            stroke="#1E1B4B"
            strokeWidth="3"
          />
          <path
            d={
              step === 2 && severity === "ABANDONED"
                ? "M 82 42 Q 88 58 82 64 Q 77 58 78 42 Z"
                : "M 82 34 Q 87 28 83 44 Q 78 40 78 34 Z"
            }
            fill="url(#earGrad)"
            opacity="0.75"
          />

          {/* Head Base */}
          <circle cx="50" cy="54" r="32" fill="url(#furGrad)" stroke="#1E1B4B" strokeWidth="3" />

          {/* Muzzle */}
          <ellipse cx="50" cy="64" rx="18" ry="14" fill="#FEF08A" stroke="#1E1B4B" strokeWidth="2.5" />

          {/* Nose */}
          <ellipse cx="50" cy="58" rx="5" ry="3.5" fill="#1E1B4B" />
          <ellipse cx="48.5" cy="57" rx="1.5" ry="0.8" fill="#FFFFFF" opacity="0.8" />

          {/* Eyes & Expressions */}
          {step === 2 && severity === "STABLE" ? (
            /* Happy Smiling Eyes (Arcs) */
            <>
              <path d="M 34 50 Q 40 43 44 50" fill="none" stroke="#1E1B4B" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M 56 50 Q 60 43 66 50" fill="none" stroke="#1E1B4B" strokeWidth="3.5" strokeLinecap="round" />
              {/* Rosy Cheeks */}
              <circle cx="32" cy="56" r="4" fill="#F43F5E" opacity="0.4" />
              <circle cx="68" cy="56" r="4" fill="#F43F5E" opacity="0.4" />
              {/* Smiling Mouth */}
              <path d="M 46 64 Q 50 68 54 64" fill="none" stroke="#1E1B4B" strokeWidth="2.5" strokeLinecap="round" />
            </>
          ) : step === 2 && severity === "ABANDONED" ? (
            /* Giant Soulful Watery Eyes (Pixar Puss in Boots) */
            <>
              <ellipse cx="38" cy="48" rx="8" ry="9" fill="#1E1B4B" />
              <ellipse cx="62" cy="48" rx="8" ry="9" fill="#1E1B4B" />
              {/* Glassy Highlights */}
              <circle cx="36" cy="45" r="3.5" fill="#FFFFFF" />
              <circle cx="40" cy="51" r="1.5" fill="#FFFFFF" />
              <circle cx="60" cy="45" r="3.5" fill="#FFFFFF" />
              <circle cx="64" cy="51" r="1.5" fill="#FFFFFF" />
              {/* Teardrop */}
              <circle cx="29" cy="57" r="2.2" fill="#38BDF8" opacity="0.85" />
              {/* Sad W-Mouth */}
              <path d="M 45 66 Q 48 64 50 66 Q 52 64 55 66" fill="none" stroke="#1E1B4B" strokeWidth="2.5" strokeLinecap="round" />
            </>
          ) : step === 2 && severity === "DEHYDRATED" ? (
            /* Panting Tongue Out */
            <>
              <ellipse cx="38" cy="48" rx="6" ry="6" fill="#1E1B4B" />
              <ellipse cx="62" cy="48" rx="6" ry="6" fill="#1E1B4B" />
              <circle cx="36.5" cy="46" r="2" fill="#FFFFFF" />
              <circle cx="60.5" cy="46" r="2" fill="#FFFFFF" />
              {/* Hanging Pink Tongue */}
              <path d="M 47 64 C 47 72 53 72 53 64 Z" fill="#F43F5E" stroke="#1E1B4B" strokeWidth="2" />
              {/* Water Drop particle */}
              <circle cx="70" cy="38" r="3" fill="#38BDF8" />
            </>
          ) : step === 2 && severity === "INJURED" ? (
            /* Caring puppy with Band-Aid on cheek */
            <>
              <ellipse cx="38" cy="48" rx="6" ry="6" fill="#1E1B4B" />
              <ellipse cx="62" cy="48" rx="6" ry="6" fill="#1E1B4B" />
              <circle cx="36.5" cy="46" r="2.2" fill="#FFFFFF" />
              <circle cx="60.5" cy="46" r="2.2" fill="#FFFFFF" />
              {/* Cute Criss-cross Band-aid */}
              <rect x="23" y="44" width="10" height="4" rx="2" transform="rotate(25 28 46)" fill="#FED7AA" stroke="#1E1B4B" strokeWidth="1.5" />
              <rect x="23" y="44" width="10" height="4" rx="2" transform="rotate(-25 28 46)" fill="#FED7AA" stroke="#1E1B4B" strokeWidth="1.5" />
              {/* Gentle Mouth */}
              <path d="M 46 64 Q 50 67 54 64" fill="none" stroke="#1E1B4B" strokeWidth="2" strokeLinecap="round" />
            </>
          ) : step === 2 && severity === "CRITICAL" ? (
            /* Emergency Siren on Head & Wide Urgent Eyes */
            <>
              <ellipse cx="38" cy="48" rx="7" ry="7" fill="#1E1B4B" />
              <ellipse cx="62" cy="48" rx="7" ry="7" fill="#1E1B4B" />
              <circle cx="38" cy="48" r="3" fill="#EF4444" />
              <circle cx="62" cy="48" r="3" fill="#EF4444" />
              <circle cx="36" cy="46" r="1.2" fill="#FFFFFF" />
              <circle cx="60" cy="46" r="1.2" fill="#FFFFFF" />
              {/* Emergency Siren on forehead */}
              <rect x="44" y="14" width="12" height="12" rx="4" fill="#EF4444" stroke="#1E1B4B" strokeWidth="2.5" />
              <circle cx="50" cy="20" r="3" fill="#FDE047" />
              {/* Siren Light Rays */}
              <line x1="38" y1="12" x2="42" y2="16" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="62" y1="12" x2="58" y2="16" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" />
              {/* Alarmed Open Mouth */}
              <ellipse cx="50" cy="66" rx="3.5" ry="4.5" fill="#1E1B4B" />
            </>
          ) : step === 3 ? (
            /* Hero Rescuer Bandana & Determined Eyes */
            <>
              <ellipse cx="38" cy="48" rx="6.5" ry="6.5" fill="#1E1B4B" />
              <ellipse cx="62" cy="48" rx="6.5" ry="6.5" fill="#1E1B4B" />
              <circle cx="36" cy="46" r="2.2" fill="#FFFFFF" />
              <circle cx="60" cy="46" r="2.2" fill="#FFFFFF" />
              {/* Rescuer Headband / Bandana */}
              <path d="M 24 38 Q 50 32 76 38" fill="none" stroke="#FF7A00" strokeWidth="6" strokeLinecap="round" />
              {/* Rescuer Paw Badge */}
              <circle cx="50" cy="35" r="4.5" fill="#FFB703" stroke="#1E1B4B" strokeWidth="1.5" />
              <path d="M 46 64 Q 50 68 54 64" fill="none" stroke="#1E1B4B" strokeWidth="2.5" strokeLinecap="round" />
            </>
          ) : (
            /* Default Curious Eyes (Step 0 & 1) */
            <>
              <ellipse cx="38" cy="48" rx="6" ry="6.5" fill="#1E1B4B" />
              <ellipse cx="62" cy="48" rx="6" ry="6.5" fill="#1E1B4B" />
              <circle cx="36" cy="46" r="2.2" fill="#FFFFFF" />
              <circle cx="60" cy="46" r="2.2" fill="#FFFFFF" />
              <circle cx="40" cy="51" r="1" fill="#FFFFFF" />
              <circle cx="64" cy="51" r="1" fill="#FFFFFF" />
              <path d="M 46 64 Q 50 67 54 64" fill="none" stroke="#1E1B4B" strokeWidth="2.5" strokeLinecap="round" />
            </>
          )}
        </svg>
      </div>

      {/* Speech Bubble with Pixar Storybook Typography */}
      <div className="flex-1">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="font-display text-[11px] font-bold text-[#FF7A00] uppercase tracking-wider">
            {step === 0 && "Step 1 // Identification"}
            {step === 1 && "Step 2 // Geolocation"}
            {step === 2 && `Step 3 // Triage [${severity}]`}
            {step === 3 && "Step 4 // Final Dispatch"}
          </span>
          <Sparkles className="w-3 h-3 text-[#FFB703]" />
        </div>
        <p className="font-display text-sm font-bold text-[#1E1B4B] leading-tight">
          {speech}
        </p>
      </div>
    </div>
  );
}

export default function IntakeWizard() {
  const router = useRouter();

  const [step, setStep] = useState<number>(0);
  const [species, setSpecies] = useState("Injured Dog");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  
  // Map coordinates & address (Default Bangalore center)
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
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

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

    import("leaflet").then((importedLeaflet) => {
      if (!isMounted || !mapContainerRef.current) return;
      const L = (importedLeaflet as any).default || importedLeaflet;

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

      if (mapContainerRef.current) {
        (mapContainerRef.current as any)._leaflet_id = null;
      }

      map = L.map(mapContainerRef.current, {
        center: [lat, lon],
        zoom: 15,
        zoomControl: false,
      });

      L.control.zoom({ position: "bottomright" }).addTo(map);

      // Fast, reliable CartoDB Voyager & OpenStreetMap raster tiles (Zero CORS / Zero API Key errors!)
      const tileLayer = L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; CARTO &copy; OpenStreetMap',
        maxZoom: 19,
        subdomains: ["a", "b", "c", "d"],
      });

      const osmFallback = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 19,
        subdomains: ["a", "b", "c"],
      });

      tileLayer.on("tileerror", () => {
        if (map && !map.hasLayer(osmFallback)) {
          osmFallback.addTo(map);
        }
      });

      tileLayer.addTo(map);

      // Custom SVG Glowing Paw Marker with Twilight Border
      const isCritical = severity === "CRITICAL" || severity === "INJURED";
      const pinColor = isCritical ? "#FF5A4E" : "#FFB703";

      const pawPinIcon = L.divIcon({
        className: "paw-marker-container",
        html: `
          <div style="position: relative; width: 44px; height: 44px; cursor: pointer;">
            <div style="position: absolute; inset: -4px; border-radius: 50%; background: ${pinColor}; opacity: 0.35; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="position: relative; width: 44px; height: 44px; border-radius: 22px; border: 3px solid #1E1B4B; background: ${pinColor}; box-shadow: 0 5px 0 #1E1B4B; display: flex; align-items: center; justify-content: center; font-size: 20px; color: #FFFFFF;">
              <span>🐾</span>
            </div>
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 40],
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
      }, 150);

      if (mapContainerRef.current && window.ResizeObserver) {
        resizeObserverRef.current = new ResizeObserver(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
          }
        });
        resizeObserverRef.current.observe(mapContainerRef.current);
      }
    });

    return () => {
      isMounted = false;
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
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
              color: "#FF7A00",
              fillColor: "#FFB703",
              fillOpacity: 0.25,
              weight: 3,
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
        colors: ["#FF7A00", "#FFB703", "#10B981", "#1E1B4B"],
      });

      router.push(`/track/${data.incident.incidentId}`);
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto w-full">
      {/* Wizard Step Progress Tracker */}
      <div className="flex items-center justify-between mb-6 px-2">
        {["1. Species & Photo", "2. Pinpoint GPS", "3. Squishy Paw Pad", "4. Contact & Send"].map((title, idx) => (
          <div key={idx} className="flex items-center gap-1.5 sm:gap-2">
            <div
              className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-[16px] border-[3px] border-[#1E1B4B] font-display text-xs font-bold transition-all ${
                step === idx
                  ? "bg-[#FF7A00] text-white shadow-pixar-sm scale-105"
                  : step > idx
                  ? "bg-[#10B981] text-white shadow-pixar-sm"
                  : "bg-[#FFF9F0] text-[#1E1B4B]"
              }`}
            >
              {step > idx ? "✓" : idx + 1}
            </div>
            <span className="hidden sm:inline font-display text-xs font-bold text-[#1E1B4B]">
              {title.split(". ")[1]}
            </span>
          </div>
        ))}
      </div>

      {/* Reactive Illustrated Companion Mascot Header */}
      <MascotCompanion step={step} severity={severity} />

      {/* Main Pixar Storybook Form Card */}
      <div className="pixar-card p-6 sm:p-8 space-y-6">
        
        {errorMsg && (
          <div className="rounded-[18px] border-[3px] border-[#EF4444] bg-[#EF4444]/10 p-4 text-xs font-bold text-[#EF4444] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STEP 0: Species & Photo */}
        {step === 0 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <span className="font-mono text-[11px] font-bold text-[#FF7A00] uppercase tracking-wider">
                STEP 01 // IDENTIFICATION
              </span>
              <h2 className="text-2xl font-black font-display text-[#1E1B4B] mt-0.5">
                Who Needs Our Help?
              </h2>
              <p className="text-xs text-[#1E1B4B]/70 mt-1 font-sans">
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
                  className={`rounded-[20px] border-[3px] border-[#1E1B4B] p-3.5 text-left transition-all ${
                    species === item.value
                      ? "bg-[#FFB703] shadow-pixar scale-[1.02]"
                      : "bg-[#FFF9F0] hover:bg-[#FFF1DC]"
                  }`}
                >
                  <span className="text-2xl block mb-1">{item.emoji}</span>
                  <span className="font-display text-xs font-bold text-[#1E1B4B] block">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Photo Upload Area */}
            <div>
              <label className="font-display text-xs font-bold text-[#1E1B4B] block mb-2">
                Snap or Upload Photo Evidence
              </label>
              <div className="rounded-[22px] border-[3px] border-dashed border-[#1E1B4B] bg-[#FFF9F0] p-6 text-center flex flex-col items-center justify-center">
                {photoPreview ? (
                  <div className="relative h-44 w-full rounded-[18px] overflow-hidden border-[3px] border-[#1E1B4B]">
                    <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setPhotoPreview(null)}
                      className="pixar-btn absolute top-2 right-2 rounded-[12px] bg-[#EF4444] px-3 py-1 text-[11px] text-white shadow-pixar-sm"
                    >
                      Change Photo
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center gap-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-[18px] border-[3px] border-[#1E1B4B] bg-[#10B981] text-white shadow-pixar-sm">
                      <Camera className="w-6 h-6" />
                    </div>
                    <span className="font-display text-xs font-bold text-[#1E1B4B]">
                      Take photo or select from gallery
                    </span>
                    <span className="font-mono text-[10px] text-[#1E1B4B]/60">
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
              <label className="font-display text-xs font-bold text-[#1E1B4B] block mb-1.5">
                Visible Symptoms & Condition
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="E.g., Limping severely on rear left leg, hiding under auto-rickshaw, whimpering..."
                className="w-full rounded-[18px] border-[3px] border-[#1E1B4B] bg-[#FFF9F0] p-3.5 text-xs font-sans text-[#1E1B4B] focus:outline-none focus:ring-2 focus:ring-[#FF7A00]"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="pixar-btn flex items-center gap-2 rounded-[20px] bg-gradient-to-r from-[#FF7A00] to-[#F97316] px-6 py-3 text-sm text-white shadow-pixar font-bold"
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
                <span className="font-mono text-[11px] font-bold text-[#10B981] uppercase tracking-wider">
                  STEP 02 // GEOLOCATION
                </span>
                <h2 className="text-2xl font-black font-display text-[#1E1B4B]">
                  Where is the Animal?
                </h2>
              </div>

              <button
                type="button"
                onClick={handleUseMyGPS}
                disabled={isLocating}
                className="pixar-btn flex items-center gap-1.5 rounded-[16px] bg-[#10B981] px-4 py-2 text-xs text-white shadow-pixar-sm font-bold"
              >
                <Navigation className={`w-3.5 h-3.5 ${isLocating ? "animate-spin" : ""}`} />
                <span>{isLocating ? "Locating..." : "Use My GPS"}</span>
              </button>
            </div>

            <p className="text-xs text-[#1E1B4B]/75 leading-tight">
              Click anywhere on the map or drag the glowing paw pin to mark the exact rescue location.
            </p>

            {/* Strict Client Leaflet Map Container with explicit 420px height */}
            <div className="rounded-[24px] border-[3px] border-[#1E1B4B] overflow-hidden min-h-[420px] h-[420px] w-full relative z-0 shadow-pixar-sm bg-[#FFF9F0]">
              <div 
                ref={mapContainerRef} 
                style={{ height: "420px", width: "100%" }} 
                className="h-[420px] w-full relative z-0" 
              />
            </div>

            {/* Address bar */}
            <div className="rounded-[18px] border-[3px] border-[#1E1B4B] bg-[#FFF9F0] p-3 flex items-center gap-2.5 shadow-pixar-sm">
              <MapPin className="w-4 h-4 text-[#FF7A00] flex-shrink-0" />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Incident address or landmark"
                className="w-full bg-transparent font-sans text-xs text-[#1E1B4B] focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(0)}
                className="pixar-btn flex items-center gap-1.5 rounded-[18px] bg-[#FFF9F0] px-5 py-2.5 text-xs text-[#1E1B4B] shadow-pixar-sm font-bold"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="pixar-btn flex items-center gap-2 rounded-[20px] bg-gradient-to-r from-[#FF7A00] to-[#F97316] px-6 py-3 text-sm text-white shadow-pixar font-bold"
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
              <h2 className="text-2xl font-black font-display text-[#1E1B4B]">
                How Urgent is the Case?
              </h2>
              <p className="text-xs text-[#1E1B4B]/75 mt-0.5">
                Press each squishy paw bean to set triage severity. Notice the mascot reacts to your triage level!
              </p>
            </div>

            {/* Anatomical Paw Pad Selector Container */}
            <div className="rounded-[28px] border-[3px] border-[#1E1B4B] bg-[#FFF1DC] p-4 sm:p-6 shadow-pixar flex flex-col items-center justify-center relative">
              
              {/* 4 Toe Pads Row */}
              <div className="flex items-center justify-center gap-2 sm:gap-5 mb-5 w-full max-w-sm">
                {[
                  { id: "STABLE", label: "Stable", bg: "#10B981", shadow: "#059669" },
                  { id: "ABANDONED", label: "Abandoned", bg: "#FFB703", shadow: "#D97706" },
                  { id: "DEHYDRATED", label: "Dehydrated", bg: "#38BDF8", shadow: "#0284C7" },
                  { id: "INJURED", label: "Injured", bg: "#F97316", shadow: "#C2410C" },
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
                      className={`relative flex-1 max-w-[76px] h-18 sm:h-22 rounded-[20px] sm:rounded-[24px] border-[3px] border-[#1E1B4B] flex flex-col items-center justify-center transition-all overflow-hidden ${
                        isSelected
                          ? "scale-105 sm:scale-110 -translate-y-1 shadow-pixar"
                          : "opacity-80 hover:opacity-100 hover:scale-105 shadow-pixar-sm"
                      }`}
                      style={{ backgroundColor: bean.bg }}
                    >
                      {/* Glossy Top Reflection Highlight */}
                      <div className="absolute top-1 left-2 right-2 h-3.5 sm:h-4 rounded-full bg-white/40 pointer-events-none" />

                      <span className="font-display text-[10px] sm:text-[11px] font-black text-[#1E1B4B] leading-none z-10">
                        {bean.label}
                      </span>
                      {isSelected && (
                        <span className="text-[9px] sm:text-[10px] mt-1 z-10 font-mono font-bold text-[#1E1B4B]">
                          ● ON
                        </span>
                      )}
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
                className={`relative h-20 sm:h-24 w-full max-w-[240px] sm:max-w-[280px] rounded-[28px] sm:rounded-[32px] border-[3px] border-[#1E1B4B] flex flex-col items-center justify-center transition-all overflow-hidden ${
                  severity === "CRITICAL"
                    ? "bg-[#EF4444] text-white shadow-pixar scale-105 -translate-y-1 animate-pulse"
                    : "bg-[#EF4444]/35 text-[#1E1B4B] hover:bg-[#EF4444]/60 hover:scale-102 shadow-pixar-sm"
                }`}
              >
                {/* Glossy Top Reflection Highlight */}
                <div className="absolute top-1.5 left-4 right-4 h-5 rounded-full bg-white/35 pointer-events-none" />

                <span className="text-xl mb-0.5 z-10">🚨</span>
                <span className="font-display text-xs sm:text-sm font-black uppercase tracking-wider z-10">
                  CRITICAL TRAUMA
                </span>
                <span className="font-mono text-[9px] uppercase z-10 font-bold">
                  (Immediate Siren SLA)
                </span>
              </button>

            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="pixar-btn flex items-center gap-1.5 rounded-[18px] bg-[#FFF9F0] px-5 py-2.5 text-xs text-[#1E1B4B] shadow-pixar-sm font-bold"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(3)}
                className="pixar-btn flex items-center gap-2 rounded-[20px] bg-gradient-to-r from-[#FF7A00] to-[#F97316] px-6 py-3 text-sm text-white shadow-pixar font-bold"
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
              <span className="font-mono text-[11px] font-bold text-[#FF7A00] uppercase tracking-wider">
                STEP 04 // DISPATCH CONFIRMATION
              </span>
              <h2 className="text-2xl font-black font-display text-[#1E1B4B]">
                Who Should We Update?
              </h2>
              <p className="text-xs text-[#1E1B4B]/75 mt-0.5">
                We will send live status alerts and GPS tracking links as rescuers arrive on scene.
              </p>
            </div>

            <div className="space-y-3">
              <div className="rounded-[18px] border-[3px] border-[#1E1B4B] bg-[#FFF9F0] p-3.5 flex items-center gap-2.5 shadow-pixar-sm">
                <User className="w-4 h-4 text-[#1E1B4B]/60" />
                <input
                  type="text"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  placeholder="Your Full Name (Optional)"
                  className="w-full bg-transparent text-xs font-sans text-[#1E1B4B] focus:outline-none"
                />
              </div>

              <div className="rounded-[18px] border-[3px] border-[#1E1B4B] bg-[#FFF9F0] p-3.5 flex items-center gap-2.5 shadow-pixar-sm">
                <Phone className="w-4 h-4 text-[#1E1B4B]/60" />
                <input
                  type="tel"
                  value={reporterPhone}
                  onChange={(e) => setReporterPhone(e.target.value)}
                  placeholder="Mobile Phone (for rescue ambulance driver)"
                  className="w-full bg-transparent text-xs font-sans text-[#1E1B4B] focus:outline-none"
                />
              </div>

              <div className="rounded-[18px] border-[3px] border-[#1E1B4B] bg-[#FFF9F0] p-3.5 flex items-center gap-2.5 shadow-pixar-sm">
                <Mail className="w-4 h-4 text-[#1E1B4B]/60" />
                <input
                  type="email"
                  value={reporterEmail}
                  onChange={(e) => setReporterEmail(e.target.value)}
                  placeholder="Email Address (for live tracker link)"
                  className="w-full bg-transparent text-xs font-sans text-[#1E1B4B] focus:outline-none"
                />
              </div>
            </div>

            {/* Summary Box */}
            <div className="rounded-[20px] border-[3px] border-[#1E1B4B] bg-[#FFF1DC] p-4 font-mono text-xs space-y-1.5 shadow-pixar-sm">
              <p className="font-bold text-[#1E1B4B]">
                SUMMARY: {species} // [{severity}]
              </p>
              <p className="text-[11px] text-[#1E1B4B]/75 truncate">
                LOCATION: {address}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="pixar-btn flex items-center gap-1.5 rounded-[18px] bg-[#FFF9F0] px-5 py-2.5 text-xs text-[#1E1B4B] shadow-pixar-sm font-bold"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={handleSubmitReport}
                disabled={submitting}
                className="pixar-btn flex items-center gap-2 rounded-[20px] bg-gradient-to-r from-[#FF7A00] to-[#F97316] px-8 py-3.5 text-sm text-white shadow-pixar font-bold disabled:opacity-50"
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
