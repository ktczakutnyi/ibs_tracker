import React, { useRef, useState } from "react";
import { localData } from "@/api/localDataClient";
import { Camera, X, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const IMAGE_EXTENSION_PATTERN = /\.(avif|bmp|gif|heic|heif|jpe?g|png|svg|webp)$/i;

const isImageFile = (file) => {
  if (!file) return false;
  if (file.type?.startsWith("image/")) return true;
  return IMAGE_EXTENSION_PATTERN.test(file.name || "");
};

export default function PhotoUploader({ value, onChange }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isImageFile(file)) {
      setError("Please choose an image file (jpg, png, webp, etc).");
      e.target.value = "";
      return;
    }

    try {
      setError("");
      setUploading(true);
      const { file_url } = await localData.integrations.Core.UploadFile({ file });
      onChange(file_url);
    } catch {
      setError("Could not upload that image. Please try again.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
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
      {error && (
        <p className="text-xs text-red-600 flex items-center gap-1">
          <AlertCircle className="h-3.5 w-3.5" />
          {error}
        </p>
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
