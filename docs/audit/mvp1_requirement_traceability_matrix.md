# MVP1 Requirement Traceability Matrix

This document was generated with the assistance of Codex AI and prompted by Ustselemov.

## Summary

| Requirement ID | Requirement | Priority | Status | Evidence |
| --- | --- | --- | --- | --- |
| MVP1-REQ-001 | Editor shell loads in browser without runtime crash | Blocker | PASS | [src/app/App.tsx](../../src/app/App.tsx), [src/features/inspector/InspectorPanel.tsx](../../src/features/inspector/InspectorPanel.tsx) |
| MVP1-REQ-002 | Board supports pan and zoom | Blocker | PASS | [src/features/editor/components/BoardView.tsx](../../src/features/editor/components/BoardView.tsx) |
| MVP1-REQ-003 | Board supports grid and snap | High | PASS | [src/core/store/editorStore.ts](../../src/core/store/editorStore.ts), [src/lib/geometry/snap.ts](../../src/lib/geometry/snap.ts) |
| MVP1-REQ-004 | User can create screens on board | Blocker | PASS | [src/app/App.tsx](../../src/app/App.tsx), [src/core/store/editorStore.ts](../../src/core/store/editorStore.ts) |
| MVP1-REQ-005 | Screen children use parent-local coordinates and stay clamped to parent bounds | Blocker | PASS | [src/lib/geometry/coords.ts](../../src/lib/geometry/coords.ts), [src/lib/geometry/bounds.ts](../../src/lib/geometry/bounds.ts), [src/core/store/editorStore.ts](../../src/core/store/editorStore.ts) |
| MVP1-REQ-006 | Palette can create core MVP elements | High | PASS | [src/features/palette/PalettePanel.tsx](../../src/features/palette/PalettePanel.tsx), [src/lib/model/defaults.ts](../../src/lib/model/defaults.ts), [src/lib/model/document.ts](../../src/lib/model/document.ts) |
| MVP1-REQ-007 | Sections/containers preserve child hierarchy when moved | Blocker | PASS | [src/lib/model/placement.ts](../../src/lib/model/placement.ts), [src/features/editor/components/BoardView.tsx](../../src/features/editor/components/BoardView.tsx), [tests/unit/model/parenting.test.ts](../../tests/unit/model/parenting.test.ts) |
| MVP1-REQ-008 | Drag, resize, snap and clamp work for selected nodes | Blocker | PASS | [src/features/editor/components/BoardView.tsx](../../src/features/editor/components/BoardView.tsx), [src/features/editor/components/SelectionOverlay.tsx](../../src/features/editor/components/SelectionOverlay.tsx) |
| MVP1-REQ-009 | Multi-select and marquee selection are available | High | PASS | [src/features/editor/components/BoardView.tsx](../../src/features/editor/components/BoardView.tsx) |
| MVP1-REQ-010 | Layers tree shows hierarchy and supports reparent through DnD | High | PASS | [src/features/layers/LayersPanel.tsx](../../src/features/layers/LayersPanel.tsx), [src/core/store/editorStore.ts](../../src/core/store/editorStore.ts) |
| MVP1-REQ-011 | Inspector edits geometry, content and style properties | High | PASS | [src/features/inspector/InspectorPanel.tsx](../../src/features/inspector/InspectorPanel.tsx) |
| MVP1-REQ-012 | Undo/redo, duplicate, clipboard and nudge are available | High | PASS | [src/core/store/editorStore.ts](../../src/core/store/editorStore.ts), [src/features/editor/hooks/useEditorHotkeys.ts](../../src/features/editor/hooks/useEditorHotkeys.ts) |
| MVP1-REQ-013 | JSON save/load works | High | PASS | [src/core/store/editorStore.ts](../../src/core/store/editorStore.ts), [src/app/App.tsx](../../src/app/App.tsx) |
| MVP1-REQ-014 | Draw.io import/export works for supported subset | Blocker | PASS | [src/lib/drawio/parseDrawio.ts](../../src/lib/drawio/parseDrawio.ts), [src/lib/drawio/serializeDrawio.ts](../../src/lib/drawio/serializeDrawio.ts) |
| MVP1-REQ-015 | Validation and debug/XML preview are available | High | PASS | [src/lib/drawio/validate.ts](../../src/lib/drawio/validate.ts), [src/features/inspector/InspectorPanel.tsx](../../src/features/inspector/InspectorPanel.tsx) |
| MVP1-REQ-016 | Orthogonal connector model is separate from node tree and updates with moved endpoints | High | PASS | [src/lib/model/document.ts](../../src/lib/model/document.ts), [src/features/editor/components/RenderNode.tsx](../../src/features/editor/components/RenderNode.tsx), [src/core/store/editorStore.ts](../../src/core/store/editorStore.ts) |
| MVP1-REQ-017 | Project contains at least 3 screen templates and at least 5 component presets | Medium | PASS | [src/core/demo/screenTemplates.ts](../../src/core/demo/screenTemplates.ts), [src/lib/model/defaults.ts](../../src/lib/model/defaults.ts) |
| MVP1-REQ-018 | Unit-level automated coverage exists for parser/serializer and geometry core | High | PASS | [tests](../../tests) |
| MVP1-REQ-019 | Browser-level automation and visual regression are present | Medium | DEFERRED | No Playwright scenario or snapshot baseline is committed yet |

## Status Legend

- `PASS`: requirement implemented and supported by code and/or tests.
- `PARTIAL`: requirement exists, but evidence is incomplete or behavior is limited.
- `FAIL`: requirement missing or contradicted by observed behavior.
- `N/A`: requirement not applicable to MVP1 acceptance.
- `DEFERRED`: requirement intentionally left for MVP2 hardening.
