"use client";

import React, { useState } from "react";
import { ShieldCheck, CheckCircle2, ArrowRight, Zap } from "lucide-react";

interface SceneExamplesProps {
  onOpenAuthPortal: () => void;
}

const samples = [
  {
    title: "Thermo-Mechanically Treated (TMT) Steel Bars",
    shortTitle: "TMT Steel Bars",
    code: "IS 1786 : 2008",
    sector: "Civil Infrastructure & Bridges",
    mandate: "BIS Quality Control Order (QCO) Mandatory",
    color: "purple" as const,
  },
  {
    title: "LED Luminaires for General Lighting",
    shortTitle: "LED Luminaires",
    code: "IS 16102 (Part 1) : 2012",
    sector: "Smart Cities & Public Utilities",
    mandate: "CRS Certification Required",
    color: "amber" as const,
  },
  {
    title: "Crosslinked Polyethylene (XLPE) Insulated Cables",
    shortTitle: "XLPE Cables",
    code: "IS 7098 (Part 2) : 2011",
    sector: "Power Transmission & Grid Safety",
    mandate: "Mandatory Type Testing & Safety Seal",
    color: "emerald" as const,
  },
];

const colorMap = {
  purple: {
    active: "bg-purple-600/20 border-purple-500 ring-1 ring-purple-500/50",
    idle: "bg-slate-900/50 border-slate-700/60 hover:border-slate-600 hover:bg-slate-800/60",
    code: "text-purple-300",
    dot: "bg-purple-500",
    badge: "bg-purple-900/50 text-purple-200 border-purple-700/40",
  },
  amber: {
    active: "bg-amber-600/20 border-amber-500 ring-1 ring-amber-500/50",
    idle: "bg-slate-900/50 border-slate-700/60 hover:border-slate-600 hover:bg-slate-800/60",
    code: "text-amber-400",
    dot: "bg-amber-500",
    badge: "bg-amber-900/50 text-amber-300 border-amber-700/40",
  },
  emerald: {
    active: "bg-emerald-600/20 border-emerald-500 ring-1 ring-emerald-500/50",
    idle: "bg-slate-900/50 border-slate-700/60 hover:border-slate-600 hover:bg-slate-800/60",
    code: "text-emerald-400",
    dot: "bg-emerald-500",
    badge: "bg-emerald-900/50 text-emerald-300 border-emerald-700/40",
  },
};

export function SceneExamples({ onOpenAuthPortal }: SceneExamplesProps) {
  const [activeSample, setActiveSample] = useState(0);
  const active = samples[activeSample];
  const colors = colorMap[active.color];

  return (
    <section className="relative py-20 bg-[#0c1220] border-t border-slate-800/50">
      {/* Subtle grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(30,41,59,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(30,41,59,0.12)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Section badge */}
        <div className="flex flex-col items-center text-center mb-10 gap-4">
          <div
            className="inline-flex items-center gap-0 rounded-full overflow-hidden shadow-lg ring-1 ring-purple-400/25"
            style={{ fontFamily: "'Mulish', sans-serif" }}
          >
            <span className="flex items-center gap-1.5 bg-purple-600 text-white px-4 py-1.5 text-[11px] font-black tracking-widest uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-200 animate-pulse" />
              Live Samples
            </span>
            <span className="bg-purple-950/70 text-purple-200 px-4 py-1.5 text-[12px] font-semibold border-l border-purple-500/20">
              Requirement Intelligence
            </span>
          </div>

          <h2
            className="text-2xl sm:text-3xl font-extrabold text-white"
            style={{ fontFamily: "'Mulish', sans-serif" }}
          >
            See Procure Map Real Procurement Specs
          </h2>
          <p
            className="text-slate-400 text-sm max-w-lg leading-relaxed"
            style={{ fontFamily: "'Mulish', sans-serif" }}
          >
            Click any requirement below to see how Procure resolves it to verified Indian Standards, regulatory mandates, and lab protocols — instantly.
          </p>
        </div>

        {/* IS Code selector cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {samples.map((s, idx) => {
            const c = colorMap[s.color];
            const isActive = activeSample === idx;
            return (
              <button
                key={s.code}
                onClick={() => setActiveSample(idx)}
                className={`group relative text-left p-4 rounded-2xl border transition-all duration-200 focus:outline-none ${
                  isActive ? c.active : c.idle
                }`}
                style={{ fontFamily: "'Mulish', sans-serif" }}
              >
                {/* Active indicator dot */}
                {isActive && (
                  <span className={`absolute top-3 right-3 w-2 h-2 rounded-full ${c.dot} animate-pulse`} />
                )}

                {/* IS code */}
                <div
                  className={`text-[13px] font-black tracking-tight mb-1.5 ${c.code}`}
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                >
                  {s.code}
                </div>

                {/* Short title */}
                <div className="text-[13px] font-bold text-white leading-snug mb-2">
                  {s.shortTitle}
                </div>

                {/* Sector badge */}
                <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border ${c.badge}`}>
                  {s.sector}
                </span>
              </button>
            );
          })}
        </div>

        {/* Result display panel */}
        <div className="bg-slate-900/80 rounded-2xl border border-slate-700/60 overflow-hidden shadow-2xl backdrop-blur-md">
          {/* Panel header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-950/50">
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-blue-400" />
              <span
                className="text-[11px] font-bold text-slate-400 uppercase tracking-widest"
                style={{ fontFamily: "'Mulish', sans-serif" }}
              >
                Procure Analysis Output
              </span>
            </div>
            <div
              className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${colors.badge}`}
              style={{ fontFamily: "'Mulish', sans-serif" }}
            >
              {activeSample + 1} of {samples.length}
            </div>
          </div>

          <div className="p-5 space-y-4">
            {/* Title row */}
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <span
                  className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border mb-2 ${colors.badge}`}
                  style={{ fontFamily: "'Mulish', sans-serif" }}
                >
                  {active.sector}
                </span>
                <h3
                  className="text-base font-extrabold text-white leading-snug"
                  style={{ fontFamily: "'Mulish', sans-serif" }}
                >
                  {active.title}
                </h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-1">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <div
                  className="text-[10px] font-bold text-slate-500 uppercase tracking-widest"
                  style={{ fontFamily: "'Mulish', sans-serif" }}
                >
                  Applicable Standard
                </div>
                <div
                  className={`text-sm font-black ${colors.code}`}
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                >
                  {active.code}
                </div>
              </div>
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <div
                  className="text-[10px] font-bold text-slate-500 uppercase tracking-widest"
                  style={{ fontFamily: "'Mulish', sans-serif" }}
                >
                  Regulatory Mandate
                </div>
                <div
                  className="text-[12px] font-bold text-emerald-400 leading-snug"
                  style={{ fontFamily: "'Mulish', sans-serif" }}
                >
                  {active.mandate}
                </div>
              </div>
            </div>

            {/* Footer row */}
            <div className="flex items-center justify-between pt-1">
              <div
                className="flex items-center gap-2 text-[12px] font-semibold text-slate-300"
                style={{ fontFamily: "'Mulish', sans-serif" }}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                Quality Assurance &amp; Lab Protocol Ready
              </div>
              <button
                onClick={onOpenAuthPortal}
                className="inline-flex items-center gap-1.5 text-[12px] font-bold text-white bg-purple-600 hover:bg-purple-500 active:bg-purple-700 px-4 py-1.5 rounded-lg transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-purple-900/40 cursor-pointer"
                style={{ fontFamily: "'Mulish', sans-serif" }}
              >
                Run Full Audit
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

