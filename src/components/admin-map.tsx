"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import "leaflet/dist/leaflet.css";
import { Navigation, Compass, Sparkles, Layers, Check, Shield, AlertTriangle } from "lucide-react";
import { IncidentData } from "@/lib/use-recent-incidents";

interface AdminMapProps {
  incidents?: IncidentData[];
  initialCenter?: [number, number]; // [lat, lon]
  initialZoom?: number;
  onSelectIncident?: (incident: IncidentData) => void;
  className?: string;
}

type MapTileStyle = "voyager" | "dark" | "osm" | "satellite";

const TILE_SERVERS: Record<MapTileStyle, { name: string; url: string; subdomains?: string[]; attribution: string; maxZoom: number }> = {
  voyager: {
    name: "Storybook Warm",
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    subdomains: ["a", "b", "c", "d"],
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  },
  dark: {
    name: "Twilight Night",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    subdomains: ["a", "b", "c", "d"],
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  },
  osm: {
    name: "OpenStreetMap",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    subdomains: ["a", "b", "c"],
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  },
  satellite: {
    name: "Esri Satellite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
    attribution: '&copy; <a href="https://www.esri.com/">Esri</a>',
    maxZoom: 19,
  },
};

export default function AdminMap({
  incidents = [],
  initialCenter = [12.9716, 77.5946], // Bangalore center
  initialZoom = 13,
  onSelectIncident,
  className = "",
}: AdminMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const activeTileLayerRef = useRef<any>(null);
  const markersGroupRef = useRef<any>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const [selectedIncident, setSelectedIncident] = useState<IncidentData | null>(null);
  const [filterPriority, setFilterPriority] = useState<string>("ALL");
  const [currentStyle, setCurrentStyle] = useState<MapTileStyle>("voyager");
  const [showStyleMenu, setShowStyleMenu] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [activeTheme, setActiveTheme] = useState<"light" | "dark">("light");

  const centerLat = initialCenter[0] || 12.9716;
  const centerLon = initialCenter[1] || 77.5946;

  // Listen to Global Theme Changes to adapt map tiles automatically
  useEffect(() => {
    if (typeof window === "undefined") return;

    const currentDocTheme = document.documentElement.getAttribute("data-theme") || "light";
    setActiveTheme(currentDocTheme === "dark" ? "dark" : "light");
    if (currentDocTheme === "dark") {
      setCurrentStyle("dark");
    }

    const handleThemeChange = (e: any) => {
      const isDark = e.detail?.theme === "dark";
      setActiveTheme(isDark ? "dark" : "light");
      switchTileLayer(isDark ? "dark" : "voyager");
    };

    window.addEventListener("pawalert-theme-change", handleThemeChange);
    return () => window.removeEventListener("pawalert-theme-change", handleThemeChange);
  }, []);

  // Switch Active Tile Layer safely
  const switchTileLayer = useCallback((styleKey: MapTileStyle) => {
    setCurrentStyle(styleKey);
    setShowStyleMenu(false);

    if (!mapRef.current) return;

    import("leaflet").then((importedLeaflet) => {
      const L = (importedLeaflet as any).default || importedLeaflet;
      const config = TILE_SERVERS[styleKey] || TILE_SERVERS.voyager;

      if (activeTileLayerRef.current) {
        try {
          mapRef.current.removeLayer(activeTileLayerRef.current);
        } catch {
          // ignore
        }
      }

      // Safe raster tile layer WITHOUT crossOrigin (fixes Chrome/Edge CORS tile drop!)
      const newLayer = L.tileLayer(config.url, {
        attribution: config.attribution,
        maxZoom: config.maxZoom,
        subdomains: config.subdomains || ["a", "b", "c"],
      });

      newLayer.addTo(mapRef.current);
      activeTileLayerRef.current = newLayer;

      // Bring markers back to top
      if (markersGroupRef.current) {
        markersGroupRef.current.bringToFront?.();
      }
    });
  }, []);

  // Initialize Leaflet Map cleanly
  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;

    let isMounted = true;

    import("leaflet").then((importedLeaflet) => {
      if (!isMounted || !containerRef.current) return;
      const L = (importedLeaflet as any).default || importedLeaflet;

      // Clean teardown if prior instance existed
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch {}
        mapRef.current = null;
      }

      if (containerRef.current) {
        (containerRef.current as any)._leaflet_id = null;
        containerRef.current.innerHTML = "";
      }

      // Override Default Icons
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      try {
        const initialStyleKey: MapTileStyle = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "voyager";
        const config = TILE_SERVERS[initialStyleKey];

        const leafletInstance = L.map(containerRef.current, {
          center: [centerLat, centerLon],
          zoom: initialZoom,
          zoomControl: false,
          attributionControl: true,
        });

        // Zoom Control
        L.control.zoom({ position: "topright" }).addTo(leafletInstance);

        // Standard, fast raster tile layer (NO crossOrigin: true)
        const tileLayer = L.tileLayer(config.url, {
          attribution: config.attribution,
          maxZoom: config.maxZoom,
          subdomains: config.subdomains || ["a", "b", "c"],
        });

        // Robust fallback if tile server errors
        tileLayer.on("tileerror", () => {
          if (leafletInstance && (initialStyleKey as MapTileStyle) !== "osm") {
            const fallback = L.tileLayer(TILE_SERVERS.osm.url, {
              attribution: TILE_SERVERS.osm.attribution,
              maxZoom: 19,
              subdomains: ["a", "b", "c"],
            });
            fallback.addTo(leafletInstance);
          }
        });

        tileLayer.addTo(leafletInstance);
        activeTileLayerRef.current = tileLayer;

        // Group for incident markers
        markersGroupRef.current = L.layerGroup().addTo(leafletInstance);
        mapRef.current = leafletInstance;
        setMapReady(true);

        // Periodic invalidateSize to guarantee tiles render over dynamic containers
        const invalidate = () => {
          if (mapRef.current) {
            mapRef.current.invalidateSize();
          }
        };
        setTimeout(invalidate, 60);
        setTimeout(invalidate, 200);
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
        } catch {}
        mapRef.current = null;
      }
    };
  }, [centerLat, centerLon, initialZoom]);

  // Update Markers when incidents or filters change
  useEffect(() => {
    if (!mapRef.current || !markersGroupRef.current) return;

    import("leaflet").then((importedLeaflet) => {
      const L = (importedLeaflet as any).default || importedLeaflet;
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
        const pulseColor = isCritical ? "rgba(255, 90, 78, 0.45)" : "rgba(255, 183, 3, 0.45)";
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

  const isDarkMode = activeTheme === "dark";

  return (
    <div className={`relative w-full rounded-[28px] sm:rounded-[32px] border-[3px] sm:border-[4px] ${isDarkMode ? "border-[#3B286D] bg-[#17153B]" : "border-[#1E1B4B] bg-[#FFF9F0]"} overflow-hidden shadow-pixar transition-colors duration-300 ${className}`}>
      
      {/* Top Map HUD Controls */}
      <div className="absolute top-3 left-3 right-3 sm:top-4 sm:left-4 sm:right-auto z-20 flex flex-wrap items-center gap-2">
        {/* Status Pill */}
        <div className={`flex items-center gap-1.5 rounded-[16px] sm:rounded-[20px] border-[2px] sm:border-[3px] ${isDarkMode ? "border-[#3B286D] bg-[#1E1B4B]/90 text-[#FFF9F0]" : "border-[#1E1B4B] bg-[#FFF9F0] text-[#1E1B4B]"} px-3 py-1.5 sm:px-4 sm:py-2 shadow-pixar-sm backdrop-blur-md`}>
          <span className={`h-2.5 w-2.5 rounded-full ${incidents.length > 0 ? "bg-[#EF4444] animate-ping" : "bg-[#10B981]"}`} />
          <span className="font-display text-[11px] sm:text-xs font-bold">
            {incidents.length > 0 ? `${incidents.length} ACTIVE ALERTS` : "SANCTUARY ALL QUIET"}
          </span>
        </div>

        {/* Priority Filter */}
        <div className={`hidden sm:flex items-center gap-1 rounded-[18px] border-[2px] sm:border-[3px] ${isDarkMode ? "border-[#3B286D] bg-[#1E1B4B]/90" : "border-[#1E1B4B] bg-[#FFF9F0]"} p-1 shadow-pixar-sm backdrop-blur-md`}>
          {["ALL", "CRITICAL", "HIGH"].map((p) => (
            <button
              key={p}
              onClick={() => setFilterPriority(p)}
              className={`rounded-[14px] px-3 py-1.5 text-xs font-bold font-display transition-all ${
                filterPriority === p
                  ? isDarkMode ? "bg-[#FBBF24] text-[#1E1B4B]" : "bg-[#1E1B4B] text-white"
                  : isDarkMode ? "text-[#FFF9F0] hover:bg-[#2D1B69]" : "text-[#1E1B4B] hover:bg-[#FFF1DC]"
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

        {/* Map Tile Style Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowStyleMenu(!showStyleMenu)}
            className={`pixar-btn px-3 py-1.5 sm:px-3.5 sm:py-2 text-[11px] sm:text-xs shadow-pixar-sm flex items-center gap-1.5 font-bold ${
              isDarkMode ? "bg-[#28235C] text-[#FFF9F0] border-[#3B286D]" : "bg-[#FFF1DC] text-[#1E1B4B] border-[#1E1B4B]"
            }`}
            title="Change Map Style"
          >
            <Layers className="w-3.5 h-3.5 text-[#FF7A00]" />
            <span className="hidden md:inline">{TILE_SERVERS[currentStyle]?.name || "Map Style"}</span>
          </button>

          {showStyleMenu && (
            <div className={`absolute left-0 mt-2 w-48 rounded-[20px] border-[3px] ${isDarkMode ? "border-[#3B286D] bg-[#1E1B4B]" : "border-[#1E1B4B] bg-[#FFF9F0]"} p-2 shadow-pixar z-50`}>
              <div className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-1 text-[#FF7A00]">
                Select Map Theme
              </div>
              {(Object.keys(TILE_SERVERS) as MapTileStyle[]).map((key) => {
                const s = TILE_SERVERS[key];
                const isSelected = currentStyle === key;
                return (
                  <button
                    key={key}
                    onClick={() => switchTileLayer(key)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold font-display rounded-[12px] transition-colors ${
                      isSelected
                        ? isDarkMode ? "bg-[#3B286D] text-[#FBBF24]" : "bg-[#FFF1DC] text-[#FF7A00]"
                        : isDarkMode ? "text-[#FFF9F0] hover:bg-[#28235C]" : "text-[#1E1B4B] hover:bg-[#FFF1DC]"
                    }`}
                  >
                    <span>{s.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#10B981]" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Main Map Container with Animated Radar Background */}
      <div className="w-full h-[460px] relative z-0 overflow-hidden">
        
        {/* Animated Geospatial Radar Screen SVG Background (Guarantees map is never a blank void) */}
        <div className={`absolute inset-0 z-0 flex items-center justify-center pointer-events-none transition-colors duration-500 ${isDarkMode ? "bg-[#090817]" : "bg-[#FFF4E5]"}`}>
          <svg className="w-full h-full opacity-35" viewBox="0 0 800 500" preserveAspectRatio="none">
            <defs>
              <radialGradient id="radarSweep" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FF7A00" stopOpacity="0.25" />
                <stop offset="70%" stopColor="#FBBF24" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#1E1B4B" stopOpacity="0" />
              </radialGradient>
              <pattern id="radarGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke={isDarkMode ? "#3B286D" : "#F59E0B"} strokeWidth="0.75" strokeOpacity="0.4" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#radarGrid)" />
            {/* Concentric distance perimeter circles */}
            <circle cx="400" cy="250" r="80" fill="none" stroke={isDarkMode ? "#818CF8" : "#FF7A00"} strokeWidth="1.5" strokeDasharray="4 4" />
            <circle cx="400" cy="250" r="160" fill="none" stroke={isDarkMode ? "#6366F1" : "#FFB703"} strokeWidth="1.5" strokeOpacity="0.6" />
            <circle cx="400" cy="250" r="240" fill="none" stroke={isDarkMode ? "#4F46E5" : "#F59E0B"} strokeWidth="1.5" strokeOpacity="0.3" />
            {/* Crosshairs */}
            <line x1="400" y1="0" x2="400" y2="500" stroke={isDarkMode ? "#818CF8" : "#FF7A00"} strokeWidth="1" strokeOpacity="0.4" />
            <line x1="0" y1="250" x2="800" y2="250" stroke={isDarkMode ? "#818CF8" : "#FF7A00"} strokeWidth="1" strokeOpacity="0.4" />
            {/* Center Sanctuary Pulse */}
            <circle cx="400" cy="250" r="12" fill="url(#radarSweep)" />
            <circle cx="400" cy="250" r="6" fill="#FF7A00" />
          </svg>
          {/* Coordinates HUD telemetry label */}
          <div className="absolute bottom-3 right-3 font-mono text-[10px] tracking-widest text-[#FF7A00]/80 bg-black/40 px-2 py-0.5 rounded-[8px] backdrop-blur-sm pointer-events-none">
            RADAR: 12.9716° N, 77.5946° E • SANCTUARY LOCK
          </div>
        </div>

        {/* Leaflet DOM Node */}
        <div 
          ref={containerRef} 
          style={{ width: "100%", height: "460px", position: "relative" }}
          className="w-full h-[460px] relative z-10" 
        />
      </div>

      {/* Heartwarming Empty State Card (When 0 active incidents in MongoDB) */}
      {incidents.length === 0 && (
        <div className={`absolute bottom-3 left-3 right-3 sm:bottom-5 sm:left-5 sm:right-auto z-20 max-w-md rounded-[22px] sm:rounded-[26px] border-[2px] sm:border-[3px] ${isDarkMode ? "border-[#3B286D] bg-[#17153B]/95 text-[#FFF9F0]" : "border-[#1E1B4B] bg-[#FFF9F0]/95 text-[#1E1B4B]"} p-4 sm:p-5 shadow-pixar backdrop-blur-md transition-colors duration-300`}>
          <div className="flex items-center gap-4">
            {/* Cute Sleeping Puppy SVG with floating Zzz */}
            <div className={`relative flex-shrink-0 w-14 h-14 rounded-[20px] border-[2px] ${isDarkMode ? "border-[#3B286D] bg-[#1E1B4B]" : "border-[#1E1B4B] bg-[#FFF1DC]"} flex items-center justify-center shadow-pixar-sm overflow-visible`}>
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
              <h4 className="font-display text-sm font-bold">
                All Quiet in the Neighborhood
              </h4>
              <p className={`text-xs ${isDarkMode ? "text-[#FFF9F0]/75" : "text-[#1E1B4B]/75"} leading-tight font-sans`}>
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
        <div className={`absolute bottom-3 left-3 right-3 sm:bottom-5 sm:right-5 sm:left-auto z-20 w-auto sm:w-84 max-w-full rounded-[24px] sm:rounded-[26px] border-[3px] ${isDarkMode ? "border-[#3B286D] bg-[#17153B] text-[#FFF9F0]" : "border-[#1E1B4B] bg-[#FFF9F0] text-[#1E1B4B]"} p-4 sm:p-5 shadow-pixar animate-in fade-in slide-in-from-bottom-4 sm:slide-in-from-right-4`}>
          <div className="flex items-center justify-between border-b-[2px] border-[#1E1B4B]/20 pb-2 mb-2.5">
            <span className="font-mono text-[11px] font-black text-[#FF7A00]">
              {selectedIncident.incidentId}
            </span>
            <span className={`px-2 py-0.5 rounded-[10px] text-[10px] font-bold font-display ${
              selectedIncident.priority === "CRITICAL" ? "bg-[#EF4444] text-white" : "bg-[#FFB703] text-[#1E1B4B]"
            }`}>
              {selectedIncident.priority}
            </span>
          </div>

          <p className="font-display text-base font-bold">
            {selectedIncident.animalCategory}
          </p>
          <p className={`text-xs ${isDarkMode ? "text-[#FFF9F0]/80" : "text-[#1E1B4B]/80"} line-clamp-2 mt-1 font-sans`}>
            {selectedIncident.conditionDescription}
          </p>
          <p className={`text-[11px] ${isDarkMode ? "text-[#FFF9F0]/60" : "text-[#1E1B4B]/60"} font-mono mt-1.5 truncate`}>
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
              className={`pixar-btn px-3 py-2 ${isDarkMode ? "bg-[#1E1B4B] text-[#FFF9F0]" : "bg-[#FFF1DC] text-[#1E1B4B]"} text-xs font-bold shadow-pixar-sm`}
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
