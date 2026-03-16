"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card } from "@/shared/components/Card";
import { useChartTheme } from "@/shared/lib/useChartTheme";
import type { MonthlyData } from "../../domain/dashboard.types";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function TaxVsRevenueChart({ data }: { data: MonthlyData[] }) {
  const ct = useChartTheme();

  if (data.length === 0) {
    return (
      <Card>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">Ingresos vs Impuestos</h3>
        <div className="flex items-center justify-center h-64 text-gray-400 dark:text-gray-500 text-sm">
          Sin datos comparativos
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">Ingresos vs Impuestos</h3>
      <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">Comparativa mensual de ingresos brutos y retenciones</p>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={ct.grid} vertical={false} fill="none" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: ct.tick }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 11, fill: ct.tick }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            />
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
              formatter={(value, name) => [
                formatCurrency(Number(value ?? 0)),
                String(name) === "ingresos" ? "Ingresos" : "Impuestos",
              ]}
            />
            <Legend
              formatter={(value) => (
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {value === "ingresos" ? "Ingresos" : "Impuestos"}
                </span>
              )}
            />
            <Bar dataKey="ingresos" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={30} />
            <Bar dataKey="impuestos" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={30} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
