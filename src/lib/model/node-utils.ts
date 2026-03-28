import {
  badgeVariantStyles,
  bannerVariantStyles,
  buttonVariantStyles,
  textStyles,
} from "@/lib/model/defaults";
import { DEFAULT_LAYOUT_CONFIG } from "@/lib/layout/config";
import type {
  ContainerNode,
  ContainerNodeType,
  EditorDocument,
  EditorNode,
  FlowLaneNode,
  NodeId,
  NodeType,
  PaletteItemType,
  ParentId,
  Point,
  ScreenNode,
} from "@/lib/model/document";

export function isContainerNode(node: EditorNode | undefined): node is ContainerNodeType {
  return node?.type === "flowLane" || node?.type === "screen" || node?.type === "container";
}

export function generateId(document: EditorDocument, prefix = "node"): NodeId {
  return `${prefix}-${document.idCounter}`;
}

export function isValidParent(
  childType: NodeType,
  parentType: NodeType | "board",
): boolean {
  if (childType === "screen") {
    return parentType === "board" || parentType === "flowLane";
  }

  if (childType === "flowLane") {
    return parentType === "board";
  }

  return (
    parentType === "screen" ||
    parentType === "container" ||
    parentType === "flowLane" ||
    parentType === "board"
  );
}

export function getParentType(
  document: EditorDocument,
  parentId: ParentId,
): NodeType | "board" {
  if (parentId === "board") {
    return "board";
  }

  return document.nodes[parentId]?.type ?? "board";
}

export function getNodeChildren(document: EditorDocument, nodeId: NodeId): NodeId[] {
  const node = document.nodes[nodeId];
  return isContainerNode(node) ? [...node.children] : [];
}

export function isNodeVisibleInTree(
  document: EditorDocument,
  nodeId: NodeId,
): boolean {
  const node = document.nodes[nodeId];
  if (!node) {
    return false;
  }

  if (!node.visible) {
    return false;
  }

  if (node.parentId === "board") {
    return true;
  }

  return isNodeVisibleInTree(document, node.parentId);
}

export function appendNode(document: EditorDocument, node: EditorNode): void {
  document.nodes[node.id] = node;

  if (node.parentId === "board") {
    node.zIndex = document.rootIds.length;
    document.rootIds.push(node.id);
    return;
  }

  const parent = document.nodes[node.parentId];
  if (isContainerNode(parent)) {
    node.zIndex = parent.children.length;
    parent.children.push(node.id);
  } else {
    node.parentId = "board";
    node.zIndex = document.rootIds.length;
    document.rootIds.push(node.id);
  }
}

export function removeNodeReference(
  document: EditorDocument,
  nodeId: NodeId,
  parentId: ParentId,
): void {
  if (parentId === "board") {
    document.rootIds = document.rootIds.filter((id) => id !== nodeId);
    return;
  }

  const parent = document.nodes[parentId];
  if (isContainerNode(parent)) {
    parent.children = parent.children.filter((id) => id !== nodeId);
  }
}

export function getDescendantIds(
  document: EditorDocument,
  nodeId: NodeId,
  visited: Set<NodeId> = new Set(),
): NodeId[] {
  const node = document.nodes[nodeId];
  if (!isContainerNode(node) || visited.has(nodeId)) {
    return [];
  }

  visited.add(nodeId);
  return node.children.flatMap((childId) => [
    childId,
    ...getDescendantIds(document, childId, visited),
  ]);
}

export function isDescendant(
  document: EditorDocument,
  ancestorId: NodeId,
  possibleDescendantId: NodeId,
): boolean {
  return getDescendantIds(document, ancestorId).includes(possibleDescendantId);
}

export function getNodeLabel(node: EditorNode): string {
  switch (node.type) {
    case "flowLane":
      return node.title;
    case "screen":
      return node.title;
    case "container":
      return node.title || node.text || "Container";
    case "field":
      return node.label || node.value || "Field";
    case "segmentedControl":
      return node.label || node.items.join(" / ");
    case "badge":
      return node.text;
    case "banner":
      return node.title;
    case "text":
      return node.text;
    case "button":
      return node.text;
    case "checkbox":
      return node.text;
    case "unsupported":
      return "Unsupported";
  }
}

