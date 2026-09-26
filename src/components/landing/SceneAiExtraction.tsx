"use client";

import React, { useState } from "react";
import { Sliders, Cpu, ArrowRight, Check, Code2, Layers, Search, Terminal } from "lucide-react";

export function SceneAiExtraction() {
  const [inputText, setInputText] = useState(
    "Supply and installation of 1,200 meters of high-voltage underground copper conductor power cables rated for 33kV operations in heavy moisture and coastal conditions."
  );

  return (
    <section id="chapter-ai-parser" className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Story Explanation */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-0 rounded-full overflow-hidden shadow-md ring-1 ring-purple-400/30 hover:ring-purple-400/60 transition-all cursor-default select-none">
              <span className="bg-purple-600 text-white px-3 py-1.5 text-[11px] font-black tracking-widest uppercase" style={{ fontFamily: "'Mulish', sans-serif" }}>
                Chapter II
              </span>
              <span className="bg-purple-950/80 text-purple-200 px-3.5 py-1.5 text-[12px] font-semibold" style={{ fontFamily: "'Mulish', sans-serif" }}>
                AI Semantic Extraction
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 font-display leading-tight">
              Raw Text In, <br />
              <span className="text-purple-600">Structured Parameters Out.</span>
            </h2>

            <p className="text-slate-600 leading-relaxed text-sm">
              Procure’s specialized NLP engine processes plain-language procurement entries, tender RFPs, or PDF reports to isolate the core engineering specs without hallucinating numbers.
            </p>

            <ul className="space-y-3 text-xs text-slate-700">
              <li className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center font-bold text-[10px]">
                  ✓
                </div>
                <span>Identifies intended application & environmental constraints</span>
              </li>
              <li className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center font-bold text-[10px]">
                  ✓
                </div>
                <span>Extracts material grades, voltage ratings, and load limits</span>
              </li>
              <li className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center font-bold text-[10px]">
                  ✓
                </div>
                <span>Flags special safety requirements (e.g. coastal moisture/flame retardant)</span>
              </li>
            </ul>
          </div>

          {/* Right Column: 2D Interactive Parser Visual */}
          <div className="lg:col-span-7">
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl text-white space-y-5">
              {/* Terminal Title */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs font-mono text-slate-400">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-purple-400" />
                  <span>Procure AI Semantic Extraction Sandbox</span>
                </div>
                <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                  READY
                </span>
              </div>

              {/* Input Simulation */}
              <div className="space-y-2">
                <label className="text-[11px] font-mono text-slate-400 uppercase">
                  Raw Procurement Requirement Prompt:
                </label>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-slate-200 leading-relaxed">
                  "{inputText}"
                </div>
              </div>

              {/* Extraction Arrow */}
              <div className="flex items-center justify-center gap-3 py-1">
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
                <div className="px-3 py-1 rounded-full bg-purple-600/20 text-purple-300 border border-purple-500/40 text-[10px] font-mono font-semibold flex items-center gap-1.5">
                  <Sliders className="w-3 h-3 text-purple-300" />
                  <span>Parameter Parsing Engine</span>
                </div>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
              </div>

              {/* Extracted Structured Parameters */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 block">Extracted Category</span>
                  <span className="font-semibold text-purple-300">Electrical Power Distribution Cables</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 block">Voltage Rating</span>
                  <span className="font-semibold text-emerald-300">33 kV (High Voltage Class)</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 block">Conductor Material</span>
                  <span className="font-semibold text-amber-300">High-Purity Electrolytic Copper</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 block">Environmental Grade</span>
                  <span className="font-semibold text-purple-300">Coastal Water-Tight Anti-Corrosive</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
