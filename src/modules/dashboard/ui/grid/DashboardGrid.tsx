"use client";

import {
  ResponsiveGridLayout,
  useContainerWidth,
  verticalCompactor,
} from "react-grid-layout";
import type { Layout, ResponsiveLayouts } from "react-grid-layout";
import { cn } from "@/shared/lib/cn";
import {
  GRID_BREAKPOINTS,
  GRID_COLS,
  GRID_ROW_HEIGHT,
  GRID_MARGIN,
} from "./grid.constants";
import type { GridLayoutItem, WidgetId } from "./grid.types";

interface DashboardGridProps {
  layouts: Record<string, GridLayoutItem[]>;
  visibleWidgets: WidgetId[];
  isEditing: boolean;
  onLayoutChange: (
    layout: GridLayoutItem[],
    allLayouts: Record<string, GridLayoutItem[]>,
  ) => void;
  renderWidget: (widgetId: WidgetId) => React.ReactNode;
}

export function DashboardGrid({
  layouts,
  visibleWidgets,
  isEditing,
  onLayoutChange,
  renderWidget,
}: DashboardGridProps) {
  const { width, containerRef, mounted } = useContainerWidth();

  // Filter layouts to only include visible widgets
  const filteredLayouts: Record<string, GridLayoutItem[]> = {};
  for (const [bp, layoutArr] of Object.entries(layouts)) {
    filteredLayouts[bp] = layoutArr.filter((l) =>
      visibleWidgets.includes(l.i as WidgetId),
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "dashboard-grid -mx-2",
        isEditing && "dashboard-grid-editing",
      )}
    >
      {mounted && (
        <ResponsiveGridLayout
          width={width}
          layouts={filteredLayouts as ResponsiveLayouts}
          breakpoints={GRID_BREAKPOINTS}
          cols={GRID_COLS}
          rowHeight={GRID_ROW_HEIGHT}
          margin={GRID_MARGIN}
          containerPadding={[8, 0] as const}
          dragConfig={{
            enabled: isEditing,
            handle: ".widget-drag-handle",
          }}
          resizeConfig={{
            enabled: isEditing,
          }}
          onLayoutChange={
            onLayoutChange as (
              layout: Layout,
              layouts: ResponsiveLayouts,
            ) => void
          }
          compactor={verticalCompactor}
        >
          {visibleWidgets.map((widgetId) => (
            <div key={widgetId}>{renderWidget(widgetId)}</div>
          ))}
        </ResponsiveGridLayout>
      )}
    </div>
  );
}
