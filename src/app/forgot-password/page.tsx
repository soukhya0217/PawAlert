"use client";

import React, { useState } from "react";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white rounded-3xl p-8 border border-cream-200 shadow-soft space-y-6 text-center">
        <span className="text-3xl">🔑</span>
        <h2 className="text-2xl font-black text-foreground">Password Recovery</h2>
        <p className="text-xs text-muted-foreground">
          Enter your registered email and we will dispatch a secure reset link.
        </p>

        {sent ? (
          <div className="p-4 rounded-2xl bg-mint-50 border border-mint-200 text-mint-800 text-xs font-bold space-y-3">
            <CheckCircle2 className="w-6 h-6 text-mint-600 mx-auto" />
            <p>Recovery link dispatched to {email}!</p>
            <a href="/login" className="text-primary-600 font-bold block pt-2">
              Back to Login →
            </a>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
            className="space-y-4"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full p-3 rounded-2xl border border-cream-300 bg-cream-50 text-xs font-medium"
            />
            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-primary-500 text-white font-bold text-xs shadow hover:bg-primary-600 transition-colors"
            >
              Send Reset Link
            </button>
          </form>
        )}

        <div className="pt-2">
          <a href="/login" className="text-xs font-bold text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
          </a>
        </div>
      </div>
    </div>
  );
}
