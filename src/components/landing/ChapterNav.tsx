"use client";

import React from "react";
import { Check } from "lucide-react";

export interface ChapterItem {
  id: string;
  number: string;
  title: string;
  subtitle: string;
}

export const CHAPTERS: ChapterItem[] = [
  {
    id: "chapter-extraction",
    number: "I",
    title: "Unstructured Requirements",
    subtitle: "Raw tenders & specification documents",
  },
  {
    id: "chapter-ai-parser",
    number: "II",
    title: "AI Requirement Parsing",
    subtitle: "Extracting core technical parameters",
  },
  {
    id: "chapter-standards",
    number: "III",
    title: "Indian Standards (BIS)",
    subtitle: "Matching mandatory IS codes & QCOs",
  },
  {
    id: "chapter-testing",
    number: "IV",
    title: "Testing & Safety Matrix",
    subtitle: "NABL lab protocols & safety compliance",
  },
  {
    id: "chapter-suppliers",
    number: "V",
    title: "Supplier Verification",
    subtitle: "Matching compliant manufacturers & CMLs",
  },
  {
    id: "chapter-report",
    number: "VI",
    title: "Audit Dossier Output",
    subtitle: "Structured decision & report generation",
  },
];

interface ChapterNavProps {
  activeChapterId: string;
  scrollProgress: number; // 0 to 100
}

export function ChapterNav({ activeChapterId, scrollProgress }: ChapterNavProps) {
  const scrollToChapter = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -90;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <>
      {/* Sticky Left Chapter Index (Desktop view >= lg) */}
      <aside className="hidden lg:block fixed left-6 top-32 w-64 z-30 pointer-events-auto select-none">
        <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400">
              Procurement Chapters
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
              {Math.round(scrollProgress)}%
            </span>
          </div>

          <nav className="space-y-1">
            {CHAPTERS.map((ch, idx) => {
              const isActive = activeChapterId === ch.id;
              return (
                <button
                  key={ch.id}
                  onClick={() => scrollToChapter(ch.id)}
                  className={`w-full text-left px-3 py-2 rounded-xl transition-all flex items-start gap-3 group ${
                    isActive
                      ? "bg-slate-900 text-white shadow-xs"
                      : "hover:bg-slate-100 text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span
                    className={`text-[11px] font-mono font-bold mt-0.5 px-1.5 py-0.5 rounded ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "bg-slate-200/70 text-slate-600 group-hover:bg-slate-300/80"
                    }`}
                  >
                    ({ch.number})
                  </span>
                  <div className="flex-1 min-w-0">
                    <div
                      className={`text-xs font-semibold truncate leading-tight ${
                        isActive ? "text-white" : "text-slate-800"
                      }`}
                    >
                      {ch.title}
                    </div>
                    <div
                      className={`text-[10px] truncate leading-tight mt-0.5 ${
                        isActive ? "text-slate-300" : "text-slate-400"
                      }`}
                    >
                      {ch.subtitle}
                    </div>
                  </div>
                  {isActive && (
                    <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse mt-1.5 shrink-0" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick Action inside Sticky Sidebar */}
          <div className="mt-4 pt-3 border-t border-slate-100">
            <a
              href="#how-it-works"
              className="text-[11px] font-medium text-slate-500 hover:text-slate-900 flex items-center justify-between"
            >
              <span>Scroll to navigate</span>
              <span className="text-xs">↓</span>
            </a>
          </div>
        </div>
      </aside>

      {/* Sticky Right Progress Ruler (Reference visual matching) */}
      <div className="hidden sm:block fixed right-4 top-1/4 -translate-y-1/2 z-30 pointer-events-none select-none">
        <div className="flex flex-col items-center gap-1 bg-white/70 backdrop-blur-sm p-2 rounded-full border border-slate-200/60 shadow-xs">
          {CHAPTERS.map((ch) => {
            const isActive = activeChapterId === ch.id;
            return (
              <div
                key={`ruler-${ch.id}`}
                className={`transition-all duration-300 ${
                  isActive
                    ? "w-2.5 h-6 rounded-full bg-blue-600 shadow-xs"
                    : "w-1.5 h-1.5 rounded-full bg-slate-300"
                }`}
                title={ch.title}
              />
            );
          })}
        </div>
      </div>
    </>
  );
}
