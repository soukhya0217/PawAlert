"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import LocationPicker from "@/components/map/LocationPicker";
import {
  AlertTriangle,
  Camera,
  Upload,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Shield,
  Info,
  Phone,
  User,
  Mail,
} from "lucide-react";

const ANIMAL_CATEGORIES = [
  { label: "Injured Dog", emoji: "🐕", value: "Injured Dog" },
  { label: "Injured Cat", emoji: "🐈", value: "Injured Cat" },
  { label: "Injured Bird", emoji: "🕊️", value: "Injured Bird" },
  { label: "Road Accident Case", emoji: "🚗", value: "Road Accident" },
  { label: "Abandoned Puppy/Kitten", emoji: "📦", value: "Abandoned Animal" },
  { label: "Trapped / Ensnared Animal", emoji: "🪤", value: "Trapped Animal" },
  { label: "Sick / Maggot Wound Case", emoji: "🩺", value: "Sick Animal" },
  { label: "Starving Community Animal", emoji: "🥣", value: "Starving Animal" },
  { label: "Animal Cruelty / Abuse", emoji: "⚖️", value: "Animal Abuse" },
  { label: "Stray Cattle / Cow in Distress", emoji: "🐄", value: "Stray Cattle" },
  { label: "Wildlife Emergency", emoji: "🦉", value: "Wildlife Emergency" },
  { label: "Other Incident", emoji: "🐾", value: "Other" },
];

