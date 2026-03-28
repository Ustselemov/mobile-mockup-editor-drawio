import { describe, expect, it } from "vitest";

import { useEditorStore } from "@/core/store/editorStore";
import { createEmptyDocument } from "@/lib/model/defaults";
import { appendNode, createNodeFromPalette } from "@/lib/model/node-utils";
import type { ButtonNode, ContainerNode, ScreenNode } from "@/lib/model/document";

function createScreenDocument() {
  const document = createEmptyDocument("Actions");
  const screen = createNodeFromPalette("screen", "screen-1", "board", {
    x: 120,
    y: 80,
  }) as ScreenNode;
  appendNode(document, screen);
  document.idCounter = 2;
  return { document, screen };
}

function primeStore(document: ReturnType<typeof createEmptyDocument>, selection: string[] = []) {
  useEditorStore.setState((state) => ({
    ...state,
    document,
    selection,
    clipboard: null,
    history: { past: [], future: [] },
    debugMessage: null,
  }));
}

describe("editor actions", () => {
  it("clears subtree selection when a parent is hidden", () => {
    const { document, screen } = createScreenDocument();
    const button = createNodeFromPalette("button", "button-2", screen.id, {
      x: 24,
      y: 36,
    }) as ButtonNode;
    appendNode(document, button);
    document.idCounter = 3;

    primeStore(document, [button.id]);
    useEditorStore.getState().toggleNodeVisibility(screen.id);

    const nextState = useEditorStore.getState();
    expect(nextState.document.nodes[screen.id]?.visible).toBe(false);
    expect(nextState.selection).toEqual([]);
  });

  it("reorders sibling nodes inside the same parent", () => {
    const { document, screen } = createScreenDocument();
    const first = createNodeFromPalette("button", "button-2", screen.id, {
      x: 20,
      y: 40,
    }) as ButtonNode;
    const second = createNodeFromPalette("button", "button-3", screen.id, {
      x: 20,
      y: 100,
    }) as ButtonNode;
    appendNode(document, first);
    appendNode(document, second);
    document.idCounter = 4;

    primeStore(document, [first.id]);
    useEditorStore.getState().reorderNode(first.id, "forward");

    const nextState = useEditorStore.getState();
    const nextScreen = nextState.document.nodes[screen.id] as ScreenNode;
    expect(nextScreen.children).toEqual([second.id, first.id]);
    expect(nextState.document.nodes[first.id]?.zIndex).toBe(1);
  });

  it("aligns sibling nodes to the same left edge", () => {
    const { document, screen } = createScreenDocument();
    const first = createNodeFromPalette("button", "button-2", screen.id, {
      x: 24,
      y: 40,
    }) as ButtonNode;
    const second = createNodeFromPalette("button", "button-3", screen.id, {
      x: 132,
      y: 120,
    }) as ButtonNode;
    appendNode(document, first);
    appendNode(document, second);
    document.idCounter = 4;

    primeStore(document, [first.id, second.id]);
    useEditorStore.getState().alignSelection("left");

    const nextState = useEditorStore.getState();
    expect(nextState.document.nodes[first.id]?.x).toBe(20);
    expect(nextState.document.nodes[second.id]?.x).toBe(20);
  });

  it("distributes sibling nodes horizontally across the occupied span", () => {
    const { document, screen } = createScreenDocument();
    const first = createNodeFromPalette("button", "button-2", screen.id, {
      x: 0,
      y: 40,
    }) as ButtonNode;
    const second = createNodeFromPalette("button", "button-3", screen.id, {
      x: 60,
      y: 40,
    }) as ButtonNode;
    const third = createNodeFromPalette("button", "button-4", screen.id, {
      x: 200,
      y: 40,
    }) as ButtonNode;
    first.width = 40;
    second.width = 40;
    third.width = 40;
    appendNode(document, first);
    appendNode(document, second);
    appendNode(document, third);
    document.idCounter = 5;

    primeStore(document, [first.id, second.id, third.id]);
    useEditorStore.getState().distributeSelection("horizontal");

    const nextState = useEditorStore.getState();
    expect(nextState.document.nodes[first.id]?.x).toBe(0);
    expect(nextState.document.nodes[second.id]?.x).toBe(100);
    expect(nextState.document.nodes[third.id]?.x).toBe(200);
  });

  it("preserves parent-center snapping even when grid snap is enabled", () => {
    const { document, screen } = createScreenDocument();
    const container = createNodeFromPalette("container", "container-2", screen.id, {
      x: 20,
      y: 72,
    }) as ContainerNode;
    container.width = 320;
    container.height = 126;
    appendNode(document, container);
    document.idCounter = 3;

    primeStore(document, [container.id]);
    useEditorStore.getState().moveNode(container.id, 20, 312);

    const nextState = useEditorStore.getState();
    expect(nextState.document.nodes[container.id]?.x).toBe(20);
    expect(nextState.document.nodes[container.id]?.y).toBe(317);
  });
});
