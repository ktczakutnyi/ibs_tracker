// Simple lock screen used when PIN protection is enabled.
// We keep wording plain so non-technical users understand what is happening.

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AppLockScreen({ onUnlock }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [unlocking, setUnlocking] = useState(false);

  // Ask parent app to validate PIN and restore decrypted session state.
  const handleUnlock = async () => {
    try {
      setError("");
      setUnlocking(true);
      await onUnlock(pin);
      setPin("");
    } catch (err) {
      setError(err?.message || "Invalid PIN.");
    } finally {
      setUnlocking(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-100 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-6 shadow-xl space-y-4">
        <h1 className="text-xl font-bold text-stone-800">🔒 App Locked</h1>
        <p className="text-sm text-stone-500">Enter your PIN to decrypt and access your local health records.</p>
        <Input
          type="password"
          inputMode="numeric"
          placeholder="Enter PIN"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          className="h-12 rounded-xl"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button disabled={unlocking || pin.length < 4} className="w-full h-12 rounded-xl" onClick={handleUnlock}>
          {unlocking ? "Unlocking…" : "Unlock"}
        </Button>
      </div>
    </div>
  );
}
