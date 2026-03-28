# MVP1 Gap List

This document was generated with the assistance of Codex AI and prompted by Ustselemov.

## Blockers

- None currently open.

## Major Gaps

- None currently open for MVP1 acceptance.

## Minor Gaps

- No visual regression baseline or snapshot suite for rendered components.
- Playwright coverage is still a focused smoke set and does not yet cover every editor surface.
- No `fit current screen` action in the main toolbar yet.
- Board navigation is improved, but there is still no minimap.
- Current status bar is useful, but it does not yet expose cursor coordinates or autosave state.

## Tech Debt

- [src/core/store/editorStore.ts](../../src/core/store/editorStore.ts) is still a large state module and should be decomposed during future hardening.
- XML export bundle size remains large due to browser-side `xmlbuilder2`.

## Known Limitations

- The product is intentionally not a full diagrams.net clone.
- Unsupported Draw.io shapes are preserved via fallback nodes and warnings instead of being fully editable.
- Some advanced connector features such as waypoint authoring and anchor editing remain import/export oriented.
