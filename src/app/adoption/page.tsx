"use client";

import React, { useEffect, useState } from "react";
import { Heart, Sparkles, Check, Home, Shield, AlertCircle } from "lucide-react";

export default function AdoptionPortalPage() {
  const [listings, setListings] = useState<any[]>([]);
  const [speciesFilter, setSpeciesFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  // Application Modal state
  const [selectedPet, setSelectedPet] = useState<any | null>(null);
  const [applicantName, setApplicantName] = useState("");
  const [applicantPhone, setApplicantPhone] = useState("");
  const [applicantEmail, setApplicantEmail] = useState("");
  const [address, setAddress] = useState("");
  const [homeType, setHomeType] = useState("APARTMENT");
  const [experience, setExperience] = useState("Committed to loving care and training");
  const [submittingApp, setSubmittingApp] = useState(false);
  const [appSuccess, setAppSuccess] = useState<string | null>(null);

  const loadListings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/adoption/listings");
      const data = await res.json();
      setListings(data.listings || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadListings();
  }, []);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPet) return;

    try {
      setSubmittingApp(true);
      const res = await fetch("/api/adoption/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: selectedPet._id,
          applicantName,
          applicantPhone,
          applicantEmail,
          address,
          homeType,
          petExperienceDetails: experience,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setAppSuccess(data.message || "Adoption application submitted successfully!");
        setSelectedPet(null);
      } else {
        alert(data.error || "Failed to submit application");
      }
    } catch (e) {
      alert("Error submitting application");
    } finally {
      setSubmittingApp(false);
    }
  };

  const filtered = listings.filter((item) => {
    if (speciesFilter === "ALL") return true;
    return item.species?.toLowerCase() === speciesFilter.toLowerCase();
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-black uppercase tracking-wider text-rose-700 bg-rose-100 px-3 py-1 rounded-full border border-rose-200">
          Forever Companions
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
          Adopt a Rescued Animal
        </h1>
        <p className="text-xs sm:text-sm text-foreground/75 leading-relaxed">
          Every animal below was rescued from distressing situations, rehabilitated with medical love, and is now looking for a kind forever home. 100% free of adoption fees.
        </p>

        {/* Filter buttons */}
        <div className="pt-4 flex items-center justify-center gap-2">
          {["ALL", "Dog", "Cat"].map((sp) => (
            <button
              key={sp}
              onClick={() => setSpeciesFilter(sp)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                speciesFilter === sp
                  ? "bg-primary-500 text-white shadow-sm"
                  : "bg-white border border-cream-200 text-foreground hover:bg-cream-100"
              }`}
            >
              {sp === "ALL" ? "All Animals" : sp === "Dog" ? "🐶 Dogs & Puppies" : "🐱 Cats & Kittens"}
            </button>
          ))}
        </div>
      </div>

      {appSuccess && (
        <div className="max-w-xl mx-auto p-4 rounded-2xl bg-mint-50 border border-mint-200 text-mint-800 text-xs font-bold text-center">
          {appSuccess}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs text-muted-foreground font-semibold">
          Finding companions...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-cream-200 max-w-md mx-auto">
          <span className="text-4xl">🐾</span>
          <h3 className="text-base font-black text-foreground mt-3">No companions found</h3>
          <p className="text-xs text-muted-foreground mt-1">Check back soon as new rescues are rehabilitated daily.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((pet) => (
            <div
              key={pet._id}
              className="bg-white rounded-3xl overflow-hidden border border-cream-200 shadow-soft hover:shadow-card hover:-translate-y-1.5 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Photo */}
                <div className="h-60 w-full overflow-hidden relative bg-cream-100">
                  <img
                    src={pet.photos?.[0] || "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=600&q=80"}
                    alt={pet.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-bold">
                    {pet.age} • {pet.gender}
                  </div>
                </div>

                {/* Details */}
                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black text-foreground">{pet.name}</h3>
                    <span className="text-xs font-bold text-primary-600 bg-peach-50 px-2.5 py-0.5 rounded-full border border-peach-200">
                      {pet.breed}
                    </span>
                  </div>

                  <p className="text-xs text-foreground/80 leading-relaxed line-clamp-3">
                    {pet.story}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {pet.personalityTraits?.map((t: string, i: number) => (
                      <span
                        key={i}
                        className="px-2.5 py-0.5 rounded-lg bg-cream-100 text-foreground text-[10px] font-bold"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-cream-100 grid grid-cols-2 gap-2 text-[11px] text-muted-foreground font-semibold">
                    <span>💉 Fully Vaccinated</span>
                    <span>✂️ Sterilized</span>
                    <span>👶 Kid Friendly</span>
                    <span>🐾 Good with Pets</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-6 pt-0">
                <button
                  onClick={() => setSelectedPet(pet)}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-primary-500 to-peach-500 text-white font-black text-xs shadow hover:shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <Heart className="w-4 h-4 fill-white" />
                  <span>Apply to Adopt {pet.name}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Application Modal */}
      {selectedPet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-cream-200 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-full">
                  Adoption Application
                </span>
                <h3 className="text-xl font-black text-foreground mt-1">
                  Adopt {selectedPet.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedPet(null)}
                className="text-muted-foreground hover:text-foreground font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleApply} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground">Your Full Name *</label>
                <input
                  type="text"
                  required
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  placeholder="Rahul Mehta"
                  className="w-full p-2.5 rounded-xl border border-cream-300 bg-cream-50 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">Mobile Phone *</label>
                  <input
                    type="tel"
                    required
                    value={applicantPhone}
                    onChange={(e) => setApplicantPhone(e.target.value)}
                    placeholder="+91 98765 00000"
                    className="w-full p-2.5 rounded-xl border border-cream-300 bg-cream-50 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={applicantEmail}
                    onChange={(e) => setApplicantEmail(e.target.value)}
                    placeholder="rahul@example.com"
                    className="w-full p-2.5 rounded-xl border border-cream-300 bg-cream-50 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground">Home Address & City *</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Apartment #, Street, City"
                  className="w-full p-2.5 rounded-xl border border-cream-300 bg-cream-50 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">Housing Type</label>
                  <select
                    value={homeType}
                    onChange={(e) => setHomeType(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-cream-300 bg-cream-50 text-xs font-bold"
                  >
                    <option value="APARTMENT">Apartment / Flat</option>
                    <option value="INDEPENDENT_HOUSE">Independent House</option>
                    <option value="FARM_HOUSE">Farm House</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">Experience with Pets</label>
                  <input
                    type="text"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-cream-300 bg-cream-50 text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPet(null)}
                  className="px-4 py-2 rounded-xl bg-cream-200 text-foreground font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingApp}
                  className="px-5 py-2 rounded-xl bg-primary-500 text-white font-bold text-xs shadow hover:bg-primary-600 disabled:opacity-50"
                >
                  {submittingApp ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
