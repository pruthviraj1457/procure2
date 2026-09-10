import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSupplierById } from "@/lib/standards/data/suppliers";
import { ensureDemoOfficer } from "@/lib/officer";

// GET /api/conversations?requirementId=xxx
export async function GET(req: NextRequest) {
  const requirementId = req.nextUrl.searchParams.get("requirementId");
  try {
    const conversations = await prisma.conversation.findMany({
      where: requirementId ? { requirementId } : {},
      include: { messages: { orderBy: { sentAt: "asc" } }, quote: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ conversations });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

// POST /api/conversations — officer initiates a conversation
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { requirementId, supplierId } = body;

    if (!requirementId || !supplierId) {
      return NextResponse.json({ error: "requirementId and supplierId required" }, { status: 400 });
    }

    const officer = await ensureDemoOfficer();

    // Ensure supplier DB record
    const seedSupplier = getSupplierById(supplierId);
    if (seedSupplier) {
      await prisma.supplier.upsert({
        where: { externalId: supplierId },
        update: {},
        create: {
          externalId: supplierId,
          name: seedSupplier.name,
          businessType: seedSupplier.businessType,
          location: seedSupplier.location,
          about: seedSupplier.about,
          trustRating: seedSupplier.trustRating,
        },
      });
    }

    const dbSupplier = await prisma.supplier.findUnique({ where: { externalId: supplierId } });
    if (!dbSupplier) return NextResponse.json({ error: "Supplier not found" }, { status: 404 });

    // Check if conversation already exists
    const existing = await prisma.conversation.findFirst({
      where: { requirementId, supplierId: dbSupplier.id },
    });
    if (existing) {
      return NextResponse.json({ conversation: existing });
    }

    const conversation = await prisma.conversation.create({
      data: {
        requirementId,
        officerId: officer.id,
        supplierId: dbSupplier.id,
        messages: {
          create: {
            senderRole: "officer",
            text: "Hello, I'm interested in sourcing products from your company for a government tender. Could you please provide more details about your offerings?",
          },
        },
      },
      include: { messages: true },
    });

    return NextResponse.json({ conversation }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/conversations]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
