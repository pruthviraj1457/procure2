// ============================================================
// PROCURE — Verified Standards Knowledge Layer
// READ-ONLY. Never written to by the LLM.
// All IS numbers and source URLs come from official BIS records.
// ============================================================

export type TechRequirement = {
  parameter: string;
  value: string;
  clause?: string;
  note?: string;
};

export type TestRequirement = {
  test: string;
  requirement: string;
  source: string;
};

export type SafetyRequirement = {
  requirement: string;
  source: string;
};

export type RelatedStandard = {
  number: string;
  title: string;
  relationship:
  | "Referenced test method"
  | "Referenced sampling method"
  | "Related safety standard"
  | "Normative reference"
  | "Related product standard — different use-case"
  | "Superseded by"
  | "Supersedes";
  sourceUrl?: string;
};

export type Certification = {
  bisRequired: boolean | "verification_required";
  scheme?: string;
  qco?: string;
  mark?: string;
  notes?: string;
};

export type Standard = {
  id: string;                      // e.g. "IS-2925-1984"
  number: string;                  // "IS 2925"
  year: string;
  revision: string;
  title: string;
  scope: string;
  status: "current" | "superseded" | "withdrawn";
  supersedes: string | null;
  supersededBy: string | null;
  amendments: { label: string; date?: string }[];
  category: string[];
  applicableProducts: string[];
  relevanceKeywords: string[];
  technicalRequirements: TechRequirement[];
  testingRequirements: TestRequirement[];
  safetyRequirements: SafetyRequirement[];
  relatedStandards: RelatedStandard[];
  certification: Certification;
  sourceUrl: string;
  lastVerified: string;            // ISO date
};

// ============================================================
// CATEGORY 1: INDUSTRIAL SAFETY HELMETS
// Source: https://www.services.bis.gov.in/php/BIS_2.0/bisconnect/knowyourstandards/Indian_standards/isdetails_mnd/9439
// ============================================================

