import { describe, expect, it } from "vitest";

import { universalArtifactPresets } from "@/core/demo/universalArtifactPresets";

describe("universalArtifactPresets", () => {
  it("covers the required starter artifact groups for the V5 alpha pass", () => {
    const groups = new Set(universalArtifactPresets.map((item) => item.group));

    expect(groups.has("Frames")).toBe(true);
    expect(groups.has("Flowchart")).toBe(true);
    expect(groups.has("Architecture")).toBe(true);
    expect(groups.has("Tree / Mind")).toBe(true);
    expect(groups.has("Whiteboard")).toBe(true);
  });

  it("includes desktop and generic frames", () => {
    expect(universalArtifactPresets.some((item) => item.id === "desktopFrame")).toBe(true);
    expect(universalArtifactPresets.some((item) => item.id === "genericFrame")).toBe(true);
  });
});
