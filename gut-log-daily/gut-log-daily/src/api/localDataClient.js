// Local data client used by the UI.
//
// This app has no backend server, so this module acts like a tiny data layer:
// - CRUD for entries
// - secure read/write delegation
// - safe image processing for uploads
//
// Keeping this logic here makes page components simpler and easier to reason about.

import { security } from "@/lib/security";

const IMAGE_EXTENSION_PATTERN = /\.(avif|bmp|gif|heic|heif|jpe?g|png|webp)$/i;
const BLOCKED_IMAGE_MIME = new Set(["image/svg+xml"]);
const MAX_IMAGE_DIMENSION = 1600;

const isImageFile = (file) => {
  if (!file) return false;
  if (BLOCKED_IMAGE_MIME.has(file.type)) return false;
  if (file.type?.startsWith("image/")) return true;
  return IMAGE_EXTENSION_PATTERN.test(file.name || "");
};

// Re-encode images before storage to reduce size and strip risky/unused metadata where possible.
const downscaleImageToJpegDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(img.width, img.height));
        const width = Math.max(1, Math.round(img.width * scale));
        const height = Math.max(1, Math.round(img.height * scale));

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not process image."));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };

      img.onerror = () => reject(new Error("Image decode failed."));
      img.src = String(reader.result || "");
    };

    reader.onerror = () => reject(new Error("Failed to read photo."));
    reader.readAsDataURL(file);
  });

const sortByField = (entries, orderBy) => {
  if (!orderBy) return entries;

  const isDesc = orderBy.startsWith("-");
  const field = isDesc ? orderBy.slice(1) : orderBy;

  return [...entries].sort((a, b) => {
    const aValue = a?.[field];
    const bValue = b?.[field];

    if (aValue === bValue) return 0;
    if (aValue == null) return 1;
    if (bValue == null) return -1;

    if (aValue > bValue) return isDesc ? -1 : 1;
    return isDesc ? 1 : -1;
  });
};

// Shared CRUD API for both PoopEntry and SymptomEntry collections.
const createEntityApi = (collectionName) => ({
  async list(orderBy, limit = 100) {
    const entries = await security.readCollectionSecure(collectionName);
    const retained = security.applyRetention(entries);
    if (retained.length !== entries.length) {
      await security.writeCollectionSecure(collectionName, retained);
    }
    return sortByField(retained, orderBy).slice(0, limit);
  },
  async create(payload) {
    const entries = await security.readCollectionSecure(collectionName);
    const next = security.applyRetention(entries);
    const newEntry = {
      ...payload,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };

    await security.writeCollectionSecure(collectionName, [...next, newEntry]);
    return newEntry;
  },
  async delete(id) {
    const entries = await security.readCollectionSecure(collectionName);
    const filtered = entries.filter((entry) => entry.id !== id);
    await security.writeCollectionSecure(collectionName, filtered);
    return { success: true };
  },
});

// Upload flow in this offline app means: validate + process image, then return a local data URL.
const uploadFile = async (file) => {
  if (!isImageFile(file)) {
    throw new Error("Only non-SVG image files are allowed.");
  }

  const maxImageBytes = security.getMaxImageBytes();
  if (file.size > maxImageBytes) {
    throw new Error(`Image is too large. Max size is ${(maxImageBytes / (1024 * 1024)).toFixed(0)}MB.`);
  }

  const file_url = await downscaleImageToJpegDataUrl(file);
  return { file_url };
};

export const localData = {
  entities: {
    PoopEntry: createEntityApi("PoopEntry"),
    SymptomEntry: createEntityApi("SymptomEntry"),
  },
  integrations: {
    Core: {
      UploadFile: async ({ file }) => uploadFile(file),
    },
  },
  auth: {
    async me() {
      return null;
    },
    logout() {},
    redirectToLogin() {},
  },
};
