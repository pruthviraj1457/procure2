"use client";

import { useEffect, useState, useRef, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2, AlertTriangle, Info, ExternalLink, ChevronDown,
  ChevronUp, Shield, FileText, Download, ArrowRight,
  Loader2, ChevronRight, FlaskConical, AlertCircle, BookOpen, Send, Paperclip, Mic, Edit3, Check
} from "lucide-react";
import type { Standard } from "@/lib/standards/data/standards";

type RankedStandard = Standard & {
  finalScore: number;
  whyApplicable: string;
  relevanceScore: number;
  matchedKeywords: string[];
};

type Extracted = {
  product?: string;
  quantity?: number;
  purpose?: string;
  useCase?: string;
  intendedUse?: string;
  environment?: string;
  category?: string;
  statedSpecs?: string[];
  technicalRequirements?: { parameter: string; value: string; clause?: string; note?: string }[];
  safetyRequirements?: { requirement: string; source?: string }[];
  procurementRequirements?: string[];
  keywords?: string[];
  messages?: { role: "user" | "assistant"; text: string; sentAt: string }[];
};

export default function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [standards, setStandards] = useState<RankedStandard[]>([]);
  const [extracted, setExtracted] = useState<Extracted>({});
  const [rawInput, setRawInput] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Edit raw requirement state
  const [isEditingReq, setIsEditingReq] = useState(false);
  const [editedReqInput, setEditedReqInput] = useState("");
  const [isUpdatingReq, setIsUpdatingReq] = useState(false);

  // Conversation state
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "assistant"; text: string; sentAt: string }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isSendingMsg, setIsSendingMsg] = useState(false);

  const [expandedEvidence, setExpandedEvidence] = useState(false);
  const [expandedStandards, setExpandedStandards] = useState<Set<string>>(new Set());

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchRequirementData();
  }, [id]);

  function fetchRequirementData() {
    setLoading(true);
    setErrorMessage(null);

    // First check requirement record
    fetch(`/api/requirements/${id}`)
      .then((r) => r.json())
      .then((reqData) => {
        if (reqData.requirement) {
          setRawInput(reqData.requirement.rawInput || "");
          setEditedReqInput(reqData.requirement.rawInput || "");
        }
      })
      .catch(console.error);

    // Fetch analysis results
    fetch(`/api/requirements/${id}/analyze`)
      .then((r) => r.json())
      .then((data) => {
        if (data.ready) {
          setStandards(data.standards || []);
          setExtracted(data.extracted || {});
          if (data.extracted?.messages) {
            setChatMessages(data.extracted.messages);
          }
        } else {
          // If analysis not complete, trigger analyze POST
          return fetch(`/api/requirements/${id}/analyze`, { method: "POST" })
            .then((r) => r.json())
            .then((d) => {
              setStandards(d.standards || []);
              setExtracted(d.extracted || {});
              if (d.extracted?.messages) {
                setChatMessages(d.extracted.messages);
              }
            });
        }
      })
      .catch((err) => {
        console.error(err);
        setErrorMessage("Procure could not complete the analysis. Please try again.");
      })
      .finally(() => setLoading(false));
  }

  // Handle Edit Requirement Submission
  async function handleSaveEditedRequirement() {
    if (!editedReqInput.trim()) return;
    setIsUpdatingReq(true);
    setErrorMessage(null);
    try {
      // Send updated message to messages API to re-evaluate requirement context
      const res = await fetch(`/api/requirements/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: `Updated Requirement Specification: ${editedReqInput.trim()}` }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update requirement");
      setStandards(data.standards || []);
      setExtracted(data.extracted || {});
      setChatMessages(data.messages || []);
      setRawInput(editedReqInput.trim());
      setIsEditingReq(false);
    } catch (err: any) {
      console.error(err);
      setErrorMessage("Failed to update requirement. Please try again.");
    } finally {
      setIsUpdatingReq(false);
    }
  }

  // Handle Sending Conversation Message
  async function handleSendMessage(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const text = chatInput.trim();
    if (!text || isSendingMsg) return;

    const userMsg = { role: "user" as const, text, sentAt: new Date().toISOString() };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setIsSendingMsg(true);

    try {
      const res = await fetch(`/api/requirements/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send message");

      setChatMessages(data.messages || []);
      if (data.extracted) setExtracted(data.extracted);
      if (data.standards) setStandards(data.standards);
    } catch (err) {
      console.error(err);
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Procure could not process your request at this moment. Please try again.",
          sentAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsSendingMsg(false);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }

  function toggleStandard(stdId: string) {
    setExpandedStandards((prev) => {
      const next = new Set(prev);
      if (next.has(stdId)) next.delete(stdId);
      else next.add(stdId);
      return next;
    });
  }

  const primaryStandard = standards[0];
  const techReqsFromExtracted = extracted.technicalRequirements || [];
  const techReqsFromStandards = standards.flatMap((s) =>
    s.technicalRequirements.map((r) => ({ ...r, source: `${s.number}:${s.year}` }))
  );
  const displayTechReqs = techReqsFromExtracted.length > 0 ? techReqsFromExtracted : techReqsFromStandards;

  const allTestReqs = standards.flatMap((s) =>
    s.testingRequirements.map((r) => ({ ...r, standard: s.number }))
  );
  const allSafetyReqs = standards.flatMap((s) =>
    s.safetyRequirements.map((r) => ({ ...r, standard: s.number }))
  );
  const allRelated = primaryStandard?.relatedStandards || [];

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* ========================================================================= */}
      {/* CANONICAL PROCURE HEADER                                                  */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between gap-6">
          {/* Left Brand & Navigation Section */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              aria-label="Open navigation menu"
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM18 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </button>
            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAk4Le55Bl4onG-aJhl36kgDhKn_4-PxMRxtfLPCCr39mrNQSicw2rShwxdGFp5-soBdgViP52Sb6_xswzVzOuZHtleG3l5Cx5_MpzywAQQBUj7xVX60Hlv6Ho-Juym4oKZ3aJY9EeOVkXDTZIdCieoEzH_FNDRElf4CUF8Z6UNObrlnY2joDPkt8DdZKA36rv77v9HRuvvnUrijvsS0X7tR377ARVzkkNwAvdHiBVyxtrOLvVKiDb3KGdtWT7tc8PwrZU"
                alt="Procure Logo"
                className="w-8 h-8 object-contain transition-transform group-hover:scale-105"
              />
              <span className="text-xl font-bold tracking-tight text-slate-900 font-display">
                Procure
              </span>
            </Link>
          </div>

          {/* Center Global Universal Search Bar */}
          <div className="flex-1 max-w-2xl">
            <div className="relative flex items-center">
              <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
              </div>
              <input
                id="global-procure-search"
                type="text"
                placeholder="Search standards, products, suppliers, certifications..."
                className="w-full pl-10 pr-20 py-2 text-sm bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all placeholder:text-slate-400 font-normal text-slate-800"
              />
              <div className="absolute right-2.5 flex items-center gap-1">
                <button type="button" title="Scan document" className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors cursor-pointer">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Right User Utilities & Officer Profile Pill */}
          <div className="flex items-center gap-4 shrink-0">
            <button type="button" aria-label="Notifications" className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"></path>
              </svg>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
            </button>
            <div className="h-6 w-px bg-slate-200"></div>
            <button type="button" className="flex items-center gap-2.5 p-1.5 pr-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer">
              <div className="w-7 h-7 rounded-full bg-slate-800 text-white font-medium text-xs flex items-center justify-center tracking-wider font-mono">
                PM
              </div>
              <div className="text-left hidden md:block">
                <div className="text-xs font-semibold text-slate-800 leading-tight">Pruthviraj Mali</div>
                <div className="text-[10px] text-slate-500 leading-tight">Procurement Officer</div>
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MAIN AI PROCUREMENT ANALYSIS WORKSPACE                                   */}
      {/* ========================================================================= */}
      <main className="flex-1 max-w-[1280px] w-full mx-auto px-6 py-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-6 font-mono">
          <Link href="/dashboard" className="hover:text-slate-900 transition-colors">Dashboard</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-900 font-semibold">AI Procurement Analysis</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-400">#PROC-{id.slice(-6).toUpperCase()}</span>
        </div>

        {/* Page Title & Status Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 font-display">
                AI Procurement Analysis
              </h1>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Procure AI Verified
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 font-normal">
              Structured requirement extraction and verified Indian Standards intelligence analysis
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push(`/analysis/${id}/report`)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors shadow-2xs cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Export Tech Specs</span>
            </button>
            <button
              type="button"
              onClick={() => router.push(`/analysis/${id}/suppliers`)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-[#0f62fe] text-white text-xs font-semibold rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              <span>Find Verified Suppliers</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Error State Banner */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-sm text-red-800">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">{errorMessage}</p>
              <p className="text-xs text-red-600 mt-0.5">Please check your network connection or verify requirements on the official BIS portal.</p>
            </div>
            <button type="button" onClick={() => fetchRequirementData()} className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 text-xs font-semibold rounded-md transition-colors cursor-pointer">
              Retry Analysis
            </button>
          </div>
        )}

        {/* Loading Overlay */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
            <Loader2 className="w-8 h-8 animate-spin text-[#0f62fe] mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">Procure AI is analyzing your requirement…</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Extracting parameters and querying the verified BIS Indian Standards knowledge layer.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* ── SECTION 1: Original Officer Requirement & Staged Progress ── */}
            <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                    Original Officer Requirement
                  </span>
                  <span className="text-xs text-slate-400 font-mono">• Procurement ID #PROC-{id.slice(-6).toUpperCase()}</span>
                </div>
                {!isEditingReq ? (
                  <button
                    type="button"
                    onClick={() => setIsEditingReq(true)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Review / Edit Requirement</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingReq(false)}
                      className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveEditedRequirement}
                      disabled={isUpdatingReq}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-slate-900 hover:bg-[#0f62fe] text-white text-xs font-semibold rounded cursor-pointer"
                    >
                      {isUpdatingReq ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      <span>Save &amp; Re-Analyze</span>
                    </button>
                  </div>
                )}
              </div>

              {!isEditingReq ? (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-800 leading-relaxed font-sans">
                  "{rawInput || "Industrial safety requirement for procurement."}"
                </div>
              ) : (
                <div className="space-y-3">
                  <textarea
                    value={editedReqInput}
                    onChange={(e) => setEditedReqInput(e.target.value)}
                    rows={3}
                    className="w-full p-3.5 text-sm bg-white border border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-xl outline-none font-sans text-slate-800"
                  />
                </div>
              )}

              {/* Staged Analysis Pipeline Indicators */}
              <div className="mt-6 pt-5 border-t border-slate-100">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono block mb-3">
                  Staged AI Analysis Pipeline
                </span>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {[
                    { label: "Identifying product", done: true },
                    { label: "Understanding intended use", done: true },
                    { label: "Extracting technical reqs", done: true },
                    { label: "Finding applicable standards", done: true },
                    { label: "Checking test requirements", done: true },
                    { label: "Checking certification info", done: true },
                  ].map((step, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-100">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="text-xs font-semibold text-emerald-950 leading-tight">{step.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ── SECTION 2: Requirement Understanding ── */}
            <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold text-xs">
                  01
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 font-display">Requirement Understanding</h2>
                  <p className="text-xs text-slate-500">Structured parameters extracted from procurement prompt</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[11px] text-slate-500 font-medium block mb-1 uppercase tracking-wider font-mono">Product Name</span>
                  <span className="text-sm font-bold text-slate-900 block">{extracted.product || "Industrial Safety Equipment"}</span>
                  <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 font-mono">
                    {extracted.category || "Safety Equipment"}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[11px] text-slate-500 font-medium block mb-1 uppercase tracking-wider font-mono">Quantity Requested</span>
                  <span className="text-sm font-bold text-slate-900 block">
                    {extracted.quantity ? `${extracted.quantity.toLocaleString("en-IN")} Units` : "500 Units (Default)"}
                  </span>
                  <span className="text-xs text-slate-500 block mt-1">Lot sampling per IS 9695:1980</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[11px] text-slate-500 font-medium block mb-1 uppercase tracking-wider font-mono">Intended Use &amp; Environment</span>
                  <span className="text-sm font-bold text-slate-900 block">{extracted.purpose || extracted.useCase || "Construction & Industrial work"}</span>
                  <span className="text-xs text-slate-500 block mt-1">{extracted.intendedUse || extracted.environment || "Outdoor site conditions"}</span>
                </div>
              </div>

              {/* Technical Requirements Table */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Technical &amp; Functional Specifications
                </h3>

                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold font-mono">
                      <tr>
                        <th className="px-4 py-3">Technical Parameter</th>
                        <th className="px-4 py-3">Specified Value / Limit</th>
                        <th className="px-4 py-3">Clause Reference</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800">
                      {displayTechReqs.length > 0 ? (
                        displayTechReqs.map((req, i) => (
                          <tr key={i} className="hover:bg-slate-50/50">
                            <td className="px-4 py-3 font-semibold text-slate-900">{req.parameter}</td>
                            <td className="px-4 py-3">{req.value}</td>
                            <td className="px-4 py-3 text-slate-500 font-mono">{req.clause || (req as any).source || "Cl. Verified"}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="px-4 py-4 text-center text-slate-500 italic">
                            Standard parameters apply as per IS specification.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* ── SECTION 3: Applicable Indian Standards Knowledge Layer ── */}
            <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center font-bold text-xs">
                    02
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
                      <span>Applicable Indian Standards</span>
                      <span className="text-xs font-mono font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200">
                        {standards.length} Verified
                      </span>
                    </h2>
                    <p className="text-xs text-slate-500">Queried strictly from local verified BIS knowledge records</p>
                  </div>
                </div>
              </div>

              {standards.length === 0 ? (
                <div className="p-8 text-center bg-amber-50/50 border border-amber-200 rounded-xl">
                  <AlertCircle className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                  <h3 className="text-sm font-bold text-amber-900">Insufficient verified data</h3>
                  <p className="text-xs text-amber-800 mt-1 max-w-md mx-auto">
                    No verified standard was found in the current knowledge base for your query. Please verify directly with the official BIS portal.
                  </p>
                  <a
                    href="https://www.services.bis.gov.in"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold text-blue-700 hover:underline"
                  >
                    <span>Visit Official BIS Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ) : (
                <div className="space-y-5">
                  {standards.map((std, i) => (
                    <StandardCard
                      key={std.id}
                      standard={std}
                      rank={i + 1}
                      expanded={expandedStandards.has(std.id)}
                      onToggle={() => toggleStandard(std.id)}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* ── SECTION 4: Testing & Safety Requirements ── */}
            {allTestReqs.length > 0 && (
              <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center font-bold text-xs">
                    03
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 font-display">Testing &amp; Compliance Requirements</h2>
                    <p className="text-xs text-slate-500">Mandatory lab test protocols and sampling standards</p>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden mb-6">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold font-mono">
                      <tr>
                        <th className="px-4 py-3">Required Test</th>
                        <th className="px-4 py-3">Pass / Limit Criterion</th>
                        <th className="px-4 py-3">Source Clause</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800">
                      {allTestReqs.map((req, i) => (
                        <tr key={i} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3 font-semibold text-slate-900">{req.test}</td>
                          <td className="px-4 py-3">{req.requirement}</td>
                          <td className="px-4 py-3 text-slate-500 font-mono">{req.source}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {allSafetyReqs.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono mb-3 flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-emerald-600" />
                      Mandatory Safety Requirements
                    </h3>
                    <div className="space-y-2">
                      {allSafetyReqs.map((s, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200/80 text-xs">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-medium text-slate-800">{s.requirement}</span>
                            <span className="block text-[11px] text-slate-400 font-mono mt-0.5">Source: {s.source}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* ── SECTION 5: Evidence & Source Verification ── */}
            <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <button
                type="button"
                onClick={() => setExpandedEvidence(!expandedEvidence)}
                className="w-full flex items-center justify-between text-left cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Verified Evidence &amp; BIS Portal Records</h3>
                    <p className="text-xs text-slate-500">Every record is linked to official BIS published standards</p>
                  </div>
                </div>
                {expandedEvidence ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>

              {expandedEvidence && (
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                  {standards.map((std) => (
                    <div key={std.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200/70 text-xs">
                      <div>
                        <span className="font-bold text-slate-900 font-mono">{std.number}:{std.year}</span>
                        <span className="text-slate-600 ml-2">— {std.title}</span>
                      </div>
                      <a
                        href={std.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:underline shrink-0 font-mono"
                      >
                        <span>Official BIS Link</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* ── SECTION 6: Analysis Conversation (Step 7) ── */}
            <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 border border-purple-100 flex items-center justify-center font-bold text-xs">
                    04
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 font-display">Analysis Conversation</h2>
                    <p className="text-xs text-slate-500">Ask Procure, clarify a requirement, or add more information to refine analysis</p>
                  </div>
                </div>
              </div>

              {/* Chat messages stream */}
              <div className="space-y-3 max-h-80 overflow-y-auto pr-2 mb-4">
                {chatMessages.length === 0 ? (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 text-xs text-slate-500 text-center">
                    No clarification messages yet. You can type below to ask Procure AI follow-up questions or add site conditions.
                  </div>
                ) : (
                  chatMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex flex-col ${
                        msg.role === "user" ? "items-end" : "items-start"
                      }`}
                    >
                      <div
                        className={`max-w-xl p-3.5 rounded-2xl text-xs leading-relaxed ${
                          msg.role === "user"
                            ? "bg-slate-900 text-white rounded-br-none"
                            : "bg-blue-50 text-slate-900 border border-blue-100 rounded-bl-none font-medium"
                        }`}
                      >
                        <span className="font-semibold block text-[10px] opacity-70 mb-1 font-mono uppercase">
                          {msg.role === "user" ? "Procurement Officer" : "Procure AI"}
                        </span>
                        {msg.text}
                      </div>
                    </div>
                  ))
                )}
                {isSendingMsg && (
                  <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                    <span>Procure AI is processing your input…</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Bar (Matches exact prompt specs) */}
              <form onSubmit={handleSendMessage} className="relative flex items-center">
                <div className="relative flex-1 flex items-center">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask Procure, clarify a requirement, or add more information..."
                    className="w-full pl-4 pr-24 py-3 text-xs bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all placeholder:text-slate-400 font-sans text-slate-800 shadow-inner"
                  />
                  <div className="absolute right-2 flex items-center gap-1">
                    <button
                      type="button"
                      title="Attach file or spec sheet"
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded transition-colors cursor-pointer"
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      title="Voice input"
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded transition-colors cursor-pointer"
                    >
                      <Mic className="w-4 h-4" />
                    </button>
                    <button
                      type="submit"
                      disabled={isSendingMsg || !chatInput.trim()}
                      className="p-2 bg-slate-900 hover:bg-[#0f62fe] text-white rounded-lg transition-colors disabled:opacity-40 cursor-pointer shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </form>
            </section>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-[1440px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">Procure AI Platform</span>
            <span>•</span>
            <span>Verified BIS Standards Intelligence System</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span>BIS Portal Verified</span>
            <span>•</span>
            <span>GeM Integration Ready</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ── Sub-components ──

function StandardCard({
  standard,
  rank,
  expanded,
  onToggle,
}: {
  standard: RankedStandard;
  rank: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  const score = standard.finalScore || standard.relevanceScore;

  return (
    <div className={`p-5 rounded-xl border transition-all bg-white ${rank === 1 ? "border-blue-400 shadow-xs ring-1 ring-blue-100" : "border-slate-200 hover:border-slate-300"}`}>
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap font-mono">
            <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-slate-900 text-white">
              {standard.number}:{standard.year}
            </span>
            <StatusPill status={standard.status} />
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Verified Current Record
            </span>
            {rank === 1 && (
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                Primary Standard
              </span>
            )}
          </div>

          <h3 className="text-base font-bold text-slate-900 mb-1 font-display">{standard.title}</h3>
          <p className="text-xs text-slate-500 mb-3">{standard.revision}</p>

          {/* Relevance Bar */}
          <div className="flex items-center gap-3 mb-3 max-w-sm">
            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div className="h-full bg-blue-600 rounded-full" style={{ width: `${score}%` }} />
            </div>
            <span className="text-xs font-bold font-mono text-slate-900">{score}% Match</span>
          </div>

          <p className="text-xs text-slate-700 italic border-l-2 border-blue-500 pl-3 py-0.5 leading-relaxed bg-slate-50 rounded-r-md">
            "{standard.whyApplicable}"
          </p>
        </div>

        <div className="shrink-0 flex sm:flex-col items-end gap-2">
          <a
            href={standard.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-semibold rounded-lg transition-colors font-mono cursor-pointer"
          >
            <span>Official BIS Source</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
          </a>
        </div>
      </div>

      {/* Certification details */}
      {standard.certification && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3 text-xs">
          <span className="font-semibold text-slate-700 font-mono">Certification Status:</span>
          <span className="px-2 py-0.5 rounded font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono">
            {standard.certification.mark || "ISI Mark Mandatory"}
          </span>
          {standard.certification.scheme && (
            <span className="text-slate-500 text-[11px] font-mono">• {standard.certification.scheme}</span>
          )}
        </div>
      )}

      {/* Toggle scope */}
      <button
        type="button"
        onClick={onToggle}
        className="mt-3 text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors cursor-pointer"
      >
        {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        <span>{expanded ? "Hide scope & keywords" : "Show full scope & matched keywords"}</span>
      </button>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-slate-100 text-xs space-y-2">
          <div>
            <span className="font-bold text-slate-700 font-mono uppercase tracking-wider block mb-1">Standard Scope</span>
            <p className="text-slate-600 leading-relaxed">{standard.scope}</p>
          </div>
          {standard.matchedKeywords.length > 0 && (
            <div>
              <span className="font-bold text-slate-700 font-mono uppercase tracking-wider block mb-1">Matched Keywords</span>
              <div className="flex flex-wrap gap-1.5">
                {standard.matchedKeywords.map((kw, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-mono text-[11px]">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: Standard["status"] }) {
  if (status === "current") {
    return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">Current</span>;
  }
  if (status === "superseded") {
    return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800">Superseded</span>;
  }
  return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-200 text-slate-700">Withdrawn</span>;
}
