"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import "leaflet/dist/leaflet.css";
import { 
  Navigation, 
  Compass, 
  Sparkles, 
  Layers, 
  Check, 
  Shield, 
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  MapPin,
  X,
  Phone,
  Heart
} from "lucide-react";
import { IncidentData } from "@/lib/use-recent-incidents";

interface AdminMapProps {
  incidents?: IncidentData[];
  initialCenter?: [number, number]; // [lat, lon]
  initialZoom?: number;
  onSelectIncident?: (incident: IncidentData) => void;
  className?: string;
}

type MapTileStyle = "osm" | "dark" | "warm" | "satellite";

const TILE_SERVERS: Record<MapTileStyle, { name: string; url: string; subdomains?: string[]; attribution: string; maxZoom: number }> = {
  osm: {
    name: "Standard Streets (OSM)",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    subdomains: ["a", "b", "c"],
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  },
  dark: {
    name: "Twilight Night (Esri Dark)",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
    attribution: '&copy; <a href="https://www.esri.com/">Esri</a>',
    maxZoom: 16,
  },
  warm: {
    name: "Storybook Warm (OSM HOT)",
    url: "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
    subdomains: ["a", "b", "c"],
    attribution: '&copy; <a href="https://www.hotosm.org/">Humanitarian OSM</a> &copy; OpenStreetMap',
    maxZoom: 19,
  },
  satellite: {
    name: "Satellite Streets (Esri)",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: '&copy; <a href="https://www.esri.com/">Esri</a>',
    maxZoom: 19,
  },
};

