"use client";

import React from "react";
import { AlertTriangle, FileQuestion, FileText, XCircle, SearchX, Layers } from "lucide-react";

export function SceneUnstructured() {
  return (
    <section id="chapter-extraction" className="py-20 bg-slate-50 border-y border-slate-200/80 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-0 rounded-full overflow-hidden shadow-md ring-1 ring-amber-400/30 hover:ring-amber-400/60 transition-all cursor-default select-none">
            <span className="bg-amber-500 text-white px-3 py-1.5 text-[11px] font-black tracking-widest uppercase" style={{ fontFamily: "'Mulish', sans-serif" }}>
              Chapter I
            </span>
            <span className="bg-amber-950/80 text-amber-200 px-3.5 py-1.5 text-[12px] font-semibold" style={{ fontFamily: "'Mulish', sans-serif" }}>
              The Procurement Bottleneck
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 font-display">
            Tenders Are Complex. Standards Information Is Scattered.
          </h2>

          <p className="text-base text-slate-600 leading-relaxed">
            Procurement officers know <strong className="text-slate-900 font-semibold">what</strong> their department needs, but identifying the exact applicable Indian Standards (IS), mandatory Quality Control Orders (QCOs), and testing parameters usually involves wading through hundreds of manual documents.
          </p>
        </div>

        {/* 2D Story Cards Comparison */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 hover:border-slate-300 transition-all">
            <div className="w-10 h-10 rounded-full bg-[#f4a261] flex items-center justify-center shrink-0 shadow-xs">
              <FileQuestion className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Unstructured Technical Specs</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tenders often list vague terms like "high strength rebar" or "standard LED light" without specifying the precise BIS version, grade, or chemical composition boundaries required by law.
            </p>
            <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100 text-[11px] font-mono text-amber-900 flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-[#f4a261] flex items-center justify-center shrink-0">
                <AlertTriangle className="w-2.5 h-2.5 text-white" />
              </span>
              <span>Risk: Tender rejection or invalid specs</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 hover:border-slate-300 transition-all">
            <div className="w-10 h-10 rounded-full bg-[#e63565] flex items-center justify-center shrink-0 shadow-xs">
              <XCircle className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Overlooked QCO Mandates</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              The Department for Promotion of Industry and Internal Trade (DPIIT) issues mandatory Quality Control Orders. Missing a QCO mandate exposes officers to regulatory non-compliance.
            </p>
            <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-100 text-[11px] font-mono text-rose-900 flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-[#e63565] flex items-center justify-center shrink-0">
                <AlertTriangle className="w-2.5 h-2.5 text-white" />
              </span>
              <span>Risk: Legal & audit liability</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 hover:border-slate-300 transition-all">
            <div className="w-10 h-10 rounded-full bg-[#8d99ae] flex items-center justify-center shrink-0 shadow-xs">
              <SearchX className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Opaque Vendor Verification</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Verifying whether a bidding supplier holds a valid BIS CML license number, NABL test report, or genuine ISI mark certification requires tedious manual portal lookups.
            </p>
            <div className="p-3 bg-slate-100/70 rounded-xl border border-slate-200 text-[11px] font-mono text-slate-700 flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-[#8d99ae] flex items-center justify-center shrink-0">
                <AlertTriangle className="w-2.5 h-2.5 text-white" />
              </span>
              <span>Risk: Counterfeit or unverified vendors</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
