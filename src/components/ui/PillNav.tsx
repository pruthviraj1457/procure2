"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "gsap";

export type PillNavItem = {
  label: string;
  href: string;
  ariaLabel?: string;
};

export interface PillNavProps {
  logo: string;
  logoAlt?: string;
  items: PillNavItem[];
  activeHref?: string;
  className?: string;
  ease?: string;
  baseColor?: string;
  pillColor?: string;
  hoveredPillTextColor?: string;
  pillTextColor?: string;
  onMobileMenuClick?: () => void;
  initialLoadAnimation?: boolean;
  /** Hide the built-in logo bubble (useful when logo is rendered externally) */
  showLogo?: boolean;
  /** Hide the mobile hamburger button (useful for standalone pill-bar usage) */
  showMobileHamburger?: boolean;
}

/**
 * Returns true when the href should be handled by next/link (internal non-hash routes).
 * Hash anchors, external URLs, mailto:, tel: fall through to plain <a>.
 */
const isNextLink = (href: string): boolean =>
  href.startsWith("/") && !href.startsWith("//") && !href.startsWith("/#");

const PillNav: React.FC<PillNavProps> = ({
  logo,
  logoAlt = "Logo",
  items,
  activeHref,
  className = "",
  ease = "power3.easeOut",
  baseColor = "#fff",
  pillColor = "#120F17",
  hoveredPillTextColor = "#120F17",
  pillTextColor,
  onMobileMenuClick,
  initialLoadAnimation = true,
  showLogo = true,
  showMobileHamburger = true,
}) => {
  const resolvedPillTextColor = pillTextColor ?? baseColor;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const circleRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const tlRefs = useRef<Array<gsap.core.Timeline | null>>([]);
  const activeTweenRefs = useRef<Array<gsap.core.Tween | null>>([]);
  const logoImgRef = useRef<HTMLImageElement | null>(null);
  const logoTweenRef = useRef<gsap.core.Tween | null>(null);
  const hamburgerRef = useRef<HTMLButtonElement | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);
  const navItemsRef = useRef<HTMLDivElement | null>(null);
  const logoContainerRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    const layout = () => {
      circleRefs.current.forEach((circle) => {
        if (!circle?.parentElement) return;

        const pill = circle.parentElement as HTMLElement;
        const rect = pill.getBoundingClientRect();
        const { width: w, height: h } = rect;
        const R = ((w * w) / 4 + h * h) / (2 * h);
        const D = Math.ceil(2 * R) + 2;
        const delta =
          Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
        const originY = D - delta;

        circle.style.width = `${D}px`;
        circle.style.height = `${D}px`;
        circle.style.bottom = `-${delta}px`;

        gsap.set(circle, {
          xPercent: -50,
          scale: 0,
          transformOrigin: `50% ${originY}px`,
        });

        const label = pill.querySelector<HTMLElement>(".pill-label");
        const white = pill.querySelector<HTMLElement>(".pill-label-hover");

        if (label) gsap.set(label, { y: 0 });
        if (white) gsap.set(white, { y: h + 12, opacity: 0 });

        const index = circleRefs.current.indexOf(circle);
        if (index === -1) return;

        tlRefs.current[index]?.kill();
        const tl = gsap.timeline({ paused: true });

        tl.to(
          circle,
          { scale: 1.2, xPercent: -50, duration: 2, ease, overwrite: "auto" },
          0
        );

        if (label) {
          tl.to(label, { y: -(h + 8), duration: 2, ease, overwrite: "auto" }, 0);
        }

        if (white) {
          gsap.set(white, { y: Math.ceil(h + 100), opacity: 0 });
          tl.to(
            white,
            { y: 0, opacity: 1, duration: 2, ease, overwrite: "auto" },
            0
          );
        }

        tlRefs.current[index] = tl;
      });
    };

    layout();
    window.addEventListener("resize", layout);
    if (document.fonts) {
      document.fonts.ready.then(layout).catch(() => {});
    }

    const menu = mobileMenuRef.current;
    if (menu) {
      gsap.set(menu, { visibility: "hidden", opacity: 0, scaleY: 1, y: 0 });
    }

    if (initialLoadAnimation) {
      const logoEl = logoContainerRef.current;
      const navItems = navItemsRef.current;

      if (logoEl) {
        gsap.set(logoEl, { scale: 0 });
        gsap.to(logoEl, { scale: 1, duration: 0.6, ease });
      }

      if (navItems) {
        gsap.set(navItems, { width: 0, overflow: "hidden" });
        gsap.to(navItems, { width: "auto", duration: 0.6, ease });
      }
    }

    return () => window.removeEventListener("resize", layout);
  }, [items, ease, initialLoadAnimation]);

  const handleEnter = (i: number) => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(tl.duration(), {
      duration: 0.3,
      ease,
      overwrite: "auto",
    });
  };

  const handleLeave = (i: number) => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(0, {
      duration: 0.2,
      ease,
      overwrite: "auto",
    });
  };

  const handleLogoEnter = () => {
    const img = logoImgRef.current;
    if (!img) return;
    logoTweenRef.current?.kill();
    gsap.set(img, { rotate: 0 });
    logoTweenRef.current = gsap.to(img, {
      rotate: 360,
      duration: 0.35,
      ease,
      overwrite: "auto",
    });
  };

  const toggleMobileMenu = () => {
    const newState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newState);

    const hamburger = hamburgerRef.current;
    const menu = mobileMenuRef.current;

    if (hamburger) {
      const lines = hamburger.querySelectorAll(".hamburger-line");
      if (newState) {
        gsap.to(lines[0], { rotation: 45, y: 3, duration: 0.3, ease });
        gsap.to(lines[1], { rotation: -45, y: -3, duration: 0.3, ease });
      } else {
        gsap.to(lines[0], { rotation: 0, y: 0, duration: 0.3, ease });
        gsap.to(lines[1], { rotation: 0, y: 0, duration: 0.3, ease });
      }
    }

    if (menu) {
      if (newState) {
        gsap.set(menu, { visibility: "visible" });
        gsap.fromTo(
          menu,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.3, ease }
        );
      } else {
        gsap.to(menu, {
          opacity: 0,
          y: 10,
          duration: 0.2,
          ease,
          onComplete: () => gsap.set(menu, { visibility: "hidden" }),
        });
      }
    }

    onMobileMenuClick?.();
  };

  const cssVars = {
    ["--base"]: baseColor,
    ["--pill-bg"]: pillColor,
    ["--hover-text"]: hoveredPillTextColor,
    ["--pill-text"]: resolvedPillTextColor,
    ["--nav-h"]: "42px",
    ["--logo"]: "36px",
    ["--pill-pad-x"]: "18px",
    ["--pill-gap"]: "3px",
  } as React.CSSProperties;

  const buildPillContent = (item: PillNavItem, i: number) => {
    const isActive = activeHref === item.href;
    return (
      <>
        <span
          className="hover-circle absolute left-1/2 bottom-0 rounded-full z-[1] block pointer-events-none"
          style={{ background: "var(--base)", willChange: "transform" }}
          aria-hidden="true"
          ref={(el) => {
            circleRefs.current[i] = el;
          }}
        />
        <span className="label-stack relative inline-block leading-[1] z-[2]">
          <span
            className="pill-label relative z-[2] inline-block leading-[1]"
            style={{ willChange: "transform" }}
          >
            {item.label}
          </span>
          <span
            className="pill-label-hover absolute left-0 top-0 z-[3] inline-block"
            style={{
              color: "var(--hover-text)",
              willChange: "transform, opacity",
            }}
            aria-hidden="true"
          >
            {item.label}
          </span>
        </span>
        {isActive && (
          <span
            className="absolute left-1/2 -bottom-[6px] -translate-x-1/2 w-3 h-3 rounded-full z-[4]"
            style={{ background: "var(--base)" }}
            aria-hidden="true"
          />
        )}
      </>
    );
  };

  const basePillClasses =
    "relative overflow-hidden inline-flex items-center justify-center h-full no-underline rounded-full box-border font-semibold text-[13px] leading-[0] uppercase tracking-[0.5px] whitespace-nowrap cursor-pointer";

  const buildPillStyle = (): React.CSSProperties => ({
    background: "var(--pill-bg)",
    color: "var(--pill-text)",
    paddingLeft: "var(--pill-pad-x)",
    paddingRight: "var(--pill-pad-x)",
  });

  return (
    <div className={`relative ${className || "w-full"}`} style={cssVars}>
      <nav
        className={`w-full flex items-center ${showLogo ? "justify-between md:justify-start" : "justify-end"} box-border`}
        aria-label="Primary"
      >
        {/* Logo bubble — conditionally shown */}
        {showLogo && (
          <a
            href="#"
            aria-label="Home"
            onMouseEnter={handleLogoEnter}
            ref={logoContainerRef}
            className="rounded-full p-2 inline-flex items-center justify-center overflow-hidden flex-shrink-0"
            style={{
              width: "var(--nav-h)",
              height: "var(--nav-h)",
              background: "var(--base)",
            }}
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            <img
              src={logo}
              alt={logoAlt}
              ref={logoImgRef}
              className="w-full h-full object-contain block"
            />
          </a>
        )}

        {/* Desktop pill bar */}
        <div
          ref={navItemsRef}
          className={`relative items-center rounded-full hidden md:flex ${showLogo ? "ml-2" : ""}`}
          style={{ height: "var(--nav-h)", background: "var(--base)" }}
        >
          <ul
            role="menubar"
            className="list-none flex items-stretch m-0 p-[3px] h-full"
            style={{ gap: "var(--pill-gap)" }}
          >
            {items.map((item, i) => (
              <li key={item.href} role="none" className="flex h-full">
                {isNextLink(item.href) ? (
                  <Link
                    role="menuitem"
                    href={item.href}
                    className={basePillClasses}
                    style={buildPillStyle()}
                    aria-label={item.ariaLabel || item.label}
                    onMouseEnter={() => handleEnter(i)}
                    onMouseLeave={() => handleLeave(i)}
                  >
                    {buildPillContent(item, i)}
                  </Link>
                ) : (
                  <a
                    role="menuitem"
                    href={item.href}
                    className={basePillClasses}
                    style={buildPillStyle()}
                    aria-label={item.ariaLabel || item.label}
                    onMouseEnter={() => handleEnter(i)}
                    onMouseLeave={() => handleLeave(i)}
                  >
                    {buildPillContent(item, i)}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Hamburger — conditionally shown */}
        {showMobileHamburger && (
          <button
            ref={hamburgerRef}
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
            className="md:hidden rounded-full border-0 flex flex-col items-center justify-center gap-1 cursor-pointer p-0"
            style={{
              width: "var(--nav-h)",
              height: "var(--nav-h)",
              background: "var(--base)",
            }}
          >
            <span
              className="hamburger-line w-4 h-0.5 rounded origin-center"
              style={{ background: "var(--pill-bg)" }}
            />
            <span
              className="hamburger-line w-4 h-0.5 rounded origin-center"
              style={{ background: "var(--pill-bg)" }}
            />
          </button>
        )}
      </nav>

      {/* Mobile dropdown */}
      <div
        ref={mobileMenuRef}
        className="md:hidden absolute top-[3.5em] left-0 right-0 rounded-[27px] shadow-[0_8px_32px_rgba(0,0,0,0.18)] z-[998] origin-top"
        style={{ background: "var(--base)" }}
      >
        <ul className="list-none m-0 p-[3px] flex flex-col gap-[3px]">
          {items.map((item) => {
            const defaultStyle: React.CSSProperties = {
              background: "var(--pill-bg)",
              color: "var(--pill-text)",
            };
            const hoverIn = (e: React.MouseEvent<HTMLAnchorElement>) => {
              e.currentTarget.style.background = "var(--base)";
              e.currentTarget.style.color = "var(--hover-text)";
            };
            const hoverOut = (e: React.MouseEvent<HTMLAnchorElement>) => {
              e.currentTarget.style.background = "var(--pill-bg)";
              e.currentTarget.style.color = "var(--pill-text)";
            };
            const mobileLinkClasses =
              "block py-3 px-4 text-[14px] font-medium rounded-[50px] transition-all duration-200";

            return (
              <li key={item.href}>
                {isNextLink(item.href) ? (
                  <Link
                    href={item.href}
                    className={mobileLinkClasses}
                    style={defaultStyle}
                    onMouseEnter={hoverIn}
                    onMouseLeave={hoverOut}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <a
                    href={item.href}
                    className={mobileLinkClasses}
                    style={defaultStyle}
                    onMouseEnter={hoverIn}
                    onMouseLeave={hoverOut}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default PillNav;
