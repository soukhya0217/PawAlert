"use client";

import React, { useEffect, useState } from "react";
import LocationPicker from "@/components/map/LocationPicker";
import {
  PawPrint,
  MapPin,
  Clock,
  Phone,
  AlertTriangle,
  Plus,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function MissingAnimalsPage() {
  const [missingList, setMissingList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [isReporting, setIsReporting] = useState(false);
  const [petName, setPetName] = useState("");
  const [species, setSpecies] = useState("Dog");
  const [breed, setBreed] = useState("Indie / Beagle");
  const [color, setColor] = useState("Brown & White");
  const [photoUrl, setPhotoUrl] = useState("https://images.unsplash.com/photo-1505628346881-b72b27e84530?auto=format&fit=crop&w=600&q=80");
  const [coords, setCoords] = useState<[number, number]>([77.6322, 12.9734]);
  const [address, setAddress] = useState("Indiranagar, Bangalore");
  const [ownerName, setOwnerName] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [reward, setReward] = useState("5000");
  const [submitting, setSubmitting] = useState(false);
  const [aiMatches, setAiMatches] = useState<any[]>([]);
  const [reportSuccess, setReportSuccess] = useState<string | null>(null);

  const loadMissing = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/missing");
      const data = await res.json();
      setMissingList(data.missingAnimals || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMissing();
  }, []);

  const handleReportMissing = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await fetch("/api/missing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          petName,
          species,
          breed,
          color,
          photos: [photoUrl],
          coordinates: coords,
          address,
          ownerName: ownerName || "Pet Parent",
          ownerPhone: ownerPhone || "+91 99000 00000",
          rewardAmount: reward ? parseFloat(reward) : 0,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setReportSuccess("Missing animal alert broadcasted! AI check performed.");
        setAiMatches(data.potentialMatches || []);
        setIsReporting(false);
        loadMissing();
      } else {
        alert(data.error || "Failed to submit report");
      }
    } catch (e) {
      alert("Error reporting missing pet");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-amber-700 bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
            🐾 Community Pet Reunification
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight mt-2">
            Missing & Lost Animals
          </h1>
          <p className="text-xs sm:text-sm text-foreground/75 mt-1">
            Report lost pets to mobilize community search alerts and automatic cross-matching against rescued street animals.
          </p>
        </div>

        <button
          onClick={() => setIsReporting(true)}
          className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-primary-500 text-white font-black text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Report Lost Pet</span>
        </button>
      </div>

      {reportSuccess && (
        <div className="p-4 rounded-2xl bg-mint-50 border border-mint-200 text-mint-800 text-xs font-bold text-center">
          {reportSuccess}
        </div>
      )}

      {/* AI Matches Highlight if any found */}
      {aiMatches.length > 0 && (
        <div className="p-5 bg-amber-50 rounded-3xl border border-amber-200 space-y-3">
          <h3 className="text-sm font-black text-amber-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            AI Smart Match: We found {aiMatches.length} recently rescued animal(s) matching this description nearby!
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {aiMatches.map((m) => (
              <a
                key={m._id}
                href={`/user/incident/${m._id}`}
                className="p-3 bg-white rounded-2xl border border-amber-200 flex items-center gap-3 hover:shadow-sm"
              >
                <img src={m.images?.[0]} alt="Match" className="w-12 h-12 rounded-xl object-cover" />
                <div className="text-xs">
                  <p className="font-black text-foreground">Incident {m.incidentId}</p>
                  <p className="text-muted-foreground">{m.distanceKm} km away • {m.status}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Missing Animals Cards */}
      {loading ? (
        <div className="py-20 text-center text-xs text-muted-foreground font-semibold">
          Scanning missing animal registry...
        </div>
      ) : missingList.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-cream-200 max-w-md mx-auto">
          <span className="text-4xl">🎉</span>
          <h3 className="text-base font-black text-foreground mt-3">No active lost pets reported</h3>
          <p className="text-xs text-muted-foreground mt-1">All registered pets are currently accounted for.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {missingList.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-3xl overflow-hidden border border-cream-200 shadow-soft hover:shadow-card transition-all flex flex-col justify-between"
            >
              <div>
                <div className="h-56 w-full overflow-hidden relative bg-cream-100">
                  <img
                    src={item.photos?.[0] || "https://images.unsplash.com/photo-1505628346881-b72b27e84530?auto=format&fit=crop&w=600&q=80"}
                    alt={item.petName}
                    className="w-full h-full object-cover"
                  />
                  {item.rewardAmount > 0 && (
                    <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-amber-500 text-white text-xs font-black shadow">
                      ₹{item.rewardAmount} Reward
                    </div>
                  )}
                  <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-bold">
                    Lost {formatDate(item.lostDate)}
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black text-foreground">{item.petName}</h3>
                    <span className="text-xs font-bold text-muted-foreground">{item.breed}</span>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Color: <span className="text-foreground font-bold">{item.color}</span> • Gender: {item.gender}
                  </p>

                  <div className="flex items-start gap-1.5 text-xs text-foreground/80 pt-1">
                    <MapPin className="w-3.5 h-3.5 text-primary-500 flex-shrink-0 mt-0.5" />
                    <span className="line-clamp-2">Last seen: {item.lastSeenLocation?.address}</span>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                <a
                  href={`tel:${item.ownerPhone}`}
                  className="w-full py-2.5 rounded-xl bg-peach-100 text-primary-800 font-bold text-xs hover:bg-peach-200 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Contact Owner ({item.ownerPhone})</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Report Modal */}
      {isReporting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-cream-200 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-foreground">Report Missing Companion</h3>
              <button
                onClick={() => setIsReporting(false)}
                className="text-muted-foreground hover:text-foreground font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleReportMissing} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">Pet Name *</label>
                  <input
                    type="text"
                    required
                    value={petName}
                    onChange={(e) => setPetName(e.target.value)}
                    placeholder="Bruno"
                    className="w-full p-2.5 rounded-xl border border-cream-300 bg-cream-50 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">Species *</label>
                  <select
                    value={species}
                    onChange={(e) => setSpecies(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-cream-300 bg-cream-50 text-xs font-bold"
                  >
                    <option value="Dog">Dog</option>
                    <option value="Cat">Cat</option>
                    <option value="Bird">Bird</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">Color / Pattern *</label>
                  <input
                    type="text"
                    required
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="Tricolor, Black & Tan"
                    className="w-full p-2.5 rounded-xl border border-cream-300 bg-cream-50 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">Reward Amount (₹)</label>
                  <input
                    type="number"
                    value={reward}
                    onChange={(e) => setReward(e.target.value)}
                    placeholder="5000"
                    className="w-full p-2.5 rounded-xl border border-cream-300 bg-cream-50 text-xs"
                  />
                </div>
              </div>

              <div>
                <LocationPicker
                  initialCoordinates={coords}
                  onLocationSelect={(c, addr) => {
                    setCoords(c);
                    setAddress(addr);
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">Owner Contact Phone *</label>
                  <input
                    type="tel"
                    required
                    value={ownerPhone}
                    onChange={(e) => setOwnerPhone(e.target.value)}
                    placeholder="+91 99000 00000"
                    className="w-full p-2.5 rounded-xl border border-cream-300 bg-cream-50 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">Owner Name</label>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="Akash"
                    className="w-full p-2.5 rounded-xl border border-cream-300 bg-cream-50 text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsReporting(false)}
                  className="px-4 py-2 rounded-xl bg-cream-200 text-foreground font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-primary-500 text-white font-bold text-xs shadow hover:bg-primary-600 disabled:opacity-50"
                >
                  {submitting ? "Broadcasting..." : "Broadcast Alert"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
