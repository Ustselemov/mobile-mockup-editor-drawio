import { describe, expect, it } from "vitest";

import { createEmptyDocument } from "@/lib/model/defaults";
import { appendNode, createNodeFromPalette } from "@/lib/model/node-utils";
import { absoluteToLocal, getAbsolutePosition } from "@/lib/geometry/coords";
import type { ContainerNode, ScreenNode, TextNode } from "@/lib/model/document";

describe("reparent coordinate conversion", () => {
  it("converts absolute coordinates into local parent space", () => {
    const document = createEmptyDocument();

    const screen = createNodeFromPalette("screen", "screen-1", "board", {
      x: 100,
      y: 120,
    }) as ScreenNode;
    appendNode(document, screen);

    const container = createNodeFromPalette("container", "container-2", screen.id, {
      x: 24,
      y: 40,
    }) as ContainerNode;
    appendNode(document, container);

    const text = createNodeFromPalette("text", "text-3", screen.id, {
      x: 60,
      y: 80,
    }) as TextNode;
    appendNode(document, text);

    const absolute = getAbsolutePosition(document, text.id);
    const localToContainer = absoluteToLocal(document, container.id, absolute);

    expect(absolute).toEqual({ x: 160, y: 200 });
    expect(localToContainer).toEqual({ x: 36, y: 40 });
  });
});
