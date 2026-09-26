"use client";

import React, { useState, useRef, useLayoutEffect, cloneElement } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  House,
  MagnifyingGlass,
  ClipboardText,
  BookmarkSimple,
  Plus,
  Buildings,
  ChartBar,
  UserCircle,
} from "@phosphor-icons/react";

export type ProcureNavItem = {
  id: string;
  icon: React.ReactElement;
  label: string;
  href: string;
  badgeColor: string;
  isPrimary?: boolean;
};

export const defaultProcureNavItems: ProcureNavItem[] = [
  { id: "home", icon: <House weight="fill" />, label: "Home Dashboard", href: "/dashboard", badgeColor: "bg-[#00a8e8]" },
  { id: "new-analysis", icon: <Plus weight="bold" />, label: "New Analysis", href: "/dashboard", isPrimary: true, badgeColor: "bg-[#7209b7]" },
];

export function LimelightNav() {
  const router = useRouter();
  const pathname = usePathname();

  const activeIndex = pathname.startsWith("/analysis") ? 1 : 0;
  const [isReady, setIsReady] = useState(false);
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);

  const navItemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const limelightRef = useRef<HTMLDivElement | null>(null);

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

  if (pathname === "/") {
    return null;
  }

  const handleItemClick = (_index: number, item: ProcureNavItem) => {
    router.push(item.href);
  };

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50">
      <div
        className={`absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-1.5 rounded-full text-[11px] font-semibold pointer-events-none transition-all duration-150 ${
          hoveredLabel
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-1"
        } bg-slate-900/90 text-white shadow-md border border-slate-700/40 backdrop-blur-sm`}
      >
        {hoveredLabel || "\u00A0"}
      </div>

      <nav className="relative inline-flex items-center h-14 rounded-full bg-white/90 backdrop-blur-lg border border-slate-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.08)] px-2.5 gap-1.5">
        {defaultProcureNavItems.map((item, index) => {
          const isActive = activeIndex === index;

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
              className="relative z-20 flex items-center justify-center cursor-pointer p-0.5 rounded-full transition-transform duration-150 hover:scale-105"
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center shadow-xs transition-all duration-200 ${
                  item.badgeColor
                } ${
                  isActive
                    ? "ring-2 ring-slate-900 ring-offset-2 scale-105 shadow-md"
                    : "opacity-90 hover:opacity-100"
                }`}
              >
                {cloneElement(item.icon as React.ReactElement<{ className?: string }>, {
                  className: "w-4.5 h-4.5 text-white fill-white",
                })}
              </div>
            </button>
          );
        })}

        <div
          ref={limelightRef}
          className={`absolute top-0 z-10 w-10 h-[4px] rounded-full bg-slate-900 ${
            isReady ? "transition-[left] duration-250 ease-out" : ""
          }`}
          style={{ left: "-999px" }}
        >
          <div className="absolute left-[-30%] top-[4px] w-[160%] h-10 [clip-path:polygon(8%_100%,25%_0,75%_0,92%_100%)] bg-gradient-to-b from-purple-500/30 to-transparent pointer-events-none" />
        </div>
      </nav>
    </div>
  );
}
