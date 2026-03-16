"use client";

import { useState, useCallback } from "react";
import type { DashboardLayoutState, GridLayoutItem, WidgetId } from "./grid.types";
import {
  LAYOUT_STORAGE_KEY,
  LAYOUT_VERSION,
  DEFAULT_LAYOUTS,
  WIDGET_CONFIGS,
} from "./grid.constants";

function getDefaultState(): DashboardLayoutState {
  return {
    layouts: DEFAULT_LAYOUTS,
    hiddenWidgets: [],
    version: LAYOUT_VERSION,
  };
}

function loadFromStorage(): DashboardLayoutState {
  try {
    const raw = localStorage.getItem(LAYOUT_STORAGE_KEY);
    if (!raw) return getDefaultState();
    const parsed = JSON.parse(raw) as DashboardLayoutState;
    if (parsed.version !== LAYOUT_VERSION) return getDefaultState();
    return parsed;
  } catch {
    return getDefaultState();
  }
}

function saveToStorage(state: DashboardLayoutState): void {
  try {
    localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* quota exceeded — silently ignore */
  }
}

export function useGridLayout() {
  const [state, setState] = useState<DashboardLayoutState>(getDefaultState);

  // Hydrate from localStorage on mount (client only)
  const [hydrated, setHydrated] = useState(false);
  if (!hydrated && typeof window !== "undefined") {
    const stored = loadFromStorage();
    setState(stored);
    setHydrated(true);
  }
  const [isEditing, setIsEditing] = useState(false);

  const onLayoutChange = useCallback(
    (_layout: GridLayoutItem[], allLayouts: Record<string, GridLayoutItem[]>) => {
      setState((prev) => {
        const next = { ...prev, layouts: allLayouts };
        saveToStorage(next);
        return next;
      });
    },
    [],
  );

  const toggleWidget = useCallback((widgetId: WidgetId) => {
    setState((prev) => {
      const hidden = prev.hiddenWidgets.includes(widgetId)
        ? prev.hiddenWidgets.filter((id) => id !== widgetId)
        : [...prev.hiddenWidgets, widgetId];
      const next = { ...prev, hiddenWidgets: hidden };
      saveToStorage(next);
      return next;
    });
  }, []);

  const resetLayout = useCallback(() => {
    const def = getDefaultState();
    saveToStorage(def);
    setState(def);
  }, []);

  const visibleWidgets = (
    Object.keys(WIDGET_CONFIGS) as WidgetId[]
  ).filter((id) => !state.hiddenWidgets.includes(id));

  return {
    layouts: state.layouts,
    hiddenWidgets: state.hiddenWidgets,
    visibleWidgets,
    isEditing,
    setIsEditing,
    onLayoutChange,
    toggleWidget,
    resetLayout,
  };
}
