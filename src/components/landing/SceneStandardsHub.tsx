"use client";

import React, { useState } from "react";
import { ShieldCheck, BookOpen, ExternalLink, Award, FileBadge, CheckCircle, Search } from "lucide-react";

export function SceneStandardsHub() {
  const [activeTab, setActiveTab] = useState<"is1786" | "is2062" | "is7098">("is1786");

  const standardsData = {
    is1786: {
      code: "IS 1786 : 2008",
      title: "High Strength Deformed Steel Bars and Wires for Concrete Reinforcement",
      department: "Civil & Structural Engineering Department (CED)",
      qcoMandate: "Mandatory Order by DPIIT (No. S.O. 1749(E))",
      status: "Active (Reaffirmed 2024 with Amendment 3)",
      keyTests: ["Tensile Strength (Fe 500D / Fe 550D)", "Bend & Rebend Test", "Chemical Carbon Eq. (< 0.42%)"],
    },
    is2062: {
      code: "IS 2062 : 2011",
      title: "Hot Rolled Medium and High Tensile Structural Steel",
      department: "Metallurgical Engineering Department (MTD)",
      qcoMandate: "Mandatory QCO Enforced by Ministry of Steel",
      status: "Active (Amendment 2 Included)",
      keyTests: ["Charpy V-Notch Impact Test", "Yield Stress Threshold", "Weldability Index"],
    },
    is7098: {
      code: "IS 7098 (Part 2) : 2011",
      title: "Crosslinked Polyethylene Insulated Thermoplastic Sheathed Cables (3.3 kV to 33 kV)",
      department: "Electrotechnical Department (ETD)",
      qcoMandate: "Mandatory Electrical Safety Regulation",
      status: "Active (Current National Standard)",
      keyTests: ["High Voltage Water Bath Test", "Partial Discharge Measurement", "Thermal Ageing Resistance"],
    },
  };

  const curr = standardsData[activeTab];

  return (
    <section id="standards" className="py-24 bg-slate-900 text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-0 rounded-full overflow-hidden shadow-md ring-1 ring-emerald-400/30 hover:ring-emerald-400/60 transition-all cursor-default select-none">
            <span className="bg-emerald-500 text-white px-3 py-1.5 text-[11px] font-black tracking-widest uppercase" style={{ fontFamily: "'Mulish', sans-serif" }}>
              Chapter III
            </span>
            <span className="bg-emerald-950/60 text-emerald-200 px-3.5 py-1.5 text-[12px] font-semibold border-l border-emerald-500/20" style={{ fontFamily: "'Mulish', sans-serif" }}>
              Verified BIS Source of Truth
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white font-display">
            The Verified Indian Standards Layer
          </h2>

          <p className="text-base text-slate-300 leading-relaxed">
            Procure anchors AI intelligence to a deterministic, verified index of Bureau of Indian Standards (BIS) documents. Every matched IS code includes official QCO status, amendments, and testing protocols.
          </p>
        </div>

        {/* Standards Switcher Tabs */}
        <div className="mt-12 flex justify-center gap-2 sm:gap-4 border-b border-slate-800 pb-4">
          <button
            onClick={() => setActiveTab("is1786")}
            className={`px-4 py-2.5 rounded-xl font-mono text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "is1786"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            IS 1786 : 2008 (TMT Steel)
          </button>
          <button
            onClick={() => setActiveTab("is2062")}
            className={`px-4 py-2.5 rounded-xl font-mono text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "is2062"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            IS 2062 : 2011 (Structural Steel)
          </button>
          <button
            onClick={() => setActiveTab("is7098")}
            className={`px-4 py-2.5 rounded-xl font-mono text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "is7098"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            IS 7098 (Part 2) (33kV Cables)
          </button>
        </div>

        {/* Active Standard Display Card */}
        <div className="mt-8 bg-slate-800/90 rounded-2xl border border-slate-700 p-6 lg:p-8 backdrop-blur-md shadow-2xl max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-700">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded bg-purple-500/20 text-purple-300 font-mono text-xs font-bold border border-purple-500/30">
                  OFFICIAL IS CODE
                </span>
                <span className="text-xs font-mono text-slate-400">{curr.department}</span>
              </div>
              <h3 className="text-2xl font-bold text-white font-mono mt-2">{curr.code}</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>QCO Mandate Verified</span>
              </span>
            </div>
          </div>

          <div className="py-6 space-y-4">
            <div>
              <span className="text-xs font-mono text-slate-400 uppercase">Standard Scope & Title</span>
              <p className="text-lg font-medium text-slate-200 mt-1">{curr.title}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[11px] font-mono text-slate-400 uppercase">DPIIT / Ministry QCO Status</span>
                <p className="text-xs font-semibold text-amber-300">{curr.qcoMandate}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[11px] font-mono text-slate-400 uppercase">Validity & Amendment Track</span>
                <p className="text-xs font-semibold text-emerald-300">{curr.status}</p>
              </div>
            </div>

            <div className="pt-4">
              <span className="text-xs font-mono text-slate-400 uppercase block mb-3">
                Mandatory Lab Testing Protocols Under This Standard:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {curr.keyTests.map((t, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-slate-900/90 border border-slate-700/80 flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
