import { useTheme } from "./ThemeContext";

export function useChartTheme() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return {
    isDark,
    grid: isDark ? "#374151" : "#e2e8f0",
    tick: isDark ? "#9ca3af" : "#64748b",
    tooltipBg: isDark ? "#1f2937" : "#ffffff",
    tooltipBorder: isDark ? "#4b5563" : "#e2e8f0",
    tooltipColor: isDark ? "#f3f4f6" : "#1f2937",
    labelColor: isDark ? "#d1d5db" : "#374151",
    cursorFill: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
  };
}
