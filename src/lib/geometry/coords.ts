import { isContainerNode } from "@/lib/model/node-utils";
import type {
  EditorDocument,
  EditorNode,
  ParentId,
  Point,
} from "@/lib/model/document";

export function getAbsolutePosition(
  document: EditorDocument,
  nodeId: string,
): Point {
  const node = document.nodes[nodeId];
  if (!node) {
    return { x: 0, y: 0 };
  }

  return localToAbsolute(document, node.parentId, { x: node.x, y: node.y });
}

export function localToAbsolute(
  document: EditorDocument,
  parentId: ParentId,
  point: Point,
): Point {
  if (parentId === "board") {
    return point;
  }

  const parent = document.nodes[parentId];
  if (!parent) {
    return point;
  }

  const parentPoint = localToAbsolute(document, parent.parentId, {
    x: parent.x,
    y: parent.y,
  });

  return {
    x: parentPoint.x + point.x,
    y: parentPoint.y + point.y,
  };
}

export function absoluteToLocal(
  document: EditorDocument,
  parentId: ParentId,
  point: Point,
): Point {
  if (parentId === "board") {
    return point;
  }

  const parent = document.nodes[parentId];
  if (!parent) {
    return point;
  }

  const parentAbsolute = getAbsolutePosition(document, parent.id);
  return {
    x: point.x - parentAbsolute.x,
    y: point.y - parentAbsolute.y,
  };
}

export function getParentBounds(
  document: EditorDocument,
  parentId: ParentId,
): { width: number; height: number } | null {
  if (parentId === "board") {
    return null;
  }

  const parent = document.nodes[parentId];
  if (!parent) {
    return null;
  }

  return { width: parent.width, height: parent.height };
}

export function getContentBounds(
  document: EditorDocument,
  node: EditorNode,
): { width: number; height: number } {
  if (!isContainerNode(node)) {
    return { width: node.width, height: node.height };
  }

  return node.children.reduce(
    (accumulator, childId) => {
      const child = document.nodes[childId];
      if (!child) {
        return accumulator;
      }

      return {
        width: Math.max(accumulator.width, child.x + child.width),
        height: Math.max(accumulator.height, child.y + child.height),
      };
    },
    { width: 0, height: 0 },
  );
}
