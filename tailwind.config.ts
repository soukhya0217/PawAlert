import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        cyber: {
          bg: "#05070d",
          panel: "#0a0e17",
          card: "#0f1422",
          border: "rgba(255, 255, 255, 0.08)",
          line: "rgba(212, 255, 58, 0.2)",
          lime: "#d4ff3a",
          neon: "#d4ff3a",
          emergency: "#ff3b30",
          cyan: "#00f0ff",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          50: "#fff5f0",
          100: "#ffe8df",
          200: "#ffd2c0",
          300: "#ffb295",
          400: "#ff845e",
          500: "#f75c2e",
          600: "#e84013",
          700: "#c2300b",
          800: "#9b280e",
          900: "#7d2411",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        cream: {
          50: "#FFFDF9",
          100: "#FAF7F2",
          200: "#F4EFE6",
          300: "#E8E0D2",
        },
        lavender: {
          50: "#FAF7FF",
          100: "#F3EEFF",
          200: "#E6DCFC",
          300: "#D1BFF8",
          400: "#A888EC",
          500: "#8656DF",
          600: "#6B35C8",
        },
        mint: {
          50: "#F3FAF6",
          100: "#E3F5EC",
          200: "#C4EAD7",
          300: "#98D8BA",
          400: "#5DBE93",
          500: "#2FA372",
          600: "#1E8257",
        },
        peach: {
          50: "#FFF7F4",
          100: "#FFEEE8",
          200: "#FFDACD",
          300: "#FFBBA6",
          400: "#FF8E6E",
          500: "#F6653E",
        },
        sky: {
          50: "#F0F8FF",
          100: "#E2F2FE",
          200: "#C4E4FC",
          300: "#97CDF9",
          400: "#55ADF3",
          500: "#288BE3",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
        "4xl": "2.25rem",
      },
      boxShadow: {
        soft: "0 10px 30px -10px rgba(224, 90, 54, 0.08), 0 4px 12px -4px rgba(0, 0, 0, 0.04)",
        card: "0 14px 34px -10px rgba(100, 110, 140, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.03)",
        magical: "0 20px 40px -15px rgba(134, 86, 223, 0.15), 0 8px 16px -6px rgba(246, 101, 62, 0.12)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-8px) rotate(1.5deg)" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.75", transform: "scale(1.04)" },
        },
      },
      animation: {
        float: "float 4s ease-in-out infinite",
        "float-slow": "float 7s ease-in-out infinite",
        wiggle: "wiggle 1s ease-in-out infinite",
        "pulse-glow": "pulseGlow 2.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
