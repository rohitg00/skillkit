# Changelog

All notable changes to SkillKit are documented here. Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions use [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added
- **Skill integrity verification (`skillkit verify`).** New command computes a deterministic SHA-256 over every file in a skill (excluding metadata, VCS, and editor artifacts) and emits the result as a Subresource Integrity string (`sha256-<base64>`). Supports:
  - `--expected <sri|hex>` to verify against a known publisher digest
  - `--against-lock` to verify against the local `~/.skillkit/lock.json` entry
  - `--files` to dump per-file digests
  - `--json` for CI pipelines
- **`computeSkillIntegrity` / `verifySkillIntegrity`** exported from `@skillkit/core` for programmatic use.
- **`integrity` field** in `WellKnownSkill` index. `skillkit publish` now records a full SRI digest for each published skill alongside the file list.
- **Lockfile records full integrity.** `skillkit install` and `skillkit update` now persist the full SRI digest to `~/.skillkit/lock.json` (with graceful fallback to the legacy short checksum when integrity computation fails).
- Phase 1 of supply-chain integrity (issue #90). Phase 2 (ed25519 signing + publisher key registry) tracked separately.

### Tests
- 11 unit tests for the integrity module (`packages/core/src/integrity/__tests__/integrity.test.ts`).
- 5 CLI end-to-end tests for `skillkit verify` (`packages/cli/src/__tests__/verify.test.ts`).

## [1.24.0] - 2026-04-XX

See [GitHub releases](https://github.com/rohitg00/skillkit/releases) for prior history.
