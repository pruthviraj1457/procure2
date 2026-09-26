"use client";

import React from "react";
import { Building2, CheckCircle, AlertTriangle, ShieldCheck, ExternalLink, BadgeCheck } from "lucide-react";

export function SceneSupplierMatching() {
  const suppliers = [
    {
      name: "Bharat Industrial Rebars Ltd",
      brand: "Bharat Steel Fe 500D",
      location: "Bhilai, Chhattisgarh",
      cmlNumber: "CM/L-9842105",
      isCode: "IS 1786 : 2008",
      complianceScore: 100,
      nablTested: true,
      qcoValid: true,
    },
    {
      name: "National Cables & Energy Corp",
      brand: "PowerShield XLPE 33kV",
      location: "Vadodara, Gujarat",
      cmlNumber: "CM/L-7714902",
      isCode: "IS 7098 (Part 2)",
      complianceScore: 100,
      nablTested: true,
      qcoValid: true,
    },
    {
      name: "Apex Metal Alloys & Traders",
      brand: "Generic Structural Angle",
      location: "New Delhi, NCR",
      cmlNumber: "Unverified / Pending",
      isCode: "IS 2062",
      complianceScore: 45,
      nablTested: false,
      qcoValid: false,
    },
  ];

  return (
    <section id="suppliers" className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-0 rounded-full overflow-hidden shadow-md ring-1 ring-purple-400/30 hover:ring-purple-400/60 transition-all cursor-default select-none">
            <span className="bg-purple-600 text-white px-3 py-1.5 text-[11px] font-black tracking-widest uppercase" style={{ fontFamily: "'Mulish', sans-serif" }}>
              Chapter V
            </span>
            <span className="bg-purple-950/80 text-purple-200 px-3.5 py-1.5 text-[12px] font-semibold" style={{ fontFamily: "'Mulish', sans-serif" }}>
              Compliant Supplier Discovery
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 font-display">
            Match Certified Suppliers With Confidence
          </h2>

          <p className="text-base text-slate-600 leading-relaxed">
            Compare bidder products against extracted Indian Standards parameters. Instantly filter for valid BIS Certification Marks Licenses (CML) and NABL accredited test reports.
          </p>
        </div>

        {/* Supplier Cards List */}
        <div className="mt-12 space-y-4">
          {suppliers.map((s, idx) => (
            <div
              key={idx}
              className={`p-6 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 ${
                s.complianceScore === 100
                  ? "bg-slate-50/80 border-slate-200 hover:border-purple-300 shadow-xs"
                  : "bg-amber-50/40 border-amber-200/80"
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-xs ${
                    s.complianceScore === 100
                      ? "bg-[#2a9d8f] text-white"
                      : "bg-[#f4a261] text-white"
                  }`}
                >
                  <Building2 className="w-6 h-6 text-white" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="text-base font-bold text-slate-900">{s.name}</h3>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-medium">
                      {s.brand}
                    </span>
                    {s.complianceScore === 100 ? (
                      <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-[#2a9d8f] flex items-center justify-center shrink-0">
                          <BadgeCheck className="w-3 h-3 text-white" />
                        </span>
                        100% Compliant
                      </span>
                    ) : (
                      <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-semibold flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-[#f4a261] flex items-center justify-center shrink-0">
                          <AlertTriangle className="w-3 h-3 text-white" />
                        </span>
                        Action Required
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-3">
                    <span>📍 {s.location}</span>
                    <span>•</span>
                    <span className="font-mono text-slate-700 font-medium">IS Code: {s.isCode}</span>
                  </div>
                </div>
              </div>

              {/* License Details & Actions */}
              <div className="flex items-center justify-between md:justify-end gap-6 pt-4 md:pt-0 border-t md:border-t-0 border-slate-200">
                <div className="text-left md:text-right space-y-0.5 font-mono">
                  <span className="text-[10px] text-slate-400 uppercase block">BIS License (CML)</span>
                  <span className={`text-xs font-bold ${s.qcoValid ? "text-slate-900" : "text-amber-800"}`}>
                    {s.cmlNumber}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                      s.nablTested
                        ? "bg-purple-50 text-purple-700 border border-purple-200"
                        : "bg-amber-100 text-amber-900 border border-amber-300"
                    }`}
                  >
                    {s.nablTested ? "NABL Report Verified" : "Missing NABL Lab Report"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
