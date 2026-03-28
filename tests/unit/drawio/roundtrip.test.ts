import { describe, expect, it } from "vitest";

import { createDemoDocument } from "@/core/demo/demoDocument";
import { parseDrawioXml } from "@/lib/drawio/parseDrawio";
import { serializeDrawioXml } from "@/lib/drawio/serializeDrawio";
import { validateDocument } from "@/lib/drawio/validate";

describe("drawio round-trip", () => {
  it("serializes the demo document into valid draw.io xml", () => {
    const xml = serializeDrawioXml(createDemoDocument());

    expect(xml).toContain("<mxfile>");
    expect(xml).toContain("Proceed to payment");
    expect(xml).toContain("mxGraphModel");
    expect(xml).toContain('id="node-4__label"');
    expect(xml).toContain('id="node-4__value"');
    expect(xml).toContain('id="edge-11"');
    expect(xml).toContain("edgeStyle=orthogonalEdgeStyle");
    expect(xml).toContain("strokeWidth=5");
  });

  it("parses exported xml back into an editable document", () => {
    const xml = serializeDrawioXml(createDemoDocument());
    const imported = parseDrawioXml(xml, "demo.drawio");
    const report = validateDocument(imported);
    const fieldNode = Object.values(imported.nodes).find((node) => node.type === "field");
    const screenNode = Object.values(imported.nodes).find((node) => node.type === "screen");

    expect(imported.meta.source).toBe("imported-drawio");
    expect(Object.keys(imported.nodes)).toHaveLength(10);
    expect(fieldNode).toMatchObject({
      type: "field",
      label: "Pickup point",
      value: "Yekaterinburg, Vostochnaya 7A",
    });
    expect(screenNode).toMatchObject({
      type: "screen",
      title: "Checkout",
    });
    expect(imported.edgeIds).toEqual(["edge-11"]);
    expect(imported.edges["edge-11"]).toMatchObject({
      sourceId: "node-4",
      targetId: "node-5",
      orthogonal: true,
      endArrow: "classic",
      strokeWidth: 5,
    });
    expect(Object.keys(imported.nodes).some((id) => id.includes("__label"))).toBe(false);
    expect(report.errors).toEqual([]);
  });
});
