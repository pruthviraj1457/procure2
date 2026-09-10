"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Star, StarOff, MessageCircle, ChevronDown, ChevronUp,
  CheckCircle2, MapPin, Building2, ChevronRight, Loader2,
  BarChart3, ArrowRight
} from "lucide-react";
import { useRole } from "@/components/layout/RoleContext";

type MatchBreakdown = {
  productMatch: number;
  standardsAlignment: number;
  compliance: number;
  documents: number;
  certification: number;
  other: number;
};

type SupplierResult = {
  id: string;
  name: string;
  businessType: string;
  location: string;
  about: string;
  trustRating: number;
  yearsInBusiness: number;
  annualTurnover: string;
  certifications: { name: string; verified: boolean }[];
  standardsPassport: { standardId: string; certified: boolean }[];
  matchScore: {
    overall: number;
    breakdown: MatchBreakdown;
    reasons: string[];
  };
  isFavorite: boolean;
};

const BREAKDOWN_LABELS: { key: keyof MatchBreakdown; label: string; weight: string; color: string }[] = [
  { key: "productMatch", label: "Product Match", weight: "30%", color: "bg-accent-500" },
  { key: "standardsAlignment", label: "Standards Alignment", weight: "25%", color: "bg-navy-600" },
  { key: "compliance", label: "Compliance", weight: "20%", color: "bg-green-500" },
  { key: "documents", label: "Required Documents", weight: "10%", color: "bg-purple-500" },
  { key: "certification", label: "Certification", weight: "10%", color: "bg-orange-500" },
  { key: "other", label: "Other (Trust)", weight: "5%", color: "bg-slate-400" },
];

