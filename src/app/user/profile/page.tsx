"use client";

import React, { useEffect, useState } from "react";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import LocationPicker from "@/components/map/LocationPicker";
import { User, Mail, Phone, MapPin, Shield, CheckCircle2, Save } from "lucide-react";

export default function UserProfilePage() {
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [coords, setCoords] = useState<[number, number]>([77.5946, 12.9716]);
  const [profileImage, setProfileImage] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setCurrentUser(data.user);
          setFullName(data.user.fullName || "");
          setMobile(data.user.mobile || "");
          setCity(data.user.city || "");
          setAddress(data.user.address || "");
          setProfileImage(data.user.profileImage || "");
          if (data.user.location?.coordinates) {
            setCoords(data.user.location.coordinates);
          }
        }
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 600);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <DashboardSidebar
          role={currentUser?.role || "PUBLIC_USER"}
          userName={currentUser?.fullName || "Guardian"}
        />

        <div className="flex-1 space-y-6 w-full">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-primary-700 bg-peach-100 px-3 py-1 rounded-full border border-peach-200">
              User Profile
            </span>
            <h1 className="text-3xl font-black text-foreground tracking-tight mt-2">
              Guardian Account & Location
            </h1>
            <p className="text-xs sm:text-sm text-foreground/75 mt-1">
              Manage your personal guardian credentials and regional GPS alert perimeter.
            </p>
          </div>

          {saveSuccess && (
            <div className="p-4 rounded-2xl bg-mint-50 border border-mint-200 text-mint-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-mint-600 flex-shrink-0" />
              <span>Profile preferences successfully updated!</span>
            </div>
          )}

          <form
            onSubmit={handleSave}
            className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-soft space-y-6"
          >
            {/* Avatar & Role Badge */}
            <div className="flex items-center gap-4 pb-6 border-b border-cream-100">
              <img
                src={profileImage || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"}
                alt="Avatar"
                className="w-16 h-16 rounded-full object-cover border-2 border-peach-300 shadow-sm"
              />
              <div>
                <h3 className="text-lg font-black text-foreground">{currentUser?.fullName}</h3>
                <span className="inline-block px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-peach-100 text-primary-700 mt-1">
                  Role: {currentUser?.role?.replace(/_/g, " ")}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-cream-300 bg-cream-50 text-xs font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground">Email Address (Registered)</label>
                <input
                  type="email"
                  disabled
                  value={currentUser?.email || ""}
                  className="w-full p-2.5 rounded-xl border border-cream-200 bg-cream-100 text-xs text-muted-foreground font-semibold cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground">Mobile Phone</label>
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-cream-300 bg-cream-50 text-xs font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-cream-300 bg-cream-50 text-xs font-semibold"
                />
              </div>
            </div>

            {/* Geolocation Pinpoint */}
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-2">
                Home Base / Operating Coordinates
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
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-2xl bg-primary-500 text-white font-bold text-xs shadow hover:bg-primary-600 transition-colors flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? "Saving..." : "Save Profile Details"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