export function createNodeFromPalette(
  type: PaletteItemType,
  id: NodeId,
  parentId: ParentId,
  position: Point,
): EditorNode {
  switch (type) {
    case "flowLane":
      return {
        id,
        type: "flowLane",
        parentId: "board",
        x: position.x,
        y: position.y,
        width: 980,
        height: 920,
        zIndex: 0,
        visible: true,
        locked: false,
        fillColor: "#eef5f4",
        strokeColor: "#d7e1e3",
        strokeWidth: 1,
        borderRadius: 10,
        opacity: 1,
        title: "Flow lane",
        startSize: 34,
        layout: { ...DEFAULT_LAYOUT_CONFIG, padding: 20 },
        children: [],
      };
    case "screen":
      return {
        id,
        type: "screen",
        parentId,
        x: position.x,
        y: position.y,
        width: 360,
        height: 760,
        zIndex: 0,
        visible: true,
        locked: false,
        fillColor: "#ffffff",
        strokeColor: "#1c2a30",
        strokeWidth: 2,
        borderRadius: 14,
        opacity: 1,
        title: "New screen",
        clipChildren: true,
        layout: { ...DEFAULT_LAYOUT_CONFIG, padding: 20 },
        children: [],
      };
    case "container":
      return {
        id,
        type: "container",
        parentId,
        x: position.x,
        y: position.y,
        width: 280,
        height: 120,
        zIndex: 0,
        visible: true,
        locked: false,
        fillColor: "#f7fafb",
        strokeColor: "#d7e1e3",
        strokeWidth: 1,
        borderRadius: 10,
        opacity: 1,
        title: "Section",
        padding: 12,
        layout: { ...DEFAULT_LAYOUT_CONFIG, padding: 12 },
        children: [],
      };
    case "field":
      return {
        id,
        type: "field",
        parentId,
        x: position.x,
        y: position.y,
        width: 280,
        height: 42,
        zIndex: 0,
        visible: true,
        locked: false,
        fillColor: "#f7fafb",
        strokeColor: "#d7e1e3",
        strokeWidth: 1,
        borderRadius: 10,
        opacity: 1,
        label: "Field label",
        value: "Field value",
        labelStyle: { ...textStyles.sectionTitle },
        valueStyle: { ...textStyles.body },
      };
    case "segmentedControl":
      return {
        id,
        type: "segmentedControl",
        parentId,
        x: position.x,
        y: position.y,
        width: 240,
        height: 28,
        zIndex: 0,
        visible: true,
        locked: false,
        fillColor: "#ffffff",
        strokeColor: "#d7e1e3",
        strokeWidth: 1,
        borderRadius: 12,
        opacity: 1,
        items: ["Online", "Clinic"],
        activeIndex: 0,
        itemHeight: 28,
        activeFill: "#dcefeb",
        activeStroke: "#0f766e",
        inactiveFill: "#ffffff",
        inactiveStroke: "#666666",
        textStyle: { ...textStyles.bodyStrong, align: "center" },
      };
    case "badge": {
      const variant = "info";
      const style = badgeVariantStyles[variant];
      return {
        id,
        type: "badge",
        parentId,
        x: position.x,
        y: position.y,
        width: 84,
        height: 24,
        zIndex: 0,
        visible: true,
        locked: false,
        fillColor: style.fillColor,
        strokeColor: style.strokeColor,
        strokeWidth: 1,
        borderRadius: 9,
        opacity: 1,
        text: "Badge",
        variant,
        textStyle: { ...textStyles.bodyStrong, fontSize: 10, color: style.textColor, align: "center" },
      };
    }
    case "banner": {
      const variant = "warning";
      const style = bannerVariantStyles[variant];
      return {
        id,
        type: "banner",
        parentId,
        x: position.x,
        y: position.y,
        width: 280,
        height: 72,
        zIndex: 0,
        visible: true,
        locked: false,
        fillColor: style.fillColor,
        strokeColor: style.strokeColor,
        strokeWidth: 1,
        borderRadius: 16,
        opacity: 1,
        title: "Important notice",
        body: "Double-check the entered data before continuing.",
        variant,
        titleStyle: { ...textStyles.bodyStrong },
        bodyStyle: { ...textStyles.caption },
      };
    }
    case "text":
      return {
        id,
        type: "text",
        parentId,
        x: position.x,
        y: position.y,
        width: 180,
        height: 26,
        zIndex: 0,
        visible: true,
        locked: false,
        opacity: 1,
        text: "Text",
        textStyle: { ...textStyles.body },
      };
    case "button": {
      const variant = "primarySuccess";
      const style = buttonVariantStyles[variant];
      return {
        id,
        type: "button",
        parentId,
        x: position.x,
        y: position.y,
        width: 220,
        height: 40,
        zIndex: 0,
        visible: true,
        locked: false,
        fillColor: style.fillColor,
        strokeColor: style.strokeColor,
        strokeWidth: 1,
        borderRadius: 14,
        opacity: 1,
        text: "Continue",
        variant,
        textStyle: { ...textStyles.cta, color: style.textColor },
      };
    }
    case "checkbox":
      return {
        id,
        type: "checkbox",
        parentId,
        x: position.x,
        y: position.y,
        width: 200,
        height: 24,
        zIndex: 0,
        visible: true,
        locked: false,
        fillColor: "#ffffff",
        strokeColor: "#0f766e",
        strokeWidth: 2,
        borderRadius: 6,
        opacity: 1,
        text: "Checkbox label",
        checked: false,
        boxSize: 16,
        textStyle: { ...textStyles.body },
      };
  }
}

export function sortChildrenByZIndex(document: EditorDocument, parentId: ParentId): void {
  const ids =
    parentId === "board"
      ? [...document.rootIds]
      : isContainerNode(document.nodes[parentId])
        ? [...document.nodes[parentId].children]
        : [];

  ids.sort((left, right) => {
    const leftNode = document.nodes[left];
    const rightNode = document.nodes[right];
    return (leftNode?.zIndex ?? 0) - (rightNode?.zIndex ?? 0);
  });

  if (parentId === "board") {
    document.rootIds = ids;
    return;
  }

  const parent = document.nodes[parentId];
  if (isContainerNode(parent)) {
    parent.children = ids;
  }
}

export function createFlowLane(
  id: string,
  title: string,
  x: number,
  y: number,
  width: number,
  height: number,
): FlowLaneNode {
  return {
    id,
    type: "flowLane",
    parentId: "board",
    x,
    y,
    width,
    height,
    zIndex: 0,
    visible: true,
    locked: false,
    fillColor: "#eef5f4",
    strokeColor: "#d7e1e3",
    strokeWidth: 1,
    borderRadius: 10,
    opacity: 1,
    title,
    startSize: 34,
    children: [],
  };
}

export function isScreenLike(node: EditorNode | undefined): node is ScreenNode | ContainerNode {
  return node?.type === "screen" || node?.type === "container";
}
