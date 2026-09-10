import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ensureDemoOfficer } from "@/lib/officer";

// GET /api/requirements — list all requirements for the demo officer
export async function GET() {
  try {
    // Ensure demo officer exists
    const officer = await ensureDemoOfficer();
    const requirements = await prisma.procurementRequirement.findMany({
      where: { officerId: officer.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ requirements });
  } catch (err) {
    console.error("[GET /api/requirements]", err);
    return NextResponse.json({ error: "Failed to fetch requirements" }, { status: 500 });
  }
}

// POST /api/requirements — create a new requirement
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { rawInput, inputMode = "text" } = body;

    if (!rawInput || typeof rawInput !== "string" || rawInput.trim().length === 0) {
      return NextResponse.json({ error: "rawInput is required" }, { status: 400 });
    }

    const officer = await ensureDemoOfficer();

    const requirement = await prisma.procurementRequirement.create({
      data: {
        officerId: officer.id,
        rawInput: rawInput.trim(),
        inputMode,
        status: "draft",
      },
    });

    return NextResponse.json({ requirement }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/requirements]", err);
    return NextResponse.json({ error: "Failed to create requirement" }, { status: 500 });
  }
}
