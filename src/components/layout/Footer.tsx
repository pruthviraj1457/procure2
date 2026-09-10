"use client";

import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();
  if (pathname === "/" || pathname === "/dashboard" || pathname.startsWith("/analysis")) return null;
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      {/* Disclaimer strip */}
      <div className="bg-caution-bg border-b border-caution-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <p className="text-xs text-caution-text text-center">
            <strong>Disclaimer:</strong> Procure is a hackathon prototype (SIH 2026, PS 26108). Standards data is seeded
            from official BIS listings for demonstration purposes. Always verify against the live{" "}
            <Link
              href="https://www.services.bis.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold inline-flex items-center gap-0.5"
            >
              BIS portal <ExternalLink className="w-3 h-3" />
            </Link>{" "}
            before using in an actual tender.
          </p>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-navy-800 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">P</span>
            </div>
            <span className="text-slate-600 text-sm">
              <strong className="text-navy-800">Procure</strong> — Department of Consumer Affairs, MoCAFPD
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <Link
              href="https://www.services.bis.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-navy-800 transition-colors inline-flex items-center gap-1"
            >
              BIS Portal <ExternalLink className="w-3 h-3" />
            </Link>
            <span>·</span>
            <span>SIH 2026 — PS 26108</span>
            <span>·</span>
            <span>Prototype — not for production use</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
