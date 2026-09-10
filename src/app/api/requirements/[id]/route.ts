import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/requirements/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const requirement = await prisma.procurementRequirement.findUnique({ where: { id } });
    if (!requirement) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ requirement });
  } catch (err) {
    console.error("[GET /api/requirements/[id]]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

// PATCH /api/requirements/[id] — update status or extracted data
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const requirement = await prisma.procurementRequirement.update({
      where: { id },
      data: {
        ...(body.status && { status: body.status }),
        ...(body.extractedJson && { extractedJson: JSON.stringify(body.extractedJson) }),
        ...(body.matchedStandardIds && { matchedStandardIds: JSON.stringify(body.matchedStandardIds) }),
      },
    });
    return NextResponse.json({ requirement });
  } catch (err) {
    console.error("[PATCH /api/requirements/[id]]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
