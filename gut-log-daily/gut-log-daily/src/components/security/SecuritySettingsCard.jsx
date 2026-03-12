// Security settings card shown on Home page.
// This gives non-technical users clear controls for local privacy:
// - enable/rotate PIN
// - set data retention period
// - export data
// - wipe local data

import React, { useMemo, useState } from "react";
import { security } from "@/lib/security";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SecuritySettingsCard({ onDataChanged }) {
  const initialConfig = useMemo(() => security.getSecurityConfig(), []);
  const [pin, setPin] = useState("");
  const [retentionDays, setRetentionDays] = useState(String(initialConfig.retentionDays || 0));
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [working, setWorking] = useState(false);

  const config = security.getSecurityConfig();

  // Wrapper to show consistent loading/success/error feedback for each action.
  const runTask = async (task, successMessage) => {
    try {
      setWorking(true);
      setError("");
      setStatus("");
      await task();
      if (onDataChanged) await onDataChanged();
      setStatus(successMessage);
    } catch (err) {
      setError(err?.message || "Security action failed.");
    } finally {
      setWorking(false);
    }
  };

  const saveRetention = () =>
    runTask(async () => {
      await security.updateRetentionDays(Number(retentionDays));
    }, "Retention policy saved and applied.");

  // Export a human-readable JSON backup to the user's device.
  const exportData = async () => {
    const payload = await security.exportAllData();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ibs-tracker-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-4 space-y-3">
      <div>
        <h3 className="text-sm font-bold text-stone-700 uppercase tracking-wider">Security & Privacy</h3>
        <p className="text-xs text-stone-500 mt-1">
          Your entries stay on this device. Add a PIN lock, set data retention, export data, or securely wipe.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2 items-center">
        <Input
          type="password"
          inputMode="numeric"
          placeholder={config.pinEnabled ? "Enter new PIN to rotate" : "Set a 4+ digit PIN"}
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          className="h-10"
        />
        <Button
          disabled={working || pin.length < 4}
          onClick={() => runTask(() => security.configurePin(pin), config.pinEnabled ? "PIN rotated." : "PIN enabled. Unlock required next launch.")}
        >
          {config.pinEnabled ? "Update PIN" : "Enable PIN"}
        </Button>
      </div>

      {config.pinEnabled && (
        <Button variant="outline" className="w-full" disabled={working} onClick={() => runTask(() => security.disablePin(), "PIN disabled.") }>
          Disable PIN Encryption
        </Button>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2 items-center">
        <Input
          type="number"
          min="0"
          step="1"
          value={retentionDays}
          onChange={(e) => setRetentionDays(e.target.value)}
          className="h-10"
          placeholder="Retention days (0 keeps everything)"
        />
        <Button variant="secondary" disabled={working} onClick={saveRetention}>
          Save Retention
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" disabled={working} onClick={() => runTask(exportData, "Data exported.")}>
          Export Data
        </Button>
        <Button
          variant="destructive"
          disabled={working}
          onClick={() =>
            runTask(async () => {
              if (!confirm("This deletes all entries on this device. Continue?")) return;
              security.secureWipeAll();
            }, "All local data wiped.")
          }
        >
          Wipe All Data
        </Button>
      </div>

      {status && <p className="text-xs text-emerald-600">{status}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
