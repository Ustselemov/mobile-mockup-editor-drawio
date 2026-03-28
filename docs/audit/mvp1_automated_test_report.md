# MVP1 Automated Test Report

This document was generated with the assistance of Codex AI and prompted by Ustselemov.

## Commands

```bash
npm run typecheck
npm test
npm run test:e2e
npm run build
```

## Latest Result

- `npm run typecheck`: PASS
- `npm test`: PASS
- `npm run test:e2e`: PASS
- `npm run build`: PASS
- Unit test files: `16`
- Unit test cases: `30`
- E2E test cases: `4`

## Coverage Highlights

- draw.io style parse/serialize
- draw.io text HTML mapping and escaping
- draw.io geometry import
- draw.io round-trip for core and extended components
- unsupported import fallback
- edge parent normalization
- snap math
- center snap math
- layout reflow for `vstack` and `hstack`
- reparent coordinate conversion
- deterministic id generation
- container auto-parenting and move+reparent behavior
- browser smoke for container movement, right-button pan, inspector-driven layout edits, and Draw.io export

## Evidence

- [tests/unit/drawio/style.test.ts](../../tests/unit/drawio/style.test.ts)
- [tests/unit/drawio/text-format.test.ts](../../tests/unit/drawio/text-format.test.ts)
- [tests/unit/drawio/roundtrip.test.ts](../../tests/unit/drawio/roundtrip.test.ts)
- [tests/unit/drawio/extended-components.test.ts](../../tests/unit/drawio/extended-components.test.ts)
- [tests/unit/drawio/edge-parent.test.ts](../../tests/unit/drawio/edge-parent.test.ts)
- [tests/unit/geometry/center-snap.test.ts](../../tests/unit/geometry/center-snap.test.ts)
- [tests/unit/layout/reflow.test.ts](../../tests/unit/layout/reflow.test.ts)
- [tests/unit/geometry/reparent.test.ts](../../tests/unit/geometry/reparent.test.ts)
- [tests/unit/model/parenting.test.ts](../../tests/unit/model/parenting.test.ts)
- [tests/e2e/editor-core.spec.ts](../../tests/e2e/editor-core.spec.ts)

## Limitations

- No visual regression baseline yet.
- The browser suite is still a focused smoke set, not a full interaction matrix.
