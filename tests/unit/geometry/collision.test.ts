import { describe, expect, it } from "vitest";

import { pushRectOutsideSiblings } from "@/lib/geometry/collision";

describe("pushRectOutsideSiblings", () => {
  it("moves a rect away from an overlapping sibling inside bounds", () => {
    const result = pushRectOutsideSiblings(
      { x: 60, y: 20, width: 80, height: 40 },
      [{ id: "sibling-1", x: 40, y: 20, width: 80, height: 40 }],
      { width: 240, height: 160 },
      10,
    );

    expect(result.shifted).toBe(true);
    expect(result.rect).toEqual({ x: 60, y: 70, width: 80, height: 40 });
  });

  it("keeps a rect in place when there is no overlap", () => {
    const result = pushRectOutsideSiblings(
      { x: 20, y: 20, width: 60, height: 30 },
      [{ id: "sibling-1", x: 120, y: 20, width: 80, height: 40 }],
      { width: 240, height: 160 },
      10,
    );

    expect(result.shifted).toBe(false);
    expect(result.rect).toEqual({ x: 20, y: 20, width: 60, height: 30 });
  });
});
