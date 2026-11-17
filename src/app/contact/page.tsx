"use client";

import React, { useState } from "react";
import { Phone, Mail, MapPin, CheckCircle2, MessageSquare } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-xs font-black uppercase tracking-wider text-primary-700 bg-peach-100 px-3 py-1 rounded-full border border-peach-200">
          24/7 Dispatch Control
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
          Contact POWER ALERT
        </h1>
        <p className="text-xs sm:text-sm text-foreground/75 leading-relaxed">
          For technical support, emergency animal dispatch, partnering shelter enrollment, or media inquiries.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Contact info cards */}
        <div className="space-y-4">
          <div className="p-6 bg-white rounded-3xl border border-cream-200 shadow-soft flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0 animate-pulse">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-wider text-red-600">24/7 Emergency Dispatch Helpline</p>
              <h3 className="text-xl font-black text-foreground mt-0.5">+91 (800) 425-PAWS</h3>
              <p className="text-xs text-muted-foreground mt-1">Available 24 hours a day for immediate trauma response.</p>
            </div>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-cream-200 shadow-soft flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-peach-100 text-primary-600 flex items-center justify-center flex-shrink-0">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-wider text-primary-700">Email Inquiries</p>
              <h3 className="text-base font-black text-foreground mt-0.5">dispatch@poweralert.org</h3>
              <p className="text-xs text-muted-foreground mt-1">For general questions and partner onboarding.</p>
            </div>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-cream-200 shadow-soft flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-mint-100 text-mint-600 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-wider text-mint-800">Regional Headquarters</p>
              <h3 className="text-base font-black text-foreground mt-0.5">Bangalore, Karnataka</h3>
              <p className="text-xs text-muted-foreground mt-1">Operating across Bangalore urban and rural districts.</p>
            </div>
          </div>
        </div>

        {/* Message Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-soft">
          {submitted ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-mint-100 text-mint-600 flex items-center justify-center text-3xl mx-auto">
                ✓
              </div>
              <h3 className="text-lg font-black text-foreground">Message Dispatched</h3>
              <p className="text-xs text-muted-foreground">Our team will get back to you shortly.</p>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSubmitted(true);
              }}
              className="space-y-4"
            >
              <h3 className="text-lg font-black text-foreground">Send an Inquiry</h3>

              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Your Name"
                  className="w-full p-2.5 rounded-xl border border-cream-300 bg-cream-50 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="your@email.com"
                  className="w-full p-2.5 rounded-xl border border-cream-300 bg-cream-50 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground">Message</label>
                <textarea
                  rows={4}
                  required
                  placeholder="How can we help or collaborate?"
                  className="w-full p-2.5 rounded-xl border border-cream-300 bg-cream-50 text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-primary-500 text-white font-bold text-xs shadow hover:bg-primary-600 transition-colors"
              >
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
