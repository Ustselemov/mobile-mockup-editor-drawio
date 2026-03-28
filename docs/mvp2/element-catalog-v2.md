# Element Catalog V2

This document was generated with the assistance of Codex AI and prompted by Ustselemov.

## Scope

This catalog describes the elements that actually exist in the current app snapshot.
Items that are listed in the MVP2 spec but are not implemented yet are marked as deferred.

## Implemented elements

| Element | Purpose | Parent rules | UI support | Import/export |
| --- | --- | --- | --- | --- |
| `flowLane` | Scenario swimlane and top-level structural area | Board only | Palette, board, layers | Imported/exported as `swimlane` vertex |
| `screen` | Mobile screen frame | Board or `flowLane` | Palette, board, layers, inspector | Imported/exported as container-like vertex with title label |
| `container` | Generic section or card | Board, `screen`, `flowLane`, `container` | Palette, board, layers, inspector | Imported/exported as rounded container |
| `field` | Label + value row | Board, `screen`, `flowLane`, `container` | Palette, board, layers, inspector | Imported/exported as composite vertex with label/value children |
| `segmentedControl` | Segmented toggle row | Board, `screen`, `flowLane`, `container` | Palette, board, layers, inspector | Imported/exported as composite vertex with item cells |
| `badge` | Compact status pill | Board, `screen`, `flowLane`, `container` | Palette, board, layers, inspector | Imported/exported as single vertex |
| `banner` | Informational or warning block | Board, `screen`, `flowLane`, `container` | Palette, board, layers, inspector | Imported/exported as composite vertex with title/body children |
| `text` | Plain text block | Board, `screen`, `flowLane`, `container` | Palette, board, layers, inspector, inline edit | Imported/exported as single text vertex |
| `button` | CTA button | Board, `screen`, `flowLane`, `container` | Palette, board, layers, inspector, inline edit | Imported/exported as single vertex |
| `checkbox` | Checkbox row | Board, `screen`, `flowLane`, `container` | Palette, board, layers, inspector, inline edit | Imported/exported as composite vertex with box + label |
| `unsupported` | Fallback for unsupported imports | Board, `screen`, `flowLane`, `container` | Debug only | Preserves raw XML and style metadata |
| `edge` | Orthogonal connector between nodes | Board, `flowLane`, `screen` | Board, layers, inspector/debug | Imported/exported as separate edge element |

## Current palette

The palette currently exposes:

- `Flow lane`
- `Screen`
- `Container`
- `Field`
- `Segmented`
- `Badge`
- `Banner`
- `Text`
- `Button`
- `Checkbox`

## Deferred MVP2 catalog items

These items are part of the MVP2 spec but are not implemented in the current codebase snapshot:

- `input`
- `textarea`
- `radio`
- `switch`
- `divider`
- `icon placeholder`
- `image placeholder`
- `list`
- `list item`
- `top nav`
- `tab bar`
- `empty state`
- `modal`
- `bottom sheet`
- `toast`
- `skeleton group`

## Notes

- `screen` is the primary containment boundary for mobile UI content.
- `flowLane` is a board-level organization primitive and is useful for multi-screen flows.
- `unsupported` nodes are intentional; they prevent silent data loss during import.