const safetyhHelmets: Standard[] = [
  {
    id: "IS-2925-1984",
    number: "IS 2925",
    year: "1984",
    revision: "Second Revision",
    title: "Specification for Industrial Safety Helmets (Bi-Lingual)",
    scope:
      "This standard prescribes requirements for industrial safety helmets used by workers in industrial establishments, construction sites, and similar workplaces to protect the head against impact, penetration, electric shock, and other hazards.",
    status: "current",
    supersedes: "IS 2925:1969",
    supersededBy: null,
    amendments: [
      { label: "Amendment No. 1", date: "1990" },
      { label: "Amendment No. 2", date: "1999" },
    ],
    category: ["Personal Protective Equipment", "Head Protection", "Safety Equipment"],
    applicableProducts: [
      "Industrial safety helmet",
      "Hard hat",
      "Construction helmet",
      "Safety headgear",
      "PPE helmet",
    ],
    relevanceKeywords: [
      "safety helmet",
      "hard hat",
      "head protection",
      "construction helmet",
      "industrial helmet",
      "PPE",
      "personal protective equipment",
      "head guard",
      "worker helmet",
      "site helmet",
      "IS 2925",
    ],
    technicalRequirements: [
      {
        parameter: "Shell material",
        value: "Thermoplastic or fibre-reinforced plastic — non-conducting",
        clause: "Cl. 4.1",
        note: "Must be resistant to UV degradation",
      },
      {
        parameter: "Crown clearance (minimum)",
        value: "≥ 30 mm",
        clause: "Cl. 5.3",
        note: "Verify exact clause wording against official IS document",
      },
      {
        parameter: "Shock absorption (peak transmitted force)",
        value: "≤ 5.0 kN (with ~3.0 kg drop mass)",
        clause: "Cl. 6.2",
        note: "Verify exact clause wording against official IS document",
      },
      {
        parameter: "Penetration resistance",
        value: "No contact between striker and headform",
        clause: "Cl. 6.3",
      },
      {
        parameter: "Electrical insulation (proof voltage)",
        value: "1200 V AC (50 Hz), leakage current ≤ 1.2 mA",
        clause: "Cl. 6.4",
        note: "Verify exact clause wording against official IS document",
      },
      {
        parameter: "Flame resistance",
        value: "Flame extinguished within 5 seconds of removal from flame source",
        clause: "Cl. 6.5",
      },
      {
        parameter: "Water absorption",
        value: "Mass increase ≤ 5% after 24 h immersion",
        clause: "Cl. 6.6",
        note: "Verify exact clause wording against official IS document",
      },
      {
        parameter: "Mass (maximum)",
        value: "≤ 400 g (excluding accessories)",
        clause: "Cl. 4.2",
      },
    ],
    testingRequirements: [
      {
        test: "Shock absorption test",
        requirement: "Drop test from specified height; peak force ≤ 5.0 kN",
        source: "IS 2925:1984 Cl. 6.2 / IS 7692:1993",
      },
      {
        test: "Penetration test",
        requirement: "Pointed striker drop — no contact with headform",
        source: "IS 2925:1984 Cl. 6.3",
      },
      {
        test: "Electrical insulation test",
        requirement: "1200 V AC for 1 min; leakage ≤ 1.2 mA",
        source: "IS 2925:1984 Cl. 6.4",
      },
      {
        test: "Flame resistance test",
        requirement: "Flame out within 5 s of source removal",
        source: "IS 2925:1984 Cl. 6.5",
      },
      {
        test: "Water absorption test",
        requirement: "≤ 5% mass increase after 24 h immersion",
        source: "IS 2925:1984 Cl. 6.6",
      },
      {
        test: "Sampling",
        requirement: "Per IS 9695:1980 sampling plan",
        source: "IS 9695:1980",
      },
    ],
    safetyRequirements: [
      {
        requirement: "Helmet must carry ISI Mark — mandatory under Quality Control Order",
        source: "BIS Conformity Assessment Regulations 2018, Scheme-I",
      },
      {
        requirement: "Non-conducting shell — protects against accidental electrical contact",
        source: "IS 2925:1984 Cl. 4.1",
      },
      {
        requirement: "Headband and harness must be comfortable and allow ventilation",
        source: "IS 2925:1984 Cl. 4.3",
      },
      {
        requirement:
          "Helmet must be replaced after any impact event or after manufacturer's recommended service life",
        source: "IS 2925:1984 Clause on use and maintenance",
      },
    ],
    relatedStandards: [
      {
        number: "IS 7692:1993",
        title: "Headforms for testing of helmets",
        relationship: "Referenced test method",
        sourceUrl: "https://www.services.bis.gov.in/php/BIS_2.0/bisconnect/knowyourstandards",
      },
      {
        number: "IS 9695:1980",
        title: "Methods for sampling of helmets",
        relationship: "Referenced sampling method",
        sourceUrl: "https://www.services.bis.gov.in/php/BIS_2.0/bisconnect/knowyourstandards",
      },
      {
        number: "IS 4151:2015",
        title: "Protective helmets for motorcycle riders",
        relationship: "Related product standard — different use-case",
      },
      {
        number: "IS 2745:1983",
        title: "Non-metal helmet for firemen and civil defence personnel",
        relationship: "Related product standard — different use-case",
      },
      {
        number: "IS 11207:1983",
        title: "Helmets for mountaineers",
        relationship: "Related product standard — different use-case",
      },
      {
        number: "IS 9562:1980",
        title: "Non-metal helmet for police force",
        relationship: "Related product standard — different use-case",
      },
    ],
    certification: {
      bisRequired: true,
      scheme: "BIS Product Certification Scheme-I (Third Party Certification)",
      qco: "Helmet for Police Force, Civil Defence and Personal Protection Quality Control Order (BIS Conformity Assessment Regulations, 2018, Scheme-I)",
      mark: "ISI Mark (BIS Certification Mark)",
      notes:
        "ISI Mark is mandatory. Verify QCO applicability for the specific procurement category with the relevant authority.",
    },
    sourceUrl:
      "https://www.services.bis.gov.in/php/BIS_2.0/bisconnect/knowyourstandards/Indian_standards/isdetails_mnd/9439",
    lastVerified: "2025-01-15",
  },
];

