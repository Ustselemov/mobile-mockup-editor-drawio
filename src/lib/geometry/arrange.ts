export type ArrangementRect = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type AlignmentMode =
  | "left"
  | "center"
  | "right"
  | "top"
  | "middle"
  | "bottom";

export type DistributionAxis = "horizontal" | "vertical";

export function alignRects(
  rects: ArrangementRect[],
  mode: AlignmentMode,
): Record<string, { x: number; y: number }> {
  if (rects.length < 2) {
    return {};
  }

  const left = Math.min(...rects.map((rect) => rect.x));
  const right = Math.max(...rects.map((rect) => rect.x + rect.width));
  const top = Math.min(...rects.map((rect) => rect.y));
  const bottom = Math.max(...rects.map((rect) => rect.y + rect.height));
  const centerX = left + (right - left) / 2;
  const centerY = top + (bottom - top) / 2;

  return Object.fromEntries(
    rects.map((rect) => {
      const next =
        mode === "left"
          ? { x: left, y: rect.y }
          : mode === "center"
            ? { x: centerX - rect.width / 2, y: rect.y }
            : mode === "right"
              ? { x: right - rect.width, y: rect.y }
              : mode === "top"
                ? { x: rect.x, y: top }
                : mode === "middle"
                  ? { x: rect.x, y: centerY - rect.height / 2 }
                  : { x: rect.x, y: bottom - rect.height };

      return [rect.id, next];
    }),
  );
}

export function distributeRects(
  rects: ArrangementRect[],
  axis: DistributionAxis,
): Record<string, { x: number; y: number }> {
  if (rects.length < 3) {
    return {};
  }

  const sorted = [...rects].sort((left, right) =>
    axis === "horizontal" ? left.x - right.x : left.y - right.y,
  );
  const start = axis === "horizontal" ? sorted[0].x : sorted[0].y;
  const end = axis === "horizontal"
    ? Math.max(...sorted.map((rect) => rect.x + rect.width))
    : Math.max(...sorted.map((rect) => rect.y + rect.height));
  const totalSize = sorted.reduce(
    (sum, rect) => sum + (axis === "horizontal" ? rect.width : rect.height),
    0,
  );
  const gap = (end - start - totalSize) / (sorted.length - 1);
  let cursor = start;

  return Object.fromEntries(
    sorted.map((rect) => {
      const next =
        axis === "horizontal"
          ? { x: cursor, y: rect.y }
          : { x: rect.x, y: cursor };
      cursor += (axis === "horizontal" ? rect.width : rect.height) + gap;
      return [rect.id, next];
    }),
  );
}
