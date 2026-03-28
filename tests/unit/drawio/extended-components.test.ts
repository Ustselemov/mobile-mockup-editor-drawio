import { describe, expect, it } from "vitest";

import { createEmptyDocument } from "@/lib/model/defaults";
import { appendNode, createNodeFromPalette } from "@/lib/model/node-utils";
import { parseDrawioXml } from "@/lib/drawio/parseDrawio";
import { serializeDrawioXml } from "@/lib/drawio/serializeDrawio";
import type {
  BadgeNode,
  BannerNode,
  ScreenNode,
  SegmentedControlNode,
} from "@/lib/model/document";

describe("drawio extended components", () => {
  it("round-trips segmented control, badge, and banner", () => {
    const document = createEmptyDocument("Extended");
    const screen = createNodeFromPalette("screen", "screen-1", "board", {
      x: 160,
      y: 80,
    }) as ScreenNode;
    screen.title = "Extended";
    appendNode(document, screen);

    const segmented = createNodeFromPalette("segmentedControl", "segmented-2", screen.id, {
      x: 20,
      y: 24,
    }) as SegmentedControlNode;
    segmented.items = ["One", "Two", "Three"];
    segmented.activeIndex = 1;
    segmented.width = 300;
    appendNode(document, segmented);

    const badge = createNodeFromPalette("badge", "badge-3", screen.id, {
      x: 20,
      y: 70,
    }) as BadgeNode;
    badge.text = "Ready";
    appendNode(document, badge);

    const banner = createNodeFromPalette("banner", "banner-4", screen.id, {
      x: 20,
      y: 110,
    }) as BannerNode;
    banner.title = "Heads up";
    banner.body = "Review the data before submitting.";
    appendNode(document, banner);
    document.idCounter = 5;

    const xml = serializeDrawioXml(document);
    const imported = parseDrawioXml(xml, "extended.drawio");

    expect(imported.nodes["segmented-2"]).toMatchObject({
      type: "segmentedControl",
      items: ["One", "Two", "Three"],
      activeIndex: 1,
    });
    expect(imported.nodes["badge-3"]).toMatchObject({
      type: "badge",
      text: "Ready",
    });
    expect(imported.nodes["banner-4"]).toMatchObject({
      type: "banner",
      title: "Heads up",
      body: "Review the data before submitting.",
    });
  });
});
