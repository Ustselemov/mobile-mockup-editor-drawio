import { describe, expect, it } from "vitest";

import { snapRectToSiblingGuides } from "@/lib/geometry/sibling-snap";

describe("snapRectToSiblingGuides", () => {
  it("snaps to sibling horizontal and vertical alignment lines", () => {
    const result = snapRectToSiblingGuides(
      { x: 99, y: 61, width: 100, height: 40 },
      [{ id: "sibling-1", x: 100, y: 60, width: 120, height: 40 }],
      4,
    );

    expect(result.rect.x).toBe(100);
    expect(result.rect.y).toBe(60);
    expect(result.guides).toEqual([
      { orientation: "vertical", position: 100 },
      { orientation: "horizontal", position: 60 },
    ]);
  });

  it("snaps centers when edges are not close", () => {
    const result = snapRectToSiblingGuides(
      { x: 126, y: 32, width: 80, height: 24 },
      [{ id: "sibling-1", x: 100, y: 20, width: 120, height: 40 }],
      6,
    );

    expect(result.rect.x).toBe(120);
    expect(result.rect.y).toBe(28);
    expect(result.guides).toEqual([
      { orientation: "vertical", position: 160 },
      { orientation: "horizontal", position: 40 },
    ]);
  });
});
