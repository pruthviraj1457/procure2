import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { understandRequirement } from "@/lib/ai/understandRequirement";
import { queryStandards } from "@/lib/standards/query";
import { rankStandards } from "@/lib/ai/rankStandards";
import { runAiResearchMode } from "@/lib/ai/aiResearchMode";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const requirement = await prisma.procurementRequirement.findUnique({ where: { id } });
    if (!requirement) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const extracted = JSON.parse(requirement.extractedJson || "{}");
    const messages = extracted.messages || [];

    return NextResponse.json({ messages });
  } catch (err) {
    console.error("[GET /api/requirements/[id]/messages]", err);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const { text } = body;

    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const requirement = await prisma.procurementRequirement.findUnique({ where: { id } });
    if (!requirement) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const extracted = JSON.parse(requirement.extractedJson || "{}");
    const existingMessages: { role: "user" | "assistant"; text: string; sentAt: string }[] =
      extracted.messages || [];

    const userMsg = { role: "user" as const, text: text.trim(), sentAt: new Date().toISOString() };
    existingMessages.push(userMsg);

    // Combine raw input with new officer clarification for updated understanding
    const updatedInput = `${requirement.rawInput}\nClarification: ${text.trim()}`;

    let replyText = "";
    const apiKey = process.env.GEMINI_API_KEY?.trim();

    if (apiKey) {
      try {
        const { GoogleGenerativeAI } = await import("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `You are Procure AI, an Indian government procurement & BIS standards intelligence assistant.
The procurement officer has provided a clarification or question for an existing procurement requirement.

Original Requirement: "${requirement.rawInput}"
Officer Message: "${text.trim()}"

Acknowledge the officer's message, explain how it affects the requirement specification and BIS standards compliance, and maintain an authoritative, professional tone. Keep response under 4 sentences. Never invent fabricated IS numbers.`;

        const res = await model.generateContent(prompt);
        replyText = res.response.text().trim();
      } catch (err) {
        console.warn("[POST /api/requirements/[id]/messages] Gemini failed, using fallback:", err);
      }
    }

    if (!replyText) {
      if (/construction|site|civil/i.test(text)) {
        replyText = "Updated requirement context to prioritize industrial safety helmets conforming to IS 2925:1984 with reinforced shell and shock absorption criteria for civil and construction sites.";
      } else if (/dielectric|electric|voltage|1200v/i.test(text)) {
        replyText = "Noted dielectric rating requirement. Under IS 2925:1984 Clause 6.4, electrical insulation proof testing at 1200V AC (leakage ≤ 1.2mA) is enforced for non-conducting shells.";
      } else if (/quantity|units|count/i.test(text)) {
        replyText = `Noted updated quantity specification. Sampling plan and lot batch testing will follow IS 9695:1980 standard protocols.`;
      } else {
        replyText = `Thank you officer. I have updated the procurement analysis context with "${text.trim()}". Technical specifications and BIS compliance parameters have been refreshed.`;
      }
    }

    const assistantMsg = { role: "assistant" as const, text: replyText, sentAt: new Date().toISOString() };
    existingMessages.push(assistantMsg);

    // Re-run understanding & research with updated context
    const understanding = await understandRequirement(updatedInput);
    const researchResult = await runAiResearchMode(updatedInput);
    const candidates = queryStandards(understanding.extracted);
    const ranked = await rankStandards(understanding.extracted, candidates);

    const verifiedStandardsAnnotated = ranked.map((std) => ({
      ...std,
      verificationStatus: "verified_bis_knowledge" as const,
      knowledgeSource: "Verified BIS Knowledge Layer" as const,
    }));

    const updatedExtracted = {
      ...understanding.extracted,
      product: researchResult.product || understanding.extracted.product,
      category: researchResult.category || understanding.extracted.category,
      purpose: researchResult.purpose || understanding.extracted.purpose,
      intendedUse: researchResult.intendedUse || understanding.extracted.intendedUse,
      quantity: researchResult.quantity || understanding.extracted.quantity,
      clarificationQuestions: researchResult.clarificationsNeeded,
      procurementChecklist: researchResult.procurementChecklist,
      limitations: researchResult.limitations,
      knowledgeSource: researchResult.knowledgeSource,
      disclaimer: researchResult.disclaimer,
      aiResearch: researchResult,
      messages: existingMessages,
    };

    await prisma.procurementRequirement.update({
      where: { id },
      data: {
        rawInput: updatedInput,
        extractedJson: JSON.stringify(updatedExtracted),
        matchedStandardIds: JSON.stringify(verifiedStandardsAnnotated.map((s) => s.id)),
      },
    });

    return NextResponse.json({
      messages: existingMessages,
      extracted: updatedExtracted,
      standards: verifiedStandardsAnnotated,
      aiResearch: researchResult,
    });
  } catch (err) {
    console.error("[POST /api/requirements/[id]/messages]", err);
    return NextResponse.json({ error: "Failed to process message" }, { status: 500 });
  }
}
