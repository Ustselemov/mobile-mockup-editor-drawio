# Development Guide

This project was generated with the assistance of Codex AI and prompted by Ustselemov.

## Commands

- `npm install`
- `npm run dev`
- `npm run typecheck`
- `npm run build`
- `npm test`
- `npm run test:e2e`
- `npm run verify`

## Notes

- The persistent contract is the JSON document model from `src/lib/model`.
- Draw.io parsing and serialization live in `src/lib/drawio`.
- Interactive editor behavior lives in `src/features/editor` and `src/core/store`.
- `src/core/demo/demoDocument.ts` is the canonical seeded MVP scene used for manual verification and round-trip tests.
- `src/core/demo/screenTemplates.ts` contains the reusable screen templates exposed by the toolbar.
- Toolbar actions cover the primary manual test flows: new/demo, JSON save/load, draw.io import/export, zoom presets, fit actions, and connector creation.
