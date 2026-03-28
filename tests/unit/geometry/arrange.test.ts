import { describe, expect, it } from "vitest";

import { alignRects, distributeRects } from "@/lib/geometry/arrange";

describe("arrange geometry helpers", () => {
  it("aligns rectangles to the same left edge", () => {
    const result = alignRects(
      [
        { id: "a", x: 20, y: 10, width: 40, height: 20 },
        { id: "b", x: 90, y: 80, width: 60, height: 30 },
      ],
      "left",
    );

    expect(result.a).toEqual({ x: 20, y: 10 });
    expect(result.b).toEqual({ x: 20, y: 80 });
  });

  it("aligns rectangles to the same vertical middle", () => {
    const result = alignRects(
      [
        { id: "a", x: 10, y: 20, width: 60, height: 20 },
        { id: "b", x: 80, y: 70, width: 60, height: 40 },
      ],
      "middle",
    );

    expect(result.a.y).toBe(55);
    expect(result.b.y).toBe(45);
  });

  it("distributes rectangles horizontally across the occupied span", () => {
    const result = distributeRects(
      [
        { id: "a", x: 0, y: 10, width: 40, height: 20 },
        { id: "b", x: 60, y: 10, width: 40, height: 20 },
        { id: "c", x: 200, y: 10, width: 40, height: 20 },
      ],
      "horizontal",
    );

    expect(result.a).toEqual({ x: 0, y: 10 });
    expect(result.b).toEqual({ x: 100, y: 10 });
    expect(result.c).toEqual({ x: 200, y: 10 });
  });
});
