"use client";

import React, { useState } from "react";
import { Mail, ArrowLeft, CheckCircle2, Sparkles, AlertCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email) {
      setErrorMsg("Please enter your registered email address.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok) {
        setSent(true);
        if (data.previewResetUrl) {
          setPreviewUrl(data.previewResetUrl);
        }
      } else {
        setErrorMsg(data.error || "Failed to dispatch recovery link.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-[22px] border-[3px] border-[#1E1B4B] bg-[#FFB703] flex items-center justify-center text-3xl mx-auto shadow-pixar mb-3">
          🔑
        </div>
        <h1 className="text-3xl font-black font-display text-[#1E1B4B] tracking-tight">
          Password Recovery
        </h1>
        <p className="text-xs text-[#1E1B4B]/70 mt-1 font-sans">
          Enter your registered email and our dispatch mailer will send a secure reset link.
        </p>
      </div>

      <div className="pixar-card p-6 sm:p-8 space-y-6">
        {errorMsg && (
          <div className="p-3.5 rounded-[16px] border-[2px] border-[#EF4444] bg-[#EF4444]/10 text-[#EF4444] text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {sent ? (
          <div className="p-5 rounded-[20px] bg-[#10B981]/10 border-[2px] border-[#10B981] text-[#1E1B4B] text-xs font-medium space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-[#10B981] text-white flex items-center justify-center mx-auto shadow-pixar-sm">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="font-display text-sm font-bold text-[#1E1B4B]">
                Recovery Instructions Dispatched!
              </p>
              <p className="text-[11px] text-[#1E1B4B]/75 mt-1 font-sans">
                Check your inbox at <strong className="text-[#FF7A00]">{email}</strong> for the secure password reset link.
              </p>
            </div>

            {previewUrl && (
              <div className="p-3 rounded-[14px] bg-[#FFF9F0] border-[2px] border-[#1E1B4B] text-left">
                <span className="font-mono text-[9px] font-bold text-[#FF7A00] block uppercase mb-1">
                  ⚡ Dev Mode Simulation Link:
                </span>
                <a
                  href={previewUrl}
                  className="font-mono text-[10px] text-[#1D4ED8] underline break-all block"
                >
                  {previewUrl}
                </a>
              </div>
            )}

            <div className="pt-2">
              <a
                href="/login"
                className="pixar-btn inline-flex items-center justify-center gap-1.5 w-full bg-[#1E1B4B] text-white py-2.5 text-xs font-bold shadow-pixar-sm"
              >
                <span>Back to Sign In</span>
              </a>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="font-display text-xs font-bold text-[#1E1B4B] block mb-1">
                Registered Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#1E1B4B]/50 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rescuer@pawalert.org"
                  className="w-full pl-10 pr-4 py-2.5 rounded-[16px] border-[2px] border-[#1E1B4B] bg-[#FFF9F0] text-xs font-sans text-[#1E1B4B] focus:outline-none focus:ring-2 focus:ring-[#FF7A00]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="pixar-btn w-full flex items-center justify-center gap-2 rounded-[18px] bg-gradient-to-r from-[#FF7A00] to-[#F97316] py-3 text-sm font-bold text-white shadow-pixar disabled:opacity-50 mt-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? "Dispatching Reset Link..." : "Send Password Reset Link"}</span>
            </button>
          </form>
        )}

        <div className="pt-4 border-t-[2px] border-[#1E1B4B]/10 text-center">
          <a
            href="/login"
            className="text-xs font-display font-bold text-[#1E1B4B]/70 hover:text-[#FF7A00] inline-flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Sign In</span>
          </a>
        </div>
      </div>
    </div>
  );
}
