"use client";

import React, { useEffect, useState } from "react";
import { Heart, Sparkles, Shield, CheckCircle2, FileText, Lock, ArrowRight } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function DonatePage() {
  const [amount, setAmount] = useState<number>(1000);
  const [customAmount, setCustomAmount] = useState("");
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [campaign, setCampaign] = useState("EMERGENCY_MEDICAL");

  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<any | null>(null);
  const [recentDonations, setRecentDonations] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({ totalAmount: 0, totalDonors: 0 });

  const loadDonationStats = async () => {
    try {
      const res = await fetch("/api/donations");
      const data = await res.json();
      setRecentDonations(data.donations || []);
      if (data.summary) setSummary(data.summary);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadDonationStats();
  }, []);

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = customAmount ? parseFloat(customAmount) : amount;

    if (!finalAmount || finalAmount <= 0) {
      alert("Please choose a valid contribution amount.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: finalAmount,
          donorName: donorName || "Compassionate Friend",
          donorEmail: donorEmail || "friend@poweralert.org",
          donorPhone,
          panNumber,
          isAnonymous,
          category: campaign,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setReceipt(data.donation);
        loadDonationStats();
      } else {
        alert(data.error || "Failed to process donation");
      }
    } catch (e) {
      alert("Error processing gift");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-black uppercase tracking-wider text-mint-800 bg-mint-100 px-3 py-1 rounded-full border border-mint-200">
          💖 100% Tax Deductible (80G)
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight mt-1">
          Fuel Emergency Animal Rescues
        </h1>
        <p className="text-xs sm:text-sm text-foreground/75 leading-relaxed">
          Every rupee goes directly toward emergency trauma splints, veterinary surgeries, critical antibiotics, ambulance fuel, and daily community meals.
        </p>
      </div>

      {receipt ? (
        <div className="max-w-xl mx-auto bg-white rounded-3xl p-8 border border-cream-200 shadow-soft text-center space-y-6 animate-in fade-in">
          <div className="w-16 h-16 rounded-full bg-mint-100 mx-auto flex items-center justify-center text-3xl">
            🎉
          </div>
          <h2 className="text-2xl font-black text-foreground">
            Thank You, {receipt.donorName}!
          </h2>
          <p className="text-xs text-muted-foreground">
            Your gift of <strong>₹{receipt.amount}</strong> is already allocated to emergency trauma cases. An official 80G tax receipt has been sent to <strong>{receipt.donorEmail}</strong>.
          </p>

          <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200 text-left text-xs space-y-1.5 font-medium">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Receipt Number:</span>
              <span className="font-bold text-foreground">{receipt.receiptNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment ID:</span>
              <span className="font-bold text-foreground">{receipt.paymentId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date:</span>
              <span className="font-bold text-foreground">{formatDate(receipt.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax Benefit:</span>
              <span className="font-bold text-mint-700">Eligible under Section 80G</span>
            </div>
          </div>

          <button
            onClick={() => setReceipt(null)}
            className="px-6 py-2.5 rounded-2xl bg-primary-500 text-white font-bold text-xs shadow hover:bg-primary-600 transition-colors"
          >
            Make Another Contribution
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Donation Form */}
          <form
            onSubmit={handleDonate}
            className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-soft space-y-6"
          >
            {/* Campaign Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground">
                1. Select Rescue Campaign
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                {[
                  { id: "EMERGENCY_MEDICAL", label: "Trauma Surgery Fund", emoji: "🩺" },
                  { id: "FEEDING_DRIVE", label: "Street Feeding Meals", emoji: "🥣" },
                  { id: "SHELTER_MAINTENANCE", label: "Sanctuary Maintenance", emoji: "🏡" },
                  { id: "AMBULANCE_FUEL", label: "Ambulance Fuel & Fleet", emoji: "🚑" },
                ].map((camp) => (
                  <button
                    type="button"
                    key={camp.id}
                    onClick={() => setCampaign(camp.id)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      campaign === camp.id
                        ? "bg-peach-100 border-primary-500 text-primary-950 ring-2 ring-primary-500/20"
                        : "bg-cream-50/50 border-cream-200 hover:bg-cream-100"
                    }`}
                  >
                    <span>{camp.emoji}</span> {camp.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground">
                2. Select Amount (INR)
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[500, 1000, 2500, 5000].map((amt) => (
                  <button
                    type="button"
                    key={amt}
                    onClick={() => {
                      setAmount(amt);
                      setCustomAmount("");
                    }}
                    className={`py-3 rounded-2xl text-xs font-black transition-all ${
                      amount === amt && !customAmount
                        ? "bg-primary-500 text-white shadow-md shadow-primary-500/30"
                        : "bg-cream-50 border border-cream-200 text-foreground hover:bg-cream-100"
                    }`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>

              <div className="pt-2">
                <input
                  type="number"
                  placeholder="Or enter custom amount in ₹"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setAmount(0);
                  }}
                  className="w-full p-3 rounded-2xl border border-cream-300 bg-cream-50/50 text-xs font-bold"
                />
              </div>
            </div>

            {/* Donor Information */}
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground">
                3. Donor & Tax Receipt Details
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Full Name (for 80G Receipt)"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  className="p-3 rounded-2xl border border-cream-300 bg-cream-50/50 text-xs font-medium"
                />
                <input
                  type="email"
                  required
                  placeholder="Email Address"
                  value={donorEmail}
                  onChange={(e) => setDonorEmail(e.target.value)}
                  className="p-3 rounded-2xl border border-cream-300 bg-cream-50/50 text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="tel"
                  placeholder="Mobile Phone"
                  value={donorPhone}
                  onChange={(e) => setDonorPhone(e.target.value)}
                  className="p-3 rounded-2xl border border-cream-300 bg-cream-50/50 text-xs font-medium"
                />
                <input
                  type="text"
                  placeholder="PAN Card (Optional, for 80G)"
                  value={panNumber}
                  onChange={(e) => setPanNumber(e.target.value)}
                  className="p-3 rounded-2xl border border-cream-300 bg-cream-50/50 text-xs font-medium uppercase"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary-500 to-peach-500 text-white font-black text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Heart className="w-4 h-4 fill-white" />
              <span>{submitting ? "Processing Gift..." : `Contribute ₹${customAmount || amount} to Rescue Fund`}</span>
            </button>
          </form>

          {/* Right Column: Transparency Statistics */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-cream-200 shadow-soft space-y-4">
              <h3 className="text-base font-black text-foreground flex items-center gap-2">
                <Shield className="w-4 h-4 text-mint-600" /> Financial Transparency
              </h3>

              <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200">
                <p className="text-xs text-muted-foreground font-semibold">Total Community Fund Raised</p>
                <p className="text-3xl font-black text-foreground mt-1">₹{summary.totalAmount.toLocaleString()}</p>
                <p className="text-[11px] text-mint-700 font-bold mt-1">
                  100% of donations deployed for medicines, food and surgeries
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Recent Contributions
                </p>
                {recentDonations.slice(0, 4).map((d) => (
                  <div key={d._id} className="flex items-center justify-between text-xs py-1.5 border-b border-cream-100">
                    <div>
                      <p className="font-bold text-foreground">{d.donorName}</p>
                      <p className="text-[11px] text-muted-foreground">{d.campaignTitle}</p>
                    </div>
                    <span className="font-black text-primary-600">₹{d.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
