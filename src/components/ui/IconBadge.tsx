"use client";

import React from "react";

export type IconBadgeColor =
  | "blue"
  | "pink"
  | "red"
  | "grey"
  | "green"
  | "lime"
  | "orange"
  | "amber"
  | "purple"
  | "cyan"
  | "teal"
  | "emerald"
  | "indigo";

export type IconBadgeSize = "xs" | "sm" | "md" | "lg" | "xl";

interface IconBadgeProps {
  icon: React.ReactNode;
  color?: IconBadgeColor;
  size?: IconBadgeSize;
  className?: string;
  title?: string;
}

const colorMap: Record<IconBadgeColor, string> = {
  blue: "bg-[#00a8e8] text-white shadow-xs",
  pink: "bg-[#e63565] text-white shadow-xs",
  red: "bg-[#e63946] text-white shadow-xs",
  grey: "bg-[#8d99ae] text-white shadow-xs",
  green: "bg-[#2a9d8f] text-white shadow-xs",
  lime: "bg-[#70e000] text-white shadow-xs",
  orange: "bg-[#f4a261] text-white shadow-xs",
  amber: "bg-[#ff9f1c] text-white shadow-xs",
  purple: "bg-[#7209b7] text-white shadow-xs",
  cyan: "bg-[#00b4d8] text-white shadow-xs",
  teal: "bg-[#0d9488] text-white shadow-xs",
  emerald: "bg-[#10b981] text-white shadow-xs",
  indigo: "bg-[#6366f1] text-white shadow-xs",
};

const sizeMap: Record<IconBadgeSize, string> = {
  xs: "w-5 h-5 text-[10px]",
  sm: "w-6 h-6 text-xs",
  md: "w-8 h-8 text-sm",
  lg: "w-10 h-10 text-base",
  xl: "w-12 h-12 text-lg",
};

export default function IconBadge({
  icon,
  color = "blue",
  size = "md",
  className = "",
  title,
}: IconBadgeProps) {
  return (
    <div
      title={title}
      className={`rounded-full flex items-center justify-center shrink-0 ${colorMap[color]} ${sizeMap[size]} ${className}`}
    >
      {icon}
    </div>
  );
}
