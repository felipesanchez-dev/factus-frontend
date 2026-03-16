"use client";

import { cn } from "@/shared/lib/cn";

interface WidgetSkeletonProps {
  type?: "kpi" | "chart" | "table" | "banner";
  className?: string;
}

export function WidgetSkeleton({
  type = "chart",
  className,
}: WidgetSkeletonProps) {
  return (
    <div
      className={cn(
        "h-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 animate-pulse",
        className,
      )}
    >
      {type === "banner" && (
        <>
          <div className="h-5 w-48 bg-gray-200 dark:bg-gray-800 rounded mb-2" />
          <div className="h-3 w-64 bg-gray-100 dark:bg-gray-800/60 rounded" />
        </>
      )}
      {type === "kpi" && (
        <>
          <div className="h-3 w-20 bg-gray-200 dark:bg-gray-800 rounded mb-3" />
          <div className="h-7 w-28 bg-gray-200 dark:bg-gray-800 rounded mb-2" />
          <div className="h-3 w-36 bg-gray-100 dark:bg-gray-800/60 rounded" />
        </>
      )}
      {type === "chart" && (
        <>
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded mb-2" />
          <div className="h-3 w-48 bg-gray-100 dark:bg-gray-800/60 rounded mb-4" />
          <div className="flex-1 min-h-[160px] bg-gray-100 dark:bg-gray-800/40 rounded-lg" />
        </>
      )}
      {type === "table" && (
        <>
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded mb-4" />
          <div className="space-y-2.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-8 bg-gray-100 dark:bg-gray-800/40 rounded"
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
