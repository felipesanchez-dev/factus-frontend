"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card } from "@/shared/components/Card";
import { useChartTheme } from "@/shared/lib/useChartTheme";
import type { StatusBreakdown } from "../../domain/dashboard.types";

export function StatusPieChart({ data, bare }: { data: StatusBreakdown[]; bare?: boolean }) {
  const ct = useChartTheme();

  if (data.length === 0) {
    const empty = (
      <div className="flex items-center justify-center h-full min-h-[160px] text-gray-400 dark:text-gray-500 text-sm">
        Sin datos de estado
      </div>
    );
    if (bare) return empty;
    return (
      <Card>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">Estado de Facturas</h3>
        {empty}
      </Card>
    );
  }

  const total = data.reduce((sum, d) => sum + d.value, 0);

  const content = (
    <div className={bare ? "h-full" : "h-64"}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
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
            formatter={(value, name) => {
              const v = Number(value ?? 0);
              return [
                `${v} (${((v / total) * 100).toFixed(1)}%)`,
                String(name),
              ];
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => (
              <span className="text-xs text-gray-400 dark:text-gray-400">
                {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );

  if (bare) return content;

  return (
    <Card>
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">Estado de Facturas</h3>
      <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">Distribucion por estado DIAN</p>
      {content}
    </Card>
  );
}
