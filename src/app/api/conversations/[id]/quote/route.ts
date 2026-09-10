import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// POST /api/conversations/[id]/quote
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const { product, quantity, unitPrice, deliveryDays, warranty } = body;

    const totalPrice = unitPrice * quantity;

    const quote = await prisma.quote.upsert({
      where: { conversationId: id },
      update: { product, quantity, unitPrice, totalPrice, deliveryDays, warranty },
      create: {
        conversationId: id,
        product,
        quantity,
        unitPrice,
        totalPrice,
        deliveryDays,
        warranty: warranty || "12 months",
        documentsJson: JSON.stringify([]),
      },
    });

    // Add a supplier message acknowledging the quote
    await prisma.message.create({
      data: {
        conversationId: id,
        senderRole: "supplier",
        text: `Thank you for your quotation request. We have submitted our formal quote: ₹${unitPrice.toLocaleString("en-IN")} per unit × ${quantity} units = ₹${totalPrice.toLocaleString("en-IN")} total. Delivery: ${deliveryDays} working days. Warranty: ${warranty || "12 months"}. This quote is valid for 30 days.`,
      },
    });

    return NextResponse.json({ quote }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

// GET /api/conversations/[id]/quote
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const quote = await prisma.quote.findUnique({ where: { conversationId: id } });
    return NextResponse.json({ quote });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
