# DSL V1 Spec

This document was generated with the assistance of Codex AI and prompted by Ustselemov.

## Scope

DSL v1 is a text format for generating screens, components, and variant-ready layouts into the same typed JSON model used by the editor.

## Pipeline

```text
DSL source -> tokenizer -> parser -> AST -> model mapper -> JSON document -> renderer
```

## Syntax rules

- indentation defines nesting
- one statement per line
- `key:value` pairs define properties
- quoted strings preserve spaces
- arrays are written as `[a, b, c]`
- comments use `#`

## Core directives

- `project`
- `tokens`
- `screen`
- `section`
- `component`
- `variant`
- `generate`
- `connect`

## Example nodes

```txt
screen ProductPage preset:iphone15
  section Info layout:vstack gap:8
    text value:"Sony XM5"
    button variant:primary text:"Buy now" width:240 height:44
```

## AST contract

The parser must emit:

- document metadata
- screen nodes
- component nodes
- layout metadata
- variant definitions
- connector references
- diagnostics with line numbers

## Validation rules

- unknown directive names must be reported
- invalid nesting must be reported
- missing required fields must be reported
- unsupported component names must be reported
- parse errors must include line and column

## Mapping contract

- DSL maps to the internal JSON model first
- Draw.io XML is only produced after model generation
- generated output must remain editable in the manual editor
