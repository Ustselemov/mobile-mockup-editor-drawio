import { describe, expect, it } from "vitest";

import { snapRectToParentCenter } from "@/lib/geometry/center-snap";

describe("center snap", () => {
  it("snaps both axes when the node is close to the parent center", () => {
    const result = snapRectToParentCenter(
      {
        x: 84,
        y: 44,
        width: 40,
        height: 20,
      },
      {
        width: 200,
        height: 100,
      },
      8,
    );

    expect(result.rect.x).toBe(80);
    expect(result.rect.y).toBe(40);
    expect(result.snappedX).toBe(true);
    expect(result.snappedY).toBe(true);
    expect(result.guides).toEqual([
      { orientation: "vertical", position: 100 },
      { orientation: "horizontal", position: 50 },
    ]);
  });

  it("does not snap when the node is outside the threshold", () => {
    const result = snapRectToParentCenter(
      {
        x: 20,
        y: 20,
        width: 40,
        height: 20,
      },
      {
        width: 200,
        height: 100,
      },
      6,
    );

    expect(result.rect).toEqual({
      x: 20,
      y: 20,
      width: 40,
      height: 20,
    });
    expect(result.guides).toEqual([]);
    expect(result.snappedX).toBe(false);
    expect(result.snappedY).toBe(false);
  });
});
