import { describe, expect, it } from "vitest";

import { parseStyle, serializeStyle } from "@/lib/drawio/style";

describe("drawio style helpers", () => {
  it("parses style strings into key-value objects", () => {
    expect(
      parseStyle("rounded=1;fillColor=#fff;strokeColor=#000;container=1;"),
    ).toEqual({
      rounded: "1",
      fillColor: "#fff",
      strokeColor: "#000",
      container: "1",
    });
  });

  it("serializes style objects deterministically", () => {
    expect(
      serializeStyle({
        strokeColor: "#000",
        rounded: 1,
        fillColor: "#fff",
      }),
    ).toBe("fillColor=#fff;rounded=1;strokeColor=#000;");
  });
});
