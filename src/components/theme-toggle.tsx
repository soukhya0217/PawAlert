"use client";

import React, { useEffect } from "react";

/**
 * ThemeToggle - Permanently resets any lingering dark theme in localStorage or HTML root,
 * ensuring PawAlert consistently renders in the warm Sunlit Cream light theme.
 */
export default function ThemeToggle() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("pawalert_theme");
        document.documentElement.classList.remove("dark");
        document.documentElement.removeAttribute("data-theme");
        if (document.body) {
          document.body.classList.remove("dark");
          document.body.removeAttribute("data-theme");
        }
      } catch (e) {}
    }
  }, []);

  return null;
}
