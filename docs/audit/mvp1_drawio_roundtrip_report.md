# MVP1 Draw.io Round-Trip Report

This document was generated with the assistance of Codex AI and prompted by Ustselemov.

## Scope

The current round-trip audit covers the supported controlled subset used by MVP1 and the immediately added hardening around it.

## Verified Mapping

| Component | Import | Export | Evidence | Status |
| --- | --- | --- | --- | --- |
| Screen | Yes | Yes | [tests/unit/drawio/roundtrip.test.ts](../../tests/unit/drawio/roundtrip.test.ts) | PASS |
| Field | Yes | Yes | [tests/unit/drawio/roundtrip.test.ts](../../tests/unit/drawio/roundtrip.test.ts) | PASS |
| CheckboxRow | Yes | Yes | [tests/unit/drawio/roundtrip.test.ts](../../tests/unit/drawio/roundtrip.test.ts) | PASS |
| Button | Yes | Yes | [tests/unit/drawio/roundtrip.test.ts](../../tests/unit/drawio/roundtrip.test.ts) | PASS |
| Edge | Yes | Yes | [tests/unit/drawio/roundtrip.test.ts](../../tests/unit/drawio/roundtrip.test.ts), [tests/unit/drawio/edge-parent.test.ts](../../tests/unit/drawio/edge-parent.test.ts) | PASS |
| SegmentedControl | Yes | Yes | [tests/unit/drawio/extended-components.test.ts](../../tests/unit/drawio/extended-components.test.ts) | PASS |
| Badge | Yes | Yes | [tests/unit/drawio/extended-components.test.ts](../../tests/unit/drawio/extended-components.test.ts) | PASS |
| Banner | Yes | Yes | [tests/unit/drawio/extended-components.test.ts](../../tests/unit/drawio/extended-components.test.ts) | PASS |
| Unsupported shape fallback | Yes | N/A | [tests/unit/drawio/unsupported-import.test.ts](../../tests/unit/drawio/unsupported-import.test.ts) | PASS |

## Observations

- XML output is deterministic for the supported subset.
- Text escaping no longer loses plain-text characters such as `<`, `>` and `&`.
- Invalid imported edge parents are normalized to `board` and reported as warnings instead of silently breaking validation.

## Current Limitation

- Unsupported arbitrary Draw.io constructs still map to `unsupported` fallback nodes rather than high-fidelity editable components.
