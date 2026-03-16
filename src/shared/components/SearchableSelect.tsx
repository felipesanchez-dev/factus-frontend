"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { ChevronDown, X, Loader2, Search } from "lucide-react";
import { cn } from "@/shared/lib/cn";

export interface SearchableOption {
  value: string;
  label: string;
  sublabel?: string;
}

interface SearchableSelectProps {
  label: string;
  options: SearchableOption[];
  value: string;
  onChange: (value: string, option: SearchableOption | null) => void;
  placeholder?: string;
  error?: string;
  loading?: boolean;
  required?: boolean;
  disabled?: boolean;
  id?: string;
}

const MAX_VISIBLE = 8;

export function SearchableSelect({
  label,
  options,
  value,
  onChange,
  placeholder = "Buscar...",
  error,
  loading,
  required,
  disabled,
  id,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlightIndex, setHighlightIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selectId = id || label.toLowerCase().replace(/\s+/g, "-");

  const selectedOption = useMemo(
    () => options.find((o) => o.value === value) ?? null,
    [options, value],
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return options;
    const q = query.toLowerCase();
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        (o.sublabel && o.sublabel.toLowerCase().includes(q)),
    );
  }, [options, query]);

  // Close on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Reset highlight when filtered changes
  useEffect(() => {
    setHighlightIndex(0);
  }, [filtered.length]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (!open || !listRef.current) return;
    const item = listRef.current.children[highlightIndex] as HTMLElement;
    if (item) item.scrollIntoView({ block: "nearest" });
  }, [highlightIndex, open]);

  const handleSelect = useCallback(
    (option: SearchableOption) => {
      onChange(option.value, option);
      setQuery("");
      setOpen(false);
    },
    [onChange],
  );

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange("", null);
      setQuery("");
      setOpen(false);
    },
    [onChange],
  );

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightIndex((i) => Math.min(i + 1, filtered.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightIndex((i) => Math.max(i - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (filtered[highlightIndex]) handleSelect(filtered[highlightIndex]);
        break;
      case "Escape":
        e.preventDefault();
        setOpen(false);
        break;
    }
  }

  return (
    <div className="flex flex-col gap-1.5" ref={containerRef}>
      <label
        htmlFor={selectId}
        className="text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
      </label>

      <div className="relative">
        {/* Trigger / Display */}
        {!open ? (
          <button
            type="button"
            id={selectId}
            disabled={disabled}
            onClick={() => {
              if (disabled) return;
              setOpen(true);
              setTimeout(() => inputRef.current?.focus(), 0);
            }}
            className={cn(
              "flex w-full items-center justify-between rounded-lg border bg-white dark:bg-gray-800 px-3 py-2.5 text-sm transition-colors text-left",
              disabled && "opacity-60 cursor-not-allowed",
              error
                ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                : "border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
              "focus:outline-none",
            )}
          >
            {selectedOption ? (
              <span className="text-gray-900 dark:text-gray-100 truncate">
                {selectedOption.label}
                {selectedOption.sublabel && (
                  <span className="text-gray-400 dark:text-gray-500 ml-1">
                    — {selectedOption.sublabel}
                  </span>
                )}
              </span>
            ) : (
              <span className="text-gray-400 dark:text-gray-500">
                {placeholder}
              </span>
            )}
            <div className="flex items-center gap-1 shrink-0 ml-2">
              {selectedOption && (
                <span
                  role="button"
                  tabIndex={-1}
                  onClick={handleClear}
                  className="rounded p-0.5 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <X className="h-3.5 w-3.5 text-gray-400" />
                </span>
              )}
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </div>
          </button>
        ) : (
          /* Search Input */
          <div
            className={cn(
              "flex items-center gap-2 rounded-lg border bg-white dark:bg-gray-800 px-3 py-2.5 text-sm",
              "border-blue-500 ring-2 ring-blue-500/20",
            )}
          >
            <Search className="h-4 w-4 text-gray-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="flex-1 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none"
              required={required && !value}
            />
            {loading && (
              <Loader2 className="h-4 w-4 animate-spin text-blue-500 shrink-0" />
            )}
          </div>
        )}

        {/* Dropdown */}
        {open && (
          <ul
            ref={listRef}
            className="absolute z-50 mt-1 w-full max-h-64 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg"
          >
            {loading ? (
              <li className="flex items-center justify-center gap-2 py-6">
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                <span className="text-sm text-gray-400 dark:text-gray-500">
                  Cargando...
                </span>
              </li>
            ) : filtered.length === 0 ? (
              <li className="py-6 text-center text-sm text-gray-400 dark:text-gray-500">
                Sin resultados para &ldquo;{query}&rdquo;
              </li>
            ) : (
              filtered.slice(0, MAX_VISIBLE * 10).map((option, i) => (
                <li
                  key={option.value}
                  onClick={() => handleSelect(option)}
                  onMouseEnter={() => setHighlightIndex(i)}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 cursor-pointer text-sm transition-colors",
                    i === highlightIndex
                      ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300"
                      : "text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-750",
                    option.value === value &&
                      "font-medium bg-blue-50/50 dark:bg-blue-950/20",
                  )}
                >
                  <div className="min-w-0">
                    <span className="truncate">{option.label}</span>
                    {option.sublabel && (
                      <span className="text-xs text-gray-400 dark:text-gray-500 ml-1.5">
                        {option.sublabel}
                      </span>
                    )}
                  </div>
                  {option.value === value && (
                    <span className="text-blue-500 text-xs shrink-0 ml-2">
                      ✓
                    </span>
                  )}
                </li>
              ))
            )}
          </ul>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
