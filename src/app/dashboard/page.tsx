"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import DotField from "@/components/DotField";

export default function DashboardPage() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const chipPrompts: Record<string, string> = {
    "Find Standards": "Identify applicable Bureau of Indian Standards (BIS) and IS specifications for: ",
    "Analyze Tender": "Analyze technical eligibility, conformity clauses, and BIS standards in tender document: ",
    "Find Supplier": "Locate verified GeM and BIS certified class-1 OEM suppliers for: ",
    "Check Certification": "Check license validity, CM/L number, and test compliance for: ",
    "Check Compliance": "Run automated cross-clause compliance assessment against IS standards for: ",
    "Compare Suppliers": "Compare technical specifications and BIS certification status between shortlisted suppliers for: ",
  };

  function handleChipClick(chipLabel: string) {
    const promptPrefix = chipPrompts[chipLabel] || `Analyze procurement requirements for ${chipLabel}: `;
    setInput(promptPrefix);
    textareaRef.current?.focus();
  }

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(overrideText?: string) {
    const text = (overrideText ?? input).trim();
    if (!text) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/requirements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawInput: text, inputMode: uploadedFile ? "upload" : "text" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Procure could not complete the analysis. Please try again.");
      router.push(`/analysis/${data.requirement.id}/understanding`);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Procure could not complete the analysis. Please try again.");
      setIsSubmitting(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFile(file);
    setInput((prev) =>
      prev
        ? prev
        : `[Extracted from: ${file.name}] Please analyze technical clauses and IS standards.`
    );
  }

  function toggleVoice() {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      setIsRecording(true);
      setTimeout(() => {
        setInput("500 industrial safety helmets for construction workers conforming to IS 2925");
        setIsRecording(false);
      }, 1500);
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    setIsRecording(true);
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsRecording(false);
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);
    recognition.start();
  }

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900 bg-[#f8fafc] relative">
      {/* DotField — fixed full-viewport background, z-0, below sticky header (z-50) */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 0 }}
      >
        <DotField
          dotRadius={2.5}
          dotSpacing={18}
          cursorRadius={340}
          bulgeOnly={true}
          bulgeStrength={50}
          glowRadius={180}
          gradientFrom="rgba(15, 98, 254, 0.30)"
          gradientTo="rgba(15, 98, 254, 0.14)"
          glowColor="rgba(15, 98, 254, 0.20)"
        />
      </div>
      {/* Main Content Area */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-6 pt-24 md:pt-28 pb-12">
        {/* Hero AI Procurement Prompt Section */}
        <section className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-950 mb-2 font-display">
            Tell Procure what you need to procure.
          </h1>
          <p className="text-sm md:text-base text-slate-600 max-w-xl mx-auto mb-8 font-normal">
            Enter a product, procurement requirement or tender and let Procure analyze it.
          </p>

          {/* Primary Procurement Input Card */}
          <div className="bg-white border border-slate-300 rounded-2xl p-4 shadow-xs hover:border-blue-400 focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-100 transition-all text-left">
            <div className="flex items-start gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                onChange={handleFileChange}
                className="hidden"
                id="hidden-file-input"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Attach Tender PDF or Technical Specification"
                className="mt-1 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center shrink-0 border border-slate-200 transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
              </button>
              <div className="flex-1">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Describe your product, procurement requirement or tender..."
                  rows={3}
                  className="w-full resize-none border-0 p-0 text-base text-slate-800 placeholder:text-slate-400 focus:ring-0 focus:outline-none font-sans"
                />
                {uploadedFile && (
                  <div className="mt-1 text-xs text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded inline-flex items-center gap-1 font-mono">
                    📎 {uploadedFile.name}
                    <button
                      type="button"
                      onClick={() => setUploadedFile(null)}
                      className="ml-1 text-slate-400 hover:text-red-500 cursor-pointer"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={toggleVoice}
                title="Voice input"
                className={`p-2 rounded-full transition-colors shrink-0 cursor-pointer ${
                  isRecording
                    ? "bg-red-50 text-red-600 border border-red-200 animate-pulse"
                    : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  ></path>
                </svg>
              </button>
            </div>

            {/* Input Bottom Helper & Submission Bar */}
            <div className="pt-3 mt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-slate-500 italic">
                Example: I need to procure 500 industrial safety helmets for construction workers conforming to IS 2925.
              </span>
              <button
                type="button"
                onClick={() => handleSubmit()}
                disabled={isSubmitting || !input.trim()}
                className="inline-flex items-center gap-2 bg-slate-900 hover:bg-[#0f62fe] active:bg-[#0043ce] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shadow-xs ml-auto disabled:opacity-50 cursor-pointer"
              >
                <span>{isSubmitting ? "Analyzing..." : "Analyze with AI"}</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
              </button>
            </div>
            {errorMessage && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between text-xs text-red-700">
                <span>{errorMessage}</span>
                <button type="button" onClick={() => setErrorMessage(null)} className="text-red-500 hover:text-red-800 font-bold ml-2">×</button>
              </div>
            )}
          </div>

          {/* Quick Action Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 mt-5">
            {[
              { label: "Find Standards", iconColor: "text-blue-600", path: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" },
              { label: "Analyze Tender", iconColor: "text-purple-600", path: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
              { label: "Find Supplier", iconColor: "text-emerald-600", path: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
              { label: "Check Certification", iconColor: "text-indigo-600", path: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
              { label: "Check Compliance", iconColor: "text-teal-600", path: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" },
              { label: "Compare Suppliers", iconColor: "text-amber-600", path: "M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" },
            ].map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={() => handleChipClick(chip.label)}
                className="chip-hover inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-slate-300 bg-white text-xs font-medium text-slate-700 shadow-2xs cursor-pointer"
              >
                <svg className={`w-3.5 h-3.5 ${chip.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d={chip.path} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
                {chip.label}
              </button>
            ))}
          </div>
        </section>

        {/* Dashboard Content Grid: 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Recent Procurement Activity (8 Columns) */}
          <section className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between pb-1">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-slate-900 font-display">
                  Recent Procurement Activity
                </h2>
                <p className="text-xs text-slate-500">
                  Quickly continue procurement drafts, reports and compliance checks
                </p>
              </div>
              <a href="#" className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                View All
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
              </a>
            </div>

            {/* Activity Card 1: Industrial Safety Helmet */}
            <article className="bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 hover:shadow-xs transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.8"
                      ></path>
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">Industrial Safety Helmet</h3>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200 font-mono">
                        IS 2925:1984
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">AI Procurement Analysis • 500 units requested</p>
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400 font-mono">
                      <span>Updated 10 min ago</span>
                      <span>•</span>
                      <span>Draft #PROC-2026-089</span>
                    </div>
                  </div>
                </div>
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Analysis Completed
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setInput("500 industrial safety helmets for construction workers, outdoor sites");
                      handleSubmit();
                    }}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-[#0f62fe] text-white text-xs font-medium rounded-lg transition-colors shadow-2xs cursor-pointer"
                  >
                    Continue Analysis
                  </button>
                </div>
              </div>
            </article>

            {/* Activity Card 2: Office Furniture Tender */}
            <article className="bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 hover:shadow-xs transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.8"
                      ></path>
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">Office Furniture Tender (Ergonomic Chairs)</h3>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                        IS 3400 / BIFMA
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">Tender Document Analysis • 120 sets • Tender #GEM/2026/B/89412</p>
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400 font-mono">
                      <span>Updated Yesterday</span>
                      <span>•</span>
                      <span>14 clauses checked</span>
                    </div>
                  </div>
                </div>
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    Standards Identified
                  </span>
                  <button
                    type="button"
                    className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </article>

            {/* Activity Card 3: Electrical Equipment */}
            <article className="bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 hover:shadow-xs transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"></path>
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">Electrical Equipment & Switchgear</h3>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200 font-mono">
                        IS/IEC 60947
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">Supplier: ABC Industrial Controls • Compliance & Verification</p>
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400 font-mono">
                      <span>Updated 2 days ago</span>
                      <span>•</span>
                      <span>Pending Test Report</span>
                    </div>
                  </div>
                </div>
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    Verification Required
                  </span>
                  <button
                    type="button"
                    className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                  >
                    Review Documents
                  </button>
                </div>
              </div>
            </article>

            {/* Quick Activity Sub-bar */}
            <div className="rounded-lg bg-slate-100/80 p-3 border border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center gap-4">
                <span className="font-medium text-slate-800 font-mono">Quick Recents:</span>
                <a href="#" className="hover:text-blue-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                  IS Standard Search: BIS 1786
                </a>
                <a href="#" className="hover:text-blue-600 hidden md:flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                  Tender Analysis: Rail Fasteners
                </a>
              </div>
              <span className="text-[11px] font-mono text-slate-400">Archived: 42 drafts</span>
            </div>
          </section>

          {/* Right Column: Pending Actions & Standards Intelligence (4 Columns) */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Pending Actions Widget */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 font-display">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  Pending Actions
                </h3>
                <span className="text-[11px] bg-amber-50 text-amber-800 font-semibold px-2 py-0.5 rounded border border-amber-200 font-mono">
                  3 Priority
                </span>
              </div>
              <ul className="space-y-3">
                <li className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-2.5">
                    <span className="text-amber-600 text-sm mt-0.5">⚠️</span>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-slate-900">Verify BIS Certificate authenticity</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Apex Safety Equipments (CM/L: 84001923)</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-[10px] text-red-600 font-medium">Expires in 2 days</span>
                        <button type="button" className="text-[11px] font-medium text-blue-600 hover:underline cursor-pointer">
                          Verify now →
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
                <li className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-2.5">
                    <span className="text-blue-600 text-sm mt-0.5">📄</span>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-slate-900">Review Technical Compliance Matrix</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">High-Voltage Cables • IS 7098 (Part 2)</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-[10px] text-slate-500 font-mono">Matrix #TCM-09</span>
                        <button type="button" className="text-[11px] font-medium text-blue-600 hover:underline cursor-pointer">
                          Review →
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
                <li className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-2.5">
                    <span className="text-emerald-600 text-sm mt-0.5">💬</span>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-slate-900">Supplier Response Received</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Safetech Industries submitted lab test reports</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-mono">1 hour ago</span>
                        <button type="button" className="text-[11px] font-medium text-blue-600 hover:underline cursor-pointer">
                          Open report →
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              </ul>
            </div>

            {/* Standards Intelligence Snapshot Widget */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 font-display">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    ></path>
                  </svg>
                  Standards Intelligence
                </h3>
                <span className="text-[11px] text-slate-500 font-mono">Live BIS Feeds</span>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-[11px] text-slate-500 block">Verified Standards</span>
                  <span className="text-xl font-bold text-slate-900 font-mono">22,480</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-[11px] text-slate-500 block">Active QCO Orders</span>
                  <span className="text-xl font-bold text-slate-900 font-mono">481</span>
                </div>
              </div>

              <div className="rounded-lg border border-blue-100 bg-blue-50/60 p-3">
                <div className="flex items-start gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-blue-600 text-white text-[9px] font-bold tracking-wide uppercase mt-0.5 font-mono">
                    NEW QCO
                  </span>
                  <div className="text-xs">
                    <p className="font-semibold text-slate-900">Mandatory Quality Control Order</p>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                      Steel & Iron wires conformances effective from 1st of next month under Gazette S.O. 1294.
                    </p>
                    <a href="#" className="inline-block mt-1.5 text-[11px] font-medium text-blue-700 hover:underline">
                      Read BIS Notification →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* ========================================================================= */}
      {/* BEGIN: Footer                                                             */}
      {/* ========================================================================= */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-[1440px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCbEqtDhDdjU-fL9LzdM0EcdVaFsrsIN7EYokV1OD3TZN91oPB54PMmxbIXKiBa9arSz1PNh6bOLU_GLaYiPp7Le0gJ0syUDiDRsyKw6yd4JYrOhZyRAVIjvyg3V3d1jhriz8B8SwqW6tI5L9FdIVGfB8ejAT5qracmJ3q21ib48Va0xOYyPZQjodq2fhFC3AlhD9laLr5wMatn53I_j5XFyCGqbPVmbpG8zKTFeUrsTnZUcXJnWDvB-LM6Za6dPRN0STw"
              alt="Procure"
              className="w-5 h-5 grayscale opacity-70 object-contain"
            />
            <span className="font-medium text-slate-700 font-display">Procure AI Platform</span>
            <span>•</span>
            <span>Government Procurement & BIS Standards Compliance System</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-slate-900 transition-colors">BIS Standards Directory</a>
            <a href="#" className="hover:text-slate-900 transition-colors">GeM Integration</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Compliance Verification API</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Help & Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
