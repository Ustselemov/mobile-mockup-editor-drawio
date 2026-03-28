# Release Notes

This document was generated with the assistance of Codex AI and prompted by Ustselemov.

## MVP2 Baseline Update

This snapshot promotes the editor from a partial MVP2 hardening phase to a usable MVP2 baseline.

### Added or hardened

- collision-aware palette drop resolution with deepest valid parent priority
- nested parent-child consistency for container movement
- right/middle mouse pan and `Space + drag` navigation
- board grid visibility toggle
- align/distribute toolbar actions
- layers tree controls for lock, hide, and sibling order
- inspector summary with validation counts and node state actions
- browser E2E coverage for pan and nested parenting

### Carried forward

- JSON-first document model
- Draw.io import/export and unsupported token reporting
- multi-select, marquee, clipboard, undo/redo, and templates
- debug JSON/XML views and validation report

### Known non-blocking limitations

- no minimap
- no visual regression baseline bundle
- large production chunk warning remains
- supported component catalog is narrower than the full aspirational MVP2 list
