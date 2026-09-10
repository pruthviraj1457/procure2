// ============================================================
// understandRequirement — structured extraction from raw input
// Real path: Gemini API (JSON-only, no IS numbers generated here)
// Fallback: deterministic regex + keyword extraction
// ============================================================

import { ExtractedRequirement } from "@/lib/standards/query";

export type UnderstandingResult = {
  extracted: ExtractedRequirement;
  clarifyingQuestion?: {
    question: string;
    options: string[];
  };
  confidence: number; // 0–1
};

const PRODUCT_PATTERNS: {
  pattern: RegExp;
  product: string;
  category: string;
  techSpecs?: { parameter: string; value: string; clause?: string }[];
  safetySpecs?: { requirement: string; source?: string }[];
  procurementSpecs?: string[];
  keywords?: string[];
}[] = [
  {
    pattern: /safety\s+helmet|hard\s+hat|industrial\s+helmet|head\s+protect/i,
    product: "Industrial Safety Helmet",
    category: "Personal Protective Equipment",
    techSpecs: [
      { parameter: "Shell Material", value: "Thermoplastic or FRP (non-conducting)" },
      { parameter: "Crown Clearance", value: "≥ 30 mm" },
      { parameter: "Shock Absorption Peak Force", value: "≤ 5.0 kN" },
      { parameter: "Electrical Insulation", value: "1200 V AC proof rating" },
      { parameter: "Mass", value: "≤ 400 g" }
    ],
    safetySpecs: [
      { requirement: "ISI Mark mandatory under Quality Control Order" },
      { requirement: "Shock absorption and penetration resistance certified" }
    ],
    procurementSpecs: ["Mandatory ISI certification", "Class-1 OEM pre-qualification on GeM portal"],
    keywords: ["safety helmet", "hard hat", "head protection", "industrial helmet", "PPE", "IS 2925"],
  },
  {
    pattern: /fire\s+extinguisher|fire\s+fight|fire\s+suppression/i,
    product: "Portable Fire Extinguisher",
    category: "Fire Safety Equipment",
    techSpecs: [
      { parameter: "Operating Temperature", value: "-30°C to +60°C" },
      { parameter: "Hydrostatic Test Pressure", value: "2× working pressure" },
      { parameter: "Discharge Time", value: "6–15 seconds" }
    ],
    safetySpecs: [
      { requirement: "ISI Mark mandatory under BIS certification scheme" },
      { requirement: "Tamper-indicating seal & pressure gauge verification" }
    ],
    procurementSpecs: ["Mandatory ISI mark", "State Fire Department approval"],
    keywords: ["fire extinguisher", "ABC extinguisher", "CO2 extinguisher", "IS 15683"],
  },
  {
    pattern: /hdpe\s+pipe|polyethylene\s+pipe|water\s+pipe|water\s+supply\s+pipe|plastic\s+pipe/i,
    product: "HDPE Pipe for Water Supply",
    category: "Water Supply Infrastructure",
    techSpecs: [
      { parameter: "Material Grade", value: "PE 80 / PE 100" },
      { parameter: "Pressure Rating", value: "PN 6 to PN 16" },
      { parameter: "Short-term Hydrostatic Strength", value: "1.5× PN for 1 hour at 20°C" }
    ],
    safetySpecs: [
      { requirement: "Potable water non-toxic migration compliance" }
    ],
    procurementSpecs: ["Quality Control Order mandatory ISI mark"],
    keywords: ["HDPE pipe", "water supply pipe", "PE100", "IS 4984"],
  },
];

const QUANTITY_PATTERN = /(\d[\d,]*)\s*(nos?\.?|numbers?|units?|pieces?|pcs?|kg|litres?|meters?|m\b|sets?)?/i;

const USE_CASE_KEYWORDS: Record<string, string> = {
  construction: "Construction and civil work sites",
  outdoor: "Outdoor / open-air industrial work",
  electrical: "Electrical sub-station and utility work",
  mining: "Mining and excavation operations",
  factory: "Factory floor and manufacturing plant",
  fire: "Fire safety and building emergency response",
  water: "Potable water supply and distribution networks",
};

// Clarifying questions by product type
const CLARIFYING_QUESTIONS: Record<string, { question: string; options: string[] }> = {
  "Industrial Safety Helmet": {
    question: "Do these helmets need to be rated for electrical work (Class E — dielectric protection)?",
    options: ["Yes, electrical rating required", "No, standard protection only", "Not sure — include both"],
  },
  "Portable Fire Extinguisher": {
    question: "What type of fire risk is primary at the deployment site?",
    options: ["Class A (solid materials — wood, paper)", "Class B (flammable liquids)", "Class C (electrical)", "Mixed / ABC coverage"],
  },
  "HDPE Pipe for Water Supply": {
    question: "What is the required pressure rating (nominal pressure) for these pipes?",
    options: ["PN 6 (low pressure)", "PN 10 (medium pressure)", "PN 16 (high pressure)", "Not sure"],
  },
};

