"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon, Sparkles } from "lucide-react";

export type ThemeMode = "light" | "dark";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export default function ThemeToggle({ className = "", showLabel = true }: ThemeToggleProps) {
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [mounted, setMounted] = useState(false);

  // Initialize from localStorage or prefers-color-scheme on mount
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("pawalert_theme") as ThemeMode | null;
    if (saved === "dark" || saved === "light") {
      applyTheme(saved);
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      applyTheme(prefersDark ? "dark" : "light");
    }

    const handleExternalChange = (e: any) => {
      if (e.detail?.theme) {
        setTheme(e.detail.theme);
      }
    };
    window.addEventListener("pawalert-theme-change", handleExternalChange);
    return () => window.removeEventListener("pawalert-theme-change", handleExternalChange);
  }, []);

  const applyTheme = (newTheme: ThemeMode) => {
    setTheme(newTheme);
    localStorage.setItem("pawalert_theme", newTheme);

    const root = document.documentElement;
    root.setAttribute("data-theme", newTheme);
    if (newTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    window.dispatchEvent(
      new CustomEvent("pawalert-theme-change", { detail: { theme: newTheme } })
    );
  };

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    applyTheme(nextTheme);
  };

  if (!mounted) {
    // Render placeholder to avoid hydration mismatch
    return (
      <div className={`inline-flex items-center gap-1.5 rounded-[16px] border-[2px] border-[#1E1B4B] bg-[#FFF1DC] px-3 py-1.5 opacity-60 ${className}`}>
        <span className="text-xs">☀️</span>
      </div>
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      type="button"
      title={`Switch to ${isDark ? "Storybook Day" : "Twilight Sanctuary"} theme`}
      aria-label={`Toggle theme: currently ${isDark ? "Twilight Sanctuary" : "Storybook Day"}`}
      className={`pixar-btn group relative inline-flex items-center gap-2 rounded-[16px] px-3 py-1.5 text-xs font-display font-bold transition-all ${
        isDark
          ? "border-[#FBBF24] bg-[#1E1B4B] text-[#FFF9F0] shadow-[0_4px_0_#0F0E26] hover:bg-[#2D1B69]"
          : "border-[#1E1B4B] bg-[#FFF1DC] text-[#1E1B4B] shadow-pixar-sm hover:bg-[#FFE8C2]"
      } ${className}`}
    >
      {/* Animated Icon Pill */}
      <div className="relative flex h-5 w-5 items-center justify-center">
        {isDark ? (
          <div className="relative flex items-center justify-center">
            <Moon className="h-4 w-4 text-[#FBBF24] transition-transform duration-300 group-hover:-rotate-12" />
            <Sparkles className="absolute -top-1 -right-1 h-2.5 w-2.5 text-[#FDE68A] animate-pulse" />
          </div>
        ) : (
          <div className="relative flex items-center justify-center">
            <Sun className="h-4 w-4 text-[#FF7A00] transition-transform duration-300 group-hover:rotate-45" />
          </div>
        )}
      </div>

      {/* Text Label */}
      {showLabel && (
        <span className="hidden sm:inline font-display text-[11px] uppercase tracking-wider font-extrabold">
          {isDark ? "🌙 Twilight" : "☀️ Sunlit"}
        </span>
      )}
    </button>
  );
}
