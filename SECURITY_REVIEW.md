# Security Review (Post-Hardening)

Date: 2026-03-12
Scope: `gut-log-daily/gut-log-daily` frontend-only IBS tracker application.

## Executive summary (plain language)

Yes — you can materially improve security **without hosting a server** for an offline/single-device app.
This app now includes:
- local encryption support,
- PIN-based app lock,
- retention controls,
- safer photo upload handling,
- and export/wipe privacy controls.

The biggest remaining risks are:
1. **Compromised device risk (Medium):** rooted/jailbroken or malware-infected devices can still bypass app protections.
2. **Supply-chain visibility gap (Medium):** local environment could not complete `npm audit` due registry policy restrictions.
3. **No server-side authorization (Contextual):** expected for offline architecture, but still a limitation.

## Merge readiness recommendation

Before merging to shared branches, require one green CI run that proves:
- `npm ci` succeeds,
- `npm run build` succeeds,
- `npm run lint` succeeds,
- dependency security job runs (`npm audit` + SBOM artifact generation).

Reason: local agent environment errors should not block merge **if CI is green**, but CI red should block.

## Implemented mitigations (this update)

- Replaced plain local data read/write path with encrypted-at-rest storage when PIN is enabled (AES-GCM via Web Crypto, PIN-derived key).
- Added optional app lock screen that requires PIN to decrypt local records.
- Added retention policy controls with automatic pruning.
- Added export and secure wipe controls for privacy operations.
- Hardened photo handling: blocked SVG, set size limit, downscale/re-encode to JPEG before storage.
- Added CI workflow coverage for quality + dependency security checks.
- Added release checklist for Android/iOS hardening tasks (R8/ProGuard, integrity, signing hygiene, etc.).

## OWASP Mobile mapping after changes

### M9 Insecure Data Storage
**Improved:** encrypted local storage path available when PIN is enabled.
**Residual risk:** plaintext mode still possible if user leaves PIN disabled.

### M5 Insecure Communication
**Unchanged / Low:** no backend transport path in current app.

### M3 Insecure Authentication/Authorization
**Improved for local privacy:** app-lock PIN gate is implemented.
**Residual:** no multi-user/server authorization by design.

### M7 Insufficient Binary Protections
**Partially addressed by process:** release checklist documents R8/ProGuard and integrity controls for mobile builds.

### M1 Improper Credential Usage
**No hardcoded secrets found** in source scan.

### M4 Insufficient Input/Output Validation
**Improved:** upload validation includes blocked SVG + size limit + re-encode/downscale path.

### M2 Inadequate Supply Chain Security
**Improved process:** CI workflow includes `npm audit` + SBOM artifact generation.
**Residual:** local environment used for this review still blocked from npm advisory endpoint.

### M8 Security Misconfiguration
**Improved process:** release checklist reduces config drift and missed hardening steps.

### M6 Inadequate Privacy Controls
**Improved:** security control panel includes PIN lock management, retention, export, and wipe.

### M10 Broken Cryptography
**Improved:** uses platform Web Crypto primitives (PBKDF2 + AES-GCM), no custom crypto algorithm design.

## Practical next steps

1. Make PIN+encryption opt-out explicit in onboarding (recommended default: enabled).
2. Add biometric unlock option (platform plugin) for better UX.
3. Add native secure storage plugin integration for Capacitor release builds.
4. Add integrity checks and hardening in native Android project (`android/` once generated).

## Commands executed for this review

- `rg --files`
- `rg -n "localStorage|security|encrypt|PBKDF2|AES-GCM|pin|retention|wipe|export|svg|FileReader|toDataURL" README.md SECURITY_RELEASE_CHECKLIST.md gut-log-daily/gut-log-daily/src .github/workflows/security-ci.yml`
- `npm run build` (attempted, blocked by missing dependencies in this environment)
- `npm run lint` (attempted, blocked by missing dependencies in this environment)
- `npm audit --json` (attempted, blocked by npm advisory endpoint access policy in this environment)
