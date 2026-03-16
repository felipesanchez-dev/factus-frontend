"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
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

export function RevenueChart({ data }: { data: MonthlyData[] }) {
  const ct = useChartTheme();

  if (data.length === 0) {
    return (
      <Card>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">Ingresos Mensuales</h3>
        <div className="flex items-center justify-center h-64 text-gray-400 dark:text-gray-500 text-sm">
          Sin datos de ingresos
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">Ingresos Mensuales</h3>
      <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">Evolucion de ingresos por facturacion</p>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={ct.grid} fill="none" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: ct.tick }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 11, fill: ct.tick }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: ct.tooltipBg,
                border: `1px solid ${ct.tooltipBorder}`,
                borderRadius: "8px",
                fontSize: "12px",
                color: ct.tooltipColor,
              }}
              labelStyle={{ color: ct.tooltipColor }}
              itemStyle={{ color: ct.tooltipColor }}
              formatter={(value) => [formatCurrency(Number(value ?? 0)), "Ingresos"]}
            />
            <Area
              type="monotone"
              dataKey="ingresos"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#colorIngresos)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
