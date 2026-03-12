// Security helper for a fully offline app.
//
// Why this file exists:
// - We store health-related notes/photos locally.
// - localStorage alone is easy to read on compromised devices.
// - This module adds optional PIN-based encryption + privacy controls.
//
// Important: app-level encryption improves privacy, but it does NOT make rooted/jailbroken
// devices completely safe. Treat this as defense-in-depth.

const isBrowser = typeof window !== "undefined";

const STORAGE_KEYS = {
  securityConfig: "ibs_tracker_security_config",
  lockVerifier: "ibs_tracker_lock_verifier",
  poopEntries: "ibs_tracker_poop_entries",
  symptomEntries: "ibs_tracker_symptom_entries",
};

const DEFAULT_SECURITY_CONFIG = {
  pinEnabled: false,
  retentionDays: 0,
  maxImageBytes: 2 * 1024 * 1024,
};

let sessionKeyPromise = null;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

const getItem = (key) => (isBrowser ? window.localStorage.getItem(key) : null);
const setItem = (key, value) => {
  if (isBrowser) window.localStorage.setItem(key, value);
};
const removeItem = (key) => {
  if (isBrowser) window.localStorage.removeItem(key);
};

const bytesToBase64 = (bytes) => {
  const chunkSize = 0x8000;
  let binary = "";
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
};

const base64ToBytes = (base64) => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
};

// Read saved security settings. If settings are missing/corrupt, fall back to safe defaults.
const getSecurityConfig = () => {
  if (!isBrowser) return { ...DEFAULT_SECURITY_CONFIG };
  try {
    const raw = getItem(STORAGE_KEYS.securityConfig);
    if (!raw) return { ...DEFAULT_SECURITY_CONFIG };
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SECURITY_CONFIG,
      ...parsed,
    };
  } catch {
    return { ...DEFAULT_SECURITY_CONFIG };
  }
};

const saveSecurityConfig = (config) => {
  setItem(STORAGE_KEYS.securityConfig, JSON.stringify(config));
};

const randomBytes = (len) => {
  const out = new Uint8Array(len);
  crypto.getRandomValues(out);
  return out;
};

// Convert a user PIN into a strong encryption key using PBKDF2.
// A random salt prevents precomputed/rainbow-table attacks.
const deriveKeyFromPin = async (pin, saltBytes) => {
  const material = await crypto.subtle.importKey(
    "raw",
    encoder.encode(pin),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: saltBytes, iterations: 250000, hash: "SHA-256" },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
};

// Encrypt JSON text using AES-GCM with a unique IV per write.
const encryptWithKey = async (plainText, key) => {
  const iv = randomBytes(12);
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoder.encode(plainText)
  );

  return {
    encrypted: true,
    iv: bytesToBase64(iv),
    ciphertext: bytesToBase64(new Uint8Array(encrypted)),
  };
};

// Decrypt encrypted storage payload back into plain JSON text.
const decryptWithKey = async (payload, key) => {
  const iv = base64ToBytes(payload.iv);
  const encrypted = base64ToBytes(payload.ciphertext);

  const plainBuffer = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    encrypted
  );

  return decoder.decode(plainBuffer);
};

const serializeCollection = (entries) => JSON.stringify(entries);

const parseCollection = (raw) => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const getCollectionKey = (collectionName) => {
  if (collectionName === "PoopEntry") return STORAGE_KEYS.poopEntries;
  return STORAGE_KEYS.symptomEntries;
};

const clearSessionKey = () => {
  sessionKeyPromise = null;
};

// Unlock the app for this session by validating PIN against an encrypted verifier.
const setSessionFromPin = async (pin) => {
  const verifierRaw = getItem(STORAGE_KEYS.lockVerifier);
  if (!verifierRaw) throw new Error("Security lock is not configured.");

  const verifier = JSON.parse(verifierRaw);
  const saltBytes = base64ToBytes(verifier.salt);
  const key = await deriveKeyFromPin(pin, saltBytes);

  const check = await decryptWithKey(verifier.payload, key);
  if (check !== "ibs-tracker-unlock-verifier") {
    throw new Error("Invalid PIN.");
  }

  sessionKeyPromise = Promise.resolve(key);
  return true;
};

const isLocked = () => {
  const config = getSecurityConfig();
  return !!config.pinEnabled && !sessionKeyPromise;
};

const ensureUnlockedKey = async () => {
  const config = getSecurityConfig();
  if (!config.pinEnabled) return null;
  if (!sessionKeyPromise) throw new Error("App is locked. Enter PIN first.");
  return sessionKeyPromise;
};

const readCollectionRaw = (collectionName) => getItem(getCollectionKey(collectionName));
const writeCollectionRaw = (collectionName, value) => setItem(getCollectionKey(collectionName), value);

