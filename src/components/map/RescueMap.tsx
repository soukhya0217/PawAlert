"use client";

import React, { useEffect, useState, useRef } from "react";
import { 
  AlertTriangle, 
  MapPin, 
  RefreshCw, 
  ShieldCheck, 
  Radio, 
  Crosshair, 
  Compass,
  Layers,
  ChevronRight,
  ExternalLink,
  Plus
} from "lucide-react";

interface MapMarkerItem {
  id: string;
  incidentId?: string;
  title: string;
  category: string;
  priority?: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  status: string;
  type: "INCIDENT" | "FEEDING" | "SHELTER" | "VET";
  coordinates: [number, number]; // [lon, lat]
  address: string;
  image?: string;
  assignedVolunteer?: string;
}

interface RescueMapProps {
  initialCenter?: [number, number]; // [lat, lon]
  initialZoom?: number;
  onSelectIncident?: (incident: any) => void;
  filterType?: string;
}

export default function RescueMap({
  initialCenter = [12.9716, 77.5946], // Bangalore center [lat, lon]
  initialZoom = 13,
  onSelectIncident,
  filterType = "ALL",
}: RescueMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);

  const [items, setItems] = useState<MapMarkerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [activePriority, setActivePriority] = useState("ALL");
  const [selectedItem, setSelectedItem] = useState<MapMarkerItem | null>(null);
  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lng: number }>({
    lat: initialCenter[0],
    lng: initialCenter[1],
  });

  const fetchMapData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/incidents?limit=100");
      const data = await res.json();

      const mapped: MapMarkerItem[] = [];

      // Only populate REAL reported incidents from the database (no fake data)
      if (data.incidents && Array.isArray(data.incidents)) {
        data.incidents.forEach((inc: any) => {
          if (inc.location && Array.isArray(inc.location.coordinates) && inc.location.coordinates.length === 2) {
            mapped.push({
              id: inc._id,
              incidentId: inc.incidentId,
              title: inc.animalCategory || "Animal Distress",
              category: inc.animalCategory,
              priority: inc.priority,
              status: inc.status,
              type: "INCIDENT",
              coordinates: inc.location.coordinates, // [lon, lat]
              address: inc.location.address || "Location logged",
              image: inc.images?.[0],
              assignedVolunteer: inc.assignedVolunteerId?.fullName,
            });
          }
        });
      }

      setItems(mapped);
    } catch (e) {
      console.error("Tactical map fetch error:", e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMapData();
  }, []);

  // Initialize Tactical Leaflet Map with OpenStreetMap (No API key needed!)
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    let isMounted = true;

    import("leaflet").then((importedLeaflet) => {
      if (!isMounted || !mapContainerRef.current) return;
      const L = (importedLeaflet as any).default || importedLeaflet;

      if (!leafletMapRef.current) {
        if (mapContainerRef.current) {
          (mapContainerRef.current as any)._leaflet_id = null;
        }

        // Fix Leaflet's default icon paths
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        });

        const map = L.map(mapContainerRef.current, {
          center: initialCenter,
          zoom: initialZoom,
          zoomControl: false,
        });

        // Add custom zoom control at bottom-right
        L.control.zoom({ position: "bottomright" }).addTo(map);

        // 100% Free OpenStreetMap & Esri Tiles (Zero API Key / Zero Watermarks)
        const tileLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
          subdomains: ["a", "b", "c"],
        });

        const fallbackLayer = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {
          attribution: '&copy; Esri',
          maxZoom: 19,
        });

        tileLayer.on("tileerror", () => {
          if (map && !map.hasLayer(fallbackLayer)) {
            fallbackLayer.addTo(map);
          }
        });

        tileLayer.addTo(map);

        // Update telemetry coordinates on mouse move
        map.on("mousemove", (e: any) => {
          setCursorCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
        });

        markersLayerRef.current = L.layerGroup().addTo(map);
        leafletMapRef.current = map;
      }

      // Render Active Markers
      if (markersLayerRef.current) {
        markersLayerRef.current.clearLayers();

        const filtered = items.filter((item) => {
          if (activeFilter === "INCIDENTS" && item.type !== "INCIDENT") return false;
          if (activeFilter === "FEEDING" && item.type !== "FEEDING") return false;
          if (activePriority !== "ALL" && item.priority !== activePriority) return false;
          return true;
        });

        filtered.forEach((item) => {
          const lat = item.coordinates[1];
          const lon = item.coordinates[0];

          const isCritical = item.priority === "CRITICAL";
          const markerColor = isCritical ? "#ff3b30" : "#d4ff3a";
          const glowColor = isCritical ? "rgba(255, 59, 48, 0.6)" : "rgba(212, 255, 58, 0.6)";

          const customIcon = L.divIcon({
            className: "custom-tactical-marker",
            html: `
              <div style="position: relative; width: 32px; height: 32px; cursor: pointer;">
                <div style="
                  position: absolute;
                  inset: 0;
                  border-radius: 50%;
                  background: ${glowColor};
                  animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
                "></div>
                <div style="
                  position: relative;
                  width: 32px;
                  height: 32px;
                  border-radius: 50%;
                  background: #0a0e17;
                  border: 2px solid ${markerColor};
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  box-shadow: 0 0 16px ${markerColor};
                  color: ${markerColor};
                  font-family: monospace;
                  font-size: 11px;
                  font-weight: bold;
                ">
                  ${isCritical ? "!" : "▲"}
                </div>
              </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          });

          const marker = L.marker([lat, lon], { icon: customIcon });

          marker.on("click", () => {
            setSelectedItem(item);
            if (onSelectIncident) {
              onSelectIncident(item);
            }
          });

          marker.addTo(markersLayerRef.current);
        });
      }
    });

    return () => {
      isMounted = false;
    };
  }, [items, activeFilter, activePriority]);

  return (
    <div className="relative w-full rounded-xl border border-white/10 bg-[#0a0e17] overflow-hidden shadow-2xl">
      {/* Top HUD Telemetry Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-[#05070d]/90 px-4 py-3 backdrop-blur-md">
        
        {/* Sector & Telemetry Info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#d4ff3a] animate-pulse" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-white">
              Tactical Sector Grid
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 font-mono text-[11px] text-slate-400">
            <span className="h-3 w-[1px] bg-white/20" />
            <span>LAT: {cursorCoords.lat.toFixed(4)}° N</span>
            <span className="h-3 w-[1px] bg-white/20" />
            <span>LON: {cursorCoords.lng.toFixed(4)}° E</span>
          </div>
        </div>

        {/* Filter Controls & Live Count */}
        <div className="flex items-center gap-2">
          {/* Active Incident Badge (Zero False Data) */}
          <div className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-xs text-slate-300">
            <span className={`h-2 w-2 rounded-full ${items.length > 0 ? "bg-[#ff3b30] animate-ping" : "bg-emerald-400"}`} />
            <span>ACTIVE ALERTS:</span>
            <strong className={`font-mono ${items.length > 0 ? "text-[#ff3b30]" : "text-[#d4ff3a]"}`}>
              {items.length}
            </strong>
          </div>

          {/* Refresh Button */}
          <button
            onClick={fetchMapData}
            disabled={loading}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-white/5 text-slate-300 hover:border-[#d4ff3a]/40 hover:text-white transition-colors disabled:opacity-50"
            title="Refresh Radar Grid"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#d4ff3a]" : ""}`} />
          </button>
        </div>
      </div>

      {/* Map Canvas with Dark Satellite Overlay */}
      <div className="relative h-[520px] w-full bg-[#05070d]">
        <div 
          ref={mapContainerRef} 
          className="h-full w-full leaflet-tactical-container z-0" 
        />

        {/* Tactical Crosshair Center Watermark */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-25">
          <Crosshair className="w-16 h-16 text-[#d4ff3a]/40" />
        </div>

        {/* Clean Empty State Overlay (When Database Contains Zero Incidents) */}
        {!loading && items.length === 0 && (
          <div className="absolute inset-x-4 bottom-6 md:inset-x-auto md:left-6 md:bottom-6 z-20 max-w-md rounded-lg border border-white/15 bg-[#05070d]/95 p-4 shadow-2xl backdrop-blur-xl">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-white">
                    Sector Clear // Standby Mode
                  </h4>
                  <span className="rounded bg-emerald-950 px-1.5 py-0.2 font-mono text-[9px] text-emerald-400">
                    ZERO INCIDENTS
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  No active animal distress cases reported in this sector. The response network is on standby ready to dispatch volunteers.
                </p>
                <div className="pt-2">
                  <a
                    href="/report"
                    className="inline-flex items-center gap-1.5 rounded bg-[#ff3b30] px-3 py-1.5 font-mono text-[11px] font-bold text-white shadow-[0_0_12px_rgba(255,59,48,0.4)] hover:bg-[#ff4d4d] transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Report Animal in Distress</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Selected Incident Drawer / Inspection Card */}
        {selectedItem && (
          <div className="absolute top-4 right-4 z-20 w-80 max-w-[90%] rounded-lg border border-white/15 bg-[#05070d]/95 p-4 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-right-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#d4ff3a]">
                INCIDENT ID: {selectedItem.incidentId || selectedItem.id.slice(-6)}
              </span>
              <button 
                onClick={() => setSelectedItem(null)}
                className="text-slate-400 hover:text-white text-xs font-mono"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white">{selectedItem.title}</span>
                <span className="rounded px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase bg-red-950 text-red-400 border border-red-500/30">
                  {selectedItem.priority || "NORMAL"}
                </span>
              </div>

              <p className="text-xs text-slate-300 font-mono flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#ff3b30] flex-shrink-0" />
                <span className="truncate">{selectedItem.address}</span>
              </p>

              <div className="pt-3 border-t border-white/10 flex gap-2">
                <a
                  href={`/user/incident/${selectedItem.id}`}
                  className="flex-1 rounded bg-[#d4ff3a] py-1.5 text-center font-mono text-xs font-bold text-black hover:bg-[#c2ef2c] transition-colors"
                >
                  Take Responsibility
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom HUD Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-[#05070d]/90 px-4 py-2.5 font-mono text-[11px] text-slate-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#ff3b30]" />
            <span>CRITICAL RESCUE</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#d4ff3a]" />
            <span>VERIFIED ALERT</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span>FEEDING ZONE</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-2 text-slate-500">
          <span>TILE SOURCE: OPENSTREETMAP (100% UNRESTRICTED)</span>
        </div>
      </div>
    </div>
  );
}
