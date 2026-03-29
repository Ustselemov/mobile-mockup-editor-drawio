import type { CenterGuide } from "@/lib/geometry/center-snap";

type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type SiblingRect = Rect & {
  id: string;
};

type AnchorCandidate = {
  position: number;
  resolve: (line: number) => number;
};

type SnapCandidate = {
  nextValue: number;
  guide: CenterGuide;
  delta: number;
};

function getRectAnchors(
  value: number,
  size: number,
): AnchorCandidate[] {
  return [
    { position: value, resolve: (line) => line },
    { position: value + size / 2, resolve: (line) => line - size / 2 },
    { position: value + size, resolve: (line) => line - size },
  ];
}

function getSiblingLines(value: number, size: number): number[] {
  return [value, value + size / 2, value + size];
}

function getBestSnapCandidate(
  rectAnchors: AnchorCandidate[],
  siblingLines: number[],
  orientation: CenterGuide["orientation"],
  threshold: number,
): SnapCandidate | null {
  let bestCandidate: SnapCandidate | null = null;

  for (const anchor of rectAnchors) {
    for (const line of siblingLines) {
      const delta = line - anchor.position;
      if (Math.abs(delta) > threshold) {
        continue;
      }

      if (!bestCandidate || Math.abs(delta) < Math.abs(bestCandidate.delta)) {
        bestCandidate = {
          nextValue: anchor.resolve(line),
          guide: { orientation, position: line },
          delta,
        };
      }
    }
  }

  return bestCandidate;
}

export function snapRectToSiblingGuides(
  rect: Rect,
  siblings: SiblingRect[],
  threshold: number,
): {
  rect: Rect;
  guides: CenterGuide[];
  snappedX: boolean;
  snappedY: boolean;
} {
  if (siblings.length === 0) {
    return {
      rect,
      guides: [],
      snappedX: false,
      snappedY: false,
    };
  }

  let bestX: SnapCandidate | null = null;
  let bestY: SnapCandidate | null = null;

  for (const sibling of siblings) {
    const candidateX = getBestSnapCandidate(
      getRectAnchors(rect.x, rect.width),
      getSiblingLines(sibling.x, sibling.width),
      "vertical",
      threshold,
    );
    if (candidateX && (!bestX || Math.abs(candidateX.delta) < Math.abs(bestX.delta))) {
      bestX = candidateX;
    }

    const candidateY = getBestSnapCandidate(
      getRectAnchors(rect.y, rect.height),
      getSiblingLines(sibling.y, sibling.height),
      "horizontal",
      threshold,
    );
    if (candidateY && (!bestY || Math.abs(candidateY.delta) < Math.abs(bestY.delta))) {
      bestY = candidateY;
    }
  }

  return {
    rect: {
      ...rect,
      x: bestX ? bestX.nextValue : rect.x,
      y: bestY ? bestY.nextValue : rect.y,
    },
    guides: [bestX?.guide, bestY?.guide].filter((guide): guide is CenterGuide => Boolean(guide)),
    snappedX: Boolean(bestX),
    snappedY: Boolean(bestY),
  };
}