// Permanent 24/7 Verified Sanctuary & Volunteer Hubs (Guarantees map is always active)
const SANCTUARY_HUBS = [
  {
    id: "HUB-CENTRAL",
    name: "PawAlert Central Sanctuary",
    type: "HQ & Trauma Care",
    lat: 12.9716,
    lon: 77.5946,
    status: "STANDBY 24/7",
    squads: "3 Ambulances, 12 Rescuers",
    phone: "+91 80 247-PAW-ALERT",
    color: "#10B981",
    emoji: "🏥",
  },
  {
    id: "HUB-KORAMANGALA",
    name: "Koramangala Emergency Response Unit",
    type: "Rapid Volunteer Squad",
    lat: 12.9352,
    lon: 77.6245,
    status: "ON PATROL",
    squads: "2 Mobile Vans, 6 Rescuers",
    phone: "+91 80 247-PAW-KORA",
    color: "#FF7A00",
    emoji: "🚑",
  },
  {
    id: "HUB-INDIRANAGAR",
    name: "Indiranagar Animal Care Hub",
    type: "ICU & Rehabilitation",
    lat: 12.9784,
    lon: 77.6408,
    status: "VETS ON DUTY",
    squads: "Surgeon On-Call, 8 Beds",
    phone: "+91 80 247-PAW-INDI",
    color: "#FFB703",
    emoji: "🐾",
  },
  {
    id: "HUB-CUBBON",
    name: "Cubbon Park Community Patrol",
    type: "Daily Feeding & Triage",
    lat: 12.9763,
    lon: 77.5929,
    status: "FEEDING ACTIVE",
    squads: "200kg Food Supply",
    phone: "+91 80 247-PAW-FEED",
    color: "#06B6D4",
    emoji: "🥣",
  },
];

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
  const hubsGroupRef = useRef<any>(null);
  const droppedPinRef = useRef<any>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const [selectedIncident, setSelectedIncident] = useState<IncidentData | null>(null);
  const [selectedHub, setSelectedHub] = useState<typeof SANCTUARY_HUBS[0] | null>(null);
  const [filterPriority, setFilterPriority] = useState<string>("ALL");
  const [currentStyle, setCurrentStyle] = useState<MapTileStyle>("osm");
  const [showStyleMenu, setShowStyleMenu] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [isStatusCollapsed, setIsStatusCollapsed] = useState(false);
  const [droppedPinCoords, setDroppedPinCoords] = useState<[number, number] | null>(null);

  const centerLat = initialCenter[0] || 12.9716;
  const centerLon = initialCenter[1] || 77.5946;

  // Switch Active Tile Layer safely
  const switchTileLayer = useCallback((styleKey: MapTileStyle) => {
    setCurrentStyle(styleKey);
    setShowStyleMenu(false);

    if (!mapRef.current) return;

    import("leaflet").then((importedLeaflet) => {
      const L = (importedLeaflet as any).default || importedLeaflet;
      const config = TILE_SERVERS[styleKey] || TILE_SERVERS.osm;

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

      // Bring markers and hubs back to top
      if (hubsGroupRef.current) hubsGroupRef.current.bringToFront?.();
      if (markersGroupRef.current) markersGroupRef.current.bringToFront?.();
    });
  }, []);

  // Initialize Leaflet Map cleanly
  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;

    let isMounted = true;
    const handleResize = () => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    };
    window.addEventListener("resize", handleResize);

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
        const initialStyleKey: MapTileStyle = "osm";
        const config = TILE_SERVERS[initialStyleKey];

        const leafletInstance = L.map(containerRef.current, {
          center: [centerLat, centerLon],
          zoom: initialZoom,
          zoomControl: false,
          attributionControl: true,
        });

        // Zoom Control on top right
        L.control.zoom({ position: "topright" }).addTo(leafletInstance);

        // Standard, fast raster tile layer (NO crossOrigin: true)
        const tileLayer = L.tileLayer(config.url, {
          attribution: config.attribution,
          maxZoom: config.maxZoom,
          subdomains: config.subdomains || ["a", "b", "c"],
        });

        // Robust fallback if tile server errors (guarantee single fallback attachment)
        let fallbackAdded = false;
        tileLayer.on("tileerror", () => {
          if (!fallbackAdded && leafletInstance) {
            fallbackAdded = true;
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

        // Group for permanent sanctuary hubs
        const hubsGroup = L.layerGroup().addTo(leafletInstance);
        hubsGroupRef.current = hubsGroup;

        // Render permanent Sanctuary Hubs
        SANCTUARY_HUBS.forEach((hub) => {
          const hubIcon = L.divIcon({
            className: "paw-hub-marker",
            html: `
              <div style="position: relative; width: 44px; height: 44px; cursor: pointer;">
                <div style="position: absolute; inset: -4px; border-radius: 50%; background: ${hub.color}; opacity: 0.35; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
                <div style="position: relative; width: 44px; height: 44px; border-radius: 22px; border: 3px solid #1E1B4B; background: ${hub.color}; box-shadow: 0 4px 0 #1E1B4B; display: flex; align-items: center; justify-content: center; font-size: 20px;">
                  <span>${hub.emoji}</span>
                </div>
              </div>
            `,
            iconSize: [44, 44],
            iconAnchor: [22, 22],
          });

          const hubMarker = L.marker([hub.lat, hub.lon], { icon: hubIcon });
          hubMarker.on("click", () => {
            setSelectedHub(hub);
            setSelectedIncident(null);
            leafletInstance.flyTo([hub.lat, hub.lon], 15, { duration: 1.2 });
          });
          hubMarker.addTo(hubsGroup);
        });

        // Group for active incident markers
        markersGroupRef.current = L.layerGroup().addTo(leafletInstance);

        // Click to drop a temporary emergency pin for testing
        leafletInstance.on("click", (e: any) => {
          const { lat, lng } = e.latlng;
          setDroppedPinCoords([lat, lng]);

          if (droppedPinRef.current) {
            leafletInstance.removeLayer(droppedPinRef.current);
          }

          const dropIcon = L.divIcon({
            className: "paw-dropped-pin",
            html: `
              <div style="position: relative; width: 48px; height: 48px; cursor: pointer;">
                <div style="position: absolute; inset: -6px; border-radius: 50%; background: #EF4444; opacity: 0.5; animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
                <div style="position: relative; width: 48px; height: 48px; border-radius: 24px; border: 3px solid #FFFFFF; background: #EF4444; box-shadow: 0 6px 0 #1E1B4B; display: flex; align-items: center; justify-content: center; font-size: 22px;">
                  <span>🚨</span>
                </div>
              </div>
            `,
            iconSize: [48, 48],
            iconAnchor: [24, 24],
          });

          const pin = L.marker([lat, lng], { icon: dropIcon }).addTo(leafletInstance);
          droppedPinRef.current = pin;
        });

        mapRef.current = leafletInstance;
        setMapReady(true);

        setTimeout(handleResize, 50);
        setTimeout(handleResize, 200);
        setTimeout(handleResize, 500);
        setTimeout(handleResize, 1000);
        setTimeout(handleResize, 2000);

        if (containerRef.current && window.ResizeObserver) {
          resizeObserverRef.current = new ResizeObserver(() => {
            handleResize();
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
      window.removeEventListener("resize", handleResize);
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
          setSelectedHub(null);
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
    <div className={`relative w-full rounded-[28px] sm:rounded-[32px] border-[3px] sm:border-[4px] border-[#1E1B4B] bg-[#FFF9F0] overflow-hidden shadow-pixar transition-colors duration-300 ${className}`}>
      
      {/* Top Map HUD Controls */}
      <div className="absolute top-3 left-3 right-3 sm:top-4 sm:left-4 sm:right-auto z-20 flex flex-wrap items-center gap-2">
        {/* Status Pill */}
        <div className="flex items-center gap-1.5 rounded-[16px] sm:rounded-[20px] border-[2px] sm:border-[3px] border-[#1E1B4B] bg-[#FFF9F0]/95 text-[#1E1B4B] px-3 py-1.5 sm:px-4 sm:py-2 shadow-pixar-sm backdrop-blur-md">
          <span className={`h-2.5 w-2.5 rounded-full ${incidents.length > 0 ? "bg-[#EF4444] animate-ping" : "bg-[#10B981]"}`} />
          <span className="font-display text-[11px] sm:text-xs font-bold">
            {incidents.length > 0 ? `${incidents.length} ACTIVE ALERTS` : "4 SANCTUARY SQUADS ACTIVE"}
          </span>
        </div>

        {/* Priority Filter */}
        <div className="hidden sm:flex items-center gap-1 rounded-[18px] border-[2px] sm:border-[3px] border-[#1E1B4B] bg-[#FFF9F0]/95 p-1 shadow-pixar-sm backdrop-blur-md">
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

        {/* Map Tile Style Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowStyleMenu(!showStyleMenu)}
            className="pixar-btn px-3 py-1.5 sm:px-3.5 sm:py-2 text-[11px] sm:text-xs shadow-pixar-sm flex items-center gap-1.5 font-bold bg-[#FFF1DC] text-[#1E1B4B] border-[#1E1B4B]"
            title="Change Map Style"
          >
            <Layers className="w-3.5 h-3.5 text-[#FF7A00]" />
            <span className="hidden md:inline">{TILE_SERVERS[currentStyle]?.name || "Map Style"}</span>
            <ChevronDown className="w-3 h-3 opacity-70" />
          </button>

          {showStyleMenu && (
            <div className="absolute left-0 mt-2 w-52 rounded-[20px] border-[3px] border-[#1E1B4B] bg-[#FFF9F0] p-2 shadow-pixar z-50">
              <div className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-1 text-[#FF7A00]">
                Select Map Style
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
                        ? "bg-[#FFF1DC] text-[#FF7A00]"
                        : "text-[#1E1B4B] hover:bg-[#FFF1DC]"
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
      <div className="w-full h-[520px] relative z-0 overflow-hidden">
        
        {/* Animated Geospatial Radar Screen SVG Background (Guarantees map is never a blank void) */}
        <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none transition-colors duration-500 bg-[#FFF4E5]">
          <svg className="w-full h-full opacity-35" viewBox="0 0 800 500" preserveAspectRatio="none">
            <defs>
              <radialGradient id="radarSweep" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FF7A00" stopOpacity="0.25" />
                <stop offset="70%" stopColor="#FBBF24" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#1E1B4B" stopOpacity="0" />
              </radialGradient>
              <pattern id="radarGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#F59E0B" strokeWidth="0.75" strokeOpacity="0.4" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#radarGrid)" />
            {/* Concentric distance perimeter circles */}
            <circle cx="400" cy="250" r="80" fill="none" stroke="#FF7A00" strokeWidth="1.5" strokeDasharray="4 4" />
            <circle cx="400" cy="250" r="160" fill="none" stroke="#FFB703" strokeWidth="1.5" strokeOpacity="0.6" />
            <circle cx="400" cy="250" r="240" fill="none" stroke="#F59E0B" strokeWidth="1.5" strokeOpacity="0.3" />
            {/* Crosshairs */}
            <line x1="400" y1="0" x2="400" y2="500" stroke="#FF7A00" strokeWidth="1" strokeOpacity="0.4" />
            <line x1="0" y1="250" x2="800" y2="250" stroke="#FF7A00" strokeWidth="1" strokeOpacity="0.4" />
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
          style={{ width: "100%", height: "520px", position: "relative" }}
          className="w-full h-[520px] relative z-10" 
        />
      </div>

      {/* Dropped Test Pin Notice Pill */}
      {droppedPinCoords && (
        <div className="absolute top-16 left-3 right-3 sm:left-4 sm:right-auto z-20 inline-flex items-center gap-2 rounded-[16px] border-[2px] border-[#EF4444] bg-[#EF4444] text-white px-3.5 py-1.5 shadow-pixar-sm text-xs font-bold animate-in fade-in">
          <span>📍 Test Emergency Pin Placed:</span>
          <span className="font-mono text-[11px]">{droppedPinCoords[0].toFixed(4)}, {droppedPinCoords[1].toFixed(4)}</span>
          <button 
            onClick={() => {
              if (droppedPinRef.current && mapRef.current) {
                mapRef.current.removeLayer(droppedPinRef.current);
                droppedPinRef.current = null;
              }
              setDroppedPinCoords(null);
            }} 
            className="ml-1 hover:opacity-80"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Heartwarming Collapsible Status Card */}
      {incidents.length === 0 && (
        <div className="absolute bottom-3 left-3 right-3 sm:bottom-5 sm:left-5 sm:right-auto z-20 max-w-md rounded-[22px] sm:rounded-[26px] border-[2px] sm:border-[3px] border-[#1E1B4B] bg-[#FFF9F0]/95 text-[#1E1B4B] p-3 sm:p-4 shadow-pixar backdrop-blur-md transition-all duration-300">
          {isStatusCollapsed ? (
            <button
              onClick={() => setIsStatusCollapsed(false)}
              className="flex items-center gap-2 text-xs font-bold font-display"
            >
              <span>🐾</span>
              <span>Sanctuary All Quiet • 4 Hubs on Standby</span>
              <ChevronUp className="w-4 h-4 ml-1 text-[#FF7A00]" />
            </button>
          ) : (
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {/* Cute Sleeping Puppy SVG with floating Zzz */}
                  <div className="relative flex-shrink-0 w-12 h-12 rounded-[18px] border-[2px] border-[#1E1B4B] bg-[#FFF1DC] flex items-center justify-center shadow-pixar-sm overflow-visible">
                    <svg viewBox="0 0 40 40" className="w-8 h-8">
                      <circle cx="20" cy="22" r="12" fill="#FBBF24" stroke="#1E1B4B" strokeWidth="2.5" />
                      <path d="M 14 20 Q 17 23 20 20" fill="none" stroke="#1E1B4B" strokeWidth="2" strokeLinecap="round" />
                      <path d="M 21 20 Q 24 23 27 20" fill="none" stroke="#1E1B4B" strokeWidth="2" strokeLinecap="round" />
                      <path d="M 10 16 C 6 22, 10 26, 12 20" fill="#F59E0B" stroke="#1E1B4B" strokeWidth="2" />
                      <path d="M 30 16 C 34 22, 30 26, 28 20" fill="#F59E0B" stroke="#1E1B4B" strokeWidth="2" />
                      <ellipse cx="20.5" cy="24.5" rx="4" ry="2.8" fill="#FFF9F0" stroke="#1E1B4B" strokeWidth="1.5" />
                      <polygon points="19.5,23.5 21.5,23.5 20.5,25" fill="#1E1B4B" />
                    </svg>
                    <span className="absolute -top-3 -right-2 font-display text-[11px] font-black text-[#FF7A00] animate-bounce">
                      Zzz
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <h4 className="font-display text-xs sm:text-sm font-bold">
                      Sanctuary All Quiet • 4 Hubs On Guard
                    </h4>
                    <p className="text-[11px] text-[#1E1B4B]/75 leading-tight font-sans">
                      Zero active distress emergencies in flight. 4 verified sanctuary hubs are monitoring radar.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsStatusCollapsed(true)}
                  className="pixar-btn p-1 rounded-full text-xs"
                  title="Minimize card to view full map"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="pt-2.5 mt-2 border-t border-[#1E1B4B]/10 flex flex-wrap items-center gap-2">
                <a
                  href="/report"
                  className="pixar-btn bg-gradient-to-r from-[#FF7A00] to-[#F97316] text-white px-3 py-1.5 text-xs shadow-pixar-sm inline-flex items-center gap-1.5 font-bold"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Report Animal in Need</span>
                </a>
                <span className="text-[10px] text-muted-foreground font-mono">
                  (Tip: Click map to test pin)
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Selected Sanctuary Hub Modal Card */}
      {selectedHub && (
        <div className="absolute bottom-3 left-3 right-3 sm:bottom-5 sm:right-5 sm:left-auto z-20 w-auto sm:w-80 max-w-full rounded-[24px] sm:rounded-[26px] border-[3px] border-[#1E1B4B] bg-[#FFF9F0] text-[#1E1B4B] p-4 sm:p-5 shadow-pixar animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between border-b-[2px] border-[#1E1B4B]/20 pb-2 mb-2">
            <span className="font-mono text-[10px] font-black text-[#10B981] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
              {selectedHub.status}
            </span>
            <span className="text-base">{selectedHub.emoji}</span>
          </div>

          <p className="font-display text-sm font-bold">
            {selectedHub.name}
          </p>
          <p className="text-xs text-[#FF7A00] font-bold mt-0.5">
            {selectedHub.type}
          </p>
          <p className="text-[11px] text-[#1E1B4B]/80 font-sans mt-1.5">
            🚑 Active Resources: {selectedHub.squads}
          </p>
          <p className="text-[11px] font-mono text-[#10B981] mt-1 font-bold">
            📞 Hotline: {selectedHub.phone}
          </p>

          <div className="mt-3 flex items-center gap-2">
            <a
              href="/report"
              className="pixar-btn flex-1 bg-gradient-to-r from-[#FF7A00] to-[#F97316] text-white py-1.5 text-center text-xs shadow-pixar-sm font-bold"
            >
              Dispatch Alert Here
            </a>
            <button
              onClick={() => setSelectedHub(null)}
              className="pixar-btn px-3 py-1.5 bg-[#FFF1DC] text-[#1E1B4B] text-xs font-bold shadow-pixar-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Selected Incident Drawer */}
      {selectedIncident && (
        <div className="absolute bottom-3 left-3 right-3 sm:bottom-5 sm:right-5 sm:left-auto z-20 w-auto sm:w-84 max-w-full rounded-[24px] sm:rounded-[26px] border-[3px] border-[#1E1B4B] bg-[#FFF9F0] text-[#1E1B4B] p-4 sm:p-5 shadow-pixar animate-in fade-in slide-in-from-bottom-4 sm:slide-in-from-right-4">
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
