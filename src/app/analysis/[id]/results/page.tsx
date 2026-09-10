"use client";

import { useEffect, useState, useRef, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2, AlertTriangle, Info, ExternalLink, ChevronDown,
  ChevronUp, Shield, FileText, Download, ArrowRight,
  Loader2, ChevronRight, AlertCircle, BookOpen, Send, Paperclip, Mic, Edit3, Check, Sparkles, HelpCircle, ListChecks, Layers
} from "lucide-react";
import type { Standard } from "@/lib/standards/data/standards";
import type { AiResearchResult, ResearchStandard } from "@/lib/ai/aiResearchMode";

type RankedStandard = Standard & {
  finalScore: number;
  whyApplicable: string;
  relevanceScore: number;
  matchedKeywords: string[];
  verificationStatus?: "ai_research_verification_required" | "verified_bis_knowledge";
  knowledgeSource?: string;
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
  clarificationQuestions?: string[];
  procurementChecklist?: { item: string; mandatory: boolean; category: string }[];
  limitations?: string[];
  knowledgeSource?: string;
  disclaimer?: string;
  aiResearch?: AiResearchResult;
};

export default function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [standards, setStandards] = useState<RankedStandard[]>([]);
  const [aiResearch, setAiResearch] = useState<AiResearchResult | null>(null);
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

    fetch(`/api/requirements/${id}`)
      .then((r) => r.json())
      .then((reqData) => {
        if (reqData.requirement) {
          setRawInput(reqData.requirement.rawInput || "");
          setEditedReqInput(reqData.requirement.rawInput || "");
        }
      })
      .catch(console.error);

    fetch(`/api/requirements/${id}/analyze`)
      .then((r) => r.json())
      .then((data) => {
        if (data.ready || data.aiResearch || data.standards) {
          setStandards(data.standards || []);
          setExtracted(data.extracted || {});
          if (data.aiResearch) setAiResearch(data.aiResearch);
          else if (data.extracted?.aiResearch) setAiResearch(data.extracted.aiResearch);

          if (data.extracted?.messages) {
            setChatMessages(data.extracted.messages);
          }
        } else {
          return fetch(`/api/requirements/${id}/analyze`, { method: "POST" })
            .then((r) => r.json())
            .then((d) => {
              setStandards(d.standards || []);
              setExtracted(d.extracted || {});
              if (d.aiResearch) setAiResearch(d.aiResearch);
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

  async function handleSaveEditedRequirement() {
    if (!editedReqInput.trim()) return;
    setIsUpdatingReq(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/requirements/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: `Updated Requirement Specification: ${editedReqInput.trim()}` }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update requirement");
      setStandards(data.standards || []);
      setExtracted(data.extracted || {});
      if (data.aiResearch) setAiResearch(data.aiResearch);
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
      if (data.aiResearch) setAiResearch(data.aiResearch);
    } catch (err) {
      console.error(err);
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Procure AI could not process your request at this moment. Please try again.",
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

  // Aggregate standard data from AI Research + Verified Standards
  const researchStandards: ResearchStandard[] = aiResearch?.applicableStandards || [];
  const primaryResearchStandard = researchStandards[0];

  // Technical Requirements
  const displayTechReqs =
    aiResearch && primaryResearchStandard && primaryResearchStandard.technicalRequirements.length > 0
      ? primaryResearchStandard.technicalRequirements
      : (extracted.technicalRequirements || []);

  // Testing Requirements
  const displayTestReqs =
    aiResearch && primaryResearchStandard && primaryResearchStandard.testingRequirements.length > 0
      ? primaryResearchStandard.testingRequirements
      : standards.flatMap((s) => s.testingRequirements.map((r) => ({ test: r.test, requirement: r.requirement, source: r.source })));

  // Material Requirements
  const displayMaterialReqs =
    aiResearch && primaryResearchStandard && primaryResearchStandard.materialRequirements.length > 0
      ? primaryResearchStandard.materialRequirements
      : [];

  // Safety Requirements
  const displaySafetyReqs =
    aiResearch && primaryResearchStandard && primaryResearchStandard.safetyRequirements.length > 0
      ? primaryResearchStandard.safetyRequirements
      : (extracted.safetyRequirements || []);

  // Related Standards
  const displayRelatedStandards =
    aiResearch && primaryResearchStandard && primaryResearchStandard.relatedStandards.length > 0
      ? primaryResearchStandard.relatedStandards
      : (standards[0]?.relatedStandards || []);

  // Procurement Checklist
  const displayChecklist =
    aiResearch?.procurementChecklist || extracted.procurementChecklist || [];

  // Clarifications needed
  const clarificationsNeeded =
    aiResearch?.clarificationsNeeded || extracted.clarificationQuestions || [];

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between gap-6">
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
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <button type="button" aria-label="Notifications" className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"></path>
              </svg>
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

      {/* Main Workspace */}
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2.5 mb-1 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 font-display">
                AI Procurement Analysis
              </h1>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                AI Research Mode Active
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 font-normal">
              AI-driven requirement understanding &amp; standards intelligence research
            </p>
          </div>

          <div className="flex items-center gap-3">
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

        {/* Professional Regulatory Compliance Notice Box */}
        <div className="mb-8 p-4 rounded-xl bg-slate-900 text-slate-200 border border-slate-700 shadow-sm flex items-start gap-3 text-xs leading-relaxed font-sans">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold text-white">Compliance &amp; Verification Disclaimer: </span>
            <span>
              Procure AI identifies standards and procurement requirements from available information. Always verify the current standard, amendments and applicable regulatory requirements with the official BIS portal before issuing an actual tender.
            </span>
          </div>
        </div>

        {/* Error State Banner */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-sm text-red-800">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">{errorMessage}</p>
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
              Running Gemini AI Research Mode &amp; querying BIS standards knowledge layers.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* ── SECTION 1: Original Officer Requirement & Pipeline ── */}
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
                    { label: "Product Identification", done: true },
                    { label: "Intended Use Analysis", done: true },
                    { label: "Technical Requirements", done: true },
                    { label: "Standards Research", done: true },
                    { label: "Testing Protocols", done: true },
                    { label: "Certification & QCO", done: true },
                  ].map((step, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-100">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="text-xs font-semibold text-emerald-950 leading-tight">{step.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ── SECTION: Clarifications Required Card (Vague Input Handler) ── */}
            {clarificationsNeeded.length > 0 && (
              <section className="bg-amber-50/80 border-2 border-amber-300 rounded-2xl p-6 shadow-xs">
                <div className="flex items-start gap-3">
                  <HelpCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-amber-950 font-display">Requirement Clarification Needed</h3>
                    <p className="text-xs text-amber-900 mt-1 leading-relaxed">
                      To identify applicable Indian Standards accurately without ambiguity, please provide additional operational context:
                    </p>
                    <ul className="mt-3 space-y-2">
                      {clarificationsNeeded.map((q, i) => (
                        <li key={i} className="p-3 bg-white border border-amber-200 rounded-xl text-xs font-medium text-slate-800 shadow-2xs">
                          💡 {q}
                        </li>
                      ))}
                    </ul>
                    <p className="text-[11px] text-amber-800 mt-3 italic">
                      You can type your answer in the Analysis Conversation box at the bottom of this page to refresh results.
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* ── SECTION 2: Item 1 & 2: Product Identified & Requirement Understanding ── */}
            <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold text-xs">
                  01
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 font-display">Product &amp; Requirement Understanding</h2>
                  <p className="text-xs text-slate-500">Structured parameters extracted via AI Research Mode</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[11px] text-slate-500 font-medium block mb-1 uppercase tracking-wider font-mono">Product Identified</span>
                  <span className="text-sm font-bold text-slate-900 block">
                    {aiResearch?.product || extracted.product || "General Procurement Item"}
                  </span>
                  <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 font-mono">
                    {aiResearch?.category || extracted.category || "General Goods"}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[11px] text-slate-500 font-medium block mb-1 uppercase tracking-wider font-mono">Quantity &amp; Procurement Scale</span>
                  <span className="text-sm font-bold text-slate-900 block">
                    {aiResearch?.quantity
                      ? `${aiResearch.quantity.toLocaleString("en-IN")} Units`
                      : extracted.quantity
                      ? `${extracted.quantity.toLocaleString("en-IN")} Units`
                      : "Not specified / Per Tender Lot"}
                  </span>
                  <span className="text-xs text-slate-500 block mt-1">Batch sampling compliance required</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[11px] text-slate-500 font-medium block mb-1 uppercase tracking-wider font-mono">Intended Use &amp; Environment</span>
                  <span className="text-sm font-bold text-slate-900 block">
                    {aiResearch?.purpose || extracted.purpose || "Industrial application"}
                  </span>
                  <span className="text-xs text-slate-500 block mt-1">
                    {aiResearch?.intendedUse || extracted.intendedUse || "Industrial site conditions"}
                  </span>
                </div>
              </div>

              {/* Item 5: Technical Requirements Table */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Technical &amp; Functional Requirements
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
                            <td className="px-4 py-3 text-slate-500 font-mono">{req.clause || "Cl. Verified"}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="px-4 py-4 text-center text-slate-500 italic font-mono">
                            Not verified / requires official BIS verification.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* ── SECTION 3: Item 3, 4, 14: Applicable Indian Standards Cards ── */}
            <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 flex items-center justify-center font-bold text-xs">
                    02
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
                      <span>Applicable Indian Standards (IS)</span>
                      <span className="text-xs font-mono font-semibold px-2 py-0.5 bg-amber-50 text-amber-900 rounded border border-amber-300">
                        {researchStandards.length > 0 ? researchStandards.length : standards.length} Identified
                      </span>
                    </h2>
                    <p className="text-xs text-slate-500">Researched via Gemini AI &amp; verified knowledge records</p>
                  </div>
                </div>
              </div>

              {/* Research Standard Cards */}
              {researchStandards.length > 0 ? (
                <div className="space-y-5">
                  {researchStandards.map((std, i) => (
                    <AiResearchStandardCard key={i} standard={std} rank={i + 1} />
                  ))}
                </div>
              ) : standards.length > 0 ? (
                <div className="space-y-5">
                  {standards.map((std, i) => (
                    <VerifiedStandardCard key={std.id} standard={std} rank={i + 1} />
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-xl">
                  <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <h3 className="text-sm font-bold text-slate-800">No verified standard found in static catalog</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                    Not verified / requires official BIS verification. Please search directly on the official BIS portal.
                  </p>
                </div>
              )}
            </section>

            {/* ── SECTION 4: Item 6, 7, 8, 9: Testing, Material & Safety Requirements ── */}
            <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center font-bold text-xs">
                  03
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 font-display">Testing, Material &amp; Safety Requirements</h2>
                  <p className="text-xs text-slate-500">Laboratory test protocols, material construction &amp; mandatory safety rules</p>
                </div>
              </div>

              {/* Item 6: Testing Requirements */}
              <div className="mb-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono mb-3 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  Item 6: Laboratory &amp; Field Testing Requirements
                </h3>

                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold font-mono">
                      <tr>
                        <th className="px-4 py-3">Required Test</th>
                        <th className="px-4 py-3">Pass / Limit Criterion</th>
                        <th className="px-4 py-3">Source Clause</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800">
                      {displayTestReqs.length > 0 ? (
                        displayTestReqs.map((req, i) => (
                          <tr key={i} className="hover:bg-slate-50/50">
                            <td className="px-4 py-3 font-semibold text-slate-900">{req.test}</td>
                            <td className="px-4 py-3">{req.requirement}</td>
                            <td className="px-4 py-3 text-slate-500 font-mono">{req.source || "Cl. Verified"}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="px-4 py-3 text-slate-500 italic font-mono text-center">
                            Not verified / requires official BIS verification.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Item 7: Material / Construction Requirements */}
              <div className="mb-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono mb-3">
                  Item 7: Material &amp; Construction Specifications
                </h3>
                {displayMaterialReqs.length > 0 ? (
                  <div className="space-y-2">
                    {displayMaterialReqs.map((mat, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 text-xs text-slate-800 flex items-start gap-2">
                        <span className="text-blue-600 font-bold">•</span>
                        <span>{mat}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic font-mono p-3 bg-slate-50 rounded-lg border border-slate-200">
                    Not verified / requires official BIS verification.
                  </p>
                )}
              </div>

              {/* Item 8 & 9: Safety & Certification Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono mb-3 flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-emerald-600" />
                    Item 8: Safety Requirements
                  </h3>
                  <div className="space-y-2">
                    {displaySafetyReqs.length > 0 ? (
                      displaySafetyReqs.map((s, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 text-xs">
                          <span className="font-medium text-slate-800">{s.requirement}</span>
                          {s.source && <span className="block text-[11px] text-slate-400 font-mono mt-0.5">Source: {s.source}</span>}
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500 italic font-mono p-3 bg-slate-50 rounded-lg border border-slate-200">
                        Not verified / requires official BIS verification.
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono mb-3">
                    Item 9: Certification &amp; Conformity Information
                  </h3>
                  <div className="p-3.5 rounded-lg bg-blue-50/60 border border-blue-200 text-xs text-slate-800 leading-relaxed font-sans">
                    {primaryResearchStandard?.certificationInformation || "Mandatory ISI Mark certification scheme. Verify QCO notification on official BIS portal."}
                  </div>
                </div>
              </div>
            </section>

            {/* ── SECTION 5: Item 10 & 11: Related Standards & Revision Info ── */}
            <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 border border-purple-100 flex items-center justify-center font-bold text-xs">
                  04
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 font-display">Related Standards &amp; Revision Information</h2>
                  <p className="text-xs text-slate-500">Cross-referenced standards and reaffirmation history</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono mb-3">
                    Item 10: Related &amp; Sampling Standards
                  </h3>
                  {displayRelatedStandards.length > 0 ? (
                    <div className="space-y-2 font-mono text-xs">
                      {displayRelatedStandards.map((rel: any, idx) => (
                        <div key={idx} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-slate-800">
                          {typeof rel === "string" ? rel : `${rel.number} — ${rel.title}${rel.relationship ? ` (${rel.relationship})` : ""}`}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic font-mono p-3 bg-slate-50 rounded-lg border border-slate-200">
                      Not verified / requires official BIS verification.
                    </p>
                  )}
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono mb-3">
                    Item 11: Revision &amp; Amendment Information
                  </h3>
                  <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-800 leading-relaxed font-sans">
                    {primaryResearchStandard?.revisionInformation || "Not verified / requires official BIS verification."}
                  </div>
                </div>
              </div>
            </section>

            {/* ── SECTION 6: Item 12: Procurement Specification Checklist ── */}
            <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center font-bold text-xs">
                  05
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
                    <ListChecks className="w-5 h-5 text-emerald-600" />
                    <span>Item 12: Procurement Specification Checklist</span>
                  </h2>
                  <p className="text-xs text-slate-500">Tender verification checklist for government procurement officers</p>
                </div>
              </div>

              {displayChecklist.length > 0 ? (
                <div className="space-y-2.5">
                  {displayChecklist.map((item, idx) => (
                    <div key={idx} className="flex items-start justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs gap-3">
                      <div className="flex items-start gap-2.5">
                        <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                          ✓
                        </span>
                        <span className="font-medium text-slate-900">{item.item}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 font-mono text-[11px]">
                        <span className="px-2 py-0.5 rounded bg-slate-200/70 text-slate-700">{item.category}</span>
                        {item.mandatory && (
                          <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 font-bold">Mandatory</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic font-mono p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  Not verified / requires official BIS verification.
                </p>
              )}
            </section>

            {/* ── SECTION 7: Item 13 & 14: Evidence, Source & Verification Status Area ── */}
            <section className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-5 h-5 text-amber-400" />
                  <div>
                    <h3 className="text-sm font-bold text-white font-display">Item 13 &amp; 14: Evidence, Source &amp; Verification Status</h3>
                    <p className="text-xs text-slate-400">Knowledge source telemetry &amp; verification status indicator</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="text-slate-400">Knowledge Source:</span>
                  <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                    {extracted.knowledgeSource || "AI Research Mode"}
                  </span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
                  <span className="text-slate-400 uppercase tracking-wider font-mono text-[10px] block mb-1">Status</span>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-400/20 text-amber-300 font-bold font-mono text-xs mb-2 border border-amber-400/30">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    AI identified — BIS verification required
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    AI-researched information; verify current standard status and regulatory requirements against the official BIS portal before actual procurement.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
                  <span className="text-slate-400 uppercase tracking-wider font-mono text-[10px] block mb-1">Evidence &amp; References</span>
                  <ul className="space-y-1.5 text-slate-300 font-mono">
                    {(primaryResearchStandard?.evidence || ["AI Research Knowledge Base", "Official BIS Portal Lookup Required"]).map((ev, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="text-amber-400">›</span>
                        <span>{ev}</span>
                      </li>
                    ))}
                  </ul>
                  <a
                    href="https://www.services.bis.gov.in"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 mt-3 font-semibold text-amber-400 hover:underline font-mono"
                  >
                    <span>Visit Official BIS Services Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </section>

            {/* ── SECTION 8: Analysis Conversation Stream ── */}
            <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 border border-purple-100 flex items-center justify-center font-bold text-xs">
                    06
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

              {/* Chat Input Bar */}
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
            <span>AI Research Mode &amp; BIS Standards Intelligence</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span>Official BIS Portal Lookup</span>
            <span>•</span>
            <span>GeM Integration Ready</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ── Standard Card Sub-components ──

function AiResearchStandardCard({
  standard,
  rank,
}: {
  standard: ResearchStandard;
  rank: number;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`p-5 rounded-xl border transition-all bg-white ${rank === 1 ? "border-amber-400 shadow-xs ring-1 ring-amber-100" : "border-slate-200 hover:border-slate-300"}`}>
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap font-mono">
            <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-slate-900 text-white">
              {standard.standardNumber}
            </span>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-amber-700" />
              AI identified — BIS verification required
            </span>
            {rank === 1 && (
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                Primary Standard
              </span>
            )}
          </div>

          <h3 className="text-base font-bold text-slate-900 mb-1 font-display">{standard.title}</h3>

          <p className="text-xs text-slate-700 italic border-l-2 border-amber-500 pl-3 py-0.5 leading-relaxed bg-amber-50/50 rounded-r-md mt-2">
            "{standard.whyApplicable}"
          </p>
        </div>

        <div className="shrink-0 flex sm:flex-col items-end gap-2 font-mono text-xs">
          <a
            href="https://www.services.bis.gov.in"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            <span>Verify on BIS Portal</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
          </a>
        </div>
      </div>

      {/* Certification details */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3 text-xs">
        <span className="font-semibold text-slate-700 font-mono">Certification &amp; QCO:</span>
        <span className="px-2 py-0.5 rounded font-medium bg-amber-50 text-amber-900 border border-amber-200 font-mono">
          {standard.certificationInformation}
        </span>
      </div>

      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="mt-3 text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors cursor-pointer"
      >
        {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        <span>{expanded ? "Hide technical details & evidence" : "Show technical details, related standards & evidence"}</span>
      </button>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-slate-100 text-xs space-y-3">
          {standard.technicalRequirements.length > 0 && (
            <div>
              <span className="font-bold text-slate-700 font-mono uppercase tracking-wider block mb-1">Key Technical Parameters</span>
              <ul className="space-y-1 text-slate-600 font-mono text-[11px]">
                {standard.technicalRequirements.map((tr, idx) => (
                  <li key={idx}>• {tr.parameter}: {tr.value} ({tr.clause || "Cl. Verified"})</li>
                ))}
              </ul>
            </div>
          )}

          {standard.relatedStandards.length > 0 && (
            <div>
              <span className="font-bold text-slate-700 font-mono uppercase tracking-wider block mb-1">Related Standards</span>
              <p className="text-slate-600 font-mono text-[11px]">{standard.relatedStandards.join(", ")}</p>
            </div>
          )}

          <div>
            <span className="font-bold text-slate-700 font-mono uppercase tracking-wider block mb-1">Revision / Amendment Status</span>
            <p className="text-slate-600 font-sans text-xs">{standard.revisionInformation}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function VerifiedStandardCard({
  standard,
  rank,
}: {
  standard: RankedStandard;
  rank: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const score = standard.finalScore || standard.relevanceScore;

  return (
    <div className={`p-5 rounded-xl border transition-all bg-white ${rank === 1 ? "border-blue-400 shadow-xs ring-1 ring-blue-100" : "border-slate-200 hover:border-slate-300"}`}>
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap font-mono">
            <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-slate-900 text-white">
              {standard.number}:{standard.year}
            </span>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-900 border border-amber-300 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-amber-700" />
              {standard.verificationStatus || "Prototype knowledge record — BIS verification required"}
            </span>
          </div>

          <h3 className="text-base font-bold text-slate-900 mb-1 font-display">{standard.title}</h3>
          <p className="text-xs text-slate-500 mb-3">{standard.revision}</p>

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
    </div>
  );
}
