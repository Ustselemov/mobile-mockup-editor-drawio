# Codex Mobile Mockup Editor

This project was generated with the assistance of Codex AI and prompted by Ustselemov.

AI-generated code and documentation may contain errors, omissions, or incorrect assumptions. Human review is recommended before production, security-sensitive, or business-critical use.

`Codex Mobile Mockup Editor` is a focused browser editor for mobile mockups with a JSON-first document model and controlled Draw.io import/export.

## Implemented baseline

- SVG board with zoom, right/middle mouse pan, `Space + drag`, grid toggle, snap, marquee, fit actions, and center guides
- strict parent-child hierarchy with local coordinates, clamping, reparenting, and nested container movement
- palette, layers tree, inspector, status bar, validation summary, JSON/XML debug views
- MVP4 shell pass: visual library modes, right-side inspector/layers split, board empty state, quick insert, contextual toolbar, and minimap
- multi-select, align/distribute, clipboard duplicate/paste, undo/redo
- lock/hide/order controls in the layers tree and inspector
- JSON save/load, local save/load, Draw.io import/export, unsupported token reporting
- lower DSL panel with live diagnostics and generation into the editable JSON model
- layout engine support for `absolute`, `vstack`, `hstack`, and `grid`
- template packs and editable templates across 10 target app families
- demo document, screen templates, and a supported mobile component subset
- unit tests and Playwright E2E

## Quick start

```bash
npm install
npm run dev
```

Windows shortcut:

- run [`start-editor.bat`](./start-editor.bat)

## Environment

The project currently exposes one optional client-side environment variable:

- `VITE_LOCAL_STORAGE_KEY`: overrides the browser local storage key used for autosave and manual save/load

## Verification

```bash
npm run typecheck
npm run verify
```

## GitHub Pages

For repository Pages deployment, the project now includes a GitHub Actions workflow that builds with the correct repository base path.

Required repository setting:

- GitHub repository `Settings -> Pages -> Build and deployment -> Source`
- select `GitHub Actions`

After that, every push to `main` deploys the production bundle to:

- [https://ustselemov.github.io/mobile-mockup-editor-drawio/](https://ustselemov.github.io/mobile-mockup-editor-drawio/)

## Key documentation

- [Next Versions Hub](./docs/next%20versions/index.md)
- [V5 Scope And Supported Artifacts](./docs/01-scope-and-supported-artifacts.md)
- [V5 Gap Analysis](./docs/10-mvp5-gap-analysis.md)
- [V5 QA Checklist](./docs/16-qa-checklist.md)
- [MVP4 UX Audit Packet](./docs/ux-audit/01-current-ui-inventory.md)
- [Hard UX UI Review 2026-03-29](./docs/ux-audit/08-hard-review-2026-03-29.md)
- [MVP4 UX Redesign Docs](./docs/ux/ui-review.md)
- [MVP1 Audit Final Report](./docs/audit/mvp1_final_acceptance_report.md)
- [MVP2 Architecture](./docs/mvp2/architecture.md)
- [MVP3 Current State Audit](./docs/analysis/current-state-audit.md)
- [MVP3 Architecture](./docs/architecture/mvp3-architecture.md)
- [MVP3 Universal Component Catalog](./docs/components/universal-component-catalog.md)
- [Data Model](./docs/DATA_MODEL.md)
- [Testing Guide](./docs/TESTING.md)
- [Documentation Hub](./docs/wiki/index.html)
- [Roadmap](./ROADMAP.md)

## Known non-blocking limitations

- no variants engine or batch generation yet
- current runtime DSL subset is smaller than the full MVP3 component grammar
- inspector still needs richer grouped controls and fewer raw text/number inputs
- top bar still carries more reading load than the target MVP4 shell
- current document model is editor-centric and not yet the full MVP3 `ProjectModel`
- current V5 universal model is metadata-driven and not yet a full page-based universal document model
- current Draw.io subset is narrower than the full MVP3 target, including no dedicated `CommentCloud` / `shape=cloud` node model yet
- no SVG/PNG export yet
- no visual regression baseline bundle
- supported component catalog is narrower than the full MVP3 target set
- current template-pack library is representative, but still far smaller than the full MVP3 template volume target

## License

Original project code is released under the MIT License. See [LICENSE](./LICENSE).
