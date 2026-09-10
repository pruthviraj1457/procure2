import { NextRequest, NextResponse } from "next/server";
import {
  ALL_SUPPLIERS,
  getSuppliersForStandards,
  computeMatchScore,
} from "@/lib/standards/data/suppliers";
import { prisma } from "@/lib/db";

// GET /api/suppliers?requirementId=xxx
export async function GET(req: NextRequest) {
  const requirementId = req.nextUrl.searchParams.get("requirementId");

  if (requirementId) {
    // Get matched standard IDs for this requirement
    const requirement = await prisma.procurementRequirement.findUnique({
      where: { id: requirementId },
    });

    if (!requirement) {
      return NextResponse.json({ error: "Requirement not found" }, { status: 404 });
    }

    const matchedIds: string[] = JSON.parse(requirement.matchedStandardIds || "[]");
    const extracted = JSON.parse(requirement.extractedJson || "{}");
    const productKeywords = [
      extracted.product || "",
      ...(extracted.statedSpecs || []),
    ]
      .join(" ")
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);

    const matchingSuppliers = getSuppliersForStandards(matchedIds);

    const scoredSuppliers = matchingSuppliers
      .map((supplier) => {
        const score = computeMatchScore(supplier, matchedIds, productKeywords);
        return { supplier, score };
      })
      .sort((a, b) => b.score.overall - a.score.overall);

    // Check favorites
    const officer = await prisma.officer.findFirst();
    const favorites = officer
      ? await prisma.favoriteSupplier.findMany({ where: { officerId: officer.id } })
      : [];
    const favoriteIds = new Set(favorites.map((f: any) => f.supplierId));

    return NextResponse.json({
      suppliers: scoredSuppliers.map(({ supplier, score }) => ({
        ...supplier,
        matchScore: score,
        isFavorite: favoriteIds.has(supplier.id),
      })),
    });
  }

  // No requirementId — return all suppliers
  return NextResponse.json({ suppliers: ALL_SUPPLIERS });
}
