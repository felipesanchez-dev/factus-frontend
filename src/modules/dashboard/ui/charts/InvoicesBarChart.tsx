"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card } from "@/shared/components/Card";
import { useChartTheme } from "@/shared/lib/useChartTheme";
import type { MonthlyData } from "../../domain/dashboard.types";

export function InvoicesBarChart({ data }: { data: MonthlyData[] }) {
  const ct = useChartTheme();

  if (data.length === 0) {
    return (
      <Card>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">Facturas por Mes</h3>
        <div className="flex items-center justify-center h-64 text-gray-400 dark:text-gray-500 text-sm">
          Sin datos de facturas
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">Facturas Emitidas por Mes</h3>
      <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">Cantidad de facturas electronicas generadas</p>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={ct.grid} vertical={false} fill="none" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: ct.tick }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: ct.tick }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip
              cursor={{ fill: ct.cursorFill }}
              contentStyle={{
                backgroundColor: ct.tooltipBg,
                border: `1px solid ${ct.tooltipBorder}`,
                borderRadius: "8px",
                fontSize: "12px",
                color: ct.tooltipColor,
              }}
              labelStyle={{ color: ct.tooltipColor }}
              itemStyle={{ color: ct.tooltipColor }}
              formatter={(value) => [Number(value ?? 0), "Facturas"]}
            />
            <Bar dataKey="facturas" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
