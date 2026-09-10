import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/conversations/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        messages: { orderBy: { sentAt: "asc" } },
        quote: true,
        requirement: true,
      },
    });
    if (!conversation) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Enrich with seed supplier data
    const { getSupplierById } = await import("@/lib/standards/data/suppliers");
    const dbSupplier = await prisma.supplier.findUnique({ where: { id: conversation.supplierId } });
    const seedSupplier = dbSupplier ? getSupplierById(dbSupplier.externalId) : null;

    return NextResponse.json({ conversation, supplier: seedSupplier });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
