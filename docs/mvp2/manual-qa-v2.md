# Manual QA V2

This document was generated with the assistance of Codex AI and prompted by Ustselemov.

## Preflight

1. Run `npm install`.
2. Start the editor with `npm run dev` or `start-editor.bat`.
3. Confirm the app shell, palette, layers tree, board, inspector, and status bar are visible.

## Smoke checklist

| Check | Expected result |
| --- | --- |
| App load | No blank screen, no uncaught runtime error |
| Demo reset | `Demo` restores the seeded document |
| Board pan | Right mouse drag, middle mouse drag, and `Space + drag` move the viewport |
| Zoom | `Ctrl/Cmd + wheel` and toolbar controls change zoom |
| Grid toggle | Grid can be hidden and shown from the toolbar |
| Add screen | New screen appears on the board |
| Add nested container | Dragging `Container` onto a screen creates a child of that screen |
| Add nested element | Dragging `Button` or `Field` onto a container creates a child of that container |
| Move container | Child elements visually move with the container |
| Reparent via layers | Dragging a layer row onto another valid parent updates hierarchy without breaking geometry |
| Resize | Selected node resizes and stays clamped to its parent |
| Multi-select | Shift-click and marquee selection both work |
| Align/distribute | Toolbar actions align or distribute selected sibling nodes |
| Lock/hide/order | Layers and inspector actions change node behavior and drawing order |
| Save/load JSON | Exported JSON can be loaded back successfully |
| Draw.io round-trip | Exported `.drawio` imports back without structural breakage on the supported subset |
| Validation summary | Status bar and inspector reflect errors and warnings counts |
| Debug views | Inspector debug tab shows JSON, XML fragment, validation, and unsupported tokens |

## Focused regression path for parenting

1. Reset to `Demo`.
2. Drag `Container` onto the existing screen.
3. Drag `Button` onto that new container.
4. Move the container on the board.
5. Confirm the button keeps the same local coordinates and moves visually with the container.
6. Reparent the container in the layers tree and confirm child attachment remains intact.

## Focused regression path for navigation

1. Pan with the right mouse button.
2. Pan with the middle mouse button.
3. Hold `Space` and drag with the left button.
4. Zoom with `Ctrl/Cmd + wheel`.
5. Use `Fit selection` and `Fit board`.

## Deferred manual checks

- Optional minimap behavior, because no minimap is implemented.
- Visual baseline review, because snapshot baselines are not stored in the repository.
