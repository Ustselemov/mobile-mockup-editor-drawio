# Manual Test Cases

This document was generated with the assistance of Codex AI and prompted by Ustselemov.

## Case 1: Center-aware drop

1. Create a new empty document.
2. Add a screen.
3. Drag `Button` into the visual center of the screen.
4. Confirm the parent highlight appears.
5. Confirm the center guide appears.
6. Drop the node and confirm it snaps near the center.

## Case 2: Nested container placement

1. Add a `Container` inside a screen.
2. Drag `Field` into the container near its center.
3. Confirm the field snaps toward the container center.
4. Confirm the field remains a child of the container.

## Case 3: Parent-child move consistency

1. Place a button inside a container.
2. Move the container.
3. Confirm the button keeps its local coordinates.
4. Confirm the button moves with the parent.

## Case 4: Toolbar usability

1. Use grouped toolbar actions for project, file, history, view, and arrange tasks.
2. Confirm the key actions remain reachable.
3. Confirm the board status bar reflects zoom and validation state.

## Case 5: Draw.io round-trip

1. Export the current board to Draw.io XML.
2. Re-import it.
3. Confirm the structure still matches the supported subset.

## Case 6: DSL smoke

1. Load a supported DSL example.
2. Generate a screen from it.
3. Confirm the resulting nodes can still be edited manually.
