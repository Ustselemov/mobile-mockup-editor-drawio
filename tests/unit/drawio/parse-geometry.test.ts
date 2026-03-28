import { describe, expect, it } from "vitest";

import { parseDrawioXml } from "@/lib/drawio/parseDrawio";

describe("drawio geometry parsing", () => {
  it("maps mxGeometry coordinates into node bounds", () => {
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
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;

    const document = parseDrawioXml(xml, "geometry.drawio");
    const screen = document.nodes["screen-1"];

    expect(screen).toMatchObject({
      type: "screen",
      x: 120,
      y: 80,
      width: 360,
      height: 760,
    });
  });
});