export default function SuppliersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { isOfficer } = useRole();
  const [suppliers, setSuppliers] = useState<SupplierResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSupplier, setExpandedSupplier] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [startingConvo, setStartingConvo] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/suppliers?requirementId=${id}`)
      .then((r) => r.json())
      .then((data) => {
        setSuppliers(data.suppliers || []);
        const favs = new Set<string>();
        (data.suppliers || []).forEach((s: SupplierResult) => {
          if (s.isFavorite) favs.add(s.id);
        });
        setFavorites(favs);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  async function toggleFavorite(supplierId: string) {
    const res = await fetch(`/api/suppliers/${supplierId}/favorite`, { method: "POST" });
    const data = await res.json();
    setFavorites((prev) => {
      const next = new Set(prev);
      if (data.isFavorite) next.add(supplierId);
      else next.delete(supplierId);
      return next;
    });
  }

  async function startConversation(supplierId: string) {
    if (!isOfficer) return;
    setStartingConvo(supplierId);
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requirementId: id, supplierId }),
      });
      const data = await res.json();
      router.push(`/conversations/${data.conversation.id}`);
    } catch (err) {
      console.error(err);
      setStartingConvo(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <Link href="/" className="hover:text-navy-800 transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href={`/analysis/${id}/results`} className="hover:text-navy-800 transition-colors">Results</Link>
          <ChevronRight className="w-4 h-4" />
          <span>Recommended Suppliers</span>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-navy-800">Recommended Suppliers</h1>
            <p className="text-slate-500 text-sm mt-1">
              {suppliers.length} supplier{suppliers.length !== 1 ? "s" : ""} matched · Ranked by weighted score
            </p>
          </div>
          <div className="flex gap-2">
            <Link href={`/analysis/${id}/compare`} className="btn btn-outline btn-sm">
              <BarChart3 className="w-4 h-4" />
              Compare
            </Link>
          </div>
        </div>

        {suppliers.length === 0 && (
          <div className="card p-12 text-center">
            <p className="text-slate-500">No matching suppliers found in the current dataset.</p>
          </div>
        )}

        <div className="space-y-4">
          {suppliers.map((supplier, i) => (
            <SupplierCard
              key={supplier.id}
              supplier={supplier}
              rank={i + 1}
              isFavorite={favorites.has(supplier.id)}
              expanded={expandedSupplier === supplier.id}
              isOfficer={isOfficer}
              startingConvo={startingConvo === supplier.id}
              onToggle={() => setExpandedSupplier(expandedSupplier === supplier.id ? null : supplier.id)}
              onFavorite={() => toggleFavorite(supplier.id)}
              onStartConvo={() => startConversation(supplier.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function SupplierCard({
  supplier, rank, isFavorite, expanded, isOfficer, startingConvo,
  onToggle, onFavorite, onStartConvo,
}: {
  supplier: SupplierResult;
  rank: number;
  isFavorite: boolean;
  expanded: boolean;
  isOfficer: boolean;
  startingConvo: boolean;
  onToggle: () => void;
  onFavorite: () => void;
  onStartConvo: () => void;
}) {
  const score = supplier.matchScore.overall;
  const scoreColor = score >= 80 ? "text-green-600" : score >= 60 ? "text-accent-600" : "text-caution-text";

  return (
    <div className={`card card-hover ${rank === 1 ? "border-2 border-accent-200" : ""} animate-slide-up delay-${rank * 100}`}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="w-6 h-6 rounded-full bg-navy-800 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                {rank}
              </span>
              <Link href={`/suppliers/${supplier.id}`} className="font-bold text-navy-800 hover:text-accent-600 transition-colors">
                {supplier.name}
              </Link>
              <span className="badge badge-muted">{supplier.businessType}</span>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {supplier.location}
              </span>
              {supplier.yearsInBusiness && (
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" />
                  {supplier.yearsInBusiness}+ years
                </span>
              )}
              <span>★ {supplier.trustRating.toFixed(1)}</span>
            </div>

            {/* Overall score */}
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 score-bar-track">
                <div
                  className={`score-bar-fill ${score >= 80 ? "bg-green-500" : score >= 60 ? "bg-accent-500" : "bg-caution-border"}`}
                  style={{ width: `${score}%` }}
                />
              </div>
              <span className={`text-lg font-bold w-12 text-right ${scoreColor}`}>{score}%</span>
              <span className="text-xs text-slate-500">match</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 flex-shrink-0">
            <button
              onClick={onFavorite}
              className={`btn btn-sm ${isFavorite ? "text-amber-500 hover:text-amber-600" : "btn-ghost"}`}
              title={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              {isFavorite ? <Star className="w-4 h-4 fill-current" /> : <StarOff className="w-4 h-4" />}
            </button>
            {isOfficer && (
              <button onClick={onStartConvo} disabled={startingConvo} className="btn btn-primary btn-sm">
                {startingConvo ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}
                {startingConvo ? "…" : "Message"}
              </button>
            )}
          </div>
        </div>

        {/* Why recommended — expandable */}
        <button
          onClick={onToggle}
          className="text-xs font-medium text-accent-600 hover:text-accent-700 flex items-center gap-1 transition-colors mt-1"
        >
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          {expanded ? "Hide details" : "Why recommended? · Score breakdown"}
        </button>

        {expanded && (
          <div className="mt-4 pt-4 border-t border-slate-100 animate-fade-in">
            {/* Reasons */}
            <div className="mb-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Why recommended</p>
              <div className="space-y-1">
                {supplier.matchScore.reasons.map((reason, i) => (
                  <p key={i} className="text-sm text-slate-700 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-verified-text flex-shrink-0 mt-0.5" />
                    {reason}
                  </p>
                ))}
              </div>
            </div>

            {/* Score breakdown */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Score breakdown</p>
              <div className="space-y-2">
                {BREAKDOWN_LABELS.map(({ key, label, weight, color }) => (
                  <div key={key} className="flex items-center gap-3">
                    <span className="text-xs text-slate-600 w-36 flex-shrink-0">{label} <span className="text-slate-400">({weight})</span></span>
                    <div className="flex-1 score-bar-track">
                      <div
                        className={`score-bar-fill ${color}`}
                        style={{ width: `${supplier.matchScore.breakdown[key]}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-slate-700 w-8 text-right">
                      {supplier.matchScore.breakdown[key]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Certifications */}
            {supplier.certifications.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Certifications</p>
                <div className="flex flex-wrap gap-2">
                  {supplier.certifications.map((cert, i) => (
                    <span key={i} className={cert.verified ? "badge badge-verified" : "badge badge-muted"}>
                      {cert.verified && <CheckCircle2 className="w-3 h-3" />}
                      {cert.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 flex gap-2">
              <Link href={`/suppliers/${supplier.id}`} className="btn btn-outline btn-sm">
                View Full Profile
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