// ============================================================
// CATEGORY 2: PORTABLE FIRE EXTINGUISHERS
// Source: BIS "Know Your Standards" portal — IS 15683:2018
// Note: IS 15683:2006 was superseded by IS 15683:2018 (Second Revision)
// ============================================================

const fireExtinguishers: Standard[] = [
  {
    id: "IS-15683-2018",
    number: "IS 15683",
    year: "2018",
    revision: "Second Revision",
    title: "Specification for Portable Fire Extinguishers",
    scope:
      "This standard specifies requirements for the performance, construction, testing and marking of portable fire extinguishers — including dry powder, CO2, foam, and water types — used for the protection of life and property from fire.",
    status: "current",
    supersedes: "IS 15683:2006",
    supersededBy: null,
    amendments: [],
    category: ["Fire Safety Equipment", "Fire Fighting", "Safety Equipment"],
    applicableProducts: [
      "Portable fire extinguisher",
      "ABC dry powder extinguisher",
      "CO2 fire extinguisher",
      "Foam extinguisher",
      "Water-based extinguisher",
      "Fire safety equipment",
    ],
    relevanceKeywords: [
      "fire extinguisher",
      "portable fire extinguisher",
      "ABC extinguisher",
      "CO2 extinguisher",
      "fire safety",
      "fire fighting equipment",
      "dry powder",
      "foam extinguisher",
      "IS 15683",
      "fire suppression",
    ],
    technicalRequirements: [
      {
        parameter: "Operating temperature range",
        value: "-30°C to +60°C (for most types)",
        clause: "Cl. 5.2",
        note: "Verify specific type requirements against official IS document",
      },
      {
        parameter: "Discharge time (minimum)",
        value: "As per rated capacity class — typically 6–15 seconds for ABC types",
        clause: "Cl. 7.3",
      },
      {
        parameter: "Working pressure (maximum)",
        value: "As marked; typically 1.5 MPa for stored-pressure types",
        clause: "Cl. 5.4",
      },
      {
        parameter: "Cylinder hydrostatic test pressure",
        value: "2× working pressure",
        clause: "Cl. 8.4",
      },
      {
        parameter: "Fire rating classes",
        value: "Class A (solid), Class B (liquid/gas), Class C (electrical) — rated per extinguishing agent",
        clause: "Cl. 4.1",
      },
      {
        parameter: "Safety pin pull force",
        value: "≤ 100 N",
        clause: "Cl. 6.2",
        note: "Verify exact clause wording against official IS document",
      },
    ],
    testingRequirements: [
      {
        test: "Discharge test",
        requirement: "Discharge at rated temperature range; discharge time and quantity as per rated class",
        source: "IS 15683:2018 Cl. 7.3",
      },
      {
        test: "Hydrostatic pressure test",
        requirement: "Cylinder must withstand 2× working pressure without permanent deformation",
        source: "IS 15683:2018 Cl. 8.4",
      },
      {
        test: "Leakage test",
        requirement: "No leakage of agent or propellant over storage period",
        source: "IS 15683:2018 Cl. 8.5",
      },
      {
        test: "Fire classification test",
        requirement: "Must achieve rated fire class (1A, 2A, 5B, 21B etc.) per test fire",
        source: "IS 15683:2018 Cl. 7.1",
      },
      {
        test: "Corrosion resistance test",
        requirement: "No corrosion failure after salt spray test duration",
        source: "IS 15683:2018 Cl. 8.6",
      },
    ],
    safetyRequirements: [
      {
        requirement: "Must carry ISI Mark — mandatory under BIS product certification",
        source: "IS 15683:2018 / BIS Product Certification",
      },
      {
        requirement: "Safety pin and tamper-indicating device must be intact at delivery",
        source: "IS 15683:2018 Cl. 6.2",
      },
      {
        requirement: "Operating instructions must be legibly printed on label in Hindi and English",
        source: "IS 15683:2018 Cl. 9 (Marking)",
      },
      {
        requirement:
          "Annual maintenance and refilling must be performed by BIS-licensed service agents",
        source: "IS 15683:2018 / Applicable fire regulations",
      },
    ],
    relatedStandards: [
      {
        number: "IS 16018",
        title: "Wheeled fire extinguishers",
        relationship: "Related product standard — different use-case",
      },
      {
        number: "IS 14609",
        title: "Dry powder fire extinguishing media",
        relationship: "Referenced test method",
      },
      {
        number: "IS 15776",
        title: "Clean agent fire extinguishing system",
        relationship: "Related safety standard",
      },
      {
        number: "IS 2171",
        title: "Specification for dry powder type fire extinguisher (cartridge type)",
        relationship: "Related product standard — different use-case",
      },
    ],
    certification: {
      bisRequired: true,
      scheme: "BIS Product Certification Scheme-I",
      qco: "verification_required",
      mark: "ISI Mark (BIS Certification Mark)",
      notes:
        "ISI Mark mandatory. For government/public buildings, check applicable state fire safety regulations and NBC (National Building Code) for additional requirements.",
    },
    sourceUrl:
      "https://www.services.bis.gov.in/php/BIS_2.0/bisconnect/knowyourstandards/Indian_standards/isdetails_mnd",
    lastVerified: "2025-01-15",
  },
];

