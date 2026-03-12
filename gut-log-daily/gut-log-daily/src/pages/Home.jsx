import React, { useState } from "react";
import { localData } from "@/api/localDataClient";
import { useQuery } from "@tanstack/react-query";
import { addMonths, format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import CalendarGrid from "@/components/poop/CalendarGrid";
import EntryCard from "@/components/poop/EntryCard";
import DayEntriesModal from "@/components/poop/DayEntriesModal";
import { SYMPTOM_OPTIONS, getSymptomEmoji } from "@/components/poop/SymptomSelector";
import { cn } from "@/lib/utils";

function SymptomCard({ entry, onClick }) {
  const emoji = getSymptomEmoji(entry.symptoms || []);
  const labels = (entry.symptoms || []).map(
    (s) => SYMPTOM_OPTIONS.find((o) => o.id === s)?.label || s
  );
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-indigo-50 rounded-2xl border border-indigo-200 p-4 hover:shadow-md hover:border-indigo-300 transition-all active:scale-[0.98] group"
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 bg-indigo-100 border border-indigo-200">
          {emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-stone-800 text-sm">IBS Symptoms</span>
            {entry.pain_scale && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-white text-indigo-600 border border-indigo-200">
                Pain: {entry.pain_scale}/10
              </span>
            )}
          </div>
          <p className="text-xs text-stone-400 mt-0.5">{format(new Date(entry.date), "EEEE, MMM d, yyyy")}</p>
          <p className="text-xs text-indigo-600 mt-0.5 truncate">{labels.join(", ")}</p>
        </div>
        <svg className="w-4 h-4 text-stone-300 group-hover:text-stone-500 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  );
}

export default function Home() {
  // These state values control what month is visible and which popups are open.
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [addMenuDate, setAddMenuDate] = useState(null);
  const navigate = useNavigate();

  // Load both entry collections. React Query handles caching and background refreshes.
  const { data: poopEntries = [] } = useQuery({
    queryKey: ["poop-entries"],
    queryFn: () => localData.entities.PoopEntry.list("-date", 200),
  });

  const { data: symptomEntries = [], isLoading } = useQuery({
    queryKey: ["symptom-entries"],
    queryFn: () => localData.entities.SymptomEntry.list("-date", 200),
  });

  // Build combined calendar entries for CalendarGrid
  const allCalendarEntries = [
    ...poopEntries.map((e) => ({ ...e, _type: "poop" })),
    ...symptomEntries.map((e) => ({ ...e, _type: "symptom" })),
  ];

  // If the day is empty we open a quick-add menu; otherwise we show that day's entries.
  const handleDayClick = (day, dayEntries) => {
    const dateStr = format(day, "yyyy-MM-dd");
    const dayPoops = poopEntries.filter((e) => e.date?.startsWith(dateStr));
    const daySymptoms = symptomEntries.filter((e) => e.date?.startsWith(dateStr));
    if (dayPoops.length === 0 && daySymptoms.length === 0) {
      setAddMenuDate(dateStr);
      setShowAddMenu(true);
    } else {
      setSelectedDay(day);
    }
  };

  const closeAddMenu = () => {
    setShowAddMenu(false);
    setAddMenuDate(null);
  };

  const symptomEntryUrl = addMenuDate
    ? `${createPageUrl("NewSymptomEntry")}?date=${addMenuDate}`
    : createPageUrl("NewSymptomEntry");
  const poopEntryUrl = addMenuDate
    ? `${createPageUrl("NewEntry")}?date=${addMenuDate}`
    : createPageUrl("NewEntry");

  // Merge and sort recent entries
  const recentEntries = [
    ...poopEntries.slice(0, 15).map((e) => ({ ...e, _type: "poop" })),
    ...symptomEntries.slice(0, 15).map((e) => ({ ...e, _type: "symptom" })),
  ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 12);

  // Pre-filter entries used by the day-details bottom sheet.
  const selectedDayStr = selectedDay ? format(selectedDay, "yyyy-MM-dd") : null;
  const modalPoops = selectedDay ? poopEntries.filter((e) => e.date?.startsWith(selectedDayStr)) : [];
  const modalSymptoms = selectedDay ? symptomEntries.filter((e) => e.date?.startsWith(selectedDayStr)) : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/80 via-white to-white">
      <div className="max-w-lg mx-auto px-4 pb-28">
        {/* Hero */}
        <div className="pt-8 pb-6 text-center">
          <h1 className="text-3xl font-extrabold text-stone-800 tracking-tight">
            🌿 IBS Tracker
          </h1>
          <p className="text-sm text-stone-500 mt-1">Track your gut health daily</p>
        </div>

        {/* Calendar */}
        <CalendarGrid
          currentMonth={currentMonth}
          onMonthChange={(dir) => setCurrentMonth((prev) => addMonths(prev, dir))}
          entries={allCalendarEntries}
          onDayClick={handleDayClick}
        />

        {/* Recent Entries */}
        <div className="mt-8">
          <h3 className="text-sm font-bold text-stone-700 uppercase tracking-wider mb-3">Recent Entries</h3>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin" />
            </div>
          ) : recentEntries.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-stone-200">
              <span className="text-4xl">🌿</span>
              <p className="mt-3 text-sm text-stone-500">No entries yet</p>
              <p className="text-xs text-stone-400 mt-1">Tap + to log your first entry</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentEntries.map((entry) =>
                entry._type === "poop" ? (
                  <EntryCard
                    key={`poop-${entry.id}`}
                    entry={entry}
                    onClick={() => navigate(createPageUrl("EntryDetail") + `?id=${entry.id}`)}
                  />
                ) : (
                  <SymptomCard
                    key={`sym-${entry.id}`}
                    entry={entry}
                    onClick={() => navigate(createPageUrl("SymptomDetail") + `?id=${entry.id}`)}
                  />
                )
              )}
            </div>
          )}
        </div>
      </div>

      {/* Day Modal */}
      {selectedDay && (
        <DayEntriesModal
          day={selectedDay}
          poopEntries={modalPoops}
          symptomEntries={modalSymptoms}
          onClose={() => setSelectedDay(null)}
        />
      )}

      {/* FAB with menu */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2">
        {showAddMenu && (
          <div className="flex flex-col gap-2 items-center mb-1">
            <Link to={symptomEntryUrl} onClick={closeAddMenu}>
              <Button className="h-12 px-5 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg gap-2 font-semibold">
                🤕 Log Symptoms
              </Button>
            </Link>
            <Link to={poopEntryUrl} onClick={closeAddMenu}>
              <Button className="h-12 px-5 rounded-full bg-amber-500 hover:bg-amber-600 text-white shadow-lg gap-2 font-semibold">
                💩 Log Poop
              </Button>
            </Link>
          </div>
        )}
        <Button
          onClick={() => {
            if (showAddMenu) {
              closeAddMenu();
              return;
            }
            setShowAddMenu(true);
          }}
          className={cn(
            "h-14 w-14 rounded-full text-white shadow-xl font-bold text-2xl transition-all",
            showAddMenu ? "bg-stone-500 hover:bg-stone-600 rotate-45" : "bg-gradient-to-br from-amber-400 to-indigo-500 hover:opacity-90"
          )}
        >
          +
        </Button>
      </div>

      {/* Backdrop for FAB menu */}
      {showAddMenu && (
        <div className="fixed inset-0 z-30" onClick={closeAddMenu} />
      )}
    </div>
  );
}
