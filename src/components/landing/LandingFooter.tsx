"use client";

import React from "react";
import { ExternalLink, Shield } from "lucide-react";
import Link from "next/link";

interface LandingFooterProps {
  onOpenAuthPortal: () => void;
}

export function LandingFooter({ onOpenAuthPortal }: LandingFooterProps) {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 text-xs">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Col */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center p-1 border-2 border-purple-500/70 shrink-0 shadow-xs">
                <img
                  src="/procure-logo.png"
                  alt="Procure Symbol"
                  className="w-full h-full object-contain rounded-full"
                />
              </div>
              <span className="font-extrabold text-lg text-white font-display">Procure</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              AI-powered procurement intelligence and Indian Standards verification portal. Department of Consumer Affairs, MoCAFPD.
            </p>
          </div>

          {/* Nav Col 1 */}
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase font-bold text-white block mb-1">
              Platform Features
            </span>
            <ul className="space-y-1.5">
              <li>
                <a href="#how-it-works" className="hover:text-white transition-colors">
                  AI Requirement Parsing
                </a>
              </li>
              <li>
                <a href="#standards" className="hover:text-white transition-colors">
                  BIS Indian Standards Hub
                </a>
              </li>
              <li>
                <a href="#compliance" className="hover:text-white transition-colors">
                  Testing & NABL Matrix
                </a>
              </li>
              <li>
                <a href="#suppliers" className="hover:text-white transition-colors">
                  Compliant Supplier Directory
                </a>
              </li>
            </ul>
          </div>

          {/* Nav Col 2 */}
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase font-bold text-white block mb-1">
              Access & Verification
            </span>
            <ul className="space-y-1.5">
              <li>
                <button onClick={onOpenAuthPortal} className="hover:text-white transition-colors text-left">
                  Government Officer Portal
                </button>
              </li>
              <li>
                <button onClick={onOpenAuthPortal} className="hover:text-white transition-colors text-left">
                  Supplier Registration
                </button>
              </li>
              <li>
                <button onClick={onOpenAuthPortal} className="hover:text-white transition-colors text-left">
                  Tender Report Generator
                </button>
              </li>
            </ul>
          </div>

          {/* External Links */}
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase font-bold text-white block mb-1">
              Official Links
            </span>
            <ul className="space-y-1.5">
              <li>
                <a
                  href="https://www.services.bis.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors inline-flex items-center gap-1"
                >
                  Bureau of Indian Standards <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://consumeraffairs.nic.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors inline-flex items-center gap-1"
                >
                  Dept. of Consumer Affairs <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://sih.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors inline-flex items-center gap-1"
                >
                  Smart India Hackathon 2026 <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © 2026 Procure SIH Team. Developed for PS 26108. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span>Privacy Policy</span>
            <span>·</span>
            <span>Terms of Service</span>
            <span>·</span>
            <span>Security Statement</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
