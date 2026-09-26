"use client";

import React from "react";
import { FileCheck, Sparkles, Download, ShieldCheck, CheckCircle2, ArrowRight, FileText } from "lucide-react";

interface SceneFinalReportProps {
  onOpenAuthPortal: () => void;
}

export function SceneFinalReport({ onOpenAuthPortal }: SceneFinalReportProps) {
  return (
    <section id="report" className="py-24 bg-slate-900 text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Dossier Preview */}
          <div className="lg:col-span-6">
            <div className="bg-white text-slate-900 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 border border-slate-200">
              {/* Report Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#7209b7] flex items-center justify-center text-white shrink-0 shadow-xs">
                    <FileCheck className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 font-display">
                      Procurement Standards Dossier
                    </h3>
                    <span className="text-xs font-mono text-slate-500">
                      Ref: PROC-SIH-2026-REPORT-0894
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-mono font-bold border border-emerald-300">
                  AUDIT READY
                </span>
              </div>

              {/* Summary Items */}
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="font-mono text-[10px] text-slate-500 uppercase block">Requirement Scope</span>
                  <span className="font-semibold text-slate-900">
                    High-Tensile TMT Rebar for Coastal Bridge Superstructure
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="font-mono text-[10px] text-slate-500 uppercase block">Mandatory Standard</span>
                    <span className="font-mono font-bold text-purple-700">IS 1786 : 2008 (Fe 500D)</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="font-mono text-[10px] text-slate-500 uppercase block">QCO Mandate</span>
                    <span className="font-semibold text-emerald-700">Verified & Active</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="font-mono text-[10px] text-slate-500 uppercase block">Lab Testing Protocols</span>
                  <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-700">
                    <span className="flex items-center gap-1.5 font-mono">
                      <span className="w-4 h-4 rounded-full bg-[#2a9d8f] flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-3 h-3 text-white" />
                      </span>
                      Chemical
                    </span>
                    <span className="flex items-center gap-1.5 font-mono">
                      <span className="w-4 h-4 rounded-full bg-[#2a9d8f] flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-3 h-3 text-white" />
                      </span>
                      Tensile
                    </span>
                    <span className="flex items-center gap-1.5 font-mono">
                      <span className="w-4 h-4 rounded-full bg-[#2a9d8f] flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-3 h-3 text-white" />
                      </span>
                      Bend/Rebend
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons inside Report Card */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <span className="text-[11px] font-mono text-slate-400">
                  Export Options: PDF / JSON / Official Tender Attachment
                </span>
                <button
                  onClick={onOpenAuthPortal}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-purple-600 hover:text-purple-800 cursor-pointer"
                >
                  <span>Download Sample</span>
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: High Impact Story Callout */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-0 rounded-full overflow-hidden shadow-md ring-1 ring-purple-400/30 hover:ring-purple-400/60 transition-all cursor-default select-none">
              <span className="bg-purple-600 text-white px-3 py-1.5 text-[11px] font-black tracking-widest uppercase" style={{ fontFamily: "'Mulish', sans-serif" }}>
                Chapter VI
              </span>
              <span className="bg-purple-950/80 text-purple-200 px-3.5 py-1.5 text-[12px] font-semibold" style={{ fontFamily: "'Mulish', sans-serif" }}>
                Structured Decision Output
              </span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white font-display leading-tight">
              From Raw Requirement To <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-indigo-200 to-purple-400">
                Audit-Ready Decision Report
              </span>
            </h2>

            <p className="text-base text-slate-300 leading-relaxed">
              Never worry about missing a Quality Control Order or receiving unverified materials again. Procure packages standards mapping, lab testing rules, and vendor verification into a single authoritative report.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button
                onClick={onOpenAuthPortal}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-500 px-6 py-3.5 rounded-xl shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <FileCheck className="w-4 h-4 text-purple-200" />
                <span>Start Free Analysis</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenAuthPortal}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm font-semibold text-slate-300 hover:text-white bg-slate-800 border border-slate-700 px-6 py-3.5 rounded-xl transition-all cursor-pointer"
              >
                <span>Sign In to Portal</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
