import { describe, expect, it } from "vitest";

import { clampRectToBounds } from "@/lib/geometry/bounds";
import { snapValue } from "@/lib/geometry/snap";

describe("geometry helpers", () => {
  it("snaps values to the configured grid", () => {
    expect(snapValue(23, 10, true)).toBe(20);
    expect(snapValue(27, 10, true)).toBe(30);
    expect(snapValue(27, 10, false)).toBe(27);
  });

  it("clamps child rects to parent bounds", () => {
    expect(
      clampRectToBounds(
        { x: -20, y: 40, width: 120, height: 80 },
        { width: 100, height: 100 },
      ),
    ).toEqual({
      x: 0,
      y: 20,
      width: 100,
      height: 80,
    });
  });
});
