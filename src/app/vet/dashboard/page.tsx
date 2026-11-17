"use client";

import React, { useEffect, useState } from "react";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import {
  Stethoscope,
  PawPrint,
  Clock,
  Plus,
  CheckCircle2,
  FileText,
  AlertCircle,
  Heart,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function VetDashboardPage() {
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Record state
  const [isRecording, setIsRecording] = useState(false);
  const [diagnosis, setDiagnosis] = useState("");
  const [clinicName, setClinicName] = useState("Heal & Paws Specialty Veterinary Care");
  const [medName, setMedName] = useState("");
  const [dosage, setDosage] = useState("");
  const [treatmentProgress, setTreatmentProgress] = useState("IMPROVING");
  const [generalNotes, setGeneralNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadVetData = async () => {
    try {
      setLoading(true);
      const meRes = await fetch("/api/auth/me");
      const meData = await meRes.json();
      setCurrentUser(meData.user);

      const recRes = await fetch("/api/medical");
      const recData = await recRes.json();
      setRecords(recData.records || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVetData();
  }, []);

  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await fetch("/api/medical", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clinicName,
          diagnosis,
          treatmentProgress,
          generalNotes,
          prescriptions: medName ? [{ medicineName: medName, dosage, frequency: "Twice daily", durationDays: 5 }] : [],
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setIsRecording(false);
        setDiagnosis("");
        setMedName("");
        loadVetData();
      } else {
        alert(data.error || "Failed to save record");
      }
    } catch (e) {
      alert("Error saving record");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <DashboardSidebar
          role={currentUser?.role || "VETERINARIAN"}
          userName={currentUser?.fullName || "Veterinarian"}
        />

        <div className="flex-1 space-y-8 w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-mint-100 via-cream-50 to-white p-8 rounded-3xl border border-mint-200/80 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-mint-800 bg-mint-200/70 px-3 py-1 rounded-full">
                🩺 Clinical Trauma & Rehabilitation
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-foreground mt-2">
                Veterinary Medical Console
              </h1>
              <p className="text-xs sm:text-sm text-foreground/75 mt-1">
                Clinical records, trauma surgeries, prescription logs, and post-rescue recovery tracking.
              </p>
            </div>

            <button
              onClick={() => setIsRecording(true)}
              className="px-5 py-3 rounded-2xl bg-mint-600 text-white font-black text-xs shadow-md hover:bg-mint-700 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Record New Treatment</span>
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-soft">
              <span className="text-2xl">🩺</span>
              <p className="text-3xl font-black text-mint-600 mt-2">{records.length}</p>
              <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground mt-1">
                Total Medical Files
              </h3>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-soft">
              <span className="text-2xl">🐾</span>
              <p className="text-3xl font-black text-primary-600 mt-2">
                {records.filter((r) => r.treatmentProgress === "IMPROVING").length}
              </p>
              <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground mt-1">
                Patients Improving
              </h3>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-soft">
              <span className="text-2xl">💊</span>
              <p className="text-3xl font-black text-lavender-600 mt-2">100%</p>
              <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground mt-1">
                Sterilization & Vaccine Protocol
              </h3>
            </div>
          </div>

          {/* Records Table */}
          <div className="bg-white rounded-3xl p-6 border border-cream-200 shadow-soft space-y-4">
            <h3 className="text-base font-black text-foreground flex items-center gap-2">
              <span>📋</span> Recent Clinical Examinations & Treatment Plans
            </h3>

            {loading ? (
              <div className="py-12 text-center text-xs text-muted-foreground">Loading medical records...</div>
            ) : records.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted-foreground">
                No medical records logged yet.
              </div>
            ) : (
              <div className="space-y-3">
                {records.map((rec) => (
                  <div
                    key={rec._id}
                    className="p-5 rounded-2xl bg-cream-50/70 border border-cream-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground text-sm">
                          {rec.animalId?.name || "Rescued Patient"}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-mint-100 text-mint-800">
                          {rec.treatmentProgress}
                        </span>
                      </div>
                      <p className="text-foreground/90 font-medium">{rec.diagnosis}</p>
                      <p className="text-muted-foreground text-[11px]">
                        Clinic: {rec.clinicName} • Attending: Dr. {rec.vetId?.fullName || "Staff Vet"}
                      </p>

                      {rec.prescriptions && rec.prescriptions.length > 0 && (
                        <div className="flex gap-2 pt-1">
                          {rec.prescriptions.map((p: any, i: number) => (
                            <span key={i} className="px-2 py-0.5 bg-white rounded-lg border border-cream-300 text-[10px] font-bold">
                              💊 {p.medicineName} ({p.dosage})
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <span className="text-muted-foreground font-semibold flex-shrink-0">
                      {formatDate(rec.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Medical Record Modal */}
      {isRecording && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-cream-200 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-foreground">Record Clinical Treatment</h3>
              <button
                onClick={() => setIsRecording(false)}
                className="text-muted-foreground hover:text-foreground font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRecord} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground">Clinic / Center Name *</label>
                <input
                  type="text"
                  required
                  value={clinicName}
                  onChange={(e) => setClinicName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-cream-300 bg-cream-50 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground">Primary Diagnosis & Findings *</label>
                <textarea
                  rows={3}
                  required
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="E.g. Compound fracture of distal tibia, wound contaminated, administered local block..."
                  className="w-full p-2.5 rounded-xl border border-cream-300 bg-cream-50 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">Medicine Prescribed</label>
                  <input
                    type="text"
                    value={medName}
                    onChange={(e) => setMedName(e.target.value)}
                    placeholder="Amoxicillin 250mg"
                    className="w-full p-2.5 rounded-xl border border-cream-300 bg-cream-50 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">Dosage / Frequency</label>
                  <input
                    type="text"
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    placeholder="1 tablet BD x 5 days"
                    className="w-full p-2.5 rounded-xl border border-cream-300 bg-cream-50 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground">Recovery Outlook</label>
                <select
                  value={treatmentProgress}
                  onChange={(e) => setTreatmentProgress(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-cream-300 bg-cream-50 text-xs font-bold"
                >
                  <option value="IMPROVING">Improving - Good Prognosis</option>
                  <option value="STABLE">Stable - Monitoring</option>
                  <option value="CRITICAL">Critical - Intensive Care</option>
                  <option value="FULLY_RECOVERED">Fully Recovered</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRecording(false)}
                  className="px-4 py-2 rounded-xl bg-cream-200 text-foreground font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-mint-600 text-white font-bold text-xs shadow hover:bg-mint-700 disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save Medical Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
