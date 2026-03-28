import { describe, expect, it } from "vitest";

import { parseDrawioXml } from "@/lib/drawio/parseDrawio";
import { validateDocument } from "@/lib/drawio/validate";

describe("drawio edge parents", () => {
  it("normalizes imported edges with invalid parent to board", () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<mxfile>
  <diagram id="d1" name="Page-1">
    <mxGraphModel>
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
        <mxCell id="screen-1" value="" vertex="1" parent="1" style="rounded=1;html=1;fillColor=#ffffff;strokeColor=#1c2a30;strokeWidth=2;arcSize=14;container=1;">
          <mxGeometry x="120" y="80" width="360" height="760" as="geometry" />
        </mxCell>
        <mxCell id="container-2" value="" vertex="1" parent="screen-1" style="rounded=1;html=1;fillColor=#f7fafb;strokeColor=#d7e1e3;strokeWidth=1;arcSize=10;container=1;">
          <mxGeometry x="20" y="20" width="200" height="120" as="geometry" />
        </mxCell>
        <mxCell id="button-3" value="Continue" vertex="1" parent="screen-1" style="rounded=1;html=1;fillColor=#d5e8d4;strokeColor=#82b366;strokeWidth=1;arcSize=14;">
          <mxGeometry x="20" y="200" width="160" height="40" as="geometry" />
        </mxCell>
        <mxCell id="edge-4" edge="1" parent="container-2" source="screen-1" target="button-3" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeWidth=5;strokeColor=#000000;endArrow=classic;endFill=1;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;

    const document = parseDrawioXml(xml, "edge-parent.drawio");
    const report = validateDocument(document);

    expect(document.edges["edge-4"]?.parentId).toBe("board");
    expect(document.meta.warnings).toContain(
      "Edge edge-4 had invalid parent and was moved to board.",
    );
    expect(report.errors).toEqual([]);
  });
});
