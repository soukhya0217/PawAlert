"use client";

import React, { useEffect, useState } from "react";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import LocationPicker from "@/components/map/LocationPicker";
import {
  Sparkles,
  MapPin,
  Clock,
  Plus,
  CheckCircle2,
  Camera,
  AlertCircle,
  Droplets,
  Heart,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function VolunteerFeedingPage() {
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [zones, setZones] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Feeding log modal
  const [selectedZone, setSelectedZone] = useState<any | null>(null);
  const [foodKg, setFoodKg] = useState("5.0");
  const [waterLiters, setWaterLiters] = useState("10");
  const [animalsCounted, setAnimalsCounted] = useState("8");
  const [logNotes, setLogNotes] = useState("");
  const [submittingLog, setSubmittingLog] = useState(false);
  const [logSuccess, setLogSuccess] = useState<string | null>(null);

  // New zone modal
  const [isCreatingZone, setIsCreatingZone] = useState(false);
  const [newZoneName, setNewZoneName] = useState("");
  const [newZoneAddress, setNewZoneAddress] = useState("");
  const [newZoneCoords, setNewZoneCoords] = useState<[number, number]>([77.5946, 12.9716]);
  const [animalCount, setAnimalCount] = useState(6);
  const [foodType, setFoodType] = useState("Boiled Rice, Eggs & Chicken Broth with Kibble");
  const [creatingZoneLoading, setCreatingZoneLoading] = useState(false);

  const loadFeedingData = async () => {
    try {
      setLoading(true);
      const meRes = await fetch("/api/auth/me");
      const meData = await meRes.json();
      setCurrentUser(meData.user);

      const zoneRes = await fetch("/api/feeding/zones");
      const zoneData = await zoneRes.json();
      setZones(zoneData.zones || []);

      const actRes = await fetch("/api/feeding/activities");
      const actData = await actRes.json();
      setActivities(actData.activities || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedingData();
  }, []);

  const handleLogFeeding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedZone) return;

    try {
      setSubmittingLog(true);
      const res = await fetch("/api/feeding/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          zoneId: selectedZone._id,
          foodGivenKg: foodKg,
          waterRefilledLiters: waterLiters,
          animalsCounted,
          notes: logNotes,
          isWaterBowlCleaned: true,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setLogSuccess("Feeding activity logged! Thank you for nourishing our community animals.");
        setSelectedZone(null);
        setLogNotes("");
        loadFeedingData();
      } else {
        alert(data.error || "Failed to log activity");
      }
    } catch (e) {
      alert("Error submitting feeding record");
    } finally {
      setSubmittingLog(false);
    }
  };

  const handleCreateZone = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreatingZoneLoading(true);
      const res = await fetch("/api/feeding/zones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          zoneName: newZoneName,
          address: newZoneAddress,
          coordinates: newZoneCoords,
          estimatedAnimalCount: animalCount,
          foodType,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setIsCreatingZone(false);
        setNewZoneName("");
        setNewZoneAddress("");
        loadFeedingData();
      } else {
        alert(data.error || "Failed to create zone");
      }
    } catch (e) {
      alert("Error creating zone");
    } finally {
      setCreatingZoneLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <DashboardSidebar
          role={currentUser?.role || "FOOD_VOLUNTEER"}
          userName={currentUser?.fullName || "Volunteer"}
        />

        <div className="flex-1 space-y-8 w-full">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-mint-100 text-mint-800 text-xs font-black uppercase tracking-wider mb-2 border border-mint-200">
                <Sparkles className="w-3.5 h-3.5" /> Food & Water Guardianship
              </div>
              <h1 className="text-3xl font-black text-foreground tracking-tight">
                Feeding Zones & Water Points
              </h1>
              <p className="text-xs sm:text-sm text-foreground/75 mt-1">
                Manage registered community feeding spots, refill drinking water basins, and log daily nutritional records.
              </p>
            </div>

            <button
              onClick={() => setIsCreatingZone(true)}
              className="px-5 py-3 rounded-2xl bg-mint-600 text-white font-black text-xs shadow-md hover:bg-mint-700 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Register New Feeding Zone</span>
            </button>
          </div>

          {logSuccess && (
            <div className="p-4 rounded-2xl bg-mint-50 border border-mint-200 text-mint-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-mint-600 flex-shrink-0" />
              <span>{logSuccess}</span>
            </div>
          )}

          {/* Zones Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {zones.map((zone) => (
              <div
                key={zone._id}
                className="bg-white rounded-3xl p-6 border border-cream-200 shadow-soft flex flex-col justify-between hover:shadow-card transition-all"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-mint-100 text-mint-800">
                      Active Zone
                    </span>
                    <span className="text-xs font-bold text-muted-foreground">
                      ~{zone.estimatedAnimalCount} Animals
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-foreground">{zone.zoneName}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
                      <span className="line-clamp-1">{zone.location?.address}</span>
                    </p>
                  </div>

                  <div className="p-3.5 bg-cream-50 rounded-2xl border border-cream-200 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground font-semibold">Water Bowl Condition:</span>
                      <span className="font-bold text-mint-700 flex items-center gap-1">
                        <Droplets className="w-3.5 h-3.5" />
                        {zone.waterBowlCondition}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground font-semibold">Daily Requirement:</span>
                      <span className="font-bold text-foreground">{zone.dailyFoodKg} kg food</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground font-semibold">Last Fed:</span>
                      <span className="font-bold text-foreground">
                        {zone.lastFedAt ? formatDate(zone.lastFedAt) : "Pending today"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-cream-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground">
                    Menu: {zone.foodType}
                  </span>
                  <button
                    onClick={() => setSelectedZone(zone)}
                    className="px-4 py-2 rounded-xl bg-mint-600 text-white font-bold text-xs hover:bg-mint-700 shadow-sm transition-all"
                  >
                    Log Today's Feeding
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Feeding Activity Logs */}
          <div className="bg-white rounded-3xl p-6 border border-cream-200 shadow-soft space-y-4">
            <h3 className="text-base font-black text-foreground flex items-center gap-2">
              <span>📋</span> Recent Feeding Activity Records
            </h3>

            {activities.length === 0 ? (
              <p className="text-xs text-muted-foreground py-6 text-center">
                No feeding logs submitted yet.
              </p>
            ) : (
              <div className="space-y-3">
                {activities.slice(0, 5).map((act) => (
                  <div
                    key={act._id}
                    className="p-4 rounded-2xl bg-cream-50/70 border border-cream-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">
                          {act.zoneId?.zoneName || "Feeding Point"}
                        </span>
                        <span className="text-muted-foreground">•</span>
                        <span className="font-semibold text-mint-700">{act.foodGivenKg} kg fed</span>
                        <span className="text-muted-foreground">•</span>
                        <span className="font-semibold text-sky-700">{act.waterRefilledLiters}L water</span>
                      </div>
                      <p className="text-muted-foreground mt-1">
                        Caretaker: {act.volunteerId?.fullName || "Volunteer"} • {act.notes || "Cleaned bowl and replenished water"}
                      </p>
                    </div>

                    <span className="text-muted-foreground font-semibold flex-shrink-0">
                      {formatDate(act.fedAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Log Feeding Modal */}
      {selectedZone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-cream-200 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-mint-700 bg-mint-100 px-2.5 py-0.5 rounded-full">
                  Feeding Verification
                </span>
                <h3 className="text-lg font-black text-foreground mt-1">{selectedZone.zoneName}</h3>
              </div>
              <button
                onClick={() => setSelectedZone(null)}
                className="text-muted-foreground hover:text-foreground font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleLogFeeding} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">Food Given (kg) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={foodKg}
                    onChange={(e) => setFoodKg(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-cream-300 bg-cream-50 text-xs font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">Water Refilled (L) *</label>
                  <input
                    type="number"
                    required
                    value={waterLiters}
                    onChange={(e) => setWaterLiters(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-cream-300 bg-cream-50 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground">Animals Counted Fed *</label>
                <input
                  type="number"
                  required
                  value={animalsCounted}
                  onChange={(e) => setAnimalsCounted(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-cream-300 bg-cream-50 text-xs font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground">Field Observations / Notes</label>
                <textarea
                  rows={2}
                  value={logNotes}
                  onChange={(e) => setLogNotes(e.target.value)}
                  placeholder="All animals healthy, scrubbed water basin..."
                  className="w-full p-2.5 rounded-xl border border-cream-300 bg-cream-50 text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedZone(null)}
                  className="px-4 py-2 rounded-xl bg-cream-200 text-foreground font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingLog}
                  className="px-5 py-2 rounded-xl bg-mint-600 text-white font-bold text-xs shadow hover:bg-mint-700"
                >
                  {submittingLog ? "Submitting..." : "Save Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Zone Modal */}
      {isCreatingZone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-cream-200 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-foreground">Register New Feeding Zone</h3>
              <button
                onClick={() => setIsCreatingZone(false)}
                className="text-muted-foreground hover:text-foreground font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateZone} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground">Zone Title / Landmark *</label>
                <input
                  type="text"
                  required
                  value={newZoneName}
                  onChange={(e) => setNewZoneName(e.target.value)}
                  placeholder="E.g. Indiranagar Park Perimeter"
                  className="w-full p-2.5 rounded-xl border border-cream-300 bg-cream-50 text-xs"
                />
              </div>

              <div>
                <LocationPicker
                  initialCoordinates={newZoneCoords}
                  onLocationSelect={(c, addr) => {
                    setNewZoneCoords(c);
                    setNewZoneAddress(addr);
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">Est. Animals *</label>
                  <input
                    type="number"
                    value={animalCount}
                    onChange={(e) => setAnimalCount(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-cream-300 bg-cream-50 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">Diet Composition</label>
                  <input
                    type="text"
                    value={foodType}
                    onChange={(e) => setFoodType(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-cream-300 bg-cream-50 text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingZone(false)}
                  className="px-4 py-2 rounded-xl bg-cream-200 text-foreground font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingZoneLoading}
                  className="px-5 py-2 rounded-xl bg-mint-600 text-white font-bold text-xs shadow hover:bg-mint-700"
                >
                  {creatingZoneLoading ? "Saving..." : "Create Zone"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
