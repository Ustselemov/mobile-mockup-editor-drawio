# Acceptance Checklist

This document was generated with the assistance of Codex AI and prompted by Ustselemov.

This checklist describes the target MVP3 acceptance bar. It is not, by itself, proof that every item is already implemented.

## Editor core

- app shell loads without runtime crash
- board pan, zoom, and fit actions work
- screen creation works
- component add, drag, resize, and reparent work
- parent-child movement stays correct
- center guide appears during placement inside a parent

## Model integrity

- no orphan nodes after move, reparent, or delete
- JSON save/load works
- undo/redo works
- selection state stays consistent

## Interoperability

- supported Draw.io import works
- supported Draw.io export opens in diagrams.net
- unsupported cases are reported clearly

## MVP3 scope

- layout engine supports the documented modes
- DSL parsing and generation work for the supported subset
- variant expansion works with guardrails
- template packs exist for the target app families
- diagnostics are visible in the UI

## Documentation

- current-state audit exists
- architecture doc exists
- component catalog exists
- DSL spec exists
- Draw.io mapping spec exists
- known limitations are documented honestly
