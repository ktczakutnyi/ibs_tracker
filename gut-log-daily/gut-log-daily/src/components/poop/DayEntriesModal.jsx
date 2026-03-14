import React from "react";
import { format } from "date-fns";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BRISTOL_TYPES } from "./BristolTypeSelector";
import { SYMPTOM_OPTIONS, getSymptomEmoji } from "./SymptomSelector";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

function PoopEntryRow({ entry, onClick }) {
  const info = BRISTOL_TYPES.find((b) => b.type === entry.bristol_type) || BRISTOL_TYPES[3];
  return (
    <button
      onClick={onClick}
      className={cn("w-full text-left flex items-center gap-3 p-3 rounded-xl border-2 transition-all hover:shadow-sm", info.color)}
    >
      <span className="text-2xl">{info.emoji}</span>
      <div className="flex-1">
        <p className="font-semibold text-sm">Bowel Movement — Type {entry.bristol_type}</p>
        <p className="text-xs opacity-70">{info.tag}</p>
      </div>
      <svg className="w-4 h-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
}

function SymptomEntryRow({ entry, onClick }) {
  const emoji = getSymptomEmoji(entry.symptoms || []);
  const symptomLabels = (entry.symptoms || []).map(
    (s) => SYMPTOM_OPTIONS.find((o) => o.id === s)?.label || s
  );
  return (
    <button
      onClick={onClick}
      className="w-full text-left flex items-center gap-3 p-3 rounded-xl border-2 bg-indigo-50 border-indigo-200 text-indigo-800 transition-all hover:shadow-sm"
    >
      <span className="text-2xl">{emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">Symptoms</p>
        <p className="text-xs opacity-70 truncate">{symptomLabels.join(", ")}</p>
      </div>
      {entry.pain_scale && (
        <span className="text-xs font-bold bg-white/60 px-2 py-0.5 rounded-full flex-shrink-0">
          Pain: {entry.pain_scale}/10
        </span>
      )}
      <svg className="w-4 h-4 opacity-50 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
}

export default function DayEntriesModal({ day, poopEntries, symptomEntries, onClose }) {
  // Bottom-sheet modal that summarizes everything logged for one day.
  const navigate = useNavigate();
  const dateStr = format(day, "yyyy-MM-dd");
  const hasEntries = poopEntries.length > 0 || symptomEntries.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg bg-white rounded-t-3xl shadow-2xl p-5 pb-8 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="w-10 h-1 bg-stone-200 rounded-full mx-auto mb-4" />

        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-stone-800">
            {format(day, "EEEE, MMMM d")}
          </h3>
          <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2 mb-4">
          {!hasEntries && (
            <div className="rounded-2xl border border-dashed border-stone-200 bg-stone-50/60 px-4 py-6 text-center">
              <p className="text-3xl">🗓️</p>
              <p className="mt-2 text-sm font-semibold text-stone-700">No logs for this day yet</p>
              <p className="mt-1 text-xs text-stone-500">Use one of the buttons below to add your first log.</p>
            </div>
          )}
          {poopEntries.map((e) => (
            <PoopEntryRow
              key={e.id}
              entry={e}
              onClick={() => { onClose(); navigate(createPageUrl("EntryDetail") + `?id=${e.id}`); }}
            />
          ))}
          {symptomEntries.map((e) => (
            <SymptomEntryRow
              key={e.id}
              entry={e}
              onClick={() => { onClose(); navigate(createPageUrl("SymptomDetail") + `?id=${e.id}`); }}
            />
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-100">
          <Button
            variant="outline"
            className="rounded-xl h-11 font-semibold text-sm gap-2"
            onClick={() => { onClose(); navigate(createPageUrl("NewEntry") + `?date=${dateStr}`); }}
          >
            <span>💩</span> Log Poop
          </Button>
          <Button
            variant="outline"
            className="rounded-xl h-11 font-semibold text-sm gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
            onClick={() => { onClose(); navigate(createPageUrl("NewSymptomEntry") + `?date=${dateStr}`); }}
          >
            <span>🤕</span> Log Symptoms
          </Button>
        </div>
      </div>
    </div>
  );
}