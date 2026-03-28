import { describe, expect, it } from "vitest";

import { htmlToPlainText, textStyleToHtml } from "@/lib/drawio/text";
import { textStyles } from "@/lib/model/defaults";

describe("drawio text helpers", () => {
  it("serializes text into styled html", () => {
    const html = textStyleToHtml('Dose < 5 & "confirm"', textStyles.body);

    expect(html).toContain("<div");
    expect(html).toContain("font-size:11px");
    expect(html).toContain("Dose &lt; 5 &amp; &quot;confirm&quot;");
  });

  it("extracts plain text from draw.io html fragments", () => {
    const html =
      '<div style="font-size:11px;font-family:Helvetica;color:#1f2b2d;">Dose &lt; 5 &amp; confirm &gt; 1</div>';

    expect(htmlToPlainText(html)).toBe("Dose < 5 & confirm > 1");
  });
});
