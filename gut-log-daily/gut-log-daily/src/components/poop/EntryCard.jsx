import React from "react";
import { format } from "date-fns";
import { BRISTOL_TYPES } from "./BristolTypeSelector";
import { Camera } from "lucide-react";
import { cn } from "@/lib/utils";

export default function EntryCard({ entry, onClick }) {
  const bristolInfo = BRISTOL_TYPES.find((b) => b.type === entry.bristol_type) || BRISTOL_TYPES[3];

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-2xl border border-stone-200 p-4 hover:shadow-md hover:border-stone-300 transition-all active:scale-[0.98] group"
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0",
          bristolInfo.color
        )}>
          {bristolInfo.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-stone-800 text-sm">
              Type {entry.bristol_type}
            </span>
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-stone-100 text-stone-500">
              {bristolInfo.tag}
            </span>
            {entry.photo_url && (
              <Camera className="w-3.5 h-3.5 text-stone-400" />
            )}
          </div>
          <p className="text-xs text-stone-400 mt-0.5">
            {format(new Date(entry.date), "EEEE, MMM d, yyyy")}
          </p>
          {entry.notes && (
            <p className="text-xs text-stone-500 mt-1 truncate">{entry.notes}</p>
          )}
        </div>
        <svg className="w-4 h-4 text-stone-300 group-hover:text-stone-500 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  );
}