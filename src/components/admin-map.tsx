"use client";

import React, { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import anime from "animejs";
import { Navigation, Heart, AlertTriangle, Compass, Sparkles, RefreshCw, Trash2 } from "lucide-react";
import { IncidentData } from "@/lib/use-recent-incidents";

interface AdminMapProps {
  incidents?: IncidentData[];
  initialCenter?: [number, number]; // [lat, lon]
  initialZoom?: number;
  onSelectIncident?: (incident: IncidentData) => void;
  className?: string;
}

export default function AdminMap({
  incidents = [],
  initialCenter = [12.9716, 77.5946], // Bangalore center
  initialZoom = 13,
  onSelectIncident,
  className = "",
}: AdminMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersGroupRef = useRef<any>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const [selectedIncident, setSelectedIncident] = useState<IncidentData | null>(null);
  const [filterPriority, setFilterPriority] = useState<string>("ALL");
  const [mapReady, setMapReady] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const centerLat = initialCenter[0] || 12.9716;
  const centerLon = initialCenter[1] || 77.5946;

  // Initialize Leaflet Map cleanly with robust CSS & dimensions
  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;

    let isMounted = true;
    let leafletInstance: any = null;

    import("leaflet").then((importedLeaflet) => {
      if (!isMounted || !containerRef.current) return;
      const L = (importedLeaflet as any).default || importedLeaflet;

      // Ensure prior instance is removed cleanly
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (e) {
          // ignore
        }
        mapRef.current = null;
      }

      // Reset Leaflet internal container tracking ID to avoid "Map container is already initialized"
      if (containerRef.current) {
        (containerRef.current as any)._leaflet_id = null;
        containerRef.current.innerHTML = "";
      }

      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      try {
        leafletInstance = L.map(containerRef.current, {
          center: [centerLat, centerLon],
          zoom: initialZoom,
          zoomControl: false,
        });

        L.control.zoom({ position: "topright" }).addTo(leafletInstance);

        // Reliable OpenStreetMap Standard Tiles (No API key needed)
        const osmLayer = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
          crossOrigin: true,
        });

        // Esri StreetMap Fallback Layer
        const esriLayer = L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
          {
            attribution: '&copy; <a href="https://www.esri.com/">Esri</a>',
            maxZoom: 19,
          }
        );

        osmLayer.on("tileerror", () => {
          if (leafletInstance && !leafletInstance.hasLayer(esriLayer)) {
            esriLayer.addTo(leafletInstance);
          }
        });

        osmLayer.addTo(leafletInstance);

        markersGroupRef.current = L.layerGroup().addTo(leafletInstance);
        mapRef.current = leafletInstance;
        setMapReady(true);

        // Force size invalidation across multiple frames to eliminate grey tiles
        const invalidate = () => {
          if (mapRef.current) {
            mapRef.current.invalidateSize();
          }
        };
        setTimeout(invalidate, 100);
        setTimeout(invalidate, 300);
        setTimeout(invalidate, 600);
        setTimeout(invalidate, 1200);

        if (containerRef.current && window.ResizeObserver) {
          resizeObserverRef.current = new ResizeObserver(() => {
            invalidate();
          });
          resizeObserverRef.current.observe(containerRef.current);
        }
      } catch (initErr) {
        console.error("[AdminMap] Failed to initialize Leaflet map:", initErr);
      }
    }).catch((err) => {
      console.error("[AdminMap] Could not import Leaflet:", err);
    });

    return () => {
      isMounted = false;
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (e) {
          // ignore
        }
        mapRef.current = null;
      }
    };
  }, [centerLat, centerLon, initialZoom]);

  // Update Markers when incidents change
  useEffect(() => {
    if (!mapRef.current || !markersGroupRef.current) return;

    import("leaflet").then((L) => {
      if (!markersGroupRef.current) return;
      markersGroupRef.current.clearLayers();

      const filtered = incidents.filter((inc) => {
        if (filterPriority === "ALL") return true;
        return inc.priority === filterPriority;
      });

      filtered.forEach((inc) => {
        if (!inc.location || !Array.isArray(inc.location.coordinates)) return;
        const [lon, lat] = inc.location.coordinates;
        if (typeof lat !== "number" || typeof lon !== "number") return;

        const isCritical = inc.priority === "CRITICAL";
        const pinBg = isCritical ? "#FF5A4E" : "#FFB703";
        const pulseColor = isCritical ? "rgba(255, 90, 78, 0.4)" : "rgba(255, 183, 3, 0.4)";
        const emoji = isCritical ? "🚨" : "🐾";

        const customIcon = L.divIcon({
          className: "paw-pin-marker",
          html: `
            <div style="position: relative; width: 44px; height: 44px; cursor: pointer;">
              <div style="position: absolute; inset: -4px; border-radius: 50%; background: ${pulseColor}; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
              <div class="paw-pin-body" style="background-color: ${pinBg};">
                <span class="paw-pin-emoji">${emoji}</span>
              </div>
            </div>
          `,
          iconSize: [44, 44],
          iconAnchor: [22, 40],
        });

        const marker = L.marker([lat, lon], { icon: customIcon });

        marker.on("click", () => {
          setSelectedIncident(inc);
          if (onSelectIncident) onSelectIncident(inc);
          mapRef.current?.flyTo([lat, lon], 15, { duration: 1.2 });
        });

        marker.addTo(markersGroupRef.current);
      });
    });
  }, [incidents, filterPriority, mapReady, onSelectIncident]);

  const handleFlyToMyLocation = () => {
    if (!navigator.geolocation || !mapRef.current) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        mapRef.current.flyTo([latitude, longitude], 15, { duration: 1.5 });
      },
      (err) => console.warn("Geolocation warning:", err.message),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // 1-Click Load Sample Rescue Alerts
  const handleLoadSampleAlerts = async () => {
    setSeeding(true);
    try {
      await fetch("/api/seed", { method: "POST" });
      window.location.reload();
    } catch (e) {
      console.error("Error loading sample alerts:", e);
    } finally {
      setSeeding(false);
    }
  };

  // 1-Click Clear Database to Zero Empty State
  const handleClearAllAlerts = async () => {
    if (!confirm("Clear all active alerts to test empty sanctuary state?")) return;
    setSeeding(true);
    try {
      await fetch("/api/seed", { method: "DELETE" });
      window.location.reload();
    } catch (e) {
      console.error("Error clearing alerts:", e);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className={`relative w-full rounded-[28px] sm:rounded-[32px] border-[3px] sm:border-[4px] border-[#1E1B4B] bg-[#FFF9F0] overflow-hidden shadow-pixar ${className}`}>
      
      {/* Top Map HUD Controls */}
      <div className="absolute top-3 left-3 right-3 sm:top-4 sm:left-4 sm:right-auto z-20 flex flex-wrap items-center gap-2">
        {/* Status Pill */}
        <div className="flex items-center gap-1.5 rounded-[16px] sm:rounded-[20px] border-[2px] sm:border-[3px] border-[#1E1B4B] bg-[#FFF9F0] px-3 py-1.5 sm:px-4 sm:py-2 shadow-pixar-sm">
          <span className={`h-2.5 w-2.5 rounded-full ${incidents.length > 0 ? "bg-[#EF4444] animate-ping" : "bg-[#10B981]"}`} />
          <span className="font-display text-[11px] sm:text-xs font-bold text-[#1E1B4B]">
            {incidents.length > 0 ? `${incidents.length} ACTIVE ALERTS` : "SANCTUARY ALL QUIET"}
          </span>
        </div>

        {/* Priority Filter */}
        <div className="hidden sm:flex items-center gap-1 rounded-[18px] border-[3px] border-[#1E1B4B] bg-[#FFF9F0] p-1 shadow-pixar-sm">
          {["ALL", "CRITICAL", "HIGH"].map((p) => (
            <button
              key={p}
              onClick={() => setFilterPriority(p)}
              className={`rounded-[14px] px-3 py-1.5 text-xs font-bold font-display transition-all ${
                filterPriority === p
                  ? "bg-[#1E1B4B] text-white"
                  : "text-[#1E1B4B] hover:bg-[#FFF1DC]"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* GPS Locate Me Button */}
        <button
          onClick={handleFlyToMyLocation}
          className="pixar-btn bg-[#FFB703] text-[#1E1B4B] px-3 py-1.5 sm:px-3.5 sm:py-2 text-[11px] sm:text-xs shadow-pixar-sm flex items-center gap-1.5 font-bold"
          title="Locate Me (GPS)"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Locate Me</span>
        </button>
      </div>

      {/* Map Canvas with explicit height */}
      <div className="w-full h-[420px] relative z-0">
        <div 
          ref={containerRef} 
          style={{ width: "100%", height: "420px", position: "relative" }}
          className="w-full h-[420px] relative z-0" 
        />
      </div>

      {/* Heartwarming Empty State Card (When 0 active incidents in MongoDB) */}
      {incidents.length === 0 && (
        <div className="absolute bottom-3 left-3 right-3 sm:bottom-5 sm:left-5 sm:right-auto z-20 max-w-md rounded-[22px] sm:rounded-[26px] border-[2px] sm:border-[3px] border-[#1E1B4B] bg-[#FFF9F0]/95 p-4 sm:p-5 shadow-pixar backdrop-blur-md">
          <div className="flex items-center gap-4">
            {/* Cute Sleeping Puppy SVG with floating Zzz animated via Anime.js */}
            <div className="relative flex-shrink-0 w-14 h-14 rounded-[20px] border-[2px] border-[#1E1B4B] bg-[#FFF1DC] flex items-center justify-center shadow-pixar-sm overflow-visible">
              <svg viewBox="0 0 40 40" className="w-9 h-9">
                <circle cx="20" cy="22" r="12" fill="#FBBF24" stroke="#1E1B4B" strokeWidth="2.5" />
                {/* Closed sleeping eyes */}
                <path d="M 14 20 Q 17 23 20 20" fill="none" stroke="#1E1B4B" strokeWidth="2" strokeLinecap="round" />
                <path d="M 21 20 Q 24 23 27 20" fill="none" stroke="#1E1B4B" strokeWidth="2" strokeLinecap="round" />
                {/* Floppy sleeping ears */}
                <path d="M 10 16 C 6 22, 10 26, 12 20" fill="#F59E0B" stroke="#1E1B4B" strokeWidth="2" />
                <path d="M 30 16 C 34 22, 30 26, 28 20" fill="#F59E0B" stroke="#1E1B4B" strokeWidth="2" />
                {/* Nose & Snout */}
                <ellipse cx="20.5" cy="24.5" rx="4" ry="2.8" fill="#FFF9F0" stroke="#1E1B4B" strokeWidth="1.5" />
                <polygon points="19.5,23.5 21.5,23.5 20.5,25" fill="#1E1B4B" />
              </svg>
              {/* Floating Zzz bubbles */}
              <span className="absolute -top-3.5 -right-2 font-display text-xs font-black text-[#FF7A00] animate-bounce">
                Zzz
              </span>
              <span className="absolute -top-6 -right-4 font-display text-[10px] font-bold text-[#F59E0B] animate-pulse">
                z
              </span>
            </div>

            <div className="space-y-1">
              <h4 className="font-display text-sm font-bold text-[#1E1B4B]">
                All Quiet in the Neighborhood
              </h4>
              <p className="text-xs text-[#1E1B4B]/75 leading-tight font-sans">
                Zero active distress cases logged. All rescue squads and ambulances are resting on standby.
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-2">
                <a
                  href="/report"
                  className="pixar-btn bg-gradient-to-r from-[#FF7A00] to-[#F97316] text-white px-3.5 py-1.5 text-xs shadow-pixar-sm inline-flex items-center gap-1.5 font-bold"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Spot an Animal in Need? Be Their Voice</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Selected Incident Drawer */}
      {selectedIncident && (
        <div className="absolute bottom-3 left-3 right-3 sm:bottom-5 sm:right-5 sm:left-auto z-20 w-auto sm:w-84 max-w-full rounded-[24px] sm:rounded-[26px] border-[3px] border-[#1E1B4B] bg-[#FFF9F0] p-4 sm:p-5 shadow-pixar animate-in fade-in slide-in-from-bottom-4 sm:slide-in-from-right-4">
          <div className="flex items-center justify-between border-b-[2px] border-[#1E1B4B] pb-2 mb-2.5">
            <span className="font-mono text-[11px] font-black text-[#FF7A00]">
              {selectedIncident.incidentId}
            </span>
            <span className={`px-2 py-0.5 rounded-[10px] text-[10px] font-bold font-display ${
              selectedIncident.priority === "CRITICAL" ? "bg-[#EF4444] text-white" : "bg-[#FFB703] text-[#1E1B4B]"
            }`}>
              {selectedIncident.priority}
            </span>
          </div>

          <p className="font-display text-base font-bold text-[#1E1B4B]">
            {selectedIncident.animalCategory}
          </p>
          <p className="text-xs text-[#1E1B4B]/80 line-clamp-2 mt-1 font-sans">
            {selectedIncident.conditionDescription}
          </p>
          <p className="text-[11px] text-[#1E1B4B]/60 font-mono mt-1.5 truncate">
            📍 {selectedIncident.location?.address || "Bangalore Location"}
          </p>

          <div className="mt-3.5 flex items-center gap-2">
            <a
              href={`/track/${selectedIncident.incidentId}`}
              className="pixar-btn flex-1 bg-gradient-to-r from-[#FF7A00] to-[#F97316] text-white py-2 text-center text-xs shadow-pixar-sm font-bold"
            >
              Track Live Rescue
            </a>
            <button
              onClick={() => setSelectedIncident(null)}
              className="pixar-btn px-3 py-2 bg-[#FFF1DC] text-[#1E1B4B] text-xs font-bold shadow-pixar-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
