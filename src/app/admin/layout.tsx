import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { ShieldAlert, ArrowLeft, Home, UserCheck } from "lucide-react";

export const metadata = {
  title: "Admin Command Center | PawAlert",
  description: "Restricted administrative access for verified PawAlert Field Commanders.",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  // 1. If not logged in at all, redirect to login page with callback
  if (!user) {
    redirect("/login?redirect=/admin&denied=1");
  }

  // 2. Strict Role Check: Only SUPER_ADMIN, ADMIN, and NGO_ADMIN are authorized
  const isAuthorizedAdmin =
    user.role === "SUPER_ADMIN" ||
    user.role === "ADMIN" ||
    user.role === "NGO_ADMIN";

  if (!isAuthorizedAdmin) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-[#FFF9F0]">
        <div className="max-w-md w-full pixar-card p-8 bg-[#FFF9F0] border-[3px] border-[#EF4444] rounded-[28px] text-center space-y-5 shadow-pixar animate-in fade-in zoom-in-95 duration-300">
          <div className="w-16 h-16 rounded-[22px] border-[3px] border-[#EF4444] bg-[#EF4444]/15 text-[#EF4444] flex items-center justify-center mx-auto text-3xl shadow-pixar-sm">
            🛡️
          </div>

          <div className="space-y-2">
            <span className="inline-block rounded-[12px] bg-[#EF4444] text-white px-3 py-1 font-mono text-[11px] font-black uppercase tracking-wider shadow-sm">
              403 • Administrator Access Only
            </span>
            <h1 className="font-display text-2xl font-black text-[#1E1B4B]">
              Restricted Area
            </h1>
            <p className="font-sans text-xs text-[#1E1B4B]/75 leading-relaxed">
              You are signed in as <strong>{user.fullName}</strong>. This account does not possess administrator privileges. Only authorized PawAlert platform commanders may view and manage the Command Center.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <a
              href="/user/dashboard"
              className="pixar-btn w-full bg-[#1E1B4B] text-white py-2.5 text-xs font-bold rounded-[16px] shadow-pixar-sm inline-flex items-center justify-center gap-1.5"
            >
              <UserCheck className="w-4 h-4 text-[#FFB703]" />
              <span>Go to Guardian Dashboard</span>
            </a>
            <a
              href="/"
              className="pixar-btn w-full bg-[#FFF1DC] text-[#1E1B4B] py-2.5 text-xs font-bold rounded-[16px] border-[2px] border-[#1E1B4B] shadow-pixar-sm inline-flex items-center justify-center gap-1.5"
            >
              <Home className="w-4 h-4 text-[#FF7A00]" />
              <span>Return to Homepage</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  // 3. User is verified Administrator
  return <>{children}</>;
}
