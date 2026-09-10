import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/favorites
export async function GET() {
  try {
    const officer = await prisma.officer.findFirst();
    if (!officer) return NextResponse.json({ favorites: [] });

    const favorites = await prisma.favoriteSupplier.findMany({
      where: { officerId: officer.id },
      include: { supplier: true },
      orderBy: { createdAt: "desc" },
    });

    const { getSupplierById } = await import("@/lib/standards/data/suppliers");

    const enriched = favorites.map((fav: any) => ({
      ...fav,
      seedSupplier: getSupplierById(fav.supplier.externalId),
    }));

    return NextResponse.json({ favorites: enriched });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
