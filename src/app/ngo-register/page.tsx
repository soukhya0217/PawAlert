"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import LocationPicker from "@/components/map/LocationPicker";
import { Building, Phone, Mail, FileText, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";

export default function NGORegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [coords, setCoords] = useState<[number, number]>([77.5946, 12.9716]);
  const [address, setAddress] = useState("Bangalore");
  const [city, setCity] = useState("Bangalore");
  const [shelterCapacity, setShelterCapacity] = useState(50);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    try {
      setLoading(true);
      const res = await fetch("/api/ngos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          registrationNumber,
          email,
          phone,
          website,
          coordinates: coords,
          address,
          city,
          shelterCapacity: Number(shelterCapacity),
          description,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
      } else {
        if (res.status === 401) {
          router.push("/login?redirect=/ngo-register");
        } else {
          setErrorMsg(data.error || "Failed to register NGO");
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-20 h-20 bg-lavender-100 rounded-3xl mx-auto flex items-center justify-center text-3xl shadow-sm animate-bounce">
          🏢
        </div>
        <h2 className="text-3xl font-black text-foreground">NGO Registration Approved!</h2>
        <p className="text-xs text-muted-foreground max-w-md mx-auto">
          Your organization is now plugged into the regional rescue grid. You have been granted NGO_ADMIN coordination privileges.
        </p>
        <div className="pt-4">
          <a
            href="/ngo/dashboard"
            className="px-8 py-3.5 rounded-2xl bg-primary-500 text-white font-bold text-xs shadow hover:bg-primary-600 transition-colors inline-block"
          >
            Open NGO Operations Console →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center max-w-xl mx-auto mb-10">
        <span className="text-xs font-black uppercase tracking-wider text-lavender-800 bg-lavender-100 px-3 py-1 rounded-full border border-lavender-200">
          🏢 Organizational Partnering
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight mt-2">
          Register Animal Shelter / NGO
        </h1>
        <p className="text-xs sm:text-sm text-foreground/75 mt-1">
          Coordinate local rescue fleets, manage verified shelter capacities, and dispatch field volunteers.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl p-6 sm:p-10 border border-cream-200 shadow-soft space-y-6"
      >
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-bold text-muted-foreground">Official NGO / Trust Name *</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Paws & Care Animal Rescue Trust"
            className="w-full p-2.5 rounded-xl border border-cream-300 bg-cream-50 text-xs font-bold"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground">Registration Number *</label>
            <input
              type="text"
              required
              value={registrationNumber}
              onChange={(e) => setRegistrationNumber(e.target.value)}
              placeholder="TRUST-BLR-2023-9988"
              className="w-full p-2.5 rounded-xl border border-cream-300 bg-cream-50 text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground">Official Email *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contact@pawsandcare.org"
              className="w-full p-2.5 rounded-xl border border-cream-300 bg-cream-50 text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground">Helpline / Phone *</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 80 2345 6789"
              className="w-full p-2.5 rounded-xl border border-cream-300 bg-cream-50 text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground">Shelter Inpatient Capacity</label>
            <input
              type="number"
              value={shelterCapacity}
              onChange={(e) => setShelterCapacity(Number(e.target.value))}
              placeholder="50"
              className="w-full p-2.5 rounded-xl border border-cream-300 bg-cream-50 text-xs"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-muted-foreground mb-2">Shelter Headquarters Location *</label>
          <LocationPicker
            initialCoordinates={coords}
            onLocationSelect={(c, addr) => {
              setCoords(c);
              setAddress(addr);
            }}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-muted-foreground">Mission Statement & Fleet Details</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="We operate 2 mobile ambulances and a 50-dog quarantine trauma center..."
            className="w-full p-2.5 rounded-xl border border-cream-300 bg-cream-50 text-xs"
          />
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-primary-500 to-peach-500 text-white font-black text-sm shadow hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <span>{loading ? "Registering..." : "Enroll NGO & Shelter"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
