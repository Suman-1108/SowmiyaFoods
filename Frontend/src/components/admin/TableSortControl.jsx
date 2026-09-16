import React from "react";
import { ArrowUpDown } from "lucide-react";

/**
 * TableSortControl
 * Reusable sort control dropdown for admin table views
 * 
 * Props:
 * - value: string (current sort option key)
 * - onChange: (newValue: string) => void
 * - options: Array<{ value: string, label: string }>
 * - label: string (optional header label, default: "Sort")
 */
const TableSortControl = ({ value, onChange, options = [], label = "Sort by" }) => {
  return (
    <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
      <ArrowUpDown className="w-3.5 h-3.5 text-[#e8703b] shrink-0" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e8703b] focus:border-transparent font-medium text-slate-800 transition cursor-pointer hover:bg-slate-100/70"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TableSortControl;
