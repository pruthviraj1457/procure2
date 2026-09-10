import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSupplierById } from "@/lib/standards/data/suppliers";

// POST /api/suppliers/[id]/favorite — toggle favorite
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supplier = getSupplierById(id);
  if (!supplier) return NextResponse.json({ error: "Supplier not found" }, { status: 404 });

  const officer = await ensureDemoOfficer();

  // Ensure supplier record exists in DB
  await prisma.supplier.upsert({
    where: { externalId: id },
    update: {},
    create: {
      externalId: id,
      name: supplier.name,
      businessType: supplier.businessType,
      location: supplier.location,
      about: supplier.about,
      trustRating: supplier.trustRating,
    },
  });

  const dbSupplier = await prisma.supplier.findUnique({ where: { externalId: id } });
  if (!dbSupplier) return NextResponse.json({ error: "DB error" }, { status: 500 });

  const existing = await prisma.favoriteSupplier.findFirst({
    where: { officerId: officer.id, supplierId: dbSupplier.id },
  });

  if (existing) {
    await prisma.favoriteSupplier.delete({ where: { id: existing.id } });
    return NextResponse.json({ isFavorite: false });
  } else {
    await prisma.favoriteSupplier.create({
      data: { officerId: officer.id, supplierId: dbSupplier.id },
    });
    return NextResponse.json({ isFavorite: true });
  }
}

async function ensureDemoOfficer() {
  let officer = await prisma.officer.findFirst();
  if (!officer) {
    officer = await prisma.officer.create({
      data: {
        name: "Rajesh Kumar",
        department: "Department of Consumer Affairs",
        email: "rajesh.kumar@consumeraffairs.gov.in",
      },
    });
  }
  return officer;
}
