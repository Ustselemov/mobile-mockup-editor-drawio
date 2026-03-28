# Universal Component Catalog

This document was generated with the assistance of Codex AI and prompted by Ustselemov.

## Current implemented set

### Structure

- `screen`
- `container`
- `flowLane`

### Content and form

- `text`
- `field`
- `button`
- `checkbox`
- `segmentedControl`
- `badge`
- `banner`

### Interop and fallback

- `edge`
- `unsupported`

## MVP3 catalog target

### Navigation

- `header`
- `searchBar`
- `tabs`
- `bottomTabBar`

### Form

- `input`
- `textArea`
- `radio`
- `switch`
- `helperText`

### Content

- `card`
- `list`
- `listItem`
- `productRow`
- `chatBubble`
- `emptyState`
- `imagePlaceholder`
- `iconPlaceholder`

### System

- `modal`
- `bottomSheet`
- `toast`
- `dialog`
- `tooltip`

## Component contract

Every catalog entry should define:

- JSON node type
- supported properties
- renderer behavior
- inspector controls
- Draw.io mapping
- DSL syntax

## Catalog rules

- prefer reusable primitives over ad hoc shapes
- keep property names stable
- keep defaults deterministic
- map unsupported imports to explicit fallback nodes
- keep generated content editable in the manual editor
