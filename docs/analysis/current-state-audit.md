# Current State Audit

This document was generated with the assistance of Codex AI and prompted by Ustselemov.

## Current baseline

The repository is a working SVG-first editor with:

- infinite board, pan, zoom, grid, snap, marquee selection
- right/middle mouse pan and `Space + drag`
- screen/container/flowLane hierarchy with local coordinates and parent-aware movement
- palette, templates, layers tree, inspector, lower DSL panel, status bar, lock/hide/order, align/distribute
- JSON save/load, local storage, undo/redo
- Draw.io import/export on a controlled subset
- center-aware drop preview and soft center snap inside parents
- layout engine support for `absolute`, `vstack`, `hstack`, and `grid`
- minimal DSL v1 parse/compile pipeline with diagnostics and generation
- template packs across the target top-10 app families
- unit tests plus Playwright smoke coverage

## What should stay

- JSON-first normalized store
- SVG renderer with DOM-inspectable geometry
- typed model and validation rather than XML-as-state
- explicit parent-child relationships with local positioning
- controlled interoperability boundary for Draw.io

## MVP3 gaps against the spec

### Product gaps

- no variant expansion or batch screen generation
- no advanced auto-layout constraints beyond the current baseline reflow rules
- current template packs cover the target families, but not the full template-volume goal from the spec
- component catalog is still narrower than the MVP3 target set
- runtime DSL support is still narrower than the broader MVP3 grammar examples

### UX gaps

- no dedicated variants/assets sidebar tabs yet
- left sidebar does not yet expose the full MVP3 tab set for components, screens, and assets
- right sidebar does not yet expose the full MVP3 tab set for layout/style/text/bindings
- no minimap
- toolbar is usable, but still not the full MVP3 control surface

### Technical gaps

- current model is editor-centric, not the full `ProjectModel`
- no variant overflow guardrails
- no explicit `CommentCloud` / `shape=cloud` node model in the Draw.io subset yet
- no round-trip contract beyond the current Draw.io subset

## MVP3 execution order

1. Stabilize editor core and placement UX.
2. Lock the data model and validation contracts.
3. Add the layout engine.
4. Expand the component catalog.
5. Implement DSL v1.
6. Add variants and batch placement.
7. Add template packs.
8. Harden Draw.io mapping and diagnostics.
