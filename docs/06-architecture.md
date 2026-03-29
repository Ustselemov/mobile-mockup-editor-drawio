# V5 Architecture

## Current architecture direction
- `src/app`: shell composition and integration
- `src/core/store`: document mutations, history, import/export funnel
- `src/lib/model`: schema, node factories, placement, validation
- `src/lib/layout`: reflow engine
- `src/lib/drawio`: parser / serializer / validation
- `src/features/*`: board, palette, inspector, layers, minimap, quick insert, context toolbar

## V5 strategy
Instead of a fake universal rewrite, the current pass expands the existing model with variant-driven frames and shapes, then documents the remaining core refactors needed for pages, richer connectors, and broader artifact modes.
