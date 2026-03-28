import { describe, expect, it } from "vitest";

import { validateDocument } from "@/lib/drawio/validate";
import { createEmptyDocument } from "@/lib/model/defaults";
import { reflowContainerChildren } from "@/lib/layout/reflow";
import { appendNode, createNodeFromPalette } from "@/lib/model/node-utils";
import type {
  ButtonNode,
  ContainerNode,
  ScreenNode,
} from "@/lib/model/document";

function buildLayoutDocument() {
  const document = createEmptyDocument("Layout");
  const screen = createNodeFromPalette("screen", "screen-1", "board", {
    x: 120,
    y: 80,
  }) as ScreenNode;
  appendNode(document, screen);

  const container = createNodeFromPalette("container", "container-2", screen.id, {
    x: 20,
    y: 40,
  }) as ContainerNode;
  container.width = 300;
  container.height = 280;
  appendNode(document, container);

  const first = createNodeFromPalette("button", "button-3", container.id, {
    x: 0,
    y: 0,
  }) as ButtonNode;
  first.width = 180;
  appendNode(document, first);

  const second = createNodeFromPalette("button", "button-4", container.id, {
    x: 0,
    y: 0,
  }) as ButtonNode;
  second.width = 200;
  appendNode(document, second);

  return { document, container, first, second };
}

describe("layout reflow", () => {
  it("reflows children in vstack mode with center alignment", () => {
    const { document, container, first, second } = buildLayoutDocument();
    container.layout = {
      mode: "vstack",
      gap: 12,
      padding: 20,
      align: "center",
    };

    reflowContainerChildren(document, container.id);

    expect(document.nodes[first.id]?.x).toBe(60);
    expect(document.nodes[first.id]?.y).toBe(20);
    expect(document.nodes[second.id]?.x).toBe(50);
    expect(document.nodes[second.id]?.y).toBe(72);
  });

  it("stretches children across the cross axis in hstack mode", () => {
    const { document, container, first, second } = buildLayoutDocument();
    container.layout = {
      mode: "hstack",
      gap: 10,
      padding: 16,
      align: "stretch",
    };

    reflowContainerChildren(document, container.id);

    expect(document.nodes[first.id]?.x).toBe(16);
    expect(document.nodes[first.id]?.y).toBe(16);
    expect(document.nodes[first.id]?.height).toBe(248);
    expect(document.nodes[second.id]?.x).toBe(206);
    expect(document.nodes[second.id]?.height).toBe(248);
  });

  it("reflows children in grid mode across columns and rows", () => {
    const { document, container, first, second } = buildLayoutDocument();
    const third = createNodeFromPalette("button", "button-5", container.id, {
      x: 0,
      y: 0,
    }) as ButtonNode;
    third.width = 120;
    appendNode(document, third);

    const fourth = createNodeFromPalette("button", "button-6", container.id, {
      x: 0,
      y: 0,
    }) as ButtonNode;
    fourth.width = 140;
    appendNode(document, fourth);

    container.layout = {
      mode: "grid",
      gap: 12,
      padding: 20,
      align: "center",
      gridColumns: 2,
    };

    reflowContainerChildren(document, container.id);

    expect(document.nodes[first.id]?.x).toBe(20);
    expect(document.nodes[first.id]?.y).toBe(20);
    expect(document.nodes[second.id]?.x).toBe(212);
    expect(document.nodes[second.id]?.y).toBe(20);
    expect(document.nodes[third.id]?.x).toBe(50);
    expect(document.nodes[third.id]?.y).toBe(72);
    expect(document.nodes[fourth.id]?.x).toBe(242);
    expect(document.nodes[fourth.id]?.y).toBe(72);
  });

  it("reports invalid grid config during validation", () => {
    const { document, container } = buildLayoutDocument();
    container.layout = {
      mode: "grid",
      gap: -4,
      padding: 12,
      align: "start",
      gridColumns: 0,
    };

    const report = validateDocument(document);

    expect(report.errors).toContain("Node container-2 has negative layout gap.");
    expect(report.errors).toContain("Node container-2 has invalid grid column count.");
  });
});
