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
import SymptomSelector from "@/components/poop/SymptomSelector";
import PainScaleSelector from "@/components/poop/PainScaleSelector";

export default function NewSymptomEntry() {
  // This screen creates a symptom-focused entry.
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const presetDate = urlParams.get("date") || format(new Date(), "yyyy-MM-dd");

  // Keep all user inputs in one object for easier updates and submission.
  const [formData, setFormData] = useState({
    date: presetDate,
    symptoms: [],
    pain_scale: null,
    notes: "",
  });

  // After save succeeds we refresh symptom list cache and return home.
  const createMutation = useMutation({
    mutationFn: (data) => localData.entities.SymptomEntry.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["symptom-entries"] });
      navigate(createPageUrl("Home"));
    },
  });

  // Require at least one symptom before sending data.
  const handleSubmit = () => {
    if (formData.symptoms.length === 0) return;
    const payload = { ...formData };
    if (!payload.notes) delete payload.notes;
    if (!payload.pain_scale) delete payload.pain_scale;
    createMutation.mutate(payload);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50/80 via-white to-white">
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
          <h1 className="text-xl font-bold text-stone-800">Log Symptoms</h1>
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

          {/* Symptoms */}
          <SymptomSelector
            value={formData.symptoms}
            onChange={(s) => setFormData({ ...formData, symptoms: s })}
          />

          {/* Pain Scale */}
          <PainScaleSelector
            value={formData.pain_scale}
            onChange={(v) => setFormData({ ...formData, pain_scale: v })}
          />

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-stone-700">Notes (optional)</label>
            <Textarea
              placeholder="How are you feeling? Any triggers? Additional details..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="rounded-xl border-stone-300 min-h-[100px] resize-none"
            />
          </div>

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={formData.symptoms.length === 0 || createMutation.isPending}
            className="w-full h-14 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-base shadow-lg shadow-indigo-500/20 disabled:opacity-50"
          >
            {createMutation.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              "Save Symptoms 🤕"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}