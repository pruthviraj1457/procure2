import { NextRequest, NextResponse } from "next/server";
import { getSupplierById } from "@/lib/standards/data/suppliers";
import { prisma } from "@/lib/db";

// GET /api/suppliers/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supplier = getSupplierById(id);
  if (!supplier) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const officer = await prisma.officer.findFirst();
  let isFavorite = false;
  if (officer) {
    const fav = await prisma.favoriteSupplier.findFirst({
      where: { officerId: officer.id, supplierId: id },
    });
    isFavorite = !!fav;
  }

  return NextResponse.json({ supplier, isFavorite });
}
