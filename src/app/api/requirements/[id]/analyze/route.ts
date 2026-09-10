import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { understandRequirement } from "@/lib/ai/understandRequirement";
import { queryStandards } from "@/lib/standards/query";
import { rankStandards } from "@/lib/ai/rankStandards";

// POST /api/requirements/[id]/analyze
// Runs the full understanding + retrieval + ranking pipeline
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

    // Step 1: Understand the requirement (LLM or fallback)
    const understanding = await understandRequirement(requirement.rawInput);

    // Step 2: Query local knowledge base (deterministic, no LLM)
    const candidates = queryStandards(understanding.extracted);

    // Step 3: Rank candidates (LLM or fallback — cannot add new standards)
    const ranked = await rankStandards(understanding.extracted, candidates);

    // Save results
    const matchedIds = ranked.map((s) => s.id);
    await prisma.procurementRequirement.update({
      where: { id },
      data: {
        status: "analyzed",
        extractedJson: JSON.stringify({
          ...understanding.extracted,
          clarifyingQuestion: understanding.clarifyingQuestion,
          confidence: understanding.confidence,
        }),
        matchedStandardIds: JSON.stringify(matchedIds),
      },
    });

    return NextResponse.json({
      extracted: understanding.extracted,
      clarifyingQuestion: understanding.clarifyingQuestion,
      confidence: understanding.confidence,
      standards: ranked,
    });
  } catch (err) {
    console.error("[POST /api/requirements/[id]/analyze]", err);
    // Reset status on error
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

    // Re-fetch standards from local data (not from DB)
    const { queryStandards } = await import("@/lib/standards/query");
    const candidates = queryStandards(extracted);
    const { rankStandards } = await import("@/lib/ai/rankStandards");
    const ranked = await rankStandards(extracted, candidates.filter((c) => matchedIds.includes(c.id)));

    return NextResponse.json({
      status: requirement.status,
      ready: true,
      extracted,
      standards: ranked,
    });
  } catch (err) {
    console.error("[GET /api/requirements/[id]/analyze]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
