import React, { useState } from "react";
import { localData } from "@/api/localDataClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import BristolTypeSelector from "@/components/poop/BristolTypeSelector";
import PhotoUploader from "@/components/poop/PhotoUploader";

export default function NewEntry() {
  // This screen creates a bowel movement entry.
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const presetDate = urlParams.get("date") || format(new Date(), "yyyy-MM-dd");

  // Form state mirrors each field on screen so typing updates the UI instantly.
  const [formData, setFormData] = useState({
    date: presetDate,
    bristol_type: null,
    notes: "",
    photo_url: "",
  });

  // Mutation = async create request + loading/error lifecycle.
  const createMutation = useMutation({
    mutationFn: (data) => localData.entities.PoopEntry.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["poop-entries"] });
      navigate(createPageUrl("Home"));
    },
  });

  // Validate minimum required data, clean empty optional fields, then save.
  const handleSubmit = () => {
    if (!formData.bristol_type) return;
    const payload = { ...formData };
    if (!payload.notes) delete payload.notes;
    if (!payload.photo_url) delete payload.photo_url;
    createMutation.mutate(payload);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/80 via-white to-white">
      <div className="max-w-lg mx-auto px-4 pb-12">
        {/* Header */}
        <div className="flex items-center gap-3 pt-6 pb-4">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-10 w-10"
            onClick={() => navigate(createPageUrl("Home"))}
          >
            <ArrowLeft className="h-5 w-5 text-stone-600" />
          </Button>
          <h1 className="text-xl font-bold text-stone-800">New Entry</h1>
        </div>

        <div className="space-y-6">
          {/* Date */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-stone-700">Date</label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="rounded-xl border-stone-300 h-12"
            />
          </div>

          {/* Bristol Type */}
          <BristolTypeSelector
            value={formData.bristol_type}
            onChange={(type) => setFormData({ ...formData, bristol_type: type })}
          />

          {/* Photo */}
          <PhotoUploader
            value={formData.photo_url}
            onChange={(url) => setFormData({ ...formData, photo_url: url })}
          />

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-stone-700">Notes (optional)</label>
            <Textarea
              placeholder="How are you feeling? Anything unusual?"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="rounded-xl border-stone-300 min-h-[100px] resize-none"
            />
          </div>

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={!formData.bristol_type || createMutation.isPending}
            className="w-full h-14 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-base shadow-lg shadow-amber-500/20 disabled:opacity-50"
          >
            {createMutation.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              "Save Entry 💩"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}