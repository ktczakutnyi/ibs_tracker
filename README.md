# IBS Tracker

IBS Tracker is a frontend-only web app for logging bowel movements and IBS symptoms day by day.

- Built with React + Vite.
- Stores all data locally in the browser (`localStorage`).
- Supports optional photo attachments (stored as data URLs in local storage).
- Works without account login or backend services.
- Can be packaged as an Android app using Capacitor (Android Studio + Android SDK).

## Repository Layout

This repository has a nested app folder:

- Root repo: `ibs_tracker/`
- App source: `ibs_tracker/gut-log-daily/gut-log-daily/`

Most commands below should be run from:

```bash
cd gut-log-daily/gut-log-daily
```

## Features

- Monthly calendar view with daily entry indicators.
- Two entry types:
	- Poop entries: date, Bristol stool type, optional photo, optional notes.
	- Symptom entries: date, symptom selection, optional pain scale (1-10), optional notes.
- Detail pages for each entry type.
- Delete entry support.
- Recent activity list on the home screen.
- Mobile-friendly UI.

## Tech Stack

- React 18
- Vite 6
- React Router
- TanStack Query
- Tailwind CSS + Radix UI components
- date-fns

## Getting Started

### 1. Install dependencies

```bash
cd gut-log-daily/gut-log-daily
npm install
```

### 2. Start development server

```bash
npm run dev
```

Vite will print the local URL (usually `http://localhost:5173`).

### 3. Build for production

```bash
npm run build
```

### 4. Preview production build

```bash
npm run preview
```

## Available Scripts

From `gut-log-daily/gut-log-daily`:

- `npm run dev` - Start Vite dev server.
- `npm run build` - Create production bundle.
- `npm run preview` - Preview production build locally.
- `npm run lint` - Run ESLint.
- `npm run lint:fix` - Auto-fix lint issues.
- `npm run typecheck` - Run TypeScript check using `jsconfig.json`.


## Can this be secure without hosting a server?

Yes, for a single-user/offline use case you can meaningfully improve security without a backend.
This project now includes local hardening features:

- Optional PIN-based app lock + encrypted local entry storage.
- Configurable retention window to auto-prune old records.
- Photo upload hardening (size limit + SVG blocked + re-encode/downscale before storage).
- Local export and secure wipe controls.

Important limitation: without a server there is no cross-device identity, remote revocation, or server-side authorization.


## Merge Gate Recommendation

For changes on shared branches, require one green CI run before merge:

- `npm ci`
- `npm run build`
- `npm run lint`
- security checks (`npm audit` + SBOM generation)

This avoids blocking on local environment quirks while still enforcing quality and security in a reproducible runner.

## Data Storage and Privacy

- All entries are stored in browser `localStorage`.
- Current keys:
	- `ibs_tracker_poop_entries`
	- `ibs_tracker_symptom_entries`
- Photos are stored as base64/data URLs in local storage.
- No backend sync is implemented.

Important:

- Data is tied to the specific browser profile/device.
- Clearing browser storage/site data removes saved entries.

## Main Routes

Routes are configured in `src/pages.config.js`:

- `/` -> Home
- `/NewEntry` -> Create poop entry
- `/NewSymptomEntry` -> Create symptom entry
- `/EntryDetail?id=...` -> Poop entry details
- `/SymptomDetail?id=...` -> Symptom entry details
- `/AllEntries` -> List of poop entries

## Key Source Files

- `src/App.jsx` - App shell, routing, auth/loading wrapper, query provider.
- `src/api/localDataClient.js` - Local storage data layer and file upload conversion.
- `src/pages/` - Main page components.
- `src/components/poop/` - Domain UI components (calendar, selectors, cards, modal).

## Notes for Contributors

- The app currently uses a local-only auth context stub (`src/lib/AuthContext.jsx`).
- `src/pages.config.js` is marked auto-generated; only `mainPage` should be edited manually.
- Keep UI behavior consistent for both entry types when adding new features.
- Follow `SECURITY_RELEASE_CHECKLIST.md` before mobile production releases.

## License

No license file is currently defined in this repository.

## Android Packaging

From `gut-log-daily/gut-log-daily`:

```bash
npm run android:sync
npm run android:init   # one-time setup
npm run android:open
```

Then build/run from Android Studio using your installed Android SDK.

## Quick Offline + Android Guide

A simple IBS tracking app that works fully offline and can be packaged as an Android app using Capacitor.

### Data storage

- Entries are stored on-device with `localStorage`.
- Photos are saved as data URLs on-device.
- No Base44 account, API, or backend connection is required.

### Run locally (web)

1. Install dependencies:
	```bash
	npm install
	```
2. Start the app:
	```bash
	npm run dev
	```

### Android SDK / app setup

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

### Notes

- Data stays on the specific browser/webview profile on the user's phone.
- Clearing app/site data will remove saved entries.
