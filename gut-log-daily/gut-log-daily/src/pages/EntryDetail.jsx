import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import { ArrowLeft, Trash2, Calendar, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BRISTOL_TYPES } from "@/components/poop/BristolTypeSelector";
import { cn } from "@/lib/utils";

export default function EntryDetail() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const entryId = urlParams.get("id");

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["poop-entries"],
    queryFn: () => base44.entities.PoopEntry.list("-date", 200),
  });

  const entry = entries.find((e) => e.id === entryId);

  const deleteMutation = useMutation({
    mutationFn: () => base44.entities.PoopEntry.delete(entryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["poop-entries"] });
      navigate(createPageUrl("Home"));
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50/80 via-white to-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50/80 via-white to-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-stone-500">Entry not found</p>
          <Button variant="link" onClick={() => navigate(createPageUrl("Home"))} className="text-amber-600 mt-2">
            Go back
          </Button>
        </div>
      </div>
    );
  }

  const bristolInfo = BRISTOL_TYPES.find((b) => b.type === entry.bristol_type) || BRISTOL_TYPES[3];

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/80 via-white to-white">
      <div className="max-w-lg mx-auto px-4 pb-12">
        {/* Header */}
        <div className="flex items-center justify-between pt-6 pb-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-10 w-10"
              onClick={() => navigate(createPageUrl("Home"))}
            >
              <ArrowLeft className="h-5 w-5 text-stone-600" />
            </Button>
            <h1 className="text-xl font-bold text-stone-800">Entry Details</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-10 w-10 text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={() => {
              if (confirm("Delete this entry?")) deleteMutation.mutate();
            }}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Date card */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 mb-4">
          <div className="flex items-center gap-3 text-stone-500">
            <Calendar className="h-4 w-4" />
            <span className="text-sm font-medium">
              {format(new Date(entry.date), "EEEE, MMMM d, yyyy")}
            </span>
          </div>
        </div>

        {/* Bristol type card */}
        <div className={cn("rounded-2xl border-2 p-5 mb-4", bristolInfo.color)}>
          <div className="flex items-center gap-4">
            <span className="text-5xl">{bristolInfo.emoji}</span>
            <div>
              <div className="text-2xl font-extrabold">Type {entry.bristol_type}</div>
              <div className="text-sm font-medium mt-0.5">{bristolInfo.label}</div>
              <div className="text-xs opacity-70 mt-1">{bristolInfo.desc}</div>
              <span className="inline-block mt-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/50">
                {bristolInfo.tag}
              </span>
            </div>
          </div>
        </div>

        {/* Photo */}
        {entry.photo_url && (
          <div className="rounded-2xl overflow-hidden border border-stone-200 mb-4">
            <img src={entry.photo_url} alt="Entry photo" className="w-full object-cover max-h-80" />
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