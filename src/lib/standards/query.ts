// ============================================================
// queryStandards — pure local, deterministic, NO LLM
// Scores candidate standards by keyword + category overlap
// ============================================================

import { ALL_STANDARDS, Standard } from "./data/standards";

export type ExtractedRequirement = {
  product: string;
  quantity?: number;
  useCase?: string;
  purpose?: string;
  environment?: string;
  intendedUse?: string;
  statedSpecs?: string[];
  technicalRequirements?: { parameter: string; value: string; clause?: string; note?: string }[];
  safetyRequirements?: { requirement: string; source?: string }[];
  procurementRequirements?: string[];
  category?: string;
  keywords?: string[];
  clarifyingQuestion?: { question: string; options: string[] };
};

export type ScoredStandard = Standard & {
  relevanceScore: number; // 0–100
  whyApplicable: string;
  matchedKeywords: string[];
  verificationStatus?: string;
};

export function queryStandards(extracted: ExtractedRequirement): ScoredStandard[] {
  const rawTerms = buildQueryTerms(extracted);
  const normalizedTerms = rawTerms.map(normalizeWord);

  const scored: ScoredStandard[] = ALL_STANDARDS.map((standard) => {
    const { score, matchedKeywords } = scoreStandard(standard, rawTerms, normalizedTerms);
    return {
      ...standard,
      relevanceScore: score,
      whyApplicable: generateWhyApplicable(standard, matchedKeywords, extracted),
      matchedKeywords,
      verificationStatus: "Prototype knowledge record — BIS verification required",
    };
  }).filter((s) => s.relevanceScore > 0);

  // Sort descending by score
  scored.sort((a, b) => b.relevanceScore - a.relevanceScore);
  return scored;
}

function normalizeWord(word: string): string {
  let w = word.toLowerCase().trim();
  if (w.endsWith("s") && w.length > 3 && !w.endsWith("ss")) {
    w = w.slice(0, -1);
  }
  return w;
}

function buildQueryTerms(extracted: ExtractedRequirement): string[] {
  const terms: string[] = [];

  if (extracted.product) {
    terms.push(...extracted.product.toLowerCase().split(/\s+/));
  }
  if (extracted.useCase || extracted.purpose) {
    const text = (extracted.useCase || "") + " " + (extracted.purpose || "");
    terms.push(...text.toLowerCase().split(/\s+/));
  }
  if (extracted.environment || extracted.intendedUse) {
    const text = (extracted.environment || "") + " " + (extracted.intendedUse || "");
    terms.push(...text.toLowerCase().split(/\s+/));
  }
  if (extracted.category) {
    terms.push(...extracted.category.toLowerCase().split(/\s+/));
  }
  if (extracted.keywords) {
    extracted.keywords.forEach((kw) => terms.push(...kw.toLowerCase().split(/\s+/)));
  }
  if (extracted.statedSpecs) {
    extracted.statedSpecs.forEach((spec) => {
      terms.push(...spec.toLowerCase().split(/\s+/));
    });
  }

  const stopWords = new Set([
    "the", "a", "an", "and", "or", "for", "of", "to", "in", "on",
    "at", "is", "are", "we", "need", "want", "require", "suitable",
    "with", "by", "from", "into", "that", "this", "these", "those",
    "our", "us", "be", "as", "per", "nos", "no", "should", "provide",
  ]);

  return [...new Set(terms)].filter((t) => t.length > 2 && !stopWords.has(t));
}

function scoreStandard(
  standard: Standard,
  rawTerms: string[],
  normalizedTerms: string[]
): { score: number; matchedKeywords: string[] } {
  const matchedKeywords: string[] = [];
  let rawScore = 0;

  // Check relevanceKeywords
  for (const kwFull of standard.relevanceKeywords) {
    const kwNorm = normalizeWord(kwFull);
    for (let i = 0; i < rawTerms.length; i++) {
      const rt = rawTerms[i];
      const nt = normalizedTerms[i];
      if (kwNorm.includes(nt) || nt.includes(kwNorm) || kwFull.toLowerCase().includes(rt)) {
        rawScore += 20;
        if (!matchedKeywords.includes(kwFull)) matchedKeywords.push(kwFull);
        break;
      }
    }
  }

  // Check applicableProducts
  for (const product of standard.applicableProducts) {
    const productNorm = normalizeWord(product);
    for (let i = 0; i < rawTerms.length; i++) {
      const nt = normalizedTerms[i];
      if (productNorm.includes(nt) || nt.includes(normalizeWord(product.split(" ")[0]))) {
        rawScore += 15;
        if (!matchedKeywords.includes(product)) matchedKeywords.push(product);
        break;
      }
    }
  }

  // Check title
  const titleNorm = normalizeWord(standard.title);
  for (const nt of normalizedTerms) {
    if (titleNorm.includes(nt)) {
      rawScore += 10;
    }
  }

  // Check category
  for (const cat of standard.category) {
    const catNorm = normalizeWord(cat);
    for (const nt of normalizedTerms) {
      if (catNorm.includes(nt)) {
        rawScore += 5;
        break;
      }
    }
  }

  // Penalty for non-current status
  if (standard.status === "superseded") rawScore = Math.round(rawScore * 0.3);
  if (standard.status === "withdrawn") rawScore = 0;

  const score = Math.min(rawScore, 100);
  return { score, matchedKeywords: matchedKeywords.slice(0, 5) };
}

function generateWhyApplicable(
  standard: Standard,
  matchedKeywords: string[],
  extracted: ExtractedRequirement
): string {
  if (matchedKeywords.length === 0) {
    return `This standard covers ${standard.applicableProducts[0] || standard.title}.`;
  }

  const product = extracted.product || "the requested product";
  const topKeyword = matchedKeywords[0];

  if (standard.category.includes("Personal Protective Equipment") || standard.number === "IS 2925") {
    return `Directly applicable as the primary Indian Standard (IS 2925:1984) governing industrial safety helmets for protection against impact, penetration, and electrical hazards.`;
  }
  if (standard.category.includes("Fire Safety Equipment")) {
    return `Applicable as the current BIS standard for portable fire extinguishers covering design, testing, and marking requirements.`;
  }
  if (standard.category.includes("Water Supply")) {
    return `Applicable as the current BIS standard specifying HDPE pipe requirements for water supply systems.`;
  }

  return `Applicable — "${topKeyword}" matches this standard's scope for ${standard.applicableProducts[0]}.`;
}
