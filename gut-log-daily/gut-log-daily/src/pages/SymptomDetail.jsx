import React from "react";
import { localData } from "@/api/localDataClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import { ArrowLeft, Trash2, Calendar, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SYMPTOM_OPTIONS, getSymptomEmoji } from "@/components/poop/SymptomSelector";
import { cn } from "@/lib/utils";

// Mapping arrays convert numeric pain score into UI color + readable label.
const PAIN_COLORS = ["", "bg-green-400", "bg-green-400", "bg-lime-400", "bg-yellow-400", "bg-yellow-500", "bg-orange-400", "bg-orange-500", "bg-red-400", "bg-red-500", "bg-red-600"];
const PAIN_LABELS = ["", "Minimal", "Mild", "Mild", "Moderate", "Moderate", "Noticeable", "Severe", "Severe", "Intense", "Worst Possible"];

export default function SymptomDetail() {
  // Detail page for one symptom entry, identified by URL query id.
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const entryId = urlParams.get("id");

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["symptom-entries"],
    queryFn: () => localData.entities.SymptomEntry.list("-date", 500),
  });

  const entry = entries.find((e) => e.id === entryId);

  const deleteMutation = useMutation({
    mutationFn: () => localData.entities.SymptomEntry.delete(entryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["symptom-entries"] });
      navigate(createPageUrl("Home"));
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50/80 via-white to-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-stone-500">Entry not found</p>
          <Button variant="link" onClick={() => navigate(createPageUrl("Home"))} className="text-indigo-600 mt-2">Go back</Button>
        </div>
      </div>
    );
  }

  const emoji = getSymptomEmoji(entry.symptoms || []);
  const selectedSymptoms = SYMPTOM_OPTIONS.filter((o) => entry.symptoms?.includes(o.id));

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50/80 via-white to-white">
      <div className="max-w-lg mx-auto px-4 pb-12">
        <div className="flex items-center justify-between pt-6 pb-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="rounded-full h-10 w-10" onClick={() => navigate(createPageUrl("Home"))}>
              <ArrowLeft className="h-5 w-5 text-stone-600" />
            </Button>
            <h1 className="text-xl font-bold text-stone-800">Symptom Details</h1>
          </div>
          <Button
            variant="ghost" size="icon"
            className="rounded-full h-10 w-10 text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={() => { if (confirm("Delete this entry?")) deleteMutation.mutate(); }}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-5 w-5" />}
          </Button>
        </div>

        {/* Date */}
        <div className="bg-white rounded-2xl border border-stone-200 p-4 mb-4 flex items-center gap-3 text-stone-500">
          <Calendar className="h-4 w-4" />
          <span className="text-sm font-medium">{format(new Date(entry.date), "EEEE, MMMM d, yyyy")}</span>
        </div>

        {/* Hero */}
        <div className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-5 mb-4 text-center">
          <span className="text-5xl">{emoji}</span>
          <p className="text-lg font-bold text-indigo-800 mt-2">IBS Symptoms</p>
        </div>

        {/* Symptoms list */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 mb-4">
          <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">Reported Symptoms</h3>
          <div className="space-y-2">
            {selectedSymptoms.map((s) => (
              <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl bg-indigo-50 border border-indigo-100">
                <span className="text-xl">{s.emoji}</span>
                <div>
                  <p className="font-semibold text-sm text-indigo-800">{s.label}</p>
                  <p className="text-xs text-indigo-500">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pain scale */}
        {entry.pain_scale && (
          <div className="bg-white rounded-2xl border border-stone-200 p-5 mb-4">
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">Pain / Discomfort</h3>
            <div className="flex items-center gap-4">
              <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-extrabold shadow-sm", PAIN_COLORS[entry.pain_scale])}>
                {entry.pain_scale}
              </div>
              <div>
                <p className="font-bold text-stone-800 text-lg">{PAIN_LABELS[entry.pain_scale]}</p>
                <p className="text-sm text-stone-400">{entry.pain_scale} out of 10</p>
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        {entry.notes && (
          <div className="bg-white rounded-2xl border border-stone-200 p-5">
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Notes</h3>
            <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-wrap">{entry.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}