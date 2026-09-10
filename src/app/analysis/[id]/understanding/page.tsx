"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Package, Hash, MapPin, Wrench, HelpCircle, ArrowRight, ChevronRight } from "lucide-react";

type Extracted = {
  product?: string;
  quantity?: number;
  useCase?: string;
  environment?: string;
  category?: string;
  statedSpecs?: string[];
  clarifyingQuestion?: { question: string; options: string[] };
  confidence?: number;
};

const STAGES = [
  { key: "reading", label: "Reading procurement requirement…", delay: 0 },
  { key: "product", label: "Identifying product category", delay: 1200 },
  { key: "specs", label: "Extracting technical specifications", delay: 2200 },
  { key: "query", label: "Querying verified standards database", delay: 3200 },
  { key: "done", label: "Analysis ready", delay: 4000 },
];

export default function UnderstandingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [currentStage, setCurrentStage] = useState(0);
  const [extracted, setExtracted] = useState<Extracted | null>(null);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [clarifyingAnswer, setClarifyingAnswer] = useState<string | null>(null);
  const [showQuestion, setShowQuestion] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiCalled, setApiCalled] = useState(false);

  useEffect(() => {
    if (apiCalled) return;
    setApiCalled(true);

    // Start the staged reveal animation
    STAGES.forEach((stage, i) => {
      setTimeout(() => {
        setCurrentStage(i);
      }, stage.delay);
    });

    // Call the analyze API
    fetch(`/api/requirements/${id}/analyze`, { method: "POST" })
      .then((r) => r.json())
      .then((data) => {
        setAnalysisData(data);
        setExtracted({
          ...data.extracted,
          clarifyingQuestion: data.clarifyingQuestion,
        });
        // Show clarifying question after staged reveal completes
        if (data.clarifyingQuestion) {
          setTimeout(() => setShowQuestion(true), 5000);
        }
      })
      .catch(console.error);
  }, [id, apiCalled]);

  function handleProceed() {
    setIsSubmitting(true);
    router.push(`/analysis/${id}/results`);
  }

  const extractedItems = extracted
    ? [
        { icon: Package, label: "Product", value: extracted.product },
        { icon: Hash, label: "Quantity", value: extracted.quantity?.toLocaleString("en-IN") },
        { icon: MapPin, label: "Use-case", value: extracted.useCase },
        { icon: Wrench, label: "Environment", value: extracted.environment },
      ].filter((item) => item.value)
    : [];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
            <span className="text-navy-600 font-medium">Analysis</span>
            <ChevronRight className="w-4 h-4" />
            <span>Understanding requirement</span>
          </div>
          <h1 className="text-2xl font-bold text-navy-800 mb-1">Understanding your requirement</h1>
          <p className="text-slate-500 text-sm">Procure is extracting structure from your input and querying verified IS records.</p>
        </div>

        {/* Processing stages */}
        <div className="card p-6 mb-6">
          <div className="space-y-4">
            {STAGES.map((stage, i) => {
              const isDone = i < currentStage || (i === currentStage && i === STAGES.length - 1);
              const isActive = i === currentStage && i < STAGES.length - 1;
              const isPending = i > currentStage;

              return (
                <div
                  key={stage.key}
                  className={`flex items-center gap-3 transition-all duration-500 ${
                    isPending ? "opacity-30" : "opacity-100"
                  }`}
                >
                  <div className="w-6 h-6 flex-shrink-0">
                    {isDone ? (
                      <CheckCircle2 className="w-6 h-6 text-verified-text animate-fade-in" />
                    ) : isActive ? (
                      <Loader2 className="w-6 h-6 text-accent-500 animate-spin" />
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-slate-200" />
                    )}
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      isDone
                        ? "text-slate-700"
                        : isActive
                        ? "text-navy-800"
                        : "text-slate-400"
                    }`}
                  >
                    {stage.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Extracted fields — reveal one at a time */}
        {extractedItems.length > 0 && (
          <div className="card p-6 mb-6 animate-slide-up">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Extracted requirement</h2>
            <div className="space-y-3">
              {extractedItems.map((item, i) => (
                <div
                  key={item.label}
                  className={`flex items-start gap-3 animate-slide-in-right delay-${(i + 1) * 100}`}
                >
                  <div className="w-8 h-8 rounded-lg bg-accent-50 border border-accent-100 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-4 h-4 text-accent-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{item.label}</p>
                    <p className="text-navy-800 font-semibold text-sm mt-0.5">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {extracted?.statedSpecs && extracted.statedSpecs.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Stated specifications</p>
                <div className="flex flex-wrap gap-2">
                  {extracted.statedSpecs.map((spec, i) => (
                    <span key={i} className="badge badge-accent">{spec}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Clarifying question */}
        {showQuestion && extracted?.clarifyingQuestion && !clarifyingAnswer && (
          <div className="card border-2 border-accent-200 p-6 mb-6 animate-slide-up">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-accent-100 flex items-center justify-center flex-shrink-0">
                <HelpCircle className="w-5 h-5 text-accent-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-accent-600 uppercase tracking-wider mb-1">One quick question</p>
                <p className="text-navy-800 font-medium text-sm">{extracted.clarifyingQuestion.question}</p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {extracted.clarifyingQuestion.options.map((option, i) => (
                <button
                  key={i}
                  onClick={() => setClarifyingAnswer(option)}
                  className="text-left px-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-700 hover:border-accent-400 hover:bg-accent-50 hover:text-accent-700 transition-all font-medium"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Answered question */}
        {clarifyingAnswer && (
          <div className="card p-4 mb-6 bg-verified-bg border-verified-border animate-fade-in">
            <p className="text-xs font-semibold text-verified-text uppercase tracking-wider mb-1">Your answer</p>
            <p className="text-verified-text font-medium text-sm">✓ {clarifyingAnswer}</p>
          </div>
        )}

        {/* CTA */}
        {extracted && (currentStage >= STAGES.length - 1 || analysisData) && (
          <div className="animate-slide-up delay-300">
            <button
              onClick={handleProceed}
              disabled={isSubmitting}
              className="btn btn-primary btn-lg w-full"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading results…
                </>
              ) : (
                <>
                  Generate Procurement Analysis
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            <p className="text-center text-xs text-slate-400 mt-3">
              Standards will be pulled from the BIS-verified local database — no fabricated IS numbers.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
