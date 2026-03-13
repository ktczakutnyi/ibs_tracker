// Settings panel for privacy actions.
// This component is intentionally explained in plain language so teammates
// who do not code often can still understand what each section does.

import React, { useState } from "react";
import { security } from "@/lib/security";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SecuritySettingsCard({ onDataChanged }) {
  // Local form/input state for this small settings panel.
  const [pin, setPin] = useState("");
  const [retentionInput, setRetentionInput] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [working, setWorking] = useState(false);

  // Re-read current config each render so UI updates after actions.
  const config = security.getSecurityConfig();

  // Shared helper so every button shows consistent loading + error handling.
  const runTask = async (task, successMessage) => {
    try {
      setWorking(true);
      setError("");
      setStatus("");
      await task();

      // Some actions change stored entries. When that happens we ask the parent
      // page to refresh its lists so the screen always shows the latest data.
      if (onDataChanged) await onDataChanged();

      setStatus(successMessage);
    } catch (err) {
      setError(err?.message || "Security action failed.");
    } finally {
      setWorking(false);
    }
  };

  // Create and download a JSON backup of all local entries.
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
    <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-lg space-y-3 w-[min(92vw,24rem)]">
      <div>
        <h3 className="text-sm font-bold text-stone-700 uppercase tracking-wider">Settings</h3>
        <p className="text-xs text-stone-500 mt-1">
          PIN lock is optional. Turn it on only if you want the app to ask for a PIN.
        </p>
      </div>

      {/* PIN setup/rotation row */}
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2 items-center">
        <Input
          type="password"
          inputMode="numeric"
          placeholder={config.pinEnabled ? "Enter new PIN" : "Set a 4+ digit PIN"}
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          className="h-10"
        />
        <Button
          disabled={working || pin.length < 4}
          onClick={() =>
            runTask(
              () => security.configurePin(pin),
              config.pinEnabled ? "PIN changed." : "PIN enabled. App will lock on next launch/background."
            )
          }
        >
          {config.pinEnabled ? "Change PIN" : "Set PIN"}
        </Button>
      </div>

      {/* If PIN is currently enabled, allow users to remove it (optional lock). */}
      {config.pinEnabled && (
        <Button
          variant="outline"
          className="w-full"
          disabled={working}
          onClick={() => runTask(() => security.disablePin(), "PIN removed. App lock is now off.")}
        >
          Remove PIN
        </Button>
      )}

      {/* Retention policy lets users automatically delete older records. */}
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2 items-center">
        <Input
          type="number"
          min="0"
          step="1"
          inputMode="numeric"
          value={retentionInput}
          onChange={(e) => setRetentionInput(e.target.value)}
          placeholder={`Retention days (current: ${config.retentionDays || 0})`}
          className="h-10"
        />
        <Button
          variant="outline"
          disabled={working}
          onClick={() =>
            runTask(
              () => security.updateRetentionDays(retentionInput),
              "Retention policy saved. Older entries pruned if needed."
            )
          }
        >
          Save Retention
        </Button>
      </div>

      {/* Export and destructive delete actions. */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
            }, "All local data deleted.")
          }
        >
          Delete All Data
        </Button>
      </div>

      {/* Inline status text keeps feedback close to the action buttons. */}
      {status && <p className="text-xs text-emerald-600">{status}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
