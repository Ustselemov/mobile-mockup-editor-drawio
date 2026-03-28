# Analysis

This document was generated with the assistance of Codex AI and prompted by Ustselemov.

## MVP subset

- `mxCell` is the primary entity. `vertex="1"` maps to visual nodes, `edge="1"` maps to connectors.
- `mxGeometry` carries `x`, `y`, `width`, `height`, and for edges also points and `relative="1"`.
- `style` is a semicolon-delimited token map. The observed subset is small and dominated by `rounded`, `fillColor`, `strokeColor`, `arcSize`, `container`, `swimlane`, `text`, and connector flags.
- Parent-child nesting is structural, not decorative. Screens and containers behave like real parents; child coordinates are local to the parent.

## Minimal MVP elements

- `FlowLane` for imported top-level swimlanes
- `Screen` as the primary editable mobile frame
- `Container` for sections/cards
- `Text`
- `Button`
- `CheckboxRow`
- `ArrowConnector` for import/export preservation

## Key UI patterns from the sample

- Screen frames are rounded white containers with dark `#1c2a30` border and `arcSize=14`.
- Internal cards and fields use softer borders `#d7e1e3` and muted fills `#f7fafb`.
- Buttons, badges, and checkbox boxes are implemented as simple rounded rectangles with HTML text in `value`.
- Text is exported as HTML fragments inside `value`, but should stay plain text in the internal model.
- Grid size is consistently `10`, so snap-to-grid should use `10` by default.
