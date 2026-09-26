"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BookmarkSimple,
  ChatCenteredText,
  CheckCircle,
  MapPin,
  Certificate,
  SealCheck,
  Package,
  CaretRight,
  CircleNotch,
  ArrowSquareOut,
} from "@phosphor-icons/react";
import { useRole } from "@/components/layout/RoleContext";
import type { Supplier } from "@/lib/standards/data/suppliers";

export default function SupplierProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { isOfficer } = useRole();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [startingConvo, setStartingConvo] = useState(false);

  useEffect(() => {
    fetch(`/api/suppliers/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setSupplier(data.supplier);
        setIsFavorite(data.isFavorite || false);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  async function toggleFavorite() {
    const res = await fetch(`/api/suppliers/${id}/favorite`, { method: "POST" });
    const data = await res.json();
    setIsFavorite(data.isFavorite);
  }

  async function startConversation() {
    if (!isOfficer) return;
    setStartingConvo(true);
    try {
      // We don't have a requirementId here, use a placeholder
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requirementId: "direct", supplierId: id }),
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/conversations/${data.conversation.id}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setStartingConvo(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <CircleNotch className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Supplier not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <Link href="/favorites" className="hover:text-navy-800 transition-colors">Suppliers</Link>
          <CaretRight className="w-3.5 h-3.5 text-slate-400" weight="bold" />
          <span>{supplier.name}</span>
        </div>

        {/* Header */}
        <div className="card p-6 mb-6 animate-fade-in">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <div className="w-12 h-12 rounded-xl bg-navy-800 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-lg">{supplier.name[0]}</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-navy-800">{supplier.name}</h1>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="badge badge-muted">{supplier.businessType}</span>
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-purple-600" weight="duotone" /> {supplier.location}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                <StatBox label="Trust Rating" value={`★ ${supplier.trustRating.toFixed(1)}/5`} />
                <StatBox label="Years in Business" value={`${supplier.yearsInBusiness}+`} />
                <StatBox label="Employees" value={supplier.employeeCount} />
                <StatBox label="Annual Turnover" value={supplier.annualTurnover} />
              </div>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col gap-2 flex-shrink-0">
              <button
                onClick={toggleFavorite}
                className={`btn btn-sm ${isFavorite ? "text-purple-700 border-purple-200 bg-purple-50 hover:bg-purple-100" : "btn-ghost text-slate-400"}`}
              >
                <BookmarkSimple className="w-4 h-4" weight={isFavorite ? "fill" : "duotone"} />
                {isFavorite ? "Favorited" : "Favorite"}
              </button>
              {isOfficer && (
                <button onClick={startConversation} disabled={startingConvo} className="btn btn-primary btn-sm">
                  {startingConvo ? <CircleNotch className="w-4 h-4 animate-spin" /> : <ChatCenteredText className="w-4 h-4" weight="bold" />}
                  Start Conversation
                </button>
              )}
              {!isOfficer && (
                <div className="px-3 py-2 bg-muted-bg border border-muted-border rounded-lg text-xs text-muted-text">
                  Switch to Officer role to message this supplier
                </div>
              )}
            </div>
          </div>

          {/* About */}
          <div className="mt-5 pt-5 border-t border-slate-100">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">About</h2>
            <p className="text-sm text-slate-700 leading-relaxed">{supplier.about}</p>
            {supplier.website && (
              <Link href={supplier.website} target="_blank" className="source-link mt-2 inline-flex items-center gap-1">
                {supplier.website} <ArrowSquareOut className="w-3.5 h-3.5" weight="bold" />
              </Link>
            )}
          </div>
        </div>

        {/* Standards Passport */}
        <div className="card p-6 mb-6 animate-slide-up">
          <div className="section-header flex items-center gap-2 text-navy-900 font-bold mb-3">
            <Certificate className="w-5 h-5 text-purple-700" weight="duotone" />
            Standards Passport
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Indian Standards this supplier&apos;s products are certified against.
          </p>
          {supplier.standardsPassport.length === 0 ? (
            <p className="text-sm text-slate-400">No standards on file.</p>
          ) : (
            <div className="space-y-3">
              {supplier.standardsPassport.map((sp, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 px-4 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-3">
                    {sp.certified ? (
                      <CheckCircle className="w-5 h-5 text-emerald-600" weight="fill" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                    )}
                    <span className="font-semibold text-navy-800 text-sm">{sp.standardId.replace("IS-", "IS ").replace(/-\d{4}$/, ":" + sp.standardId.match(/\d{4}$/)?.[0])}</span>
                    <span className={sp.certified ? "badge badge-verified" : "badge badge-muted"}>
                      {sp.certified ? "BIS Certified" : "Not certified"}
                    </span>
                  </div>
                  {sp.documentUrl && (
                    <Link href={sp.documentUrl} target="_blank" className="source-link text-xs inline-flex items-center gap-1">
                      View Certificate <ArrowSquareOut className="w-3 h-3" weight="bold" />
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Certifications */}
        <div className="card p-6 mb-6 animate-slide-up">
          <div className="section-header flex items-center gap-2 text-navy-900 font-bold mb-3">
            <SealCheck className="w-5 h-5 text-purple-700" weight="duotone" />
            Certifications &amp; Compliance
          </div>
          <div className="flex flex-wrap gap-2">
            {supplier.certifications.map((cert, i) => (
              <span key={i} className={cert.verified ? "badge badge-verified px-3 py-1.5 flex items-center gap-1" : "badge badge-muted px-3 py-1.5"}>
                {cert.verified && <SealCheck className="w-3.5 h-3.5 text-emerald-600" weight="fill" />}
                {cert.name}
              </span>
            ))}
          </div>
        </div>

        {/* Product Catalog */}
        <div className="card p-6 mb-6 animate-slide-up">
          <div className="section-header flex items-center gap-2 text-navy-900 font-bold mb-3">
            <Package className="w-5 h-5 text-purple-700" weight="duotone" />
            Product Catalog
          </div>
          <div className="space-y-2">
            {supplier.products.map((product, i) => (
              <div key={i} className="flex items-center justify-between py-2 px-4 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-sm text-navy-800 font-medium">{product.name}</span>
                <span className="badge badge-accent">{product.category}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-sm font-bold text-navy-800">{value}</p>
    </div>
  );
}
