import { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm",
        className
      )}
    >
      {children}
    </div>
  );
}