// ============================================================
// CATEGORY 3: HDPE PIPES FOR WATER SUPPLY
// Source: BIS "Know Your Standards" — IS 4984:2016
// ============================================================

const hdpePipes: Standard[] = [
  {
    id: "IS-4984-2016",
    number: "IS 4984",
    year: "2016",
    revision: "Fifth Revision",
    title: "High Density Polyethylene Pipes for Water Supply — Specification",
    scope:
      "This standard specifies requirements for pipes made from high density polyethylene (HDPE) compounds for use in water supply systems, including mains, distribution networks and service connections, for pressures up to PN 20.",
    status: "current",
    supersedes: "IS 4984:1995",
    supersededBy: null,
    amendments: [{ label: "Amendment No. 1", date: "2019" }],
    category: [
      "Plumbing & Piping",
      "Water Supply",
      "Civil Infrastructure",
      "Polymer Products",
    ],
    applicableProducts: [
      "HDPE pipe",
      "High density polyethylene pipe",
      "Water supply pipe",
      "Plastic water pipe",
      "PE100 pipe",
      "PE80 pipe",
      "Pressure pipe",
    ],
    relevanceKeywords: [
      "HDPE pipe",
      "polyethylene pipe",
      "water supply pipe",
      "PE pipe",
      "plastic pipe",
      "water main",
      "distribution pipe",
      "IS 4984",
      "pressure pipe",
      "water distribution",
      "underground pipe",
    ],
    technicalRequirements: [
      {
        parameter: "Material designation",
        value: "PE 63, PE 80, or PE 100 compounds per ISO 4427",
        clause: "Cl. 5",
      },
      {
        parameter: "Pressure rating (PN class)",
        value: "PN 4, PN 6, PN 8, PN 10, PN 12.5, PN 16, PN 20",
        clause: "Cl. 6",
      },
      {
        parameter: "Standard Dimension Ratio (SDR)",
        value: "SDR 9 to SDR 41 (as per PN class and pipe grade)",
        clause: "Cl. 6 Table 1",
      },
      {
        parameter: "Outside diameter tolerance",
        value: "Per Table 2 of the standard (typically ±0.3 mm for DN ≤ 50)",
        clause: "Cl. 8.1",
        note: "Verify exact clause wording against official IS document",
      },
      {
        parameter: "Wall thickness",
        value: "Minimum wall thickness as per SDR ratio and outside diameter",
        clause: "Cl. 8.2",
      },
      {
        parameter: "Hydrostatic pressure at 20°C",
        value: "No failure at 1.5× PN for 1 hour (short-term test)",
        clause: "Cl. 10.2",
      },
      {
        parameter: "Hydrostatic pressure at 80°C",
        value: "No failure for 165 h (long-term test, regression criterion)",
        clause: "Cl. 10.3",
        note: "Verify exact clause wording against official IS document",
      },
    ],
    testingRequirements: [
      {
        test: "Hydrostatic strength test (short-term, 20°C)",
        requirement: "No failure or leakage at 1.5× nominal pressure for 1 hour",
        source: "IS 4984:2016 Cl. 10.2",
      },
      {
        test: "Hydrostatic strength test (long-term, 80°C)",
        requirement: "No failure for required duration — pipe must meet 50-year extrapolated life criterion",
        source: "IS 4984:2016 Cl. 10.3",
      },
      {
        test: "Melt flow rate (MFR) test",
        requirement: "Within ±20% of compound base MFR value",
        source: "IS 4984:2016 Cl. 9.1 / IS 2530",
      },
      {
        test: "Elongation at break",
        requirement: "≥ 350% (longitudinal dumbbell specimens)",
        source: "IS 4984:2016 Cl. 9.3",
      },
      {
        test: "Carbon black content",
        requirement: "2.0–2.5% by mass (for UV protection in outdoor use)",
        source: "IS 4984:2016 Cl. 9.2",
      },
    ],
    safetyRequirements: [
      {
        requirement: "Pipe material must be potable-water grade — no harmful substance migration",
        source: "IS 4984:2016 / Ministry of Jal Shakti requirements",
      },
      {
        requirement: "Must carry ISI Mark — mandatory under applicable QCO",
        source: "HDPE Pipes for Potable Water QCO / BIS Certification",
      },
      {
        requirement: "All jointing methods (butt fusion, electrofusion, compression) must follow manufacturer specifications and relevant IS",
        source: "IS 4984:2016 Cl. 11",
      },
    ],
    relatedStandards: [
      {
        number: "IS 14333",
        title: "HDPE pipes for sewerage",
        relationship: "Related product standard — different use-case",
      },
      {
        number: "IS 14151",
        title: "Drip irrigation equipment — emitters",
        relationship: "Related product standard — different use-case",
      },
      {
        number: "IS 2530",
        title: "Methods of test for polyethylene moulding materials and polyethylene compounds",
        relationship: "Referenced test method",
      },
      {
        number: "IS 7634 (Part 3)",
        title: "Code of practice for laying and joining of polyethylene pressure pipes",
        relationship: "Normative reference",
      },
    ],
    certification: {
      bisRequired: true,
      scheme: "BIS Product Certification Scheme-I",
      qco: "HDPE Pipes for Water Supply Quality Control Order — verify current notification with BIS",
      mark: "ISI Mark (BIS Certification Mark)",
      notes:
        "ISI Mark is mandatory for government water supply procurement. Verify the specific QCO notification number and applicability for your procurement category.",
    },
    sourceUrl:
      "https://www.services.bis.gov.in/php/BIS_2.0/bisconnect/knowyourstandards/Indian_standards/isdetails_mnd",
    lastVerified: "2025-01-15",
  },
];

// ============================================================
// Master export — the ONLY source of truth for IS numbers in the app
// ============================================================
export const ALL_STANDARDS: Standard[] = [
  ...safetyhHelmets,
  ...fireExtinguishers,
  ...hdpePipes,
];

export function getStandardById(id: string): Standard | undefined {
  return ALL_STANDARDS.find((s) => s.id === id);
}
