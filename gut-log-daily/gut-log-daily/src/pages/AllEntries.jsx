import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import EntryCard from "@/components/poop/EntryCard";

export default function AllEntries() {
  const navigate = useNavigate();

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["poop-entries"],
    queryFn: () => base44.entities.PoopEntry.list("-date", 500),
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/80 via-white to-white">
      <div className="max-w-lg mx-auto px-4 pb-12">
        <div className="flex items-center gap-3 pt-6 pb-6">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-10 w-10"
            onClick={() => navigate(createPageUrl("Home"))}
          >
            <ArrowLeft className="h-5 w-5 text-stone-600" />
          </Button>
          <h1 className="text-xl font-bold text-stone-800">All Entries</h1>
          <span className="ml-auto text-sm text-stone-400 font-medium">{entries.length} total</span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin" />
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-4xl">💩</span>
            <p className="mt-3 text-sm text-stone-500">No entries yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((entry) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                onClick={() => navigate(createPageUrl("EntryDetail") + `?id=${entry.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}