export default function ReportAnimalPage() {
  const router = useRouter();

  const [category, setCategory] = useState("Injured Dog");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"CRITICAL" | "HIGH" | "MEDIUM" | "LOW">("HIGH");
  const [coords, setCoords] = useState<[number, number]>([77.5946, 12.9716]);
  const [address, setAddress] = useState("Bangalore City Center");
  const [landmark, setLandmark] = useState("");
  const [city, setCity] = useState("Bangalore");
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [reporterName, setReporterName] = useState("");
  const [reporterPhone, setReporterPhone] = useState("");
  const [reporterEmail, setReporterEmail] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [createdIncident, setCreatedIncident] = useState<any | null>(null);
  const [duplicates, setDuplicates] = useState<any[]>([]);

  // Sample quick images for convenience or paste URL
  const sampleImages = [
    "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80",
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const chosenImage = imagePreview || imageUrl || sampleImages[0];

    if (!category || !description || !address) {
      setErrorMsg("Please fill out animal category, condition description, and location.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          animalCategory: category,
          conditionDescription: description,
          priority,
          coordinates: coords,
          address,
          landmark,
          city,
          images: [chosenImage],
          videoUrl,
          reporterName: reporterName || "Anonymous Guardian",
          reporterPhone: reporterPhone || "Not provided",
          reporterEmail,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setCreatedIncident(data.incident);
        setDuplicates(data.possibleDuplicates || []);
      } else {
        setErrorMsg(data.error || "Failed to submit report. Please try again.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected network error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  if (createdIncident) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 bg-mint-100 rounded-3xl mx-auto flex items-center justify-center text-3xl shadow-sm mb-6 animate-bounce">
          🎉
        </div>
        <span className="text-xs font-black uppercase tracking-wider text-mint-800 bg-mint-100 px-3 py-1 rounded-full border border-mint-200">
          Emergency Dispatched
        </span>
        <h2 className="text-3xl font-black text-foreground mt-3 tracking-tight">
          Alert Registered: {createdIncident.incidentId}
        </h2>
        <p className="text-sm text-foreground/80 mt-2 max-w-lg mx-auto">
          Thank you for taking action! Your distress report has been entered into the central accountability grid and broadcasted to verified volunteers in the {createdIncident.location?.city} sector.
        </p>

        {duplicates.length > 0 && (
          <div className="my-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-left max-w-lg mx-auto">
            <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
              <Info className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>Notice: Similar incident recently reported nearby</span>
            </div>
            <p className="text-xs text-amber-900 mt-1">
              Case <strong>{duplicates[0].incidentId}</strong> is {duplicates[0].distanceMeters}m away (Status: {duplicates[0].status}). Our dispatch team will merge updates if applicable.
            </p>
          </div>
        )}

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={`/user/incident/${createdIncident._id}`}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-primary-500 to-peach-500 text-white font-bold text-sm shadow-md shadow-primary-500/25 hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <span>Track Live Rescue Progress</span>
            <ArrowRight className="w-4 h-4" />
          </a>

          <a
            href="/map"
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white border border-cream-300 font-bold text-sm text-foreground hover:bg-peach-50 transition-colors"
          >
            View on Live Map
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center max-w-xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-black uppercase tracking-wider mb-2 border border-red-200">
          <AlertTriangle className="w-3.5 h-3.5" /> Emergency Animal Intake
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
          Report an Animal in Distress
        </h1>
        <p className="text-xs sm:text-sm text-foreground/75 mt-2">
          Your report immediately triggers a geographical alert to nearby verified animal rescuers and partnered veterinary clinics.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl p-6 sm:p-10 border border-cream-200 shadow-soft space-y-8"
      >
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 1. Category Selection */}
        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground mb-3">
            1. Select Animal Incident Category *
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {ANIMAL_CATEGORIES.map((cat) => {
              const isSelected = category === cat.value;
              return (
                <button
                  type="button"
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-2.5 ${
                    isSelected
                      ? "bg-peach-100/80 border-primary-500 text-primary-950 shadow-sm ring-2 ring-primary-500/20 font-black"
                      : "bg-cream-50/60 border-cream-200 text-foreground/80 hover:bg-cream-100 font-bold"
                  }`}
                >
                  <span className="text-xl">{cat.emoji}</span>
                  <span className="text-xs leading-tight">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Photo / Evidence Upload */}
        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground mb-3">
            2. Animal Photograph & Visual Evidence *
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* File Upload Box */}
            <div className="border-2 border-dashed border-cream-300 rounded-2xl p-6 text-center hover:border-primary-400 transition-colors bg-cream-50/40 flex flex-col items-center justify-center">
              <Camera className="w-8 h-8 text-primary-500 mb-2" />
              <p className="text-xs font-bold text-foreground">Upload from Device / Take Photo</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">PNG, JPG, or WEBP up to 10MB</p>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="mt-3 block w-full text-xs text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-peach-100 file:text-primary-700 hover:file:bg-peach-200 cursor-pointer"
              />
            </div>

            {/* Image Preview / URL Option */}
            <div className="space-y-2">
              {imagePreview ? (
                <div className="relative h-40 rounded-2xl overflow-hidden border border-cream-300">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setImageUrl("");
                    }}
                    className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white text-xs font-bold px-2"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200 space-y-2">
                  <p className="text-xs font-bold text-foreground">Or select sample image for demo:</p>
                  <div className="flex gap-2">
                    {sampleImages.map((src, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setImagePreview(src);
                          setImageUrl(src);
                        }}
                        className="w-16 h-16 rounded-xl overflow-hidden border-2 border-cream-300 hover:border-primary-500 flex-shrink-0"
                      >
                        <img src={src} alt="Sample" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3. Condition Description & Priority */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-2">
            <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground">
              3. Condition & Visible Injury Details *
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="E.g., Hit by car on rear leg, bleeding profusely, unable to stand, whined in distress. Needs urgent ambulance splint..."
              className="w-full p-3.5 rounded-2xl border border-cream-300 bg-cream-50/50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground">
              Emergency Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="w-full p-3.5 rounded-2xl border border-cream-300 bg-cream-50/50 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            >
              <option value="CRITICAL">🚨 Critical (SLA: 45m)</option>
              <option value="HIGH">⚠️ High (SLA: 2h)</option>
              <option value="MEDIUM">Medium (SLA: 6h)</option>
              <option value="LOW">Low (SLA: 24h)</option>
            </select>
            <p className="text-[11px] text-muted-foreground leading-tight pt-1">
              AI Triage will automatically verify this priority to ensure genuine trauma cases receive first response.
            </p>
          </div>
        </div>

        {/* 4. Location Pinpointing */}
        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground mb-3">
            4. Incident Geolocation & Nearby Landmark *
          </label>
          <LocationPicker
            initialCoordinates={coords}
            onLocationSelect={(newCoords, newAddr) => {
              setCoords(newCoords);
              setAddress(newAddr);
            }}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
            <input
              type="text"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              placeholder="Nearby Landmark (e.g. Opposite Blue Tokai / Metro Pillar 124)"
              className="p-3 rounded-xl border border-cream-300 bg-cream-50/50 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City (e.g. Bangalore)"
              className="p-3 rounded-xl border border-cream-300 bg-cream-50/50 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* 5. Reporter Contact Details */}
        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground mb-3">
            5. Reporter Contact Details (Kept Confidential)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="relative">
              <User className="w-4 h-4 text-muted-foreground absolute left-3 top-3.5" />
              <input
                type="text"
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                placeholder="Your Full Name"
                className="w-full pl-9 pr-3 py-3 rounded-xl border border-cream-300 bg-cream-50/50 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>

            <div className="relative">
              <Phone className="w-4 h-4 text-muted-foreground absolute left-3 top-3.5" />
              <input
                type="tel"
                value={reporterPhone}
                onChange={(e) => setReporterPhone(e.target.value)}
                placeholder="Mobile Number"
                className="w-full pl-9 pr-3 py-3 rounded-xl border border-cream-300 bg-cream-50/50 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>

            <div className="relative">
              <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-3.5" />
              <input
                type="email"
                value={reporterEmail}
                onChange={(e) => setReporterEmail(e.target.value)}
                placeholder="Email Address (for live updates)"
                className="w-full pl-9 pr-3 py-3 rounded-xl border border-cream-300 bg-cream-50/50 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-cream-200 flex items-center justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-red-500 via-primary-500 to-rose-600 text-white font-black text-sm shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/35 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <AlertTriangle className="w-4 h-4 text-white" />
            <span>{submitting ? "Broadcasting Emergency..." : "Submit Distress Report"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
