"use client";

import React, { useState, useEffect, useRef } from "react";
import { MapPin, Navigation, Check } from "lucide-react";

interface LocationPickerProps {
  initialCoordinates?: [number, number]; // [lon, lat]
  onLocationSelect: (coords: [number, number], address: string) => void;
}

export default function LocationPicker({
  initialCoordinates = [77.5946, 12.9716],
  onLocationSelect,
}: LocationPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const [coords, setCoords] = useState<[number, number]>(initialCoordinates);
  const [address, setAddress] = useState("Bangalore, Karnataka, India");
  const [locating, setLocating] = useState(false);

  const reverseGeocode = async (lat: number, lon: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
      );
      const data = await res.json();
      if (data && data.display_name) {
        setAddress(data.display_name);
        onLocationSelect([lon, lat], data.display_name);
      }
    } catch (e) {
      const fallback = `Coordinates: ${lat.toFixed(5)}, ${lon.toFixed(5)}`;
      setAddress(fallback);
      onLocationSelect([lon, lat], fallback);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    let isMounted = true;

    import("leaflet").then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      if (!mapRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [coords[1], coords[0]],
          zoom: 14,
          zoomControl: false,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; OpenStreetMap',
          maxZoom: 19,
        }).addTo(map);

        const customIcon = L.divIcon({
          className: "picker-icon",
          html: `
            <div style="
              background-color: #ff3b30;
              width: 32px;
              height: 32px;
              border-radius: 9999px;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 0 16px rgba(255,59,48,0.7);
              border: 2px solid #ffffff;
              color: white;
              font-family: monospace;
              font-size: 13px;
              font-weight: bold;
              transform: translate(-50%, -50%);
            ">
              📍
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker([coords[1], coords[0]], {
          icon: customIcon,
          draggable: true,
        }).addTo(map);

        marker.on("dragend", (e: any) => {
          const latLng = e.target.getLatLng();
          setCoords([latLng.lng, latLng.lat]);
          reverseGeocode(latLng.lat, latLng.lng);
        });

        map.on("click", (e: any) => {
          marker.setLatLng(e.latlng);
          setCoords([e.latlng.lng, e.latlng.lat]);
          reverseGeocode(e.latlng.lat, e.latlng.lng);
        });

        markerRef.current = marker;
        mapRef.current = map;
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setCoords([lon, lat]);
        setLocating(false);

        if (mapRef.current && markerRef.current) {
          mapRef.current.setView([lat, lon], 16);
          markerRef.current.setLatLng([lat, lon]);
        }

        reverseGeocode(lat, lon);
      },
      (err) => {
        setLocating(false);
        alert("Could not fetch your current GPS position. Please select location manually on the map.");
      },
      { enableHighAccuracy: true }
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-primary-500" />
          Pinpoint Incident Location (Click map or use GPS)
        </label>
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          disabled={locating}
          className="px-3 py-1.5 rounded-xl bg-peach-100 text-primary-700 text-xs font-bold hover:bg-peach-200 transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
        >
          <Navigation className={`w-3.5 h-3.5 ${locating ? "animate-spin" : ""}`} />
          {locating ? "Locating..." : "Use My GPS Location"}
        </button>
      </div>

      <div className="relative w-full h-56 rounded-2xl overflow-hidden border border-cream-300 shadow-inner">
        <div ref={mapContainerRef} className="w-full h-full" />
      </div>

      <div className="p-3 bg-cream-50 rounded-xl border border-cream-200 flex items-start gap-2 text-xs text-foreground/80">
        <Check className="w-4 h-4 text-mint-600 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-foreground">Selected Address:</span>
          <p className="line-clamp-2">{address}</p>
        </div>
      </div>
    </div>
  );
}
