// ============================================================
// Supplier seed data & match score computation
// Read-only seed data — not written by LLM
// ============================================================

export type SupplierProduct = { name: string; category: string };
export type SupplierStandardCert = { standardId: string; certified: boolean; documentUrl?: string };
export type SupplierCertification = { name: string; verified: boolean; documentUrl?: string };

export type Supplier = {
  id: string;
  name: string;
  businessType: string;
  location: string;
  about: string;
  products: SupplierProduct[];
  standardsPassport: SupplierStandardCert[];
  certifications: SupplierCertification[];
  trustRating: number; // 0–5
  yearsInBusiness: number;
  employeeCount: string;
  annualTurnover: string;
  contactEmail: string;
  website?: string;
};

export type MatchBreakdown = {
  productMatch: number;      // 30%
  standardsAlignment: number; // 25%
  compliance: number;        // 20%
  documents: number;         // 10%
  certification: number;     // 10%
  other: number;             // 5%
};

export type MatchScore = {
  supplierId: string;
  overall: number; // 0–100
  breakdown: MatchBreakdown;
  reasons: string[];
};

// ============================================================
// SUPPLIER SEED DATA
// ============================================================
export const ALL_SUPPLIERS: Supplier[] = [
  // --- Safety Helmets Suppliers ---
  {
    id: "SUP-001",
    name: "Bharat Safety Industries Pvt. Ltd.",
    businessType: "Manufacturer",
    location: "Kanpur, Uttar Pradesh",
    about:
      "A leading ISI-certified manufacturer of personal protective equipment including industrial safety helmets, serving government and industrial clients since 1998. All products are BIS licensed under IS 2925.",
    products: [
      { name: "Industrial Safety Helmet (Type A)", category: "Personal Protective Equipment" },
      { name: "Industrial Safety Helmet (Type B — ventilated)", category: "Personal Protective Equipment" },
      { name: "Construction Hard Hat", category: "Personal Protective Equipment" },
    ],
    standardsPassport: [
      { standardId: "IS-2925-1984", certified: true, documentUrl: "https://example.com/isi-cert-bsi-001" },
    ],
    certifications: [
      { name: "BIS Licence — IS 2925:1984", verified: true },
      { name: "ISO 9001:2015", verified: true },
      { name: "GeM Registered Seller", verified: true },
    ],
    trustRating: 4.7,
    yearsInBusiness: 26,
    employeeCount: "200–500",
    annualTurnover: "₹45 Crore",
    contactEmail: "sales@bharatsafety.example.in",
    website: "https://bharatsafety.example.in",
  },
  {
    id: "SUP-002",
    name: "SafeGuard PPE Distributors",
    businessType: "Distributor / Trader",
    location: "Mumbai, Maharashtra",
    about:
      "Authorised distributor for multiple BIS-licensed helmet manufacturers. Provides large-volume government supply with verified batch certifications, GeM empanelled, MSME registered.",
    products: [
      { name: "IS 2925 Safety Helmet — bulk supply", category: "Personal Protective Equipment" },
      { name: "Safety Helmet with ratchet headband", category: "Personal Protective Equipment" },
    ],
    standardsPassport: [
      { standardId: "IS-2925-1984", certified: true, documentUrl: "https://example.com/isi-cert-sgd-002" },
    ],
    certifications: [
      { name: "BIS Product Licence (sourced from licensed manufacturer)", verified: true },
      { name: "MSME Registration", verified: true },
      { name: "GeM Registered Seller", verified: true },
    ],
    trustRating: 4.3,
    yearsInBusiness: 12,
    employeeCount: "50–100",
    annualTurnover: "₹22 Crore",
    contactEmail: "govtorders@safeguardppe.example.in",
  },
  {
    id: "SUP-003",
    name: "ShieldPro Equipment Co.",
    businessType: "Manufacturer & Exporter",
    location: "Faridabad, Haryana",
    about:
      "Manufacturer of safety helmets, safety footwear, and high-visibility vests. Exports to South Asia and Africa. BIS licensed for IS 2925. Offers custom shell colours for government departments.",
    products: [
      { name: "Industrial Helmet — standard", category: "Personal Protective Equipment" },
      { name: "Industrial Helmet — electrical class", category: "Personal Protective Equipment" },
      { name: "Safety Footwear", category: "Personal Protective Equipment" },
    ],
    standardsPassport: [
      { standardId: "IS-2925-1984", certified: true },
    ],
    certifications: [
      { name: "BIS Licence — IS 2925:1984", verified: true },
      { name: "ISO 9001:2015", verified: true },
    ],
    trustRating: 4.5,
    yearsInBusiness: 18,
    employeeCount: "100–200",
    annualTurnover: "₹30 Crore",
    contactEmail: "tender@shieldpro.example.in",
    website: "https://shieldpro.example.in",
  },

  // --- Fire Extinguisher Suppliers ---
  {
    id: "SUP-004",
    name: "Agni Fire Systems Pvt. Ltd.",
    businessType: "Manufacturer",
    location: "Pune, Maharashtra",
    about:
      "Manufacturer of BIS-certified portable fire extinguishers. Products conform to IS 15683:2018. Supplies to government buildings, PSUs, and defence establishments.",
    products: [
      { name: "ABC Dry Powder Fire Extinguisher 6 kg", category: "Fire Safety Equipment" },
      { name: "CO2 Fire Extinguisher 4.5 kg", category: "Fire Safety Equipment" },
      { name: "Foam Fire Extinguisher 9 L", category: "Fire Safety Equipment" },
    ],
    standardsPassport: [
      { standardId: "IS-15683-2018", certified: true },
    ],
    certifications: [
      { name: "BIS Licence — IS 15683:2018", verified: true },
      { name: "ISO 9001:2015", verified: true },
      { name: "PESO Approval", verified: true },
    ],
    trustRating: 4.6,
    yearsInBusiness: 22,
    employeeCount: "100–200",
    annualTurnover: "₹35 Crore",
    contactEmail: "govt@agnifire.example.in",
  },

  // --- HDPE Pipe Suppliers ---
  {
    id: "SUP-005",
    name: "National Poly Pipes Ltd.",
    businessType: "Manufacturer",
    location: "Ahmedabad, Gujarat",
    about:
      "Leading manufacturer of BIS-certified HDPE pipes and fittings for water supply infrastructure. Supplies to Jal Jeevan Mission projects, state PWDs, and municipalities. PE80 and PE100 grades available.",
    products: [
      { name: "HDPE Pipe PE100 PN 16 (20mm–1000mm)", category: "Water Supply Infrastructure" },
      { name: "HDPE Pipe PE80 PN 10", category: "Water Supply Infrastructure" },
      { name: "HDPE Fittings — compression & butt fusion", category: "Water Supply Infrastructure" },
    ],
    standardsPassport: [
      { standardId: "IS-4984-2016", certified: true },
    ],
    certifications: [
      { name: "BIS Licence — IS 4984:2016", verified: true },
      { name: "ISO 9001:2015", verified: true },
      { name: "GeM Registered Seller", verified: true },
    ],
    trustRating: 4.8,
    yearsInBusiness: 30,
    employeeCount: "500+",
    annualTurnover: "₹180 Crore",
    contactEmail: "tender@nationalpolypipes.example.in",
    website: "https://nationalpolypipes.example.in",
  },
];

