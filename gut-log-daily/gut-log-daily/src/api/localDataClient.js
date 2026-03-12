// This file is a tiny "fake backend" that keeps everything in localStorage.
// We keep all read/write logic here so page components stay focused on UI.
const isBrowser = typeof window !== "undefined";

// Guarded storage helper so this module also behaves safely in non-browser environments.
const storage = {
  getItem(key) {
    if (!isBrowser) return null;
    return window.localStorage.getItem(key);
  },
  setItem(key, value) {
    if (!isBrowser) return;
    window.localStorage.setItem(key, value);
  },
};

// Storage buckets used by the two entry types in this app.
const STORAGE_KEYS = {
  PoopEntry: "ibs_tracker_poop_entries",
  SymptomEntry: "ibs_tracker_symptom_entries",
};
const IMAGE_EXTENSION_PATTERN = /\.(avif|bmp|gif|heic|heif|jpe?g|png|svg|webp)$/i;

// Basic validation for uploaded files (MIME type first, extension fallback second).
const isImageFile = (file) => {
  if (!file) return false;
  if (file.type?.startsWith("image/")) return true;
  return IMAGE_EXTENSION_PATTERN.test(file.name || "");
};

// Read + parse one localStorage collection.
const readCollection = (collectionName) => {
  const raw = storage.getItem(STORAGE_KEYS[collectionName]);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

// Save a full collection back to localStorage.
const writeCollection = (collectionName, entries) => {
  storage.setItem(STORAGE_KEYS[collectionName], JSON.stringify(entries));
};

// Supports sort strings like "date" (ascending) and "-date" (descending).
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

// Factory that gives each entity the same CRUD-shaped API.
const createEntityApi = (collectionName) => ({
  async list(orderBy, limit = 100) {
    const entries = readCollection(collectionName);
    return sortByField(entries, orderBy).slice(0, limit);
  },
  async create(payload) {
    // We assign IDs/timestamps here so forms don't need to care about those details.
    const entries = readCollection(collectionName);
    const newEntry = {
      ...payload,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };

    writeCollection(collectionName, [...entries, newEntry]);
    return newEntry;
  },
  async delete(id) {
    const entries = readCollection(collectionName);
    const filtered = entries.filter((entry) => entry.id !== id);
    writeCollection(collectionName, filtered);
    return { success: true };
  },
});

// Reads a local image as a data URL string so it can be stored in localStorage.
const uploadFile = (file) =>
  new Promise((resolve, reject) => {
    if (!isImageFile(file)) {
      reject(new Error("Only image files are allowed."));
      return;
    }

    const reader = new FileReader();

    reader.onload = () => resolve({ file_url: reader.result });
    reader.onerror = () => reject(new Error("Failed to read photo."));

    reader.readAsDataURL(file);
  });

// Public API used everywhere else in the app.
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
