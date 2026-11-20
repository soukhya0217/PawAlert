"use client";

import React, { useRef, useState } from "react";
import anime from "animejs";

interface PawMarkProps {
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  className?: string;
  onClick?: () => void;
}

interface SparkleParticle {
  id: number;
  x: number;
  y: number;
  symbol: string;
}

export default function PawMark({
  size = "md",
  showTagline = true,
  className = "",
  onClick,
}: PawMarkProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const pawIconRef = useRef<SVGSVGElement>(null);
  const [particles, setParticles] = useState<SparkleParticle[]>([]);

  // Scale parameters
  const isSm = size === "sm";
  const isLg = size === "lg";

  const badgeSize = isSm ? "h-9 w-9" : isLg ? "h-14 w-14" : "h-11 w-11";
  const fontSize = isSm ? "text-lg" : isLg ? "text-3xl" : "text-2xl";
  const taglineSize = isSm ? "text-[8px]" : isLg ? "text-[11px]" : "text-[9px]";

  const triggerHoverMotion = (e: React.MouseEvent<HTMLDivElement>) => {
    // 1. Gentle 3D Tilt & Paw-pad squish
    if (badgeRef.current) {
      anime.remove(badgeRef.current);
      anime({
        targets: badgeRef.current,
        rotateZ: [-6, 6, -3, 0],
        scale: [0.95, 1.08, 1],
        duration: 500,
        easing: "easeOutElastic(1.2, 0.6)",
      });
    }

    if (pawIconRef.current) {
      anime.remove(pawIconRef.current);
      anime({
        targets: pawIconRef.current,
        scaleX: [1, 1.18, 0.94, 1],
        scaleY: [1, 0.86, 1.1, 1],
        duration: 450,
        easing: "easeOutElastic(1.4, 0.5)",
      });
    }

    // 2. Burst 4-6 golden sparkle / paw particles drifting upward
    const newParticles: SparkleParticle[] = Array.from({ length: 5 }, (_, i) => ({
      id: Date.now() + i,
      x: (Math.random() - 0.5) * 40,
      y: (Math.random() - 0.5) * 20,
      symbol: i % 2 === 0 ? "✨" : "🐾",
    }));

    setParticles(newParticles);

    // Clean particles after animation
    setTimeout(() => {
      setParticles([]);
    }, 900);
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={triggerHoverMotion}
      onClick={onClick}
      className={`relative inline-flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none transition-transform ${className}`}
    >
      {/* Floating Sparkles Burst */}
      {particles.map((p) => (
        <span
          key={p.id}
          className="pointer-events-none absolute text-xs sm:text-sm animate-sparkle-drift z-50"
          style={{
            left: `calc(18px + ${p.x}px)`,
            top: `calc(10px + ${p.y}px)`,
          }}
        >
          {p.symbol}
        </span>
      ))}

      {/* 3D Extruded Glowing Mascot Paw Badge */}
      <div
        ref={badgeRef}
        className={`relative ${badgeSize} rounded-[16px] sm:rounded-[18px] border-[3px] border-[#1E1B4B] bg-gradient-to-tr from-[#FF7A00] via-[#F59E0B] to-[#FBBF24] flex items-center justify-center shadow-pixar-sm transition-shadow hover:shadow-pixar`}
        style={{
          boxShadow: "0 5px 0 #1E1B4B, 0 0 16px rgba(255, 183, 3, 0.45)",
        }}
      >
        {/* Specular Inner Highlight Glaze */}
        <div className="pointer-events-none absolute inset-x-1 top-1 h-2 rounded-t-[12px] bg-white/40 blur-[0.5px]" />

        {/* Golden Paw SVG Emblem with Extruded Stroke */}
        <svg
          ref={pawIconRef}
          viewBox="0 0 40 40"
          className="w-3/4 h-3/4 overflow-visible drop-shadow-[0_2px_2px_rgba(0,0,0,0.15)]"
        >
          {/* Main Large Paw Pad */}
          <ellipse
            cx="20"
            cy="25"
            rx="8.5"
            ry="6.5"
            fill="#FFF9F0"
            stroke="#1E1B4B"
            strokeWidth="2.2"
          />
          {/* Inner Golden Paw Heart */}
          <path
            d="M 18 24.5 C 18 23 19 22 20 23.2 C 21 22 22 23 22 24.5 C 22 25.8 20 27 20 27 C 20 27 18 25.8 18 24.5 Z"
            fill="#FF7A00"
          />

          {/* 4 Cute Toe Beans */}
          {/* Toe 1 */}
          <ellipse
            cx="10.5"
            cy="17"
            rx="3"
            ry="4"
            transform="rotate(-20 10.5 17)"
            fill="#FFF9F0"
            stroke="#1E1B4B"
            strokeWidth="2"
          />
          {/* Toe 2 */}
          <ellipse
            cx="16.5"
            cy="12.5"
            rx="3.2"
            ry="4.5"
            transform="rotate(-7 16.5 12.5)"
            fill="#FFF9F0"
            stroke="#1E1B4B"
            strokeWidth="2"
          />
          {/* Toe 3 */}
          <ellipse
            cx="23.5"
            cy="12.5"
            rx="3.2"
            ry="4.5"
            transform="rotate(7 23.5 12.5)"
            fill="#FFF9F0"
            stroke="#1E1B4B"
            strokeWidth="2"
          />
          {/* Toe 4 */}
          <ellipse
            cx="29.5"
            cy="17"
            rx="3"
            ry="4"
            transform="rotate(20 29.5 17)"
            fill="#FFF9F0"
            stroke="#1E1B4B"
            strokeWidth="2"
          />
        </svg>

        {/* Tiny Golden Sparkle Corner Pin */}
        <span className="absolute -top-1.5 -right-1.5 text-[10px] sm:text-xs">
          ✨
        </span>
      </div>

      {/* 3D Extruded Typographic Wordmark */}
      <div className="flex flex-col leading-none">
        <div className="flex items-center gap-1">
          <span
            className={`font-display ${fontSize} font-black tracking-tight text-[#1E1B4B] flex items-center transition-colors`}
            style={{
              textShadow: "0 2px 0 rgba(255, 122, 0, 0.2)",
            }}
          >
            <span>PAW</span>
            {/* The 'A' with a miniature paw embedded in its counter */}
            <span className="relative text-[#FF7A00]">
              ALERT
              <span
                className="absolute text-[8px] sm:text-[10px] -top-1 -right-2 text-[#FBBF24] animate-pulse"
                aria-hidden="true"
              >
                ●
              </span>
            </span>
          </span>
        </div>

        {showTagline && (
          <span
            className={`font-display ${taglineSize} font-bold text-[#D97706] tracking-wider uppercase mt-0.5 transition-colors`}
          >
            Because Every Paw Matters
          </span>
        )}
      </div>
    </div>
  );
}
