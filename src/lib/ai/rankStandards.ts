// ============================================================
// rankStandards — re-orders retrieved candidates with relevance scores
// Real path: Gemini API, grounded ONLY in candidate record fields
// Fallback: deterministic keyword overlap scoring
// NEVER invents a new IS number — only annotates candidates it receives
// ============================================================

import { ScoredStandard, ExtractedRequirement } from "@/lib/standards/query";

export type RankedStandard = ScoredStandard & {
  finalScore: number;    // 0–100, Gemini-adjusted or deterministic
  whyApplicable: string; // One-sentence plain-language explanation
};

// ============================================================
// Deterministic re-ranking (no API)
// ============================================================
function rankDeterministic(
  candidates: ScoredStandard[]
): RankedStandard[] {
  // Already scored by queryStandards — just map to RankedStandard
  return candidates
    .map((c) => ({
      ...c,
      finalScore: c.relevanceScore,
      whyApplicable: c.whyApplicable,
    }))
    .sort((a, b) => b.finalScore - a.finalScore);
}

// ============================================================
// Gemini re-ranking (only when API key present)
// ============================================================
async function rankWithGemini(
  extracted: ExtractedRequirement,
  candidates: ScoredStandard[]
): Promise<RankedStandard[]> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) throw new Error("No GEMINI_API_KEY");

  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  // Build a minimal, safe representation of candidates
  // We only pass fields from the candidate's own record — not free generation
  const candidateSummaries = candidates.map((c, i) => ({
    index: i,
    id: c.id,
    number: c.number,
    title: c.title,
    scope: c.scope,
    applicableProducts: c.applicableProducts,
    relevanceKeywords: c.relevanceKeywords,
    currentScore: c.relevanceScore,
  }));

  const prompt = `You are a procurement standards analyst for the Indian government.
You are given a procurement requirement and a list of candidate Indian Standards (IS) retrieved from a verified database.

YOUR JOB: Re-rank the candidates and provide a one-sentence plain-language explanation of why each is applicable.

CRITICAL RULES:
- You may ONLY reference the standards in the provided candidates list — never add, invent, or suggest any other IS number
- Return ONLY valid JSON — no markdown, no code blocks, no commentary
- The "whyApplicable" must be grounded in the candidate's own "title", "scope", or "applicableProducts" fields
- Scores must be 0–100 integers

Requirement:
${JSON.stringify(extracted, null, 2)}

Candidates:
${JSON.stringify(candidateSummaries, null, 2)}

Return this exact JSON array (one entry per candidate, in your preferred order):
[
  {
    "id": "the standard id",
    "finalScore": 85,
    "whyApplicable": "One sentence explanation grounded in the standard's own scope"
  }
]`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  let rankings: { id: string; finalScore: number; whyApplicable: string }[];
  try {
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    rankings = JSON.parse(cleaned);
  } catch {
    throw new Error("Failed to parse Gemini ranking response");
  }

  // Merge Gemini annotations back onto original candidates
  // SAFETY: only update candidates that were in the original list
  const candidateMap = new Map(candidates.map((c) => [c.id, c]));
  const ranked: RankedStandard[] = [];

  for (const r of rankings) {
    const candidate = candidateMap.get(r.id);
    if (!candidate) continue; // Ignore any ID Gemini hallucinated
    ranked.push({
      ...candidate,
      finalScore: Math.max(0, Math.min(100, r.finalScore)),
      whyApplicable: r.whyApplicable || candidate.whyApplicable,
    });
  }

  // Add any candidates Gemini dropped (with their original score)
  for (const candidate of candidates) {
    if (!ranked.find((r) => r.id === candidate.id)) {
      ranked.push({ ...candidate, finalScore: candidate.relevanceScore, whyApplicable: candidate.whyApplicable });
    }
  }

  return ranked.sort((a, b) => b.finalScore - a.finalScore);
}

// ============================================================
// Public entry point
// ============================================================
export async function rankStandards(
  extracted: ExtractedRequirement,
  candidates: ScoredStandard[]
): Promise<RankedStandard[]> {
  if (candidates.length === 0) return [];

  if (process.env.GEMINI_API_KEY?.trim()) {
    try {
      return await rankWithGemini(extracted, candidates);
    } catch (err) {
      console.warn("[rankStandards] Gemini call failed, using fallback:", err);
    }
  }

  return rankDeterministic(candidates);
}
