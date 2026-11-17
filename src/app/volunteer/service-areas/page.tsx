"use client";

import React, { useEffect, useState } from "react";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import RescueMap from "@/components/map/RescueMap";
import LocationPicker from "@/components/map/LocationPicker";
import { MapPin, Navigation, Shield, CheckCircle2 } from "lucide-react";

export default function VolunteerServiceAreasPage() {
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [radiusKm, setRadiusKm] = useState(15);
  const [availability, setAvailability] = useState("AVAILABLE");
  const [coords, setCoords] = useState<[number, number]>([77.6245, 12.9352]);
  const [address, setAddress] = useState("Koramangala, Bangalore");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setCurrentUser(data.user);
          if (data.user.volunteerProfile) {
            setRadiusKm(data.user.volunteerProfile.serviceArea?.radiusKm || 15);
            setAvailability(data.user.volunteerProfile.availability || "AVAILABLE");
            if (data.user.volunteerProfile.serviceArea?.coordinates) {
              setCoords(data.user.volunteerProfile.serviceArea.coordinates);
            }
            setAddress(data.user.volunteerProfile.serviceArea?.address || "Bangalore");
          }
        }
      });
  }, []);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <DashboardSidebar
          role={currentUser?.role || "RESCUE_VOLUNTEER"}
          userName={currentUser?.fullName || "Volunteer"}
        />

        <div className="flex-1 space-y-6 w-full">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-primary-700 bg-peach-100 px-3 py-1 rounded-full border border-peach-200">
              Coverage Grid
            </span>
            <h1 className="text-3xl font-black text-foreground tracking-tight mt-2">
              Service Areas & Geofence Configuration
            </h1>
            <p className="text-xs sm:text-sm text-foreground/75 mt-1">
              Configure your operational response perimeter. MongoDB 2dsphere indexing notifies you when incidents occur within this radius.
            </p>
          </div>

          {saved && (
            <div className="p-4 rounded-2xl bg-mint-50 border border-mint-200 text-mint-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-mint-600 flex-shrink-0" />
              <span>Service perimeter preferences updated!</span>
            </div>
          )}

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-soft space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground">Current Availability Status</label>
                <select
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-cream-300 bg-cream-50 text-xs font-bold"
                >
                  <option value="AVAILABLE">🟢 Available for Active Dispatch</option>
                  <option value="BUSY">🟡 Busy on Active Rescue</option>
                  <option value="OFFLINE">⚪ Off Duty / Resting</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground">Response Radius: {radiusKm} km</label>
                <input
                  type="range"
                  min={2}
                  max={50}
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(Number(e.target.value))}
                  className="w-full accent-primary-500 cursor-pointer pt-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-2">
                Center Point / Home Depot Coordinates
              </label>
              <LocationPicker
                initialCoordinates={coords}
                onLocationSelect={(c, addr) => {
                  setCoords(c);
                  setAddress(addr);
                }}
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleSave}
                className="px-6 py-2.5 rounded-2xl bg-primary-500 text-white font-bold text-xs shadow hover:bg-primary-600 transition-colors"
              >
                Save Geofence Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
