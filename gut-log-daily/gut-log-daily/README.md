# IBS Tracker

A simple IBS tracking app that now works fully offline in the browser.

## Data storage

- Entries are stored on-device with `localStorage`.
- Photos are saved as data URLs on-device.
- No Base44 account, API, or backend connection is required.

## Run locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the app:
   ```bash
   npm run dev
   ```

## Notes

- Data stays on the specific browser/profile on the user's phone.
- Clearing browser site data will remove saved entries.
