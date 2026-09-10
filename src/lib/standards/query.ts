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
};

export function queryStandards(extracted: ExtractedRequirement): ScoredStandard[] {
  const queryTerms = buildQueryTerms(extracted);

  const scored: ScoredStandard[] = ALL_STANDARDS.map((standard) => {
    const { score, matchedKeywords } = scoreStandard(standard, queryTerms);
    return {
      ...standard,
      relevanceScore: score,
      whyApplicable: generateWhyApplicable(standard, matchedKeywords, extracted),
      matchedKeywords,
    };
  }).filter((s) => s.relevanceScore > 0);

  // Sort descending by score
  scored.sort((a, b) => b.relevanceScore - a.relevanceScore);
  return scored;
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

  // Deduplicate and remove stop words
  const stopWords = new Set([
    "the", "a", "an", "and", "or", "for", "of", "to", "in", "on",
    "at", "is", "are", "we", "need", "want", "require", "suitable",
    "with", "by", "from", "into", "that", "this", "these", "those",
    "our", "us", "be", "as", "per", "nos", "no",
  ]);
  return [...new Set(terms)].filter((t) => t.length > 2 && !stopWords.has(t));
}

function scoreStandard(
  standard: Standard,
  queryTerms: string[]
): { score: number; matchedKeywords: string[] } {
  const matchedKeywords: string[] = [];
  let rawScore = 0;

  // Check against standard's relevanceKeywords (highest weight)
  for (const kwFull of standard.relevanceKeywords) {
    const kw = kwFull.toLowerCase();
    for (const qt of queryTerms) {
      if (kw.includes(qt) || qt.includes(kw)) {
        rawScore += 15;
        if (!matchedKeywords.includes(kwFull)) matchedKeywords.push(kwFull);
        break;
      }
    }
  }

  // Check against applicableProducts
  for (const product of standard.applicableProducts) {
    const productLower = product.toLowerCase();
    for (const qt of queryTerms) {
      if (productLower.includes(qt) || qt.includes(productLower.split(" ")[0])) {
        rawScore += 12;
        if (!matchedKeywords.includes(product)) matchedKeywords.push(product);
        break;
      }
    }
  }

  // Check against title
  const titleLower = standard.title.toLowerCase();
  for (const qt of queryTerms) {
    if (titleLower.includes(qt)) {
      rawScore += 8;
    }
  }

  // Check against category
  for (const cat of standard.category) {
    const catLower = cat.toLowerCase();
    for (const qt of queryTerms) {
      if (catLower.includes(qt) || qt.includes(catLower.split(" ")[0])) {
        rawScore += 5;
        break;
      }
    }
  }

  // Superseded penalty
  if (standard.status === "superseded") rawScore = Math.round(rawScore * 0.3);
  if (standard.status === "withdrawn") rawScore = 0;

  // Cap at 100
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

  if (standard.category.includes("Personal Protective Equipment")) {
    return `Directly applicable as the primary BIS standard governing ${product} — matches on "${topKeyword}".`;
  }
  if (standard.category.includes("Fire Safety Equipment")) {
    return `Applicable as the current BIS standard for portable fire extinguishers covering design, testing, and marking requirements.`;
  }
  if (standard.category.includes("Water Supply")) {
    return `Applicable as the current BIS standard specifying HDPE pipe requirements for water supply systems.`;
  }

  return `Applicable — "${topKeyword}" matches this standard's scope for ${standard.applicableProducts[0]}.`;
}
