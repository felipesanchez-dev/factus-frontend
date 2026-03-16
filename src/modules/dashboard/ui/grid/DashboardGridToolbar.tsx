"use client";

import { useState, useRef, useEffect } from "react";
import {
  Settings2,
  RotateCcw,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  ChevronDown,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { WIDGET_CONFIGS } from "./grid.constants";
import type { WidgetId } from "./grid.types";

interface DashboardGridToolbarProps {
  isEditing: boolean;
  onToggleEdit: () => void;
  onReset: () => void;
  hiddenWidgets: WidgetId[];
  onToggleWidget: (id: WidgetId) => void;
  lastUpdated: Date | null;
  isRefreshing: boolean;
  onRefresh: () => void;
}

function useTimeAgo(date: Date | null): string {
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!date) return;
    const interval = window.setInterval(() => setTick((t) => t + 1), 1000);
    return () => window.clearInterval(interval);
  }, [date]);

  if (!date) return "";

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 5) return "Justo ahora";
  if (seconds < 60) return `Hace ${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `Hace ${minutes}m`;
  return `Hace ${Math.floor(minutes / 60)}h`;
}

export function DashboardGridToolbar({
  isEditing,
  onToggleEdit,
  onReset,
  hiddenWidgets,
  onToggleWidget,
  lastUpdated,
  isRefreshing,
  onRefresh,
}: DashboardGridToolbarProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeAgo = useTimeAgo(lastUpdated);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hiddenCount = hiddenWidgets.length;

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        {hiddenCount > 0 && (
          <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-xs font-medium text-gray-500 dark:text-gray-400">
            {hiddenCount} oculto{hiddenCount > 1 ? "s" : ""}
          </span>
        )}
        {/* Refresh indicator */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="rounded-md p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
            title="Actualizar datos"
          >
            {isRefreshing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
          </button>
          {timeAgo && (
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {timeAgo}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isEditing && (
          <>
            {/* Widget visibility dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                  "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400",
                  "hover:bg-gray-50 dark:hover:bg-gray-800",
                )}
              >
                <Settings2 className="h-3.5 w-3.5" />
                Widgets
                <ChevronDown className="h-3 w-3" />
              </button>

              {showDropdown && (
                <div className="absolute right-0 top-full mt-1 z-50 w-64 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg py-1">
                  <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Mostrar / Ocultar
                    </p>
                  </div>
                  <div className="max-h-72 overflow-y-auto py-1">
                    {(Object.keys(WIDGET_CONFIGS) as WidgetId[]).map((id) => {
                      const cfg = WIDGET_CONFIGS[id];
                      const isHidden = hiddenWidgets.includes(id);
                      return (
                        <button
                          key={id}
                          onClick={() => onToggleWidget(id)}
                          className="flex items-center gap-2.5 w-full px-3 py-1.5 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          {isHidden ? (
                            <EyeOff className="h-3.5 w-3.5 text-gray-300 dark:text-gray-600 shrink-0" />
                          ) : (
                            <Eye className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                          )}
                          <span
                            className={cn(
                              "text-xs truncate",
                              isHidden
                                ? "text-gray-400 dark:text-gray-500 line-through"
                                : "text-gray-700 dark:text-gray-300",
                            )}
                          >
                            {cfg.title}
                          </span>
                          <span className="ml-auto text-[10px] text-gray-300 dark:text-gray-600 uppercase">
                            {cfg.category}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Reset button */}
            <button
              onClick={onReset}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400",
                "hover:bg-gray-50 dark:hover:bg-gray-800",
              )}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Restaurar
            </button>
          </>
        )}

        {/* Edit toggle */}
        <button
          onClick={onToggleEdit}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
            isEditing
              ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
              : "border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800",
          )}
        >
          {isEditing ? (
            <>
              <Lock className="h-3.5 w-3.5" />
              Guardar
            </>
          ) : (
            <>
              <Unlock className="h-3.5 w-3.5" />
              Personalizar
            </>
          )}
        </button>
      </div>
    </div>
  );
}
