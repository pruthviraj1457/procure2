import { prisma } from "@/lib/db";

export async function ensureDemoOfficer() {
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
