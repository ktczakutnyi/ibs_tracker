import React from "react";
import { cn } from "@/lib/utils";

export const SYMPTOM_OPTIONS = [
  { id: "abdominal_pain", emoji: "😣", label: "Abdominal Pain", desc: "Pain related to urge to move bowels" },
  { id: "cramping", emoji: "😖", label: "Cramping", desc: "Muscle spasms in the abdomen" },
  { id: "bloating", emoji: "🎈", label: "Bloating & Gas", desc: "Feeling of an inflated balloon" },
  { id: "mucus", emoji: "🫧", label: "Mucus in Stool", desc: "White, cloudy, or clear mucus" },
  { id: "incomplete_evacuation", emoji: "😤", label: "Incomplete Evacuation", desc: "Feeling bowels aren't fully empty" },
];

export function getSymptomEmoji(symptoms = []) {
  if (symptoms.includes("bloating")) return "🎈";
  if (symptoms.includes("abdominal_pain")) return "😣";
  if (symptoms.includes("cramping")) return "😖";
  if (symptoms.includes("mucus")) return "🫧";
  if (symptoms.includes("incomplete_evacuation")) return "😤";
  return "🤒";
}

export default function SymptomSelector({ value = [], onChange }) {
  const toggle = (id) => {
    if (value.includes(id)) {
      onChange(value.filter((s) => s !== id));
    } else {
      onChange([...value, id]);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-stone-700">Symptoms</label>
      <div className="grid gap-2">
        {SYMPTOM_OPTIONS.map((s) => {
          const selected = value.includes(s.id);
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => toggle(s.id)}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left",
                selected
                  ? "bg-indigo-50 border-indigo-300 shadow-sm scale-[1.02]"
                  : "bg-white border-stone-200 hover:border-stone-300 hover:shadow-sm"
              )}
            >
              <span className="text-2xl flex-shrink-0">{s.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-stone-800">{s.label}</p>
                <p className="text-xs text-stone-500 mt-0.5">{s.desc}</p>
              </div>
              <div className={cn(
                "w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all",
                selected ? "border-indigo-500 bg-indigo-500" : "border-stone-300"
              )}>
                {selected && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}