// ============================================================
// Match Score Computation (deterministic, weights per spec)
// ============================================================

export function computeMatchScore(
  supplier: Supplier,
  standardIds: string[],
  productKeywords: string[]
): MatchScore {
  const breakdown: MatchBreakdown = {
    productMatch: 0,
    standardsAlignment: 0,
    compliance: 0,
    documents: 0,
    certification: 0,
    other: 0,
  };
  const reasons: string[] = [];

  // Product match (30 pts max)
  const allProductText = supplier.products
    .map((p) => `${p.name} ${p.category}`.toLowerCase())
    .join(" ");
  const productMatches = productKeywords.filter((kw) =>
    allProductText.includes(kw.toLowerCase())
  ).length;
  const productMatchRatio = Math.min(productMatches / Math.max(productKeywords.length, 1), 1);
  breakdown.productMatch = Math.round(productMatchRatio * 100);
  if (productMatchRatio > 0.5) reasons.push("✓ Product category matches procurement requirement");
  else if (productMatchRatio > 0) reasons.push("~ Partial product category match");

  // Standards alignment (25 pts max)
  const matchedStandards = supplier.standardsPassport.filter((sp) =>
    standardIds.includes(sp.standardId)
  );
  const stdRatio = Math.min(matchedStandards.length / Math.max(standardIds.length, 1), 1);
  breakdown.standardsAlignment = Math.round(stdRatio * 100);
  if (matchedStandards.length > 0)
    reasons.push(
      `✓ Standards alignment found: ${matchedStandards.map((s) => s.standardId).join(", ")}`
    );

  // Compliance / certifications (20 pts max)
  const verifiedCerts = supplier.certifications.filter((c) => c.verified).length;
  const complianceScore = Math.min((verifiedCerts / 3) * 100, 100);
  breakdown.compliance = Math.round(complianceScore);
  if (verifiedCerts >= 3) reasons.push("✓ Multiple verified compliance certifications");
  else if (verifiedCerts > 0) reasons.push(`✓ ${verifiedCerts} verified certification(s)`);

  // Documents (10 pts max)
  const docsWithUrls = supplier.standardsPassport.filter((sp) => sp.documentUrl).length;
  breakdown.documents = docsWithUrls > 0 ? 100 : 40;
  if (docsWithUrls > 0) reasons.push("✓ Certification documents available for verification");

  // Certification (10 pts max)
  const certifiedStds = supplier.standardsPassport.filter((sp) => sp.certified).length;
  breakdown.certification = certifiedStds > 0 ? 100 : 0;
  if (certifiedStds > 0) reasons.push("✓ BIS product certification confirmed");

  // Other (5 pts max) — trust rating
  breakdown.other = Math.round((supplier.trustRating / 5) * 100);
  if (supplier.trustRating >= 4.5) reasons.push("✓ High trust rating from past procurements");

  // Weighted overall
  const overall = Math.round(
    breakdown.productMatch * 0.30 +
    breakdown.standardsAlignment * 0.25 +
    breakdown.compliance * 0.20 +
    breakdown.documents * 0.10 +
    breakdown.certification * 0.10 +
    breakdown.other * 0.05
  );

  return { supplierId: supplier.id, overall, breakdown, reasons };
}

export function getSupplierById(id: string): Supplier | undefined {
  return ALL_SUPPLIERS.find((s) => s.id === id);
}

export function getSuppliersForStandards(standardIds: string[]): Supplier[] {
  return ALL_SUPPLIERS.filter((supplier) =>
    supplier.standardsPassport.some((sp) => standardIds.includes(sp.standardId))
  );
}
