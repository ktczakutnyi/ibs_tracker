import React, { useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Camera, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PhotoUploader({ value, onChange }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    onChange(file_url);
    setUploading(false);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-stone-700">Photo (optional)</label>
      {value ? (
        <div className="relative rounded-xl overflow-hidden border border-stone-200 bg-stone-50">
          <img src={value} alt="Poop photo" className="w-full h-48 object-cover" />
          <Button
            type="button"
            size="icon"
            variant="secondary"
            className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/90 shadow-sm"
            onClick={() => onChange("")}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="w-full h-32 rounded-xl border-2 border-dashed border-stone-300 bg-stone-50 hover:bg-stone-100 hover:border-stone-400 transition-all flex flex-col items-center justify-center gap-2"
        >
          {uploading ? (
            <Loader2 className="h-6 w-6 text-stone-400 animate-spin" />
          ) : (
            <>
              <Camera className="h-6 w-6 text-stone-400" />
              <span className="text-xs text-stone-500 font-medium">Tap to add a photo</span>
            </>
          )}
        </button>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleUpload}
      />
    </div>
  );
}