import type { Metadata } from "next";
import "./globals.css";
import { Footer } from "@/components/layout/Footer";
import { RoleProvider } from "@/components/layout/RoleContext";
import { LimelightNav } from "@/components/ui/limelight-nav";

export const metadata: Metadata = {
  title: "Procure — AI Procurement & Standards Intelligence",
  description:
    "AI-powered government procurement assistant. Find applicable Indian Standards, match suppliers, and generate tender specifications with verified, traceable evidence.",
  keywords: ["procurement", "Indian Standards", "BIS", "IS standards", "government tender", "SIH 2026"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=IBM+Plex+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=IBM+Plex+Mono:wght@400;500;600&family=Space+Grotesk:wght@500;600;700&family=Mulish:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,600&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..900;1,6..96,400..900&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <RoleProvider>
          <LimelightNav />
          <div className="flex-1">{children}</div>
          <Footer />
        </RoleProvider>
      </body>
    </html>
  );
}
