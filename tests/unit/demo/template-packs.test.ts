import { describe, expect, it } from "vitest";

import { appendNode, createNodeFromPalette } from "@/lib/model/node-utils";
import { createEmptyDocument } from "@/lib/model/defaults";
import type { EditorDocument, NodeId } from "@/lib/model/document";
import {
  insertTemplateDefinition,
  templatePackItems,
} from "@/core/demo/templatePacks";

function buildInsertionContext(document: EditorDocument) {
  let nextCounter = 1;
  let lastSelection: NodeId[] = [];

  return {
    document,
    selection: [] as NodeId[],
    addNode: (type: Parameters<typeof createNodeFromPalette>[0], parentId: string, position: { x: number; y: number }) => {
      const id = `${type}-${nextCounter++}`;
      const node = createNodeFromPalette(type, id, parentId as never, position);
      appendNode(document, node);
      return id;
    },
    updateNode: (nodeId: NodeId, patch: Record<string, unknown>) => {
      document.nodes[nodeId] = {
        ...document.nodes[nodeId],
        ...patch,
      } as never;
    },
    setSelection: (nodeIds: NodeId[]) => {
      lastSelection = [...nodeIds];
      document.meta.warnings = [...document.meta.warnings];
    },
    addTemplateScreen: () => null,
    getSelection: () => lastSelection,
  };
}

describe("template packs", () => {
  it("exposes top-10 domain packs with screen and section templates", () => {
    expect(templatePackItems).toHaveLength(10);
    expect(templatePackItems.every((pack) => pack.templates.length >= 2)).toBe(true);
    expect(
      templatePackItems.some((pack) =>
        pack.templates.some((template) => template.scope === "screen"),
      ),
    ).toBe(true);
    expect(
      templatePackItems.some((pack) =>
        pack.templates.some((template) => template.scope === "section"),
      ),
    ).toBe(true);
  });

  it("inserts section templates into the selected screen parent", () => {
    const document = createEmptyDocument("Templates");
    const screen = createNodeFromPalette("screen", "screen-1", "board", {
      x: 120,
      y: 100,
    });
    appendNode(document, screen);

    const selectedText = createNodeFromPalette("text", "text-2", screen.id, {
      x: 20,
      y: 20,
    });
    appendNode(document, selectedText);

    const sectionTemplate = templatePackItems
      .flatMap((pack) => pack.templates)
      .find((template) => template.id === "ecommerce-checkout-section");

    expect(sectionTemplate).toBeTruthy();
    if (!sectionTemplate) {
      return;
    }

    const context = buildInsertionContext(document);
    context.selection = [selectedText.id];
    const createdRootId = insertTemplateDefinition(sectionTemplate, context);

    expect(createdRootId).toBeTruthy();
    expect(createdRootId).not.toBe(selectedText.id);
    expect(document.nodes[createdRootId ?? ""]?.parentId).toBe(screen.id);
    expect(document.nodes[screen.id] && "children" in document.nodes[screen.id]).toBe(true);
    if (createdRootId && "children" in document.nodes[createdRootId]) {
      expect(document.nodes[createdRootId].children.length).toBeGreaterThan(0);
    }
  });
});
