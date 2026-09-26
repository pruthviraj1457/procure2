"use client";

import React from "react";
import { LandingHeader } from "./LandingHeader";
import { SceneHero } from "./SceneHero";
import { SceneExamples } from "./SceneExamples";
import { SceneUnstructured } from "./SceneUnstructured";
import { SceneAiExtraction } from "./SceneAiExtraction";
import { SceneStandardsHub } from "./SceneStandardsHub";
import { SceneTestingMatrix } from "./SceneTestingMatrix";
import { SceneSupplierMatching } from "./SceneSupplierMatching";
import { SceneFinalReport } from "./SceneFinalReport";
import { LandingFooter } from "./LandingFooter";

interface LandingPageProps {
  onOpenAuthPortal: () => void;
}

export function LandingPage({ onOpenAuthPortal }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-500 selection:text-white">
      {/* Top Header Navigation */}
      <LandingHeader onOpenAuthPortal={onOpenAuthPortal} />

      {/* Main Content Scenes */}
      <main className="relative">
        <SceneHero onOpenAuthPortal={onOpenAuthPortal} />
        <SceneExamples onOpenAuthPortal={onOpenAuthPortal} />

        <div id="how-it-works">
          <SceneUnstructured />
          <SceneAiExtraction />
        </div>

        <SceneStandardsHub />
        <SceneTestingMatrix />
        <SceneSupplierMatching />
        <SceneFinalReport onOpenAuthPortal={onOpenAuthPortal} />
      </main>

      {/* Footer */}
      <LandingFooter onOpenAuthPortal={onOpenAuthPortal} />
    </div>
  );
}
