type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type SiblingRect = Rect & {
  id: string;
};

function rectsOverlap(
  left: Rect,
  right: Rect,
  gap: number,
) {
  return !(
    left.x + left.width + gap <= right.x ||
    right.x + right.width + gap <= left.x ||
    left.y + left.height + gap <= right.y ||
    right.y + right.height + gap <= left.y
  );
}

function clampRectToBounds(
  rect: Rect,
  bounds: { width: number; height: number } | null,
): Rect {
  if (!bounds) {
    return rect;
  }

  return {
    ...rect,
    x: Math.max(0, Math.min(rect.x, bounds.width - rect.width)),
    y: Math.max(0, Math.min(rect.y, bounds.height - rect.height)),
  };
}

function getOverlapCount(
  rect: Rect,
  siblings: SiblingRect[],
  gap: number,
) {
  return siblings.filter((sibling) => rectsOverlap(rect, sibling, gap)).length;
}

export function pushRectOutsideSiblings(
  rect: Rect,
  siblings: SiblingRect[],
  bounds: { width: number; height: number } | null,
  gap: number,
): {
  rect: Rect;
  shifted: boolean;
} {
  if (siblings.length === 0) {
    return { rect, shifted: false };
  }

  const origin = { ...rect };
  let nextRect = clampRectToBounds(rect, bounds);
  let shifted = false;

  for (let iteration = 0; iteration < 24; iteration += 1) {
    const overlappingSibling = siblings.find((sibling) => rectsOverlap(nextRect, sibling, gap));
    if (!overlappingSibling) {
      return { rect: nextRect, shifted };
    }

    const candidates = [
      { x: overlappingSibling.x - nextRect.width - gap, y: nextRect.y },
      { x: overlappingSibling.x + overlappingSibling.width + gap, y: nextRect.y },
      { x: nextRect.x, y: overlappingSibling.y - nextRect.height - gap },
      { x: nextRect.x, y: overlappingSibling.y + overlappingSibling.height + gap },
    ]
      .map((candidate) => clampRectToBounds({ ...nextRect, ...candidate }, bounds))
      .map((candidate) => ({
        rect: candidate,
        overlaps: getOverlapCount(candidate, siblings, gap),
        distance:
          Math.abs(candidate.x - origin.x) +
          Math.abs(candidate.y - origin.y),
      }))
      .sort((left, right) => {
        if (left.overlaps !== right.overlaps) {
          return left.overlaps - right.overlaps;
        }

        return left.distance - right.distance;
      });

    const bestCandidate = candidates[0];
    if (!bestCandidate || bestCandidate.overlaps >= getOverlapCount(nextRect, siblings, gap)) {
      return { rect: nextRect, shifted };
    }

    nextRect = bestCandidate.rect;
    shifted = true;
  }

  return { rect: nextRect, shifted };
}
