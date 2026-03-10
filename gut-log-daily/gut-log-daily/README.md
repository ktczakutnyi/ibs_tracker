# IBS Tracker

A simple IBS tracking app that works fully offline and can now be packaged as an Android app using Capacitor.

## Data storage

- Entries are stored on-device with `localStorage`.
- Photos are saved as data URLs on-device.
- No Base44 account, API, or backend connection is required.

## Run locally (web)

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the app:
   ```bash
   npm run dev
   ```

## Android SDK / app setup

1. Build and sync web assets into Android:
   ```bash
   npm run android:sync
   ```
2. If Android has not been added yet, initialize it once:
   ```bash
   npm run android:init
   ```
3. Open Android Studio:
   ```bash
   npm run android:open
   ```
4. Run on a device/emulator from Android Studio, or use:
   ```bash
   npm run android:run
   ```

> Prerequisites: Android Studio + Android SDK must already be installed and configured on your machine.

## Notes

- Data stays on the specific browser/webview profile on the user's phone.
- Clearing app/site data will remove saved entries.
