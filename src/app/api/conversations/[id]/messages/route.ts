import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// POST /api/conversations/[id]/messages — send a message
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const { text, senderRole, attachmentUrl } = body;

    if (!text || !senderRole) {
      return NextResponse.json({ error: "text and senderRole required" }, { status: 400 });
    }

    const message = await prisma.message.create({
      data: {
        conversationId: id,
        text,
        senderRole,
        ...(attachmentUrl && { attachmentUrl }),
      },
    });

    // Auto-generate a supplier reply for demo purposes
    if (senderRole === "officer") {
      const autoReply = generateSupplierReply(text);
      if (autoReply) {
        await new Promise((resolve) => setTimeout(resolve, 800)); // simulate delay
        await prisma.message.create({
          data: {
            conversationId: id,
            text: autoReply,
            senderRole: "supplier",
          },
        });
      }
    }

    const messages = await prisma.message.findMany({
      where: { conversationId: id },
      orderBy: { sentAt: "asc" },
    });

    return NextResponse.json({ message, messages }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

function generateSupplierReply(officerText: string): string | null {
  const lower = officerText.toLowerCase();
  if (lower.includes("certificate") || lower.includes("certification")) {
    return "Thank you for reaching out. We can provide our BIS licence copy, product test reports, and ISI certificate for the relevant standard. These are available for the specific model you are considering. Please let us know the exact model/SKU for accurate documentation.";
  }
  if (lower.includes("quote") || lower.includes("price") || lower.includes("quotation")) {
    return "We have submitted our quotation for your consideration. Our pricing includes delivery to your specified location and a 12-month product warranty. Please review the attached quote and feel free to reach out for any clarifications.";
  }
  if (lower.includes("delivery") || lower.includes("lead time")) {
    return "Our standard delivery lead time is 15–20 working days from the date of confirmed purchase order. For bulk government orders, we can arrange phased delivery per your schedule. Please share the delivery location and timeline requirements.";
  }
  if (lower.includes("specification") || lower.includes("model")) {
    return "We manufacture multiple models conforming to the applicable IS standard. All products carry the ISI Mark and are available with full batch test certificates. Please share your technical specification so we can confirm the exact matching model.";
  }
  return "Thank you for your message. We are reviewing your requirement and will respond with complete details shortly. For urgent inquiries, please contact our government sales team directly.";
}
