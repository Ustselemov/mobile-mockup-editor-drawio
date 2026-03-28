export type CenterGuide = {
  orientation: "vertical" | "horizontal";
  position: number;
};

export type CenterSnapResult = {
  rect: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  guides: CenterGuide[];
  snappedX: boolean;
  snappedY: boolean;
};

export function snapRectToParentCenter(
  rect: { x: number; y: number; width: number; height: number },
  parentSize: { width: number; height: number } | null,
  threshold: number,
): CenterSnapResult {
  if (!parentSize) {
    return {
      rect,
      guides: [],
      snappedX: false,
      snappedY: false,
    };
  }

  const parentCenterX = parentSize.width / 2;
  const parentCenterY = parentSize.height / 2;
  const rectCenterX = rect.x + rect.width / 2;
  const rectCenterY = rect.y + rect.height / 2;
  const nextRect = { ...rect };
  const guides: CenterGuide[] = [];
  let snappedX = false;
  let snappedY = false;

  if (Math.abs(parentCenterX - rectCenterX) <= threshold) {
    nextRect.x = parentCenterX - rect.width / 2;
    guides.push({ orientation: "vertical", position: parentCenterX });
    snappedX = true;
  }

  if (Math.abs(parentCenterY - rectCenterY) <= threshold) {
    nextRect.y = parentCenterY - rect.height / 2;
    guides.push({ orientation: "horizontal", position: parentCenterY });
    snappedY = true;
  }

  return {
    rect: nextRect,
    guides,
    snappedX,
    snappedY,
  };
}
