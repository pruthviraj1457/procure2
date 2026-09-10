import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Govtech primary — deep navy
        navy: {
          50:  "#f0f4f9",
          100: "#d9e4f0",
          200: "#b3c9e1",
          300: "#7aa3ca",
          400: "#4d7eb2",
          500: "#2d5f96",
          600: "#1e4a7c",
          700: "#163861",
          800: "#0F2D4E", // primary
          900: "#0a1f37",
          950: "#050f1c",
        },
        // Accent — teal/sky
        accent: {
          50:  "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0EA5E9", // primary accent
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
        },
        // Semantic
        verified: {
          bg: "#d1fae5",
          text: "#065f46",
          border: "#6ee7b7",
        },
        caution: {
          bg: "#fef3c7",
          text: "#92400e",
          border: "#fcd34d",
        },
        muted: {
          bg: "#f1f5f9",
          text: "#64748b",
          border: "#cbd5e1",
        },
        danger: {
          bg: "#fee2e2",
          text: "#991b1b",
          border: "#fca5a5",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(15,45,78,0.08), 0 1px 2px -1px rgba(15,45,78,0.06)",
        "card-hover": "0 4px 12px 0 rgba(15,45,78,0.12), 0 2px 4px -1px rgba(15,45,78,0.08)",
        "card-focus": "0 0 0 2px #0EA5E9, 0 1px 3px 0 rgba(15,45,78,0.08)",
      },
      borderRadius: {
        card: "12px",
        badge: "6px",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out forwards",
        "slide-up": "slideUp 0.4s ease-out forwards",
        "slide-in-right": "slideInRight 0.3s ease-out forwards",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(16px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
