"use client";

import React, { useState, useRef, useEffect, useLayoutEffect, cloneElement } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  House,
  Search,
  ClipboardCheck,
  Bookmark,
  Plus,
  Building2,
  FileBarChart,
  CircleUserRound,
} from "lucide-react";

export type ProcureNavItem = {
  id: string;
  icon: React.ReactElement;
  label: string;
  href: string;
  isPrimary?: boolean;
};

export const defaultProcureNavItems: ProcureNavItem[] = [
  { id: "home", icon: <House />, label: "Home", href: "/dashboard" },
  { id: "search", icon: <Search />, label: "Search", href: "/dashboard?focus=search" },
  { id: "analyses", icon: <ClipboardCheck />, label: "My Analyses", href: "/conversations" },
  { id: "saved", icon: <Bookmark />, label: "Saved", href: "/dashboard?tab=saved" },
  { id: "new-analysis", icon: <Plus />, label: "New Analysis", href: "/dashboard?focus=new", isPrimary: true },
  { id: "suppliers", icon: <Building2 />, label: "Suppliers", href: "/dashboard?tab=suppliers" },
  { id: "reports", icon: <FileBarChart />, label: "Reports", href: "/dashboard?tab=reports" },
  { id: "profile", icon: <CircleUserRound />, label: "Profile", href: "/dashboard?tab=profile" },
];

export function LimelightNav() {
  const router = useRouter();
  const pathname = usePathname();

  // ALL HOOKS CALLED UNCONDITIONALLY BEFORE ANY RETURN
  const activeIndex = pathname.startsWith("/conversations") ? 2 : 0;
  const [isReady, setIsReady] = useState(false);
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);

  const navItemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const limelightRef = useRef<HTMLDivElement | null>(null);

  // Position the limelight spotlight indicator
  useLayoutEffect(() => {
    if (pathname === "/") return;

    const limelight = limelightRef.current;
    const activeItem = navItemRefs.current[activeIndex];

    if (limelight && activeItem) {
      const newLeft =
        activeItem.offsetLeft + activeItem.offsetWidth / 2 - limelight.offsetWidth / 2;
      limelight.style.left = `${newLeft}px`;

      if (!isReady) {
        const timer = setTimeout(() => setIsReady(true), 50);
        return () => clearTimeout(timer);
      }
    }
  }, [activeIndex, isReady, pathname]);

  // EARLY RETURN PLACED SAFELY AFTER ALL HOOK DECLARATIONS
  if (pathname === "/") {
    return null;
  }

  const handleItemClick = (_index: number, item: ProcureNavItem) => {
    router.push(item.href);
  };

  return (
    /* 
     * Outer wrapper: fixed position, centered. 
     * The tooltip is ABSOLUTELY POSITIONED so it never shifts the nav layout.
     * This prevents the jiggle/oscillation loop.
     */
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50">
      {/* 
        Tooltip: absolutely positioned ABOVE the nav via bottom-full.
        pointer-events-none ensures it can't intercept mouse events.
        Because it's absolute, it does NOT affect the nav's position in flow.
      */}
      <div
        className={`absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-1.5 rounded-full text-[11px] font-medium pointer-events-none transition-all duration-150 ${
          hoveredLabel
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-1"
        } bg-slate-800/90 text-white shadow-md border border-slate-700/40 backdrop-blur-sm`}
      >
        {hoveredLabel || "\u00A0"}
      </div>

      {/* 
        Nav bar: light translucent background matching reference.
        - White/glass bg with subtle gray border
        - Dark charcoal icons
        - Dark indicator bar with soft gray gradient spotlight
      */}
      <nav className="relative inline-flex items-center h-14 rounded-2xl bg-white/80 backdrop-blur-lg border border-slate-200/80 shadow-[0_2px_16px_rgba(0,0,0,0.06)] px-2">
        {defaultProcureNavItems.map((item, index) => {
          const isActive = activeIndex === index;
          const isPrimary = item.isPrimary;

          return (
            <button
              key={item.id}
              type="button"
              ref={(el) => {
                navItemRefs.current[index] = el;
              }}
              onClick={() => handleItemClick(index, item)}
              onMouseEnter={() => setHoveredLabel(item.label)}
              onMouseLeave={() => setHoveredLabel(null)}
              aria-label={item.label}
              className={`relative z-20 flex items-center justify-center cursor-pointer ${
                isPrimary
                  ? "mx-1 w-10 h-10 rounded-full bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition-colors duration-200"
                  : "p-3 rounded-xl transition-colors duration-200 hover:bg-slate-100/80"
              }`}
            >
              {cloneElement(item.icon as React.ReactElement<{ className?: string }>, {
                className: `${
                  isPrimary
                    ? "w-[18px] h-[18px] stroke-[2.5]"
                    : `w-5 h-5 transition-all duration-200 ${
                        isActive
                          ? "text-slate-900 opacity-100"
                          : "text-slate-400 opacity-70 hover:opacity-100 hover:text-slate-600"
                      }`
                }`,
              })}
            </button>
          );
        })}

        {/* 
          Limelight active indicator: dark rounded bar at top 
          with a soft gray gradient "spotlight" cone below it.
          Matches the reference design exactly.
        */}
        <div
          ref={limelightRef}
          className={`absolute top-0 z-10 w-10 h-[5px] rounded-full bg-slate-800 ${
            isReady ? "transition-[left] duration-250 ease-out" : ""
          }`}
          style={{ left: "-999px" }}
        >
          <div className="absolute left-[-30%] top-[5px] w-[160%] h-12 [clip-path:polygon(8%_100%,25%_0,75%_0,92%_100%)] bg-gradient-to-b from-slate-400/25 to-transparent pointer-events-none" />
        </div>
      </nav>
    </div>
  );
}
