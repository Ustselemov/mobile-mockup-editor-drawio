# Draw.io Mapping Spec

This document was generated with the assistance of Codex AI and prompted by Ustselemov.

## Supported subset

- `mxfile`
- `diagram`
- `mxGraphModel`
- `mxCell`
- `mxGeometry`
- vertex cells
- edge cells
- rounded containers
- swimlane-like containers
- orthogonal connectors
- a controlled set of style keys

## Current behavior

- import maps supported cells into typed JSON nodes
- unsupported shapes become explicit fallback nodes
- warnings are preserved in document metadata
- export emits deterministic minimal XML

## Mapping rules

- `screen` maps to a top-level container cell
- `container` maps to a rounded vertex cell
- `flowLane` maps to a swimlane-like cell
- `text`, `button`, `checkbox`, `field`, `badge`, `banner` map to styled vertex cells
- `edge` maps to a connector cell with orthogonal routing when requested

## Geometry contract

- `mxGeometry.x/y/width/height` map to local coordinates
- parent-child hierarchy must be preserved
- relative positions are restored on import
- export order should be deterministic

## Style contract

Supported style data includes:

- fill and stroke colors
- stroke width
- corner radius
- text alignment
- font weight and size when available

## Import reporting

Import should classify results as:

- exact
- approximated
- unsupported
- intentionally ignored

## Non-negotiable rule

Draw.io XML is an exchange format only. The editor must continue to use typed JSON as primary state.
