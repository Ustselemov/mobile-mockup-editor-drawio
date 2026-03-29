# Universal Model

## Current approach
The current V5 pass keeps the existing JSON document model and expands universality through metadata-driven variants:
- `screen` + `metadata.frameKind`
- `container` + `metadata.shapeVariant`

## Why
- avoids breaking history, import/export, and validation in one risky step
- keeps compatibility with current draw.io subset
- allows immediate expansion into non-mobile artifacts

## Planned full model evolution
- document metadata
- pages
- board settings
- nodes
- connectors
- assets
- themes
- templates
- history snapshot model
