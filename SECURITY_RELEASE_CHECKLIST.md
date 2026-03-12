# Mobile Security Release Checklist

Use this checklist before every Android/iOS production release.

> Plain-language goal: this list is here so non-security experts can still catch the most common mistakes before publishing.

## Build hardening
- [ ] Build with release mode (no debuggable build).
  Why: debug builds are easier to inspect/tamper with.
- [ ] Enable code shrinking/obfuscation (R8/ProGuard) in Android release config.
  Why: this makes reverse engineering and patching the app harder.
- [ ] Verify app signing keys are managed securely (not in source control).
  Why: leaked signing keys let attackers ship fake “official” app updates.
- [ ] Validate Play Integrity / device attestation strategy for production.
  Why: helps detect suspicious devices and app tampering patterns.

## Data protection
- [ ] Confirm local records are encrypted at rest.
  Why: if storage is stolen or copied, data should still be unreadable.
- [ ] Confirm PIN lock (or biometric lock) is enabled and tested on startup/resume.
  Why: protects privacy when someone else picks up the device.
- [ ] Confirm data-retention policy is configured for target deployment.
  Why: keeping less old data lowers impact if a device is compromised.
- [ ] Confirm export + secure wipe flows are tested.
  Why: users need control over their data lifecycle.

## Dependency and supply-chain checks
- [ ] Run dependency audit with network-enabled CI (`npm audit`).
  Why: catches known vulnerable packages.
- [ ] Generate and store SBOM artifact for release (`npm sbom`).
  Why: gives traceability for what shipped in each release.
- [ ] Review dependency updates for critical/high CVEs.
  Why: fast patching of high-risk issues reduces exposure time.

## Privacy and logging
- [ ] Validate privacy notice reflects real data practices.
  Why: users should clearly know what is collected/stored.
- [ ] Ensure logs do not include sensitive health data.
  Why: logs are often copied to support tools and can leak private data.
- [ ] Confirm no secrets/tokens are hardcoded in app code.
  Why: embedded secrets are easy to extract from app builds.

## Transport and backend (when introduced)
- [ ] Enforce HTTPS-only transport.
  Why: prevents plaintext interception.
- [ ] Verify TLS certificate validation and reject invalid cert chains.
  Why: reduces man-in-the-middle attack risk.
- [ ] Re-run threat modeling for any new backend endpoints.
  Why: every new endpoint adds attack surface.
