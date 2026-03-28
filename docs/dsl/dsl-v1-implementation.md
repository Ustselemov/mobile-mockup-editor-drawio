# DSL V1 Implementation

This document was generated with the assistance of Codex AI and prompted by Ustselemov.

The editor now includes a minimal but real DSL v1 slice:

- lower panel source editor
- live parse and validation diagnostics
- generation into the existing JSON model
- support for `screen`, `section`/`container`, `text`, `button`, `field`, `badge`, and `checkbox`
- support for `layout`, `align`, `gap`, `padding`, sizing, and common style properties

## Example

```txt
project name:"Checkout flow"
screen Checkout preset:iphone15
  section Address layout:vstack gap:8
    field label:"Address" value:"Yekaterinburg"
    checkbox text:"Save address" checked:true
  section Actions layout:hstack gap:8
    button variant:secondary text:"Back"
    button variant:primary text:"Continue"
```

## Intentionally not supported yet

- full `chatBubble` modeling
- variant expansion
- `grid` layout mode
- full template pack authoring
- connector generation

Unsupported directives are reported in diagnostics rather than being silently ignored.

