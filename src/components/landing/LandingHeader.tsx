"use client";

import React, { useState } from "react";
import PillNav from "@/components/ui/PillNav";

interface LandingHeaderProps {
  onOpenAuthPortal: () => void;
}

const NAV_ITEMS = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Indian Standards", href: "#standards" },
  { label: "Testing & Safety", href: "#compliance" },
  { label: "Suppliers Matrix", href: "#suppliers" },
  { label: "Dossier Output", href: "#report" },
];

export function LandingHeader({ onOpenAuthPortal }: LandingHeaderProps) {
  const [scrolled, setScrolled] = useState(false);

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? "bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 shadow-lg py-2"
          : "bg-gradient-to-b from-slate-950/80 via-slate-950/30 to-transparent py-3"
      }`}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* ── LEFT: Logo + Brand Name ── */}
        <div
          className="flex items-center gap-2.5 cursor-pointer select-none flex-shrink-0"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <div className="w-9 h-9 rounded-full bg-slate-950 flex items-center justify-center p-1 border-2 border-purple-500/80 shadow-md ring-2 ring-purple-500/20 shrink-0">
            <img
              src="/procure-logo.png"
              alt="Procure Logo"
              className="w-full h-full object-contain rounded-full"
            />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-extrabold text-xl tracking-tight text-purple-400 font-display">
              Procure
            </span>
            <span className="text-[10px] text-slate-400 hidden sm:block tracking-wide mt-0.5">
              Procurement &amp; Standards Intelligence
            </span>
          </div>
        </div>

        {/* ── RIGHT: PillNav ── */}
        <div className="flex items-center justify-end">
          <PillNav
            logo="/procure-logo.png"
            logoAlt="Procure"
            items={NAV_ITEMS}
            ease="power3.easeOut"
            baseColor="#0f172a"
            pillColor="#7c3aed"
            pillTextColor="#ffffff"
            hoveredPillTextColor="#7c3aed"
            initialLoadAnimation={true}
            showLogo={false}
            showMobileHamburger={false}
            className="w-auto"
          />
        </div>
      </div>
    </header>
  );
}
