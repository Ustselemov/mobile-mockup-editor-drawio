import { localToAbsolute } from "@/lib/geometry/coords";
import { isContainerNode, isDescendant, isValidParent } from "@/lib/model/node-utils";
import type {
  EditorDocument,
  NodeId,
  NodeType,
  ParentId,
} from "@/lib/model/document";

export type AbsoluteRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export function getParentDepth(document: EditorDocument, parentId: ParentId): number {
  if (parentId === "board") {
    return 0;
  }

  const parent = document.nodes[parentId];
  if (!parent) {
    return 0;
  }

  return 1 + getParentDepth(document, parent.parentId);
}

function containsRect(parentRect: AbsoluteRect, childRect: AbsoluteRect): boolean {
  return (
    childRect.x >= parentRect.x &&
    childRect.y >= parentRect.y &&
    childRect.x + childRect.width <= parentRect.x + parentRect.width &&
    childRect.y + childRect.height <= parentRect.y + parentRect.height
  );
}

export function getAbsoluteRectForLocalPlacement(
  document: EditorDocument,
  parentId: ParentId,
  rect: { x: number; y: number; width: number; height: number },
): AbsoluteRect {
  const absoluteOrigin = localToAbsolute(document, parentId, { x: rect.x, y: rect.y });
  return {
    x: absoluteOrigin.x,
    y: absoluteOrigin.y,
    width: rect.width,
    height: rect.height,
  };
}

export function findBestParentForAbsoluteRect(
  document: EditorDocument,
  childType: NodeType,
  absoluteRect: AbsoluteRect,
  options?: {
    preferredParentId?: ParentId;
    excludeNodeId?: NodeId;
  },
): ParentId {
  const candidates = Object.values(document.nodes)
    .filter((candidate) => {
      if (!isContainerNode(candidate)) {
        return false;
      }

      if (!candidate.visible || candidate.locked) {
        return false;
      }

      if (!isValidParent(childType, candidate.type)) {
        return false;
      }

      if (options?.excludeNodeId && candidate.id === options.excludeNodeId) {
        return false;
      }

      if (
        options?.excludeNodeId &&
        isDescendant(document, options.excludeNodeId, candidate.id)
      ) {
        return false;
      }

      return containsRect(
        getAbsoluteRectForLocalPlacement(document, candidate.parentId, {
          x: candidate.x,
          y: candidate.y,
          width: candidate.width,
          height: candidate.height,
        }),
        absoluteRect,
      );
    })
    .sort((left, right) => {
      const depthDelta =
        getParentDepth(document, right.id) - getParentDepth(document, left.id);
      if (depthDelta !== 0) {
        return depthDelta;
      }

      const leftArea = left.width * left.height;
      const rightArea = right.width * right.height;
      return leftArea - rightArea;
    });

  if (candidates[0]) {
    return candidates[0].id;
  }

  return options?.preferredParentId ?? "board";
}
