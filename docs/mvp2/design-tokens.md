# Design Tokens V2

This document was generated with the assistance of Codex AI and prompted by Ustselemov.

## Scope

The current project uses a small, explicit token set defined in code.
These are the tokens that exist today in `src/lib/model/defaults.ts` and related node factories.

## Typography

| Token | Value | Use |
| --- | --- | --- |
| `fontFamily.default` | `Helvetica, Arial, sans-serif` | Primary UI font stack |
| `font.body` | `11px / 400 / 1.2 / #1f2b2d` | Body text |
| `font.bodyStrong` | `11px / 700 / 1.2 / #1f2b2d` | Strong body text |
| `font.sectionTitle` | `9px / 700 / 1.2 / #66757a` | Section labels |
| `font.cta` | `11px / 700 / 1.2 / #1f2b2d` | Button text |
| `font.caption` | `10px / 400 / 1.2 / #66757a` | Secondary copy |

## Colors

| Token | Value | Use |
| --- | --- | --- |
| `surface.screen` | `#ffffff` | Screen fill |
| `surface.subtle` | `#f7fafb` | Container / field fill |
| `surface.header` | `#eef5f4` | Lane and toolbar tint |
| `border.neutral` | `#d7e1e3` | Default borders |
| `border.screen` | `#1c2a30` | Screen outline |
| `accent.teal` | `#0f766e` | Active / selection accent |
| `success.fill` | `#d5e8d4` | Positive button / badge background |
| `success.stroke` | `#82b366` | Positive border |
| `warning.fill` | `#ffe6cc` | Warning banner fill |
| `warning.stroke` | `#d79b00` | Warning banner border |
| `info.fill` | `#eef6fb` | Informational banner fill |
| `info.stroke` | `#9bc4e2` | Informational banner border |
| `badge.info.fill` | `#dae8fc` | Default badge background |
| `badge.info.stroke` | `#6c8ebf` | Default badge border |
| `badge.code.fill` | `#f5f5f5` | Code badge background |
| `badge.status.fill` | `#fff2cc` | Status badge background |
| `placeholder.fill` | `#e3ebed` | Placeholder / skeleton tone |

## Shape

| Token | Value | Use |
| --- | --- | --- |
| `radius.xs` | `6` | Checkbox box |
| `radius.sm` | `8` | Small surfaces |
| `radius.md` | `9` | Badge |
| `radius.lg` | `10` | Container / field |
| `radius.xl` | `12` | Segmented control |
| `radius.2xl` | `14` | Screen / button |
| `radius.3xl` | `16` | Banner |

## Layout

| Token | Value | Use |
| --- | --- | --- |
| `gridSize` | `10` | Board grid and snap spacing |
| `screen.defaultWidth` | `360` | Default screen width |
| `screen.defaultHeight` | `760` | Default screen height |
| `flowLane.width` | `980` | Default lane width |
| `flowLane.height` | `920` | Default lane height |

## Component defaults

| Component | Default values |
| --- | --- |
| `screen` | white fill, dark stroke, radius 14, clip children enabled |
| `container` | subtle fill, neutral border, radius 10, padding 12 |
| `field` | subtle fill, neutral border, radius 10 |
| `segmentedControl` | white fill, neutral border, active teal segment |
| `badge` | blue info palette by default |
| `banner` | warning palette by default |
| `button` | success palette by default |
| `checkbox` | white fill, teal stroke |

## Notes

- These tokens are intentionally small and explicit.
- The app does not yet have a separate token registry or theme editor.
- Imported Draw.io styles are mapped to the closest existing token values and preserved in metadata when they cannot be expressed directly.
