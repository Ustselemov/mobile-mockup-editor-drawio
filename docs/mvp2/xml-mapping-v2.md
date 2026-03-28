# XML Mapping V2

This document was generated with the assistance of Codex AI and prompted by Ustselemov.

## Scope

The current implementation supports a controlled Draw.io subset.
The JSON document model remains the source of truth during editing.

## Import pipeline

1. Parse XML with `fast-xml-parser`.
2. Read `mxCell` and `mxGeometry`.
3. Detect nodes, composites, and edges.
4. Normalize parent references.
5. Preserve unsupported styles and tokens in metadata.
6. Move invalid edge parents back to `board`.

## Supported node mappings

| JSON node | Draw.io representation | Notes |
| --- | --- | --- |
| `flowLane` | `mxCell` vertex with `swimlane` style | Board-level lane container |
| `screen` | Rounded container vertex + external title cell | Title is serialized as a companion cell |
| `container` | Rounded container vertex | Used for generic sections/cards |
| `field` | Base container cell plus `__label` and `__value` child cells | Composite mapping |
| `segmentedControl` | Base container cell plus `__item-N` child cells | Active item uses different fill/stroke |
| `badge` | Single rounded vertex | Text is stored in cell value |
| `banner` | Base container cell plus `__title` and `__body` child cells | Composite mapping |
| `text` | Single text vertex | HTML text style is preserved |
| `button` | Single rounded vertex | Variant is inferred from fill/stroke |
| `checkbox` | Base square vertex plus `__label` child cell | Checkbox box and label are separate cells |
| `unsupported` | Fallback vertex | Raw XML and style are stored in metadata |
| `edge` | `mxCell` edge with geometry points | Orthogonal connectors with optional waypoints |

## Parent mapping

- `board` maps to Draw.io root parent `1`.
- Board-level nodes export with `parent="1"`.
- Nested nodes export with their actual parent cell id.
- Edges are allowed only under `board`, `flowLane`, or `screen`.
- If an imported edge has an invalid parent, it is normalized back to `board` and a warning is stored.

## Style keys currently recognized

- `align`
- `arcSize`
- `collapsible`
- `connectable`
- `container`
- `dropTarget`
- `edgeStyle`
- `endArrow`
- `endFill`
- `fillColor`
- `fontStyle`
- `horizontal`
- `html`
- `jettySize`
- `orthogonalLoop`
- `rounded`
- `startArrow`
- `startSize`
- `strokeColor`
- `strokeWidth`
- `swimlane`
- `text`
- `verticalAlign`
- `whiteSpace`

## Unsupported handling

- Unknown style keys are not silently dropped from the import report.
- Unsupported vertices become `unsupported` nodes.
- Unsupported node metadata includes the original style map and original XML fragment when available.
- The debug inspector surfaces import warnings and unsupported tokens.

## Export behavior

- Export validates the JSON document before serialization.
- The output is a minimal valid `mxfile` / `mxGraphModel` document.
- Composite mappings are expanded back into companion cells.
- Coordinates are exported from the current normalized model, not from the original XML.

## Fidelity limits

- The exporter does not recreate every possible Draw.io feature.
- Waypoint editing is preserved when present, but the UI does not author it.
- The current mapping is designed for stability and round-trip safety within the supported subset.