// ============================================================
// Deterministic fallback (no API required)
// ============================================================
function extractDeterministic(rawInput: string): UnderstandingResult {
  const input = rawInput.trim();

  // Detect product
  let matchedPattern = PRODUCT_PATTERNS[0];
  let isProductMatched = false;
  for (const pp of PRODUCT_PATTERNS) {
    if (pp.pattern.test(input)) {
      matchedPattern = pp;
      isProductMatched = true;
      break;
    }
  }

  const product = isProductMatched ? matchedPattern.product : "General procurement item";
  const category = isProductMatched ? matchedPattern.category : "General Goods";

  // Detect quantity
  let quantity: number | undefined;
  const qMatch = input.match(QUANTITY_PATTERN);
  if (qMatch) {
    quantity = parseInt(qMatch[1].replace(/,/g, ""), 10);
    if (isNaN(quantity)) quantity = undefined;
  }

  // Detect use-case keywords
  const useCaseParts: string[] = [];
  for (const [kw, label] of Object.entries(USE_CASE_KEYWORDS)) {
    if (new RegExp(kw, "i").test(input)) {
      useCaseParts.push(label);
    }
  }
  const useCase = useCaseParts.length > 0 ? useCaseParts.join(", ") : "General industrial use";
  const purpose = useCase;

  // Detect environment
  let environment = "Industrial site / field deployment";
  if (/outdoor|open.air|site|field/i.test(input)) environment = "Outdoor / field conditions";
  else if (/indoor|office|building/i.test(input)) environment = "Indoor facility";
  else if (/underground|subsurface/i.test(input)) environment = "Underground / excavation";
  const intendedUse = environment;

  const clarifyingQuestion = CLARIFYING_QUESTIONS[product];
  const confidence = isProductMatched ? 0.90 : 0.45;

  return {
    extracted: {
      product,
      quantity,
      useCase,
      purpose,
      environment,
      intendedUse,
      category,
      technicalRequirements: isProductMatched ? matchedPattern.techSpecs : [],
      safetyRequirements: isProductMatched ? matchedPattern.safetySpecs : [],
      procurementRequirements: isProductMatched ? matchedPattern.procurementSpecs : [],
      keywords: isProductMatched ? matchedPattern.keywords : [input.split(" ")[0]],
      statedSpecs: isProductMatched ? matchedPattern.techSpecs?.map((t) => `${t.parameter}: ${t.value}`) : [],
    },
    clarifyingQuestion,
    confidence,
  };
}

// ============================================================
// Gemini API path
// ============================================================
async function extractWithGemini(rawInput: string): Promise<UnderstandingResult> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) throw new Error("No GEMINI_API_KEY");

  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `You are a procurement requirement parser for an Indian government procurement system.
Extract structured fields from the following procurement requirement text.

CRITICAL RULES:
- Return ONLY valid JSON — no markdown, no code blocks, no explanations
- Do NOT suggest any Indian Standard (IS) number — that is done by a separate system
- Do NOT invent specifications not stated or directly implied in the input
- If a field is unknown, return null

Input: "${rawInput}"

Return this exact JSON structure:
{
  "product": "specific product name",
  "category": "product category" or null,
  "purpose": "primary purpose" or null,
  "intendedUse": "intended use environment" or null,
  "quantity": number or null,
  "technicalRequirements": [
    { "parameter": "name", "value": "specification" }
  ],
  "safetyRequirements": [
    { "requirement": "safety specification" }
  ],
  "procurementRequirements": ["procurement conditions"],
  "keywords": ["search keywords"],
  "statedSpecs": ["explicitly stated specs"]
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  let parsed;
  try {
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("Failed to parse Gemini JSON response");
  }

  const productKey = Object.keys(CLARIFYING_QUESTIONS).find((k) =>
    parsed.product?.toLowerCase().includes(k.toLowerCase().split(" ")[0])
  );

  return {
    extracted: {
      product: parsed.product || "General procurement item",
      category: parsed.category ?? undefined,
      purpose: parsed.purpose ?? parsed.useCase ?? undefined,
      useCase: parsed.purpose ?? parsed.useCase ?? undefined,
      intendedUse: parsed.intendedUse ?? parsed.environment ?? undefined,
      environment: parsed.intendedUse ?? parsed.environment ?? undefined,
      quantity: typeof parsed.quantity === "number" ? parsed.quantity : undefined,
      technicalRequirements: parsed.technicalRequirements ?? [],
      safetyRequirements: parsed.safetyRequirements ?? [],
      procurementRequirements: parsed.procurementRequirements ?? [],
      keywords: parsed.keywords ?? [],
      statedSpecs: parsed.statedSpecs ?? [],
    },
    clarifyingQuestion: productKey ? CLARIFYING_QUESTIONS[productKey] : undefined,
    confidence: 0.94,
  };
}

// ============================================================
// Public entry point
// ============================================================
export async function understandRequirement(rawInput: string): Promise<UnderstandingResult> {
  if (process.env.GEMINI_API_KEY?.trim()) {
    try {
      return await extractWithGemini(rawInput);
    } catch (err) {
      console.warn("[understandRequirement] Gemini call failed, using fallback:", err);
    }
  }
  return extractDeterministic(rawInput);
}

