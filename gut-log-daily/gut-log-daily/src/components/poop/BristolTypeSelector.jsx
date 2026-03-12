import React from "react";
import { cn } from "@/lib/utils";

// Reference table for Bristol stool scale options shown across the app.
const BRISTOL_TYPES = [
  { type: 1, emoji: "🌑", label: "Hard lumps", desc: "Separate hard lumps, like nuts", tag: "Constipation", color: "bg-red-50 border-red-200 text-red-800" },
  { type: 2, emoji: "🪵", label: "Lumpy sausage", desc: "Sausage-shaped but lumpy", tag: "Mild constipation", color: "bg-orange-50 border-orange-200 text-orange-800" },
  { type: 3, emoji: "🥖", label: "Cracked sausage", desc: "Sausage with cracks on surface", tag: "Normal", color: "bg-yellow-50 border-yellow-200 text-yellow-800" },
  { type: 4, emoji: "🐍", label: "Smooth snake", desc: "Smooth and soft sausage or snake", tag: "Ideal", color: "bg-green-50 border-green-200 text-green-800" },
  { type: 5, emoji: "🧼", label: "Soft blobs", desc: "Soft blobs with clear-cut edges", tag: "Lacking fiber", color: "bg-sky-50 border-sky-200 text-sky-800" },
  { type: 6, emoji: "☁️", label: "Mushy", desc: "Fluffy pieces, ragged edges", tag: "Diarrhea", color: "bg-purple-50 border-purple-200 text-purple-800" },
  { type: 7, emoji: "💧", label: "Liquid", desc: "Watery, no solid pieces", tag: "Severe diarrhea", color: "bg-red-50 border-red-300 text-red-900" },
];

export { BRISTOL_TYPES };

export default function BristolTypeSelector({ value, onChange }) {
  // Renders selectable cards; selected card is highlighted and returns its type number.
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-stone-700">Bristol Stool Type</label>
      <div className="grid gap-2">
        {BRISTOL_TYPES.map((item) => (
          <button
            key={item.type}
            type="button"
            onClick={() => onChange(item.type)}
            className={cn(
              "flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left",
              value === item.type
                ? `${item.color} border-current shadow-sm scale-[1.02]`
                : "bg-white border-stone-200 hover:border-stone-300 hover:shadow-sm"
            )}
          >
            <span className="text-2xl flex-shrink-0">{item.emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">Type {item.type}</span>
                <span className={cn(
                  "text-[10px] font-medium px-1.5 py-0.5 rounded-full",
                  value === item.type ? "bg-white/60" : "bg-stone-100 text-stone-500"
                )}>
                  {item.tag}
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5 truncate">{item.desc}</p>
            </div>
            <div className={cn(
              "w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all",
              value === item.type ? "border-current bg-current" : "border-stone-300"
            )}>
              {value === item.type && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}