"use client";

import { WidgetSkeleton } from "./widgets/WidgetSkeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      {/* Toolbar skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
        <div className="h-8 w-32 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
      </div>
      {/* Banner */}
      <WidgetSkeleton type="banner" className="min-h-[120px]" />
      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <WidgetSkeleton key={`kpi-a-${i}`} type="kpi" />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <WidgetSkeleton key={`kpi-b-${i}`} type="kpi" />
        ))}
      </div>
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <WidgetSkeleton type="chart" className="min-h-[300px]" />
        <WidgetSkeleton type="chart" className="min-h-[300px]" />
      </div>
      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <WidgetSkeleton type="table" className="min-h-[280px]" />
        <WidgetSkeleton type="table" className="min-h-[280px]" />
      </div>
    </div>
  );
}
