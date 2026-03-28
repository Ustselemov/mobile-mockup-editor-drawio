# MVP1 Manual Test Protocol

This document was generated with the assistance of Codex AI and prompted by Ustselemov.

## Executed Session

- Environment: local Windows development run via `npm run dev`
- Focus: core editor runtime, hierarchy behavior, import/export, navigation
- Result: no runtime crash after recent fixes; white-screen regression removed

## Manual Scenarios

| Scenario ID | Scenario | Expected Result | Status |
| --- | --- | --- | --- |
| MVP1-MAN-001 | Open the editor in browser | App shell, toolbar, board, sidebars and statusbar render | PASS |
| MVP1-MAN-002 | Pan board with middle mouse, right mouse and `Space + drag` | Board viewport moves without moving selected nodes | PASS |
| MVP1-MAN-003 | Zoom with toolbar controls and `Ctrl/Cmd + wheel` | Zoom level changes and board remains interactive | PASS |
| MVP1-MAN-004 | Add screen from toolbar | New screen appears on board and is selectable | PASS |
| MVP1-MAN-005 | Add section/container, then add button/field inside it | Child attaches to container and follows container move | PASS |
| MVP1-MAN-006 | Move and resize nodes near parent edge | Node is clamped to parent bounds | PASS |
| MVP1-MAN-007 | Multi-select with shift and marquee | Selection count updates and bulk movement works | PASS |
| MVP1-MAN-008 | Change content and geometry in inspector | Selected node updates immediately | PASS |
| MVP1-MAN-009 | Reparent through layers tree drag-and-drop | Node changes parent and coordinates are converted | PASS |
| MVP1-MAN-010 | Save/load JSON | JSON round-trip restores document | PASS |
| MVP1-MAN-011 | Import and export Draw.io | Supported subset survives round-trip and debug preview remains valid | PASS |
| MVP1-MAN-012 | Undo/redo, copy/paste, duplicate, delete, nudge | History and selection stay coherent | PASS |

## Notes

- Layers tree now also surfaces loose edges under board/screen/lane parents.
- Browser automation now covers core container movement, board pan, inspector-driven geometry/layout edits, and Draw.io export.
- Manual QA is still required for palette drag/drop, Draw.io import via file picker, and broader visual review.
