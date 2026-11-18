"use client";

import React, { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
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

  // Initialize Leaflet Map cleanly with robust CSS & dimensions
  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;

    let isMounted = true;
    let leafletInstance: any = null;

    import("leaflet").then((L) => {
      if (!isMounted || !containerRef.current) return;

      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (e) {
          // ignore
        }
        mapRef.current = null;
      }

      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      leafletInstance = L.map(containerRef.current, {
        center: initialCenter,
        zoom: initialZoom,
        zoomControl: false,
      });

      L.control.zoom({ position: "topright" }).addTo(leafletInstance);

      // Fast, reliable OpenStreetMap raster tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
        subdomains: ["a", "b", "c"],
      }).addTo(leafletInstance);

      markersGroupRef.current = L.layerGroup().addTo(leafletInstance);
      mapRef.current = leafletInstance;
      setMapReady(true);

      // Force size invalidation across frames so grey tiles never persist
      const invalidate = () => {
        if (mapRef.current) {
          mapRef.current.invalidateSize();
        }
      };
      setTimeout(invalidate, 100);
      setTimeout(invalidate, 300);
      setTimeout(invalidate, 800);

      if (containerRef.current && window.ResizeObserver) {
        resizeObserverRef.current = new ResizeObserver(() => {
          invalidate();
        });
        resizeObserverRef.current.observe(containerRef.current);
      }
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
  }, [initialCenter, initialZoom]);

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
        const pinBg = isCritical ? "#EF4444" : "#FF7A00";
        const emoji = isCritical ? "🚨" : "🐾";

        const customIcon = L.divIcon({
          className: "paw-pin-marker",
          html: `
            <div class="paw-pin-body" style="background-color: ${pinBg};">
              <span class="paw-pin-emoji">${emoji}</span>
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
    <div className={`relative w-full rounded-[32px] border-[4px] border-[#1E1B4B] bg-[#FFF9F0] overflow-hidden shadow-pixar ${className}`}>
      
      {/* Top Map HUD Controls */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2.5">
        {/* Status Pill */}
        <div className="flex items-center gap-2 rounded-[20px] border-[3px] border-[#1E1B4B] bg-[#FFF9F0] px-4 py-2 shadow-pixar-sm">
          <span className={`h-3 w-3 rounded-full ${incidents.length > 0 ? "bg-[#EF4444] animate-ping" : "bg-[#10B981]"}`} />
          <span className="font-display text-xs font-bold text-[#1E1B4B]">
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
          className="pixar-btn bg-[#FFB703] text-[#1E1B4B] px-3.5 py-2 text-xs shadow-pixar-sm flex items-center gap-1.5 font-bold"
          title="Locate Me (GPS)"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Locate Me (GPS)</span>
        </button>

        {/* Quick Demo Cases Seed Button */}
        {incidents.length === 0 ? (
          <button
            onClick={handleLoadSampleAlerts}
            disabled={seeding}
            className="pixar-btn bg-[#10B981] text-white px-3.5 py-2 text-xs shadow-pixar-sm flex items-center gap-1.5 font-bold disabled:opacity-50"
            title="Load Sample Live Rescue Alerts"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{seeding ? "Loading..." : "⚡ Load Sample Alerts"}</span>
          </button>
        ) : (
          <button
            onClick={handleClearAllAlerts}
            disabled={seeding}
            className="pixar-btn bg-[#FFF9F0] text-[#1E1B4B] px-3 py-2 text-xs shadow-pixar-sm flex items-center gap-1.5 font-bold hover:bg-[#EF4444] hover:text-white transition-all disabled:opacity-50"
            title="Clear Alerts (Test Empty State)"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Map Canvas with explicit height */}
      <div className="w-full h-[520px] sm:h-[560px] relative z-0">
        <div ref={containerRef} className="w-full h-[520px] sm:h-[560px] relative z-0" />
      </div>

      {/* Heartwarming Empty State Card (When 0 active incidents in MongoDB) */}
      {incidents.length === 0 && (
        <div className="absolute bottom-5 left-5 right-5 sm:left-5 sm:right-auto z-20 max-w-md rounded-[26px] border-[3px] border-[#1E1B4B] bg-[#FFF9F0]/95 p-5 shadow-pixar backdrop-blur-md">
          <div className="flex items-center gap-4">
            {/* Cute Sleeping Puppy & Kitten SVG Illustration with Zzz bubbles */}
            <div className="relative flex-shrink-0 w-14 h-14 rounded-[20px] border-[2px] border-[#1E1B4B] bg-[#FFF1DC] flex items-center justify-center text-2xl shadow-pixar-sm">
              <span>🐶</span>
              <span className="absolute -top-3 -right-2 font-display text-xs font-black text-[#FF7A00] animate-bounce">
                Zzz
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
                  <span>Report Animal in Need</span>
                </a>

                <button
                  onClick={handleLoadSampleAlerts}
                  disabled={seeding}
                  className="pixar-btn bg-[#10B981] text-white px-3 py-1.5 text-xs shadow-pixar-sm inline-flex items-center gap-1 font-bold disabled:opacity-50"
                >
                  <span>⚡ Load Demo Cases</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Selected Incident Drawer */}
      {selectedIncident && (
        <div className="absolute bottom-5 right-5 z-20 w-84 max-w-[90%] rounded-[26px] border-[3px] border-[#1E1B4B] bg-[#FFF9F0] p-5 shadow-pixar animate-in fade-in slide-in-from-right-4">
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
