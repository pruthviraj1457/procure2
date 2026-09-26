"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import DotField from "@/components/DotField";
import {
  Paperclip,
  Microphone,
  Brain,
  Certificate,
  FileText,
  Buildings,
  SealCheck,
  ShieldCheck,
  Scales,
  HardHat,
  Scroll,
  Lightning,
  ArrowRight,
  CheckCircle,
  WarningCircle,
  Table,
  ChatCircleDots,
  Stack,
} from "@phosphor-icons/react";

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
    <div className="min-h-screen flex flex-col font-sans selection:bg-purple-100 selection:text-purple-900 bg-[#faf9fc] relative">
      {/* DotField — fixed full-viewport background, z-0, strictly behind page content */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{ zIndex: 0 }}
      >
        <DotField
          dotRadius={2.2}
          dotSpacing={9}
          cursorRadius={340}
          bulgeOnly={true}
          bulgeStrength={50}
          glowRadius={180}
          gradientFrom="rgba(109, 40, 217, 0.52)"
          gradientTo="rgba(91, 33, 182, 0.40)"
          glowColor="rgba(124, 58, 237, 0.12)"
        />
      </div>
      {/* Main Content Area — explicitly elevated above background dots with z-10 */}
      <main className="relative z-10 flex-1 max-w-[1440px] w-full mx-auto px-6 pt-24 md:pt-28 pb-12">
        {/* Hero AI Procurement Prompt Section */}
        <section className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-950 mb-2 font-display">
            Tell Procure what you need to procure.
          </h1>
          <p className="text-sm md:text-base text-slate-600 max-w-xl mx-auto mb-8 font-normal">
            Enter a product, procurement requirement or tender and let Procure analyze it.
          </p>

          {/* Primary Procurement Input Card */}
          <div className="bg-white border border-slate-300 rounded-2xl p-4 shadow-xs hover:border-purple-300 focus-within:border-purple-600 focus-within:ring-4 focus-within:ring-purple-100 transition-all text-left">
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
                className="mt-1 w-9 h-9 rounded-full bg-purple-50/80 hover:bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 border border-purple-200/60 transition-colors cursor-pointer"
              >
                <Paperclip weight="duotone" className="w-5 h-5" />
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
                  <div className="mt-1 text-xs text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded inline-flex items-center gap-1 font-mono">
                    <Paperclip weight="bold" className="w-3.5 h-3.5" />
                    {uploadedFile.name}
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
                    : "text-slate-400 hover:text-purple-700 hover:bg-purple-50"
                }`}
              >
                <Microphone weight="duotone" className="w-5 h-5" />
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
                className="inline-flex items-center gap-2 bg-[#6d28d9] hover:bg-[#5b21b6] active:bg-[#4c1d95] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shadow-xs ml-auto disabled:opacity-50 cursor-pointer"
              >
                <span>{isSubmitting ? "Analyzing..." : "Analyze Specification"}</span>
                <ArrowRight weight="bold" className="w-4 h-4 text-white" />
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
              { label: "Find Standards", icon: <Certificate weight="fill" className="w-3.5 h-3.5 text-white" />, bg: "bg-[#7209b7]" },
              { label: "Analyze Tender", icon: <FileText weight="fill" className="w-3.5 h-3.5 text-white" />, bg: "bg-[#00a8e8]" },
              { label: "Find Supplier", icon: <Buildings weight="fill" className="w-3.5 h-3.5 text-white" />, bg: "bg-[#0d9488]" },
              { label: "Check Certification", icon: <SealCheck weight="fill" className="w-3.5 h-3.5 text-white" />, bg: "bg-[#2a9d8f]" },
              { label: "Check Compliance", icon: <ShieldCheck weight="fill" className="w-3.5 h-3.5 text-white" />, bg: "bg-[#6366f1]" },
              { label: "Compare Suppliers", icon: <Scales weight="fill" className="w-3.5 h-3.5 text-white" />, bg: "bg-[#f4a261]" },
            ].map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={() => handleChipClick(chip.label)}
                className="chip-hover inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer"
              >
                <span className={`w-6 h-6 rounded-full ${chip.bg} flex items-center justify-center shrink-0 shadow-xs`}>
                  {chip.icon}
                </span>
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
              <a href="#" className="text-xs font-semibold text-purple-700 hover:text-purple-900 flex items-center gap-1">
                View All
                <ArrowRight weight="bold" className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Activity Card 1: Industrial Safety Helmet */}
            <article className="bg-white rounded-xl border border-slate-200 p-5 hover:border-purple-200 hover:shadow-xs transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#f4a261] flex items-center justify-center shrink-0 shadow-xs">
                    <HardHat weight="fill" className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">Industrial Safety Helmet</h3>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-purple-50 text-purple-700 border border-purple-200/60 font-mono">
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
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                    <span className="w-4 h-4 rounded-full bg-[#2a9d8f] flex items-center justify-center shrink-0">
                      <CheckCircle weight="fill" className="w-3 h-3 text-white" />
                    </span>
                    Analysis Completed
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setInput("500 industrial safety helmets for construction workers, outdoor sites");
                      handleSubmit();
                    }}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-[#6d28d9] text-white text-xs font-medium rounded-lg transition-colors shadow-2xs cursor-pointer"
                  >
                    Continue Analysis
                  </button>
                </div>
              </div>
            </article>

            {/* Activity Card 2: Office Furniture Tender */}
            <article className="bg-white rounded-xl border border-slate-200 p-5 hover:border-purple-200 hover:shadow-xs transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#0077b6] flex items-center justify-center shrink-0 shadow-xs">
                    <Scroll weight="fill" className="w-5 h-5 text-white" />
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
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200/60">
                    <span className="w-4 h-4 rounded-full bg-[#7209b7] flex items-center justify-center shrink-0">
                      <Certificate weight="fill" className="w-3 h-3 text-white" />
                    </span>
                    Standards Identified
                  </span>
                  <button
                    type="button"
                    className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-purple-50 hover:text-purple-700 text-slate-700 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </article>

            {/* Activity Card 3: Electrical Equipment */}
            <article className="bg-white rounded-xl border border-slate-200 p-5 hover:border-purple-200 hover:shadow-xs transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#7209b7] flex items-center justify-center shrink-0 shadow-xs">
                    <Lightning weight="fill" className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">Electrical Equipment & Switchgear</h3>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200/60 font-mono">
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
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">
                    <span className="w-4 h-4 rounded-full bg-[#ff9f1c] flex items-center justify-center shrink-0">
                      <WarningCircle weight="fill" className="w-3 h-3 text-white" />
                    </span>
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
                <a href="#" className="hover:text-purple-700 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                  IS Standard Search: BIS 1786
                </a>
                <a href="#" className="hover:text-purple-700 hidden md:flex items-center gap-1">
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
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ff9f1c]"></span>
                  Pending Actions
                </h3>
                <span className="text-[11px] bg-amber-50 text-amber-800 font-semibold px-2 py-0.5 rounded border border-amber-200/60 font-mono">
                  3 Priority
                </span>
              </div>
              <ul className="space-y-3">
                <li className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-2.5">
                    <span className="w-7 h-7 rounded-full bg-[#e63946] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                      <WarningCircle weight="fill" className="w-4 h-4 text-white" />
                    </span>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-slate-900">Verify BIS Certificate authenticity</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Apex Safety Equipments (CM/L: 84001923)</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-[10px] text-red-600 font-medium">Expires in 2 days</span>
                        <button type="button" className="text-[11px] font-medium text-purple-700 hover:underline cursor-pointer">
                          Verify now →
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
                <li className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-2.5">
                    <span className="w-7 h-7 rounded-full bg-[#7209b7] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                      <Table weight="fill" className="w-4 h-4 text-white" />
                    </span>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-slate-900">Review Technical Compliance Matrix</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">High-Voltage Cables • IS 7098 (Part 2)</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-[10px] text-slate-500 font-mono">Matrix #TCM-09</span>
                        <button type="button" className="text-[11px] font-medium text-purple-700 hover:underline cursor-pointer">
                          Review →
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
                <li className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-2.5">
                    <span className="w-7 h-7 rounded-full bg-[#2a9d8f] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                      <ChatCircleDots weight="fill" className="w-4 h-4 text-white" />
                    </span>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-slate-900">Supplier Response Received</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Safetech Industries submitted lab test reports</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-mono">1 hour ago</span>
                        <button type="button" className="text-[11px] font-medium text-purple-700 hover:underline cursor-pointer">
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
                  <span className="w-7 h-7 rounded-full bg-[#00a8e8] flex items-center justify-center shrink-0 shadow-xs">
                    <Stack weight="fill" className="w-4 h-4 text-white" />
                  </span>
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

              <div className="rounded-lg border border-purple-100 bg-purple-50/60 p-3">
                <div className="flex items-start gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-purple-700 text-white text-[9px] font-bold tracking-wide uppercase mt-0.5 font-mono">
                    NEW QCO
                  </span>
                  <div className="text-xs">
                    <p className="font-semibold text-slate-900">Mandatory Quality Control Order</p>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                      Steel & Iron wires conformances effective from 1st of next month under Gazette S.O. 1294.
                    </p>
                    <a href="#" className="inline-block mt-1.5 text-[11px] font-medium text-purple-700 hover:underline">
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
      <footer className="relative z-10 border-t border-slate-200 bg-white py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-[1440px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center p-0.5 border border-purple-500/70 shrink-0 shadow-2xs">
              <img
                src="/procure-logo.png"
                alt="Procure"
                className="w-full h-full object-contain rounded-full opacity-90"
              />
            </div>
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
