import React from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isToday } from "date-fns";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSymptomEmoji } from "./SymptomSelector";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarGrid({ currentMonth, onMonthChange, entries, onDayClick }) {
  // Build calendar boundaries (start/end of visible month including leading/trailing days).
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);

  // Group entries by date so each day cell can render quickly.
  const poopMap = {};
  const symptomMap = {};
  entries.forEach((e) => {
    const key = e.date?.split("T")[0];
    if (!key) return;
    if (e._type === "symptom") {
      if (!symptomMap[key]) symptomMap[key] = [];
      symptomMap[key].push(e);
    } else {
      if (!poopMap[key]) poopMap[key] = [];
      poopMap[key].push(e);
    }
  });

  // Convert the date range into rows of 7 days (calendar weeks).
  const weeks = [];
  let day = calStart;
  while (day <= calEnd) {
    const week = [];
    for (let i = 0; i < 7; i++) {
      week.push(new Date(day));
      day = addDays(day, 1);
    }
    weeks.push(week);
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-orange-50">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full h-9 w-9"
          onClick={() => onMonthChange(-1)}
        >
          <ChevronLeft className="h-5 w-5 text-stone-600" />
        </Button>
        <h2 className="text-lg font-bold text-stone-800">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full h-9 w-9"
          onClick={() => onMonthChange(1)}
        >
          <ChevronRight className="h-5 w-5 text-stone-600" />
        </Button>
      </div>

      {/* Weekday labels */}
      <div className="grid grid-cols-7 border-b border-stone-100">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center py-2 text-xs font-semibold text-stone-400 uppercase tracking-wider">
            {d}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="p-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7">
            {week.map((d, di) => {
              const dateKey = format(d, "yyyy-MM-dd");
              const dayPoops = poopMap[dateKey] || [];
              const daySymptoms = symptomMap[dateKey] || [];
              const hasAny = dayPoops.length > 0 || daySymptoms.length > 0;
              const inMonth = isSameMonth(d, monthStart);
              const today = isToday(d);

              // Build emoji indicators
              const indicators = [];
              if (dayPoops.length > 0) indicators.push(dayPoops.length > 1 ? `💩×${dayPoops.length}` : "💩");
              if (daySymptoms.length > 0) {
                const symEmoji = getSymptomEmoji(daySymptoms[0].symptoms || []);
                indicators.push(daySymptoms.length > 1 ? `${symEmoji}×${daySymptoms.length}` : symEmoji);
              }

              return (
                <button
                  key={di}
                  onClick={() => onDayClick(d, [])}
                  className={cn(
                    "relative flex flex-col items-center justify-center py-1 mx-0.5 my-0.5 rounded-xl transition-all min-h-[52px]",
                    inMonth ? "hover:bg-amber-50" : "opacity-30",
                    today && "ring-2 ring-amber-400 ring-offset-1",
                    hasAny && inMonth && "bg-amber-50/40"
                  )}
                >
                  <span className={cn(
                    "text-sm font-medium",
                    inMonth ? "text-stone-700" : "text-stone-300",
                    today && "text-amber-700 font-bold"
                  )}>
                    {format(d, "d")}
                  </span>
                  {hasAny && inMonth && (
                    <div className="flex flex-col items-center gap-0">
                      {indicators.map((ind, i) => (
                        <span key={i} className="text-[11px] leading-tight">{ind}</span>
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}