import { describe, expect, it } from "vitest";

import { validateDocument } from "@/lib/drawio/validate";
import { createEmptyDocument } from "@/lib/model/defaults";
import { appendNode, createNodeFromPalette } from "@/lib/model/node-utils";
import type { ButtonNode, ContainerNode, ScreenNode } from "@/lib/model/document";

describe("document validation", () => {
  it("reports parent-child reference mismatches", () => {
    const document = createEmptyDocument("Validation");
    const screen = createNodeFromPalette("screen", "screen-1", "board", {
      x: 0,
      y: 0,
    }) as ScreenNode;
    appendNode(document, screen);

    const button = createNodeFromPalette("button", "button-2", screen.id, {
      x: 20,
      y: 20,
    }) as ButtonNode;
    appendNode(document, button);
    screen.children = [];

    const report = validateDocument(document);

    expect(report.errors).toContain("Node button-2 is missing from parent screen-1 children.");
  });

  it("reports cycles without overflowing the call stack", () => {
    const document = createEmptyDocument("Cycles");
    const screen = createNodeFromPalette("screen", "screen-1", "board", {
      x: 0,
      y: 0,
    }) as ScreenNode;
    appendNode(document, screen);

    const container = createNodeFromPalette("container", "container-2", screen.id, {
      x: 20,
      y: 20,
    }) as ContainerNode;
    appendNode(document, container);
    container.children.push(container.id);

    const report = validateDocument(document);

    expect(report.errors).toContain("Node container-2 participates in a cycle.");
  });
});
