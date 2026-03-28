import { describe, expect, it } from "vitest";

import { createEmptyDocument } from "@/lib/model/defaults";
import { appendNode, createNodeFromPalette } from "@/lib/model/node-utils";
import { parseDrawioXml } from "@/lib/drawio/parseDrawio";
import { serializeDrawioXml } from "@/lib/drawio/serializeDrawio";
import type { TextNode } from "@/lib/model/document";

describe("drawio text escaping", () => {
  it("preserves plain text with XML-sensitive characters through round-trip", () => {
    const document = createEmptyDocument("Escaping");
    const textNode = createNodeFromPalette("text", "node-1", "board", {
      x: 40,
      y: 50,
    }) as TextNode;
    textNode.text = "Dose < 5 & confirm > 1";
    appendNode(document, textNode);
    document.idCounter = 2;

    const xml = serializeDrawioXml(document);
    const imported = parseDrawioXml(xml, "escaping.drawio");
    const importedText = imported.nodes["node-1"];

    expect(importedText).toMatchObject({
      type: "text",
      text: "Dose < 5 & confirm > 1",
    });
  });
});
