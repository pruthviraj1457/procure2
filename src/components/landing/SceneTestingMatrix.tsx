"use client";

import React from "react";
import { ShieldAlert, Microscope, CheckCircle2, Award, FileSpreadsheet, Scale, Flame } from "lucide-react";

export function SceneTestingMatrix() {
  return (
    <section id="compliance" className="py-24 bg-slate-50 relative border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-0 rounded-full overflow-hidden shadow-md ring-1 ring-purple-400/30 hover:ring-purple-400/60 transition-all cursor-default select-none">
            <span className="bg-purple-600 text-white px-3 py-1.5 text-[11px] font-black tracking-widest uppercase" style={{ fontFamily: "'Mulish', sans-serif" }}>
              Chapter IV
            </span>
            <span className="bg-purple-950/80 text-purple-200 px-3.5 py-1.5 text-[12px] font-semibold" style={{ fontFamily: "'Mulish', sans-serif" }}>
              Quality Assurance & Lab Protocols
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 font-display">
            Automated Testing & Safety Compliance Matrix
          </h2>

          <p className="text-base text-slate-600 leading-relaxed">
            A verified Indian Standard requires specific laboratory tests and tolerance thresholds. Procure automatically builds a complete inspection protocol for government tender specifications.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Protocol 1 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="w-10 h-10 rounded-full bg-[#7209b7] flex items-center justify-center shrink-0 shadow-xs">
              <Microscope className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Chemical Composition</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Verifies maximum permissible limits for Carbon, Sulphur, and Phosphorus to ensure structural ductility and weldability.
            </p>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-purple-700 font-semibold">
              <span>NABL Lab Test 01</span>
              <span>IS 1786 Cl. 4.2</span>
            </div>
          </div>

          {/* Protocol 2 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="w-10 h-10 rounded-full bg-[#00a8e8] flex items-center justify-center shrink-0 shadow-xs">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Mechanical Yield Stress</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tensile testing at 0.2% proof stress threshold with minimum 16% elongation rating for seismic resistance.
            </p>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-purple-700 font-semibold">
              <span>NABL Lab Test 02</span>
              <span>IS 1786 Cl. 8.1</span>
            </div>
          </div>

          {/* Protocol 3 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="w-10 h-10 rounded-full bg-[#2a9d8f] flex items-center justify-center shrink-0 shadow-xs">
              <Award className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-base font-bold text-slate-900">BIS ISI License (CML)</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Cross-references manufacturer Certification Marks License (CML) status directly against the live BIS registry.
            </p>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-emerald-700 font-semibold">
              <span>BIS Verification</span>
              <span>Live Portal Check</span>
            </div>
          </div>

          {/* Protocol 4 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="w-10 h-10 rounded-full bg-[#f4a261] flex items-center justify-center shrink-0 shadow-xs">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Environmental Safety</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Fire resistance, flame retardant low smoke (FRLS) insulation rating, and thermal overload protections.
            </p>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-amber-700 font-semibold">
              <span>Safety Rating</span>
              <span>IS 7098 Cl. 12</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
