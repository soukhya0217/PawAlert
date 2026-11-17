"use client";

import React, { useEffect, useState, useRef } from "react";
import { AlertTriangle, MapPin, CheckCircle2, Heart, Shield, RefreshCw } from "lucide-react";

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
  const [takingActionId, setTakingActionId] = useState<string | null>(null);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  const fetchMapData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/incidents?limit=100");
      const data = await res.json();

      const mapped: MapMarkerItem[] = [];

      if (data.incidents) {
        data.incidents.forEach((inc: any) => {
          if (inc.location && inc.location.coordinates) {
            mapped.push({
              id: inc._id,
              incidentId: inc.incidentId,
              title: inc.animalCategory,
              category: inc.animalCategory,
              priority: inc.priority,
              status: inc.status,
              type: "INCIDENT",
              coordinates: inc.location.coordinates, // [lon, lat]
              address: inc.location.address,
              image: inc.images?.[0],
              assignedVolunteer: inc.assignedVolunteerId?.fullName,
            });
          }
        });
      }

      // Also fetch feeding zones
      try {
        const feedRes = await fetch("/api/feeding/zones");
        const feedData = await feedRes.json();
        if (feedData.zones) {
          feedData.zones.forEach((z: any) => {
            if (z.location && z.location.coordinates) {
              mapped.push({
                id: z._id,
                title: z.zoneName,
                category: "Feeding Zone",
                status: z.status,
                type: "FEEDING",
                coordinates: z.location.coordinates,
                address: z.location.address,
                image: z.photos?.[0],
              });
            }
          });
        }
      } catch (e) {}

      setItems(mapped);
    } catch (e) {
      console.error("Map fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMapData();
  }, []);

  // Initialize Leaflet Map
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    let isMounted = true;

    import("leaflet").then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      if (!leafletMapRef.current) {
        // Fix Leaflet's default icon path issues
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

        L.control.zoom({ position: "bottomright" }).addTo(map);

        L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
          attribution: '&copy; <a href="https://carto.com/">CARTO</a>, &copy; OpenStreetMap',
          maxZoom: 19,
        }).addTo(map);

        markersLayerRef.current = L.layerGroup().addTo(map);
        leafletMapRef.current = map;
      }

      // Update markers
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

          let markerColor = "#F75C2E"; // Default coral
          let markerEmoji = "🐾";

          if (item.type === "INCIDENT") {
            if (item.priority === "CRITICAL") {
              markerColor = "#E11D48";
              markerEmoji = "🚨";
            } else if (item.priority === "HIGH") {
              markerColor = "#F97316";
              markerEmoji = "⚠️";
            } else if (item.status === "RESOLVED") {
              markerColor = "#2EA879";
              markerEmoji = "✅";
            }
          } else if (item.type === "FEEDING") {
            markerColor = "#2EA879";
            markerEmoji = "🥣";
          }

          const customIcon = L.divIcon({
            className: "custom-div-icon",
            html: `
              <div style="
                background-color: ${markerColor};
                width: 38px;
                height: 38px;
                border-radius: 9999px;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4px 14px rgba(0,0,0,0.25);
                border: 3px solid #ffffff;
                font-size: 16px;
                cursor: pointer;
                transform: translate(-50%, -50%);
                transition: transform 0.2s ease;
              " class="hover:scale-125">
                ${markerEmoji}
              </div>
            `,
            iconSize: [38, 38],
            iconAnchor: [19, 19],
          });

          const marker = L.marker([lat, lon], { icon: customIcon });

          marker.on("click", () => {
            setSelectedItem(item);
            if (onSelectIncident) onSelectIncident(item);
          });

          markersLayerRef.current.addLayer(marker);
        });
      }
    });

    return () => {
      isMounted = false;
    };
  }, [items, activeFilter, activePriority]);

  const handleTakeResponsibility = async (incidentId: string) => {
    try {
      setTakingActionId(incidentId);
      const res = await fetch(`/api/incidents/${incidentId}/assign`, {
        method: "POST",
      });
      const data = await res.json();

      if (res.ok) {
        setActionSuccessMessage("Responsibility accepted! Case assigned to you.");
        fetchMapData();
      } else {
        alert(data.error || "Failed to accept case");
      }
    } catch (e: any) {
      alert("Network or server error while taking responsibility");
    } finally {
      setTakingActionId(null);
    }
  };

  return (
    <div className="relative w-full h-[650px] rounded-3xl overflow-hidden border border-cream-200 shadow-card bg-cream-100">
      {/* Map Filter Controls Bar */}
      <div className="absolute top-4 left-4 z-[1000] flex flex-wrap items-center gap-2 bg-white/95 backdrop-blur-md p-2 rounded-2xl shadow-lg border border-cream-200 max-w-[90vw]">
        <button
          onClick={() => setActiveFilter("ALL")}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeFilter === "ALL"
              ? "bg-primary-500 text-white shadow-sm"
              : "text-foreground hover:bg-cream-100"
          }`}
        >
          All Locations ({items.length})
        </button>

        <button
          onClick={() => setActiveFilter("INCIDENTS")}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
            activeFilter === "INCIDENTS"
              ? "bg-rose-500 text-white shadow-sm"
              : "text-foreground hover:bg-cream-100"
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          Emergencies
        </button>

        <button
          onClick={() => setActiveFilter("FEEDING")}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
            activeFilter === "FEEDING"
              ? "bg-mint-500 text-white shadow-sm"
              : "text-foreground hover:bg-cream-100"
          }`}
        >
          🥣 Feeding Zones
        </button>

        <div className="h-4 w-px bg-cream-300 hidden sm:block"></div>

        {/* Priority Filter */}
        <select
          value={activePriority}
          onChange={(e) => setActivePriority(e.target.value)}
          aria-label="Filter incidents by priority"
          className="text-xs font-bold px-2 py-1.5 bg-cream-50 rounded-xl border border-cream-300 text-foreground focus:outline-none focus:ring-1 focus:ring-primary-500"
        >
          <option value="ALL">All Priorities</option>
          <option value="CRITICAL">🚨 Critical Only</option>
          <option value="HIGH">⚠️ High Priority</option>
          <option value="MEDIUM">Medium Priority</option>
          <option value="LOW">Low Priority</option>
        </select>

        <button
          onClick={fetchMapData}
          className="p-1.5 rounded-xl text-muted-foreground hover:bg-cream-100 transition-colors"
          title="Refresh Map"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Selected Item Floating Modal */}
      {selectedItem && (
        <div className="absolute bottom-6 left-6 right-6 sm:right-auto sm:w-96 z-[1000] bg-white rounded-3xl p-5 shadow-2xl border border-cream-200 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-peach-100 text-primary-700">
                  {selectedItem.priority || selectedItem.type}
                </span>
                <span className="text-xs font-bold text-muted-foreground">
                  {selectedItem.incidentId || "ZONE"}
                </span>
              </div>
              <h3 className="text-base font-black text-foreground mt-1">{selectedItem.title}</h3>
            </div>
            <button
              onClick={() => setSelectedItem(null)}
              className="text-muted-foreground hover:text-foreground text-sm font-bold p-1"
            >
              ✕
            </button>
          </div>

          {selectedItem.image && (
            <div className="mt-3 h-32 w-full rounded-2xl overflow-hidden bg-cream-100">
              <img
                src={selectedItem.image}
                alt={selectedItem.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="mt-3 flex items-start gap-2 text-xs text-foreground/80">
            <MapPin className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
            <p className="line-clamp-2">{selectedItem.address}</p>
          </div>

          <div className="mt-3 pt-3 border-t border-cream-200 flex items-center justify-between text-xs">
            <span className="font-bold text-muted-foreground">
              Status: <span className="text-foreground">{selectedItem.status.replace(/_/g, " ")}</span>
            </span>
            {selectedItem.assignedVolunteer && (
              <span className="text-mint-600 font-bold">Rescuer: {selectedItem.assignedVolunteer}</span>
            )}
          </div>

          {/* Action buttons */}
          <div className="mt-4 flex items-center gap-2">
            {selectedItem.type === "INCIDENT" && !selectedItem.assignedVolunteer && (
              <button
                onClick={() => handleTakeResponsibility(selectedItem.id)}
                disabled={takingActionId === selectedItem.id}
                className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-red-500 to-primary-500 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Shield className="w-3.5 h-3.5" />
                {takingActionId === selectedItem.id ? "Assigning..." : "Take Responsibility"}
              </button>
            )}

            <a
              href={
                selectedItem.type === "INCIDENT"
                  ? `/user/incident/${selectedItem.id}`
                  : `/volunteer/feeding`
              }
              className="py-2 px-3 rounded-xl bg-peach-100 text-primary-700 font-bold text-xs hover:bg-peach-200 transition-colors text-center"
            >
              Full Details →
            </a>
          </div>

          {actionSuccessMessage && (
            <div className="mt-2 text-xs font-bold text-mint-700 bg-mint-50 p-2 rounded-xl text-center">
              {actionSuccessMessage}
            </div>
          )}
        </div>
      )}

      {/* Leaflet Mount Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Leaflet CSS requirement */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />
    </div>
  );
}
