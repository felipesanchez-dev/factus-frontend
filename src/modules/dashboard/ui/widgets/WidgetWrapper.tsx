"use client";

import { type ReactNode } from "react";
import { GripVertical, X } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/shared/lib/cn";

interface WidgetWrapperProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  isEditing?: boolean;
  onRemove?: () => void;
  headerAction?: ReactNode;
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function WidgetWrapper({
  title,
  description,
  icon,
  isEditing,
  onRemove,
  headerAction,
  children,
  className,
  noPadding,
}: WidgetWrapperProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "flex flex-col h-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden",
        "hover:shadow-md transition-shadow duration-200",
        isEditing &&
          "ring-2 ring-blue-500/20 ring-offset-1 dark:ring-offset-gray-950",
        className,
      )}
    >
      {/* Header */}
      {(title || isEditing) && (
        <div className="flex items-center justify-between px-5 pt-4 pb-1 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            {isEditing && (
              <div className="widget-drag-handle cursor-grab active:cursor-grabbing text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 transition-colors">
                <GripVertical className="h-4 w-4" />
              </div>
            )}
            {icon && (
              <div className="rounded-lg bg-blue-50 dark:bg-blue-900/30 p-1.5 text-blue-600 dark:text-blue-400 shrink-0">
                {icon}
              </div>
            )}
            <div className="min-w-0">
              {title && (
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                  {description}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {headerAction}
            {isEditing && onRemove && (
              <button
                onClick={onRemove}
                className="rounded-md p-1 text-gray-300 dark:text-gray-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                aria-label="Ocultar widget"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
      {/* Content */}
      <div
        className={cn(
          "flex-1 min-h-0",
          noPadding ? "" : "px-5 pb-4",
          title ? "pt-2" : "pt-0",
        )}
      >
        {children}
      </div>
    </motion.div>
  );
}
