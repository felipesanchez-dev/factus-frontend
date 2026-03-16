"use client";

import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { cn } from "@/shared/lib/cn";

interface SidebarItemProps {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
  onClick?: () => void;
}

export function SidebarItem({
  href,
  label,
  icon: Icon,
  active,
  onClick,
}: SidebarItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
        active
          ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
          : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white",
      )}
    >
      <Icon className='h-5 w-5 shrink-0' />
      {label}
    </Link>
  );
}
