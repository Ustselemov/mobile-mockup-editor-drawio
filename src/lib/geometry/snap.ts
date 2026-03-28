export function snapValue(value: number, gridSize: number, enabled: boolean): number {
  if (!enabled || gridSize <= 0) {
    return value;
  }

  return Math.round(value / gridSize) * gridSize;
}

export function snapRect(
  rect: { x: number; y: number; width: number; height: number },
  gridSize: number,
  enabled: boolean,
) {
  return {
    x: snapValue(rect.x, gridSize, enabled),
    y: snapValue(rect.y, gridSize, enabled),
    width: snapValue(rect.width, gridSize, enabled),
    height: snapValue(rect.height, gridSize, enabled),
  };
}
