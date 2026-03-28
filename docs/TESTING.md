# Testing

This project was generated with the assistance of Codex AI and prompted by Ustselemov.

## Automated coverage

- Unit tests cover geometry helpers, arrange helpers, snapping, center snapping, layout reflow, parenting, store actions, Draw.io style parsing, unsupported import handling, and Draw.io round-trip.
- Browser E2E currently covers live board pan, nested parent-child behavior during container movement, inspector-driven geometry/layout updates, lower-panel DSL compilation, and Draw.io export.

## Commands

```bash
npm run typecheck
npm run verify
```

## Current limits

- Visual regression baselines are not stored in the repository.
- The E2E suite is intentionally small and focused on the most failure-prone integration paths.
- Manual QA is still recommended after changes to rendering, import/export mapping, or complex pointer interactions.
- Palette drag/drop and Draw.io import still rely on unit coverage plus manual QA rather than dedicated browser automation.

## Manual reference

- Unit coverage includes center snapping, layout reflow, and model validation integrity.
- E2E currently covers nested parent-child movement, right-button board pan, inspector-driven layout edits, lower-panel DSL generation, and Draw.io export.
- [MVP2 Manual QA](./mvp2/manual-qa-v2.md)
