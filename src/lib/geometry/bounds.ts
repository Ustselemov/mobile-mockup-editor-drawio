export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function clampRectToBounds(
  rect: { x: number; y: number; width: number; height: number },
  bounds: { width: number; height: number } | null,
) {
  if (!bounds) {
    return rect;
  }

  return {
    ...rect,
    x: clamp(rect.x, 0, Math.max(0, bounds.width - rect.width)),
    y: clamp(rect.y, 0, Math.max(0, bounds.height - rect.height)),
    width: Math.min(rect.width, bounds.width),
    height: Math.min(rect.height, bounds.height),
  };
}