// Read entries for one collection.
// - If PIN is disabled: return plain JSON records.
// - If PIN is enabled: decrypt records first.
const readCollectionSecure = async (collectionName) => {
  const raw = readCollectionRaw(collectionName);
  if (!raw) return [];

  const config = getSecurityConfig();
  if (!config.pinEnabled) return parseCollection(raw);

  const key = await ensureUnlockedKey();
  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!payload?.encrypted) return parseCollection(raw);

  const plain = await decryptWithKey(payload, await key);
  return parseCollection(plain);
};

// Write entries for one collection.
// - If PIN is disabled: store plain JSON.
// - If PIN is enabled: encrypt before saving.
const writeCollectionSecure = async (collectionName, entries) => {
  const rawPlain = serializeCollection(entries);
  const config = getSecurityConfig();
  if (!config.pinEnabled) {
    writeCollectionRaw(collectionName, rawPlain);
    return;
  }

  const key = await ensureUnlockedKey();
  const encrypted = await encryptWithKey(rawPlain, await key);
  writeCollectionRaw(collectionName, JSON.stringify(encrypted));
};

const migrateCollections = async (writer) => {
  for (const collectionName of ["PoopEntry", "SymptomEntry"]) {
    const entries = await readCollectionSecure(collectionName);
    await writer(collectionName, entries);
  }
};

// Apply retention policy (N days). Older records are pruned automatically.
const applyRetention = (entries) => {
  const { retentionDays } = getSecurityConfig();
  if (!retentionDays || retentionDays <= 0) return entries;

  const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
  return entries.filter((entry) => {
    const sourceDate = entry.date || entry.created_at;
    if (!sourceDate) return true;
    const ts = new Date(sourceDate).getTime();
    if (Number.isNaN(ts)) return true;
    return ts >= cutoff;
  });
};

const getMaxImageBytes = () => getSecurityConfig().maxImageBytes;

const exportAllData = async () => ({
  exported_at: new Date().toISOString(),
  security: getSecurityConfig(),
  poop_entries: await readCollectionSecure("PoopEntry"),
  symptom_entries: await readCollectionSecure("SymptomEntry"),
});

const secureWipeAll = () => {
  removeItem(STORAGE_KEYS.poopEntries);
  removeItem(STORAGE_KEYS.symptomEntries);
};

// Enable or rotate PIN lock. This also migrates existing data into encrypted format.
const configurePin = async (pin) => {
  if (!pin || pin.length < 4) {
    throw new Error("PIN must be at least 4 digits.");
  }

  const previous = getSecurityConfig();
  const previousSession = sessionKeyPromise;
  const previousVerifier = getItem(STORAGE_KEYS.lockVerifier);

  const salt = randomBytes(16);
  const key = await deriveKeyFromPin(pin, salt);
  const payload = await encryptWithKey("ibs-tracker-unlock-verifier", key);

  sessionKeyPromise = Promise.resolve(key);
  setItem(
    STORAGE_KEYS.lockVerifier,
    JSON.stringify({
      salt: bytesToBase64(salt),
      payload,
    })
  );
  saveSecurityConfig({ ...previous, pinEnabled: true });

  try {
    await migrateCollections(writeCollectionSecure);
  } catch (error) {
    saveSecurityConfig(previous);
    sessionKeyPromise = previousSession;
    if (previousVerifier) setItem(STORAGE_KEYS.lockVerifier, previousVerifier);
    else removeItem(STORAGE_KEYS.lockVerifier);
    throw error;
  }

};

// Disable PIN lock by decrypting everything and storing plain JSON again.
const disablePin = async () => {
  const previous = getSecurityConfig();
  const entries = {
    PoopEntry: await readCollectionSecure("PoopEntry"),
    SymptomEntry: await readCollectionSecure("SymptomEntry"),
  };

  saveSecurityConfig({ ...previous, pinEnabled: false });
  removeItem(STORAGE_KEYS.lockVerifier);
  clearSessionKey();

  writeCollectionRaw("PoopEntry", serializeCollection(entries.PoopEntry));
  writeCollectionRaw("SymptomEntry", serializeCollection(entries.SymptomEntry));
};

// Save retention setting and immediately prune stored data to match the policy.
const updateRetentionDays = async (retentionDays) => {
  const config = getSecurityConfig();
  const next = Math.max(0, Number(retentionDays) || 0);
  saveSecurityConfig({ ...config, retentionDays: next });

  for (const collectionName of ["PoopEntry", "SymptomEntry"]) {
    const entries = await readCollectionSecure(collectionName);
    const pruned = applyRetention(entries);
    await writeCollectionSecure(collectionName, pruned);
  }
};

export const security = {
  getSecurityConfig,
  isLocked,
  unlockWithPin: setSessionFromPin,
  lockNow: clearSessionKey,
  configurePin,
  disablePin,
  readCollectionSecure,
  writeCollectionSecure,
  applyRetention,
  getMaxImageBytes,
  exportAllData,
  secureWipeAll,
  updateRetentionDays,
};
