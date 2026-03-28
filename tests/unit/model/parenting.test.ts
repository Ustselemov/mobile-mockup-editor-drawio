import { describe, expect, it } from "vitest";

import { useEditorStore } from "@/core/store/editorStore";
import { createEmptyDocument } from "@/lib/model/defaults";
import { appendNode, createNodeFromPalette } from "@/lib/model/node-utils";
import { findBestParentForAbsoluteRect } from "@/lib/model/placement";
import type { ButtonNode, ContainerNode, ScreenNode } from "@/lib/model/document";

function buildScreenWithContainer() {
  const document = createEmptyDocument("Parenting");

  const screen = createNodeFromPalette("screen", "screen-1", "board", {
    x: 120,
    y: 80,
  }) as ScreenNode;
  appendNode(document, screen);

  const container = createNodeFromPalette("container", "container-2", screen.id, {
    x: 20,
    y: 72,
  }) as ContainerNode;
  container.width = 280;
  container.height = 160;
  appendNode(document, container);

  document.idCounter = 3;
  return { document, screen, container };
}

describe("parenting behavior", () => {
  it("finds the deepest valid parent for a node rect", () => {
    const { document, screen, container } = buildScreenWithContainer();

    const parentId = findBestParentForAbsoluteRect(
      document,
      "button",
      {
        x: screen.x + 32,
        y: screen.y + 98,
        width: 220,
        height: 40,
      },
      { preferredParentId: screen.id },
    );

    expect(parentId).toBe(container.id);
  });

  it("auto-parents a new node into the container it is placed inside", () => {
    const { document, screen, container } = buildScreenWithContainer();
    useEditorStore.setState({
      document,
      selection: [],
      history: { past: [], future: [] },
      debugMessage: null,
    });

    const createdId = useEditorStore.getState().addNode("button", screen.id, {
      x: 32,
      y: 98,
    });
    const nextState = useEditorStore.getState();
    const createdNode = createdId ? nextState.document.nodes[createdId] : null;

    expect(createdId).toBeTruthy();
    expect(createdNode?.parentId).toBe(container.id);
    expect((nextState.document.nodes[container.id] as ContainerNode).children).toContain(createdId);
  });

  it("reparents a moved node when a new parent is explicitly provided", () => {
    const { document, screen, container } = buildScreenWithContainer();
    const button = createNodeFromPalette("button", "button-3", screen.id, {
      x: 36,
      y: 24,
    }) as ButtonNode;
    appendNode(document, button);
    document.idCounter = 4;

    useEditorStore.setState({
      document,
      selection: [],
      history: { past: [], future: [] },
      debugMessage: null,
    });

    useEditorStore.getState().moveNode(button.id, button.x, 96, container.id);
    const nextState = useEditorStore.getState();
    const movedButton = nextState.document.nodes[button.id] as ButtonNode;

    expect(movedButton.parentId).toBe(container.id);
    expect((nextState.document.nodes[container.id] as ContainerNode).children).toContain(button.id);
    expect((nextState.document.nodes[screen.id] as ScreenNode).children).not.toContain(button.id);
  });
});
