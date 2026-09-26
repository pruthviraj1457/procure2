"use client";

import React from "react";
import { FileText, ArrowRight } from "lucide-react";
import AeroShards from "./AeroShards";

interface SceneHeroProps {
  onOpenAuthPortal: () => void;
}

export function SceneHero({ onOpenAuthPortal }: SceneHeroProps) {
  return (
    <section className="relative pt-28 pb-24 overflow-hidden bg-slate-900 text-white min-h-[90vh] flex flex-col justify-center">
      {/* Dynamic Animated Background - AeroShards */}
      <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-0 opacity-80">
        <AeroShards
          backgroundColor="#0f172a"
          shardColor="#7b4fc4"
          accentColor="#a953fb"
          placement="full"
          flow="stream"
          material="pearl"
          detail="balanced"
          effect="dither"
          scale={1.05}
          spread={1}
          depth={1}
          speed={1.1}
          spin={1.1}
          interaction="repel"
          density={1.5}
          shardSize={1.15}
          stretch={1}
          turbulence={1}
          glow={1.45}
          edgeSoftness={2}
          bloom={0.5}
          grain={0.05}
          chromaticAberration={0.0075}
          transitionDuration={1}
          interactionRadius={1.5}
          interactionStrength={0.5}
          rippleIntensity={1}
          holdToGather
          paused={false}
        />
      </div>

      {/* Grid & ambient blobs */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none z-0" />
      <div className="absolute -top-40 right-0 w-[500px] h-[500px] bg-purple-600/25 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-purple-800/20 rounded-full blur-3xl pointer-events-none z-0" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full text-center">
        {/* Hero Copy */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light tracking-tight text-slate-100 font-miller-banner leading-[1.15]">
          Turn Complex{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-200 via-violet-300 to-purple-400 font-normal">
            Procurement Specs
          </span>
          <br />
          Into Standards Intelligence
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-300/90 max-w-2xl mx-auto font-normal leading-relaxed font-['IBM_Plex_Sans',sans-serif]">
          Procure parses raw tenders, extracts technical requirements, identifies mandatory{" "}
          <strong className="text-white font-semibold">Indian Standards (IS)</strong>, verifies NABL
          lab testing protocols, and matches certified compliant suppliers.
        </p>

        {/* CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 font-['Space_Grotesk',sans-serif]">
          <button
            onClick={onOpenAuthPortal}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-500 px-7 py-4 rounded-xl shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <span className="w-6 h-6 rounded-full bg-[#7209b7] flex items-center justify-center shrink-0 shadow-xs">
              <FileText className="w-3.5 h-3.5 text-white" />
            </span>
            <span>Analyze a Requirement</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <a
            href="#how-it-works"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-purple-950/40 border border-slate-700/80 hover:border-purple-500/40 px-7 py-4 rounded-xl transition-all"
          >
            <span>Explore Interactive Story</span>
            <span className="text-xs">↓</span>
          </a>
        </div>

        {/* Trust Markers */}
        <div className="mt-12 pt-8 border-t border-slate-800/60 grid grid-cols-3 gap-6 max-w-lg mx-auto">
          <div className="space-y-1">
            <div className="text-2xl font-bold text-white font-['Space_Grotesk',sans-serif]">100%</div>
            <div className="text-xs text-slate-400 font-['IBM_Plex_Sans',sans-serif]">Verified IS Knowledge</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-purple-300 font-['Space_Grotesk',sans-serif]">Zero</div>
            <div className="text-xs text-slate-400 font-['IBM_Plex_Sans',sans-serif]">Hallucinated Codes</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-purple-200 font-['Space_Grotesk',sans-serif]">Audit</div>
            <div className="text-xs text-slate-400 font-['IBM_Plex_Sans',sans-serif]">Traceable Evidence</div>
          </div>
        </div>
      </div>
    </section>
  );
}
