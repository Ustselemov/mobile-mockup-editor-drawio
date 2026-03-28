import { describe, expect, it } from "vitest";

import { parseDrawioXml } from "@/lib/drawio/parseDrawio";

describe("unsupported drawio import", () => {
  it("preserves unsupported shapes as unsupported nodes with warnings", () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<mxfile>
  <diagram id="d1" name="Page-1">
    <mxGraphModel>
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
        <mxCell id="cloud-1" value="" style="shape=cloud;fillColor=#fffaf0;strokeColor=#c49102;" vertex="1" parent="1">
          <mxGeometry x="20" y="30" width="220" height="100" as="geometry" />
        </mxCell>
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;

    const document = parseDrawioXml(xml, "unsupported.drawio");
    const node = document.nodes["cloud-1"];

    expect(node?.type).toBe("unsupported");
    expect(document.meta.unsupportedCount).toBe(1);
    expect(document.meta.unsupportedTokens).toContain("shape");
    expect(document.meta.warnings[0]).toContain("Unsupported vertex");
  });
});
