"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { MapPin, Navigation, RefreshCw, Shield, AlertTriangle, CheckCircle, Heart } from "lucide-react";
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

  // Initialize Leaflet cleanly inside useEffect
  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;

    let isMounted = true;
    let leafletInstance: any = null;

    import("leaflet").then((L) => {
      if (!isMounted || !containerRef.current) return;

      // Ensure container has dimensions before initializing
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      // Prevent re-initialization if already active
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (e) {
          // ignore cleanup error
        }
        mapRef.current = null;
      }

      // Safe marker icon defaults
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      // Initialize map instance
      leafletInstance = L.map(containerRef.current, {
        center: initialCenter,
        zoom: initialZoom,
        zoomControl: false,
      });

      // Smooth zoom controls on top-right to avoid footer clashes
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

      // Invalidate size immediately once loaded
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.invalidateSize();
        }
      }, 200);

      // Set up ResizeObserver to prevent any gray / half-rendered tiles
      if (containerRef.current && window.ResizeObserver) {
        resizeObserverRef.current = new ResizeObserver(() => {
          if (mapRef.current) {
            mapRef.current.invalidateSize();
          }
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
          // ignore cleanup error
        }
        mapRef.current = null;
      }
    };
  }, [initialCenter, initialZoom]);

  // Update Markers whenever incidents or filter changes
  useEffect(() => {
    if (!mapRef.current || !markersGroupRef.current) return;

    import("leaflet").then((L) => {
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
        const emoji = isCritical ? "🚨" : "🐾";

        const customIcon = L.divIcon({
          className: "paw-marker-container",
          html: `
            <div class="paw-marker-pin" style="background-color: ${pinBg};">
              <span class="paw-marker-icon">${emoji}</span>
            </div>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 36],
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

  return (
    <div className={`relative w-full rounded-[24px] border-[2px] border-[#1B3B2B] bg-[#FFFBF5] overflow-hidden shadow-bento ${className}`}>
      
      {/* Top Map HUD Controls */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2">
        {/* Status Chip */}
        <div className="flex items-center gap-2 rounded-[16px] border-[2px] border-[#1B3B2B] bg-[#F5EFE6] px-3.5 py-1.5 shadow-bento-sm">
          <span className={`h-2.5 w-2.5 rounded-full ${incidents.length > 0 ? "bg-[#FF5A4E] animate-ping" : "bg-[#2EC4B6]"}`} />
          <span className="font-display text-xs font-bold text-[#1B3B2B]">
            {incidents.length > 0 ? `${incidents.length} ACTIVE ALERTS` : "SANCTUARY SECURE"}
          </span>
        </div>

        {/* Priority Filter Toggle */}
        <div className="hidden sm:flex items-center gap-1 rounded-[16px] border-[2px] border-[#1B3B2B] bg-[#FFFBF5] p-1 shadow-bento-sm">
          {["ALL", "CRITICAL", "HIGH"].map((p) => (
            <button
              key={p}
              onClick={() => setFilterPriority(p)}
              className={`rounded-[12px] px-2.5 py-1 text-[11px] font-bold font-display transition-all ${
                filterPriority === p
                  ? "bg-[#1B3B2B] text-white"
                  : "text-[#1B3B2B] hover:bg-[#F5EFE6]"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* GPS Button */}
        <button
          onClick={handleFlyToMyLocation}
          className="bento-btn flex items-center gap-1.5 rounded-[16px] bg-[#2EC4B6] px-3 py-1.5 text-xs text-white"
          title="Fly to My Coordinates"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>My GPS</span>
        </button>
      </div>

      {/* Map Canvas */}
      <div className="min-h-[420px] h-full w-full relative z-0">
        <div ref={containerRef} className="h-full w-full min-h-[420px] relative z-0" />
      </div>

      {/* Empty State Banner (When 0 active incidents) */}
      {incidents.length === 0 && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-4 sm:right-auto z-20 max-w-sm rounded-[20px] border-[2px] border-[#1B3B2B] bg-[#FFFBF5]/95 p-4 shadow-bento backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[14px] border-[2px] border-[#1B3B2B] bg-[#2EC4B6]/20 text-[#2EC4B6]">
              <Heart className="w-5 h-5 fill-[#2EC4B6]" />
            </div>
            <div>
              <p className="font-display text-xs font-bold text-[#1B3B2B]">
                All Quiet in the Field
              </p>
              <p className="text-[11px] text-[#1B3B2B]/75 leading-tight">
                No active emergencies in MongoDB. Volunteer squads are on standby.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Selected Incident Drawer */}
      {selectedIncident && (
        <div className="absolute bottom-4 right-4 z-20 w-80 max-w-[90%] rounded-[20px] border-[2px] border-[#1B3B2B] bg-[#FFFBF5] p-4 shadow-bento">
          <div className="flex items-center justify-between border-b-[2px] border-[#1B3B2B] pb-2 mb-2">
            <span className="font-mono text-[10px] font-bold text-[#FF5A4E]">
              {selectedIncident.incidentId}
            </span>
            <button
              onClick={() => setSelectedIncident(null)}
              className="text-xs font-bold text-[#1B3B2B] hover:text-[#FF5A4E]"
            >
              ✕
            </button>
          </div>
          <p className="font-display text-sm font-bold text-[#1B3B2B]">
            {selectedIncident.animalCategory}
          </p>
          <p className="text-xs text-[#1B3B2B]/80 line-clamp-2 mt-1">
            {selectedIncident.conditionDescription}
          </p>
          <div className="mt-3 flex gap-2">
            <a
              href={`/track/${selectedIncident.incidentId}`}
              className="bento-btn w-full rounded-[12px] bg-[#FF5A4E] py-1.5 text-center text-xs text-white"
            >
              Track Live Rescue
            </a>
          </div>
        </div>
      )}

    </div>
  );
}
