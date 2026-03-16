import { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

interface StatCardProps {
  icon: ReactNode;
  title: string;
  value: string | number;
  subtitle?: string;
  className?: string;
}

export function StatCard({ icon, title, value, subtitle, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          {subtitle && (
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{subtitle}</p>
          )}
        </div>
        <div className="rounded-lg bg-blue-50 dark:bg-blue-900/30 p-2.5 text-blue-600 dark:text-blue-400">
          {icon}
        </div>
      </div>
    </div>
  );
}
