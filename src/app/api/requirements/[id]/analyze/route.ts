import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { understandRequirement } from "@/lib/ai/understandRequirement";
import { queryStandards } from "@/lib/standards/query";
import { rankStandards } from "@/lib/ai/rankStandards";
import { runAiResearchMode, AiResearchResult } from "@/lib/ai/aiResearchMode";

// POST /api/requirements/[id]/analyze
// Runs the full understanding + verified retrieval + AI Research Mode pipeline
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const requirement = await prisma.procurementRequirement.findUnique({ where: { id } });
    if (!requirement) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Mark as analyzing
    await prisma.procurementRequirement.update({
      where: { id },
      data: { status: "analyzing" },
    });

    // Step 1: Understand the requirement
    const understanding = await understandRequirement(requirement.rawInput);

    // Step 2: Run AI Research Mode
    const researchResult: AiResearchResult = await runAiResearchMode(requirement.rawInput);

    // Step 3: Query local verified knowledge base
    const verifiedCandidates = queryStandards(understanding.extracted);
    const rankedVerified = await rankStandards(understanding.extracted, verifiedCandidates);

    // Annotate verified standards with verification status
    const verifiedStandardsAnnotated = rankedVerified.map((std) => ({
      ...std,
      verificationStatus: "verified_bis_knowledge" as const,
      knowledgeSource: "Verified BIS Knowledge Layer" as const,
    }));

    // Combine extracted metadata with AI Research results
    const combinedExtracted = {
      ...understanding.extracted,
      product: researchResult.product || understanding.extracted.product,
      category: researchResult.category || understanding.extracted.category,
      purpose: researchResult.purpose || understanding.extracted.purpose,
      intendedUse: researchResult.intendedUse || understanding.extracted.intendedUse,
      quantity: researchResult.quantity || understanding.extracted.quantity,
      clarificationQuestions: researchResult.clarificationsNeeded.length > 0
        ? researchResult.clarificationsNeeded
        : (understanding.clarifyingQuestion ? [understanding.clarifyingQuestion.question] : []),
      clarifyingQuestion: understanding.clarifyingQuestion,
      confidence: understanding.confidence,
      procurementChecklist: researchResult.procurementChecklist,
      limitations: researchResult.limitations,
      knowledgeSource: researchResult.knowledgeSource,
      disclaimer: researchResult.disclaimer,
      aiResearch: researchResult,
    };

    const matchedIds = verifiedStandardsAnnotated.map((s) => s.id);

    await prisma.procurementRequirement.update({
      where: { id },
      data: {
        status: "analyzed",
        extractedJson: JSON.stringify(combinedExtracted),
        matchedStandardIds: JSON.stringify(matchedIds),
      },
    });

    return NextResponse.json({
      extracted: combinedExtracted,
      clarifyingQuestion: understanding.clarifyingQuestion,
      confidence: understanding.confidence,
      standards: verifiedStandardsAnnotated,
      aiResearch: researchResult,
    });
  } catch (err) {
    console.error("[POST /api/requirements/[id]/analyze]", err);
    await prisma.procurementRequirement.update({
      where: { id },
      data: { status: "draft" },
    }).catch(() => {});
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}

// GET /api/requirements/[id]/analyze — fetch cached analysis results
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const requirement = await prisma.procurementRequirement.findUnique({ where: { id } });
    if (!requirement) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (requirement.status !== "analyzed" && requirement.status !== "reported") {
      return NextResponse.json({ status: requirement.status, ready: false });
    }

    const extracted = JSON.parse(requirement.extractedJson || "{}");
    const matchedIds: string[] = JSON.parse(requirement.matchedStandardIds || "[]");

    const { queryStandards } = await import("@/lib/standards/query");
    const candidates = queryStandards(extracted);
    const { rankStandards } = await import("@/lib/ai/rankStandards");
    const ranked = await rankStandards(extracted, candidates.filter((c) => matchedIds.includes(c.id)));

    const verifiedStandardsAnnotated = ranked.map((std) => ({
      ...std,
      verificationStatus: "verified_bis_knowledge" as const,
      knowledgeSource: "Verified BIS Knowledge Layer" as const,
    }));

    return NextResponse.json({
      status: requirement.status,
      ready: true,
      extracted,
      standards: verifiedStandardsAnnotated,
      aiResearch: extracted.aiResearch || null,
    });
  } catch (err) {
    console.error("[GET /api/requirements/[id]/analyze]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
