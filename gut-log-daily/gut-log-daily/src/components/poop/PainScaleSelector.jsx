import React from "react";
import { cn } from "@/lib/utils";

// Visual color ramp for 1-10 pain values.
const SCALE_COLORS = [
  "", // 0 unused
  "bg-green-400",
  "bg-green-400",
  "bg-lime-400",
  "bg-yellow-400",
  "bg-yellow-500",
  "bg-orange-400",
  "bg-orange-500",
  "bg-red-400",
  "bg-red-500",
  "bg-red-600",
];

const SCALE_LABELS = { 1: "Minimal", 3: "Mild", 5: "Moderate", 7: "Severe", 10: "Worst" };

export default function PainScaleSelector({ value, onChange }) {
  // Horizontal button row lets users quickly tap their current pain level.
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-stone-700">Pain / Discomfort Scale</label>
        {value && (
          <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full text-white", SCALE_COLORS[value])}>
            {value}/10
          </span>
        )}
      </div>

      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={cn(
              "flex-1 h-10 rounded-lg font-bold text-sm transition-all",
              value === n
                ? `${SCALE_COLORS[n]} text-white shadow-md scale-110`
                : value && n <= value
                ? `${SCALE_COLORS[n]} text-white opacity-60`
                : "bg-stone-100 text-stone-500 hover:bg-stone-200"
            )}
          >
            {n}
          </button>
        ))}
      </div>

      <div className="flex justify-between text-[10px] text-stone-400 px-0.5">
        {[1, 3, 5, 7, 10].map((n) => (
          <span key={n} style={{ flex: n === 1 ? 1 : n === 10 ? 1 : "auto", textAlign: n === 1 ? "left" : n === 10 ? "right" : "center" }}>
            {SCALE_LABELS[n]}
          </span>
        ))}
      </div>
    </div>
  );
}