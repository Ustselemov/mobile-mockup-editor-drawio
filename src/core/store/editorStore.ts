import { create } from "zustand";

import { createDemoDocument } from "@/core/demo/demoDocument";
import { appendTemplateScreen, type ScreenTemplateId } from "@/core/demo/screenTemplates";
import { createEmptyDocument, LOCAL_STORAGE_KEY } from "@/lib/model/defaults";
import {
  appendNode,
  createNodeFromPalette,
  getDescendantIds,
  generateId,
  getNodeChildren,
  getNodeLabel,
  getParentType,
  isContainerNode,
  isDescendant,
  isValidParent,
  removeNodeReference,
  sortChildrenByZIndex,
} from "@/lib/model/node-utils";
import { editorDocumentSchema } from "@/lib/model/schema";
import type {
  EditorDocument,
  EditorEdge,
  EditorNode,
  NodeId,
  PaletteItemType,
  ParentId,
} from "@/lib/model/document";
import { clampRectToBounds } from "@/lib/geometry/bounds";
import { alignRects, distributeRects } from "@/lib/geometry/arrange";
import { reflowLayoutChain } from "@/lib/layout/reflow";
import {
  absoluteToLocal,
  getAbsolutePosition,
  getContentBounds,
  getParentBounds,
} from "@/lib/geometry/coords";
import { snapValue } from "@/lib/geometry/snap";
import {
  findBestParentForAbsoluteRect,
  getAbsoluteRectForLocalPlacement,
} from "@/lib/model/placement";
import { parseDrawioXml } from "@/lib/drawio/parseDrawio";
import { serializeDrawioXml } from "@/lib/drawio/serializeDrawio";
import { validateDocument } from "@/lib/drawio/validate";

type HistoryState = {
  past: EditorDocument[];
  future: EditorDocument[];
};

type ViewportSize = {
  width: number;
  height: number;
};

type StoreSetter = (
  partial:
    | Partial<EditorStoreState>
    | ((state: EditorStoreState) => Partial<EditorStoreState>),
) => void;

type EditorStoreState = {
  document: EditorDocument;
  selection: NodeId[];
  clipboard: EditorNode[] | null;
  history: HistoryState;
  viewport: ViewportSize;
  debugMessage: string | null;
  hoveredDropTarget: ParentId | null;
  activeInspectorTab: "properties" | "debug";
  setDebugMessage: (message: string | null) => void;
  setActiveInspectorTab: (tab: "properties" | "debug") => void;
  setSelection: (nodeIds: NodeId[]) => void;
  setViewportSize: (width: number, height: number) => void;
  clearSelection: () => void;
  setHoveredDropTarget: (parentId: ParentId | null) => void;
  setBoardPan: (panX: number, panY: number) => void;
  setBoardZoom: (zoom: number) => void;
  fitView: (scope: "board" | "selection" | "screen") => void;
  toggleBoardFlag: (flag: "showGrid" | "snapToGrid" | "guides") => void;
  addNode: (
    type: PaletteItemType,
    parentId: ParentId,
    position: { x: number; y: number },
  ) => NodeId | null;
  updateNode: (nodeId: NodeId, patch: Partial<EditorNode>) => void;
  moveNode: (
    nodeId: NodeId,
    x: number,
    y: number,
    nextParentId?: ParentId,
  ) => void;
  resizeNode: (
    nodeId: NodeId,
    width: number,
    height: number,
    x?: number,
    y?: number,
  ) => void;
  deleteNode: (nodeId: NodeId) => void;
  deleteSelection: () => void;
  duplicateSelection: () => void;
  copySelection: () => void;
  pasteClipboard: () => void;
  nudgeSelection: (dx: number, dy: number) => void;
  reparentNode: (nodeId: NodeId, nextParentId: ParentId) => void;
  toggleNodeVisibility: (nodeId: NodeId) => void;
  toggleNodeLock: (nodeId: NodeId) => void;
  reorderNode: (
    nodeId: NodeId,
    direction: "forward" | "backward" | "front" | "back",
  ) => void;
  alignSelection: (
    mode: "left" | "center" | "right" | "top" | "middle" | "bottom",
  ) => void;
  distributeSelection: (axis: "horizontal" | "vertical") => void;
  createEdge: (sourceId: NodeId, targetId: NodeId) => string | null;
  addTemplateScreen: (templateId: ScreenTemplateId) => string | null;
  addScreen: () => void;
  resetToDemo: () => void;
  createEmpty: () => void;
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => void;
  exportJson: () => string;
  loadJson: (json: string) => void;
  importDrawio: (xml: string, fileName?: string) => void;
  exportDrawio: () => string;
  undo: () => void;
  redo: () => void;
  getValidationReport: () => ReturnType<typeof validateDocument>;
};

function cloneDocument(document: EditorDocument): EditorDocument {
  return structuredClone(document);
}

function normalizeNodeForParent(
  document: EditorDocument,
  node: EditorNode,
): EditorNode {
  const bounds = getParentBounds(document, node.parentId);
  const minWidth =
    node.type === "checkbox"
      ? node.boxSize + 40
      : node.type === "field"
        ? 140
        : node.type === "segmentedControl"
          ? 120
          : node.type === "badge"
            ? 48
            : node.type === "banner"
              ? 180
              : 24;
  const minHeight =
    node.type === "text"
      ? 20
      : node.type === "field"
        ? 42
        : node.type === "segmentedControl"
          ? node.itemHeight
      : node.type === "banner"
        ? 56
        : 24;
  const rect = clampRectToBounds(
    {
      x: document.board.snapToGrid
        ? snapValue(node.x, document.board.gridSize, true)
        : node.x,
      y: document.board.snapToGrid
        ? snapValue(node.y, document.board.gridSize, true)
        : node.y,
      width: Math.max(node.width, minWidth),
      height: Math.max(node.height, minHeight),
    },
    bounds,
  );
  const centerSnapThreshold =
    document.board.guides && node.parentId !== "board" ? 16 : 0;

  if (!bounds || centerSnapThreshold <= 0) {
    return { ...node, ...rect };
  }

  const centeredRect = { ...rect };
  const rawCenterX = node.x + rect.width / 2;
  const rawCenterY = node.y + rect.height / 2;
  const parentCenterX = bounds.width / 2;
  const parentCenterY = bounds.height / 2;

  if (Math.abs(parentCenterX - rawCenterX) <= centerSnapThreshold) {
    centeredRect.x = parentCenterX - rect.width / 2;
  }

  if (Math.abs(parentCenterY - rawCenterY) <= centerSnapThreshold) {
    centeredRect.y = parentCenterY - rect.height / 2;
  }

  return { ...node, ...clampRectToBounds(centeredRect, bounds) };
}

function resolvePreferredParent(
  document: EditorDocument,
  node: EditorNode,
  options?: {
    preferredParentId?: ParentId;
    excludeNodeId?: NodeId;
  },
): EditorNode {
  const absoluteRect = getAbsoluteRectForLocalPlacement(document, node.parentId, {
    x: node.x,
    y: node.y,
    width: node.width,
    height: node.height,
  });
  const nextParentId = findBestParentForAbsoluteRect(
    document,
    node.type,
    absoluteRect,
    {
      preferredParentId: options?.preferredParentId ?? node.parentId,
      excludeNodeId: options?.excludeNodeId ?? node.id,
    },
  );

  if (nextParentId === node.parentId) {
    return node;
  }

  const nextLocal = absoluteToLocal(document, nextParentId, {
    x: absoluteRect.x,
    y: absoluteRect.y,
  });

  return {
    ...node,
    parentId: nextParentId,
    x: nextLocal.x,
    y: nextLocal.y,
  };
}

function commitDocumentChange(
  set: StoreSetter,
  get: () => EditorStoreState,
  mutator: (draft: EditorDocument) => void,
) {
  const previous = cloneDocument(get().document);
  const draft = cloneDocument(get().document);
  mutator(draft);
  set((state) => ({
    document: draft,
    history: {
      past: [...state.history.past, previous].slice(-80),
      future: [],
    },
  }));
}

function getTopLevelSelection(document: EditorDocument, selection: NodeId[]): NodeId[] {
  return selection.filter((nodeId) => {
    const node = document.nodes[nodeId];
    if (!node) {
      return false;
    }

    return !selection.includes(node.parentId);
  });
}

function collectSubtreeNodes(
  document: EditorDocument,
  nodeId: NodeId,
  bucket: EditorNode[] = [],
): EditorNode[] {
  const node = document.nodes[nodeId];
  if (!node) {
    return bucket;
  }

  bucket.push(structuredClone(node));
  if (isContainerNode(node)) {
    for (const childId of node.children) {
      collectSubtreeNodes(document, childId, bucket);
    }
  }

  return bucket;
}

function cloneClipboardNodes(
  nodes: EditorNode[],
  idCounterStart: number,
  offset: { x: number; y: number },
): { nodes: EditorNode[]; nextCounter: number } {
  const idsInClipboard = new Set(nodes.map((node) => node.id));
  const topLevelNodes = nodes.filter((node) => !idsInClipboard.has(node.parentId));
  const byId = new Map(nodes.map((node) => [node.id, structuredClone(node)]));
  const oldToNew = new Map<string, string>();
  const clonedNodes: EditorNode[] = [];
  let nextCounter = idCounterStart;

  const visit = (node: EditorNode, applyOffset: boolean) => {
    const clone = structuredClone(node);
    const newId = `${node.type}-${nextCounter++}`;
    oldToNew.set(node.id, newId);
    clone.id = newId;
    clone.parentId = oldToNew.get(node.parentId) ?? node.parentId;
    if (applyOffset) {
      clone.x += offset.x;
      clone.y += offset.y;
    }
    if (isContainerNode(clone)) {
      clone.children = [];
    }
    clonedNodes.push(clone);

    if (isContainerNode(node)) {
      for (const childId of node.children) {
        const child = byId.get(childId);
        if (child) {
          visit(child, false);
        }
      }
    }
  };

  for (const node of topLevelNodes) {
    visit(node, true);
  }

  return { nodes: clonedNodes, nextCounter };
}

function getBoundsForNodeIds(document: EditorDocument, nodeIds: NodeId[]) {
  const rects = nodeIds
    .map((nodeId) => {
      const node = document.nodes[nodeId];
      if (!node) {
        return null;
      }

      const absolute = getAbsolutePosition(document, nodeId);
      return {
        left: absolute.x,
        top: absolute.y,
        right: absolute.x + node.width,
        bottom: absolute.y + node.height,
      };
    })
    .filter((rect): rect is { left: number; top: number; right: number; bottom: number } => Boolean(rect));

  if (rects.length === 0) {
    return null;
  }

  return rects.reduce(
    (bounds, rect) => ({
      left: Math.min(bounds.left, rect.left),
      top: Math.min(bounds.top, rect.top),
      right: Math.max(bounds.right, rect.right),
      bottom: Math.max(bounds.bottom, rect.bottom),
    }),
    rects[0],
  );
}

function removeNodeCascade(document: EditorDocument, nodeId: NodeId): void {
  const node = document.nodes[nodeId];
  if (!node) {
    return;
  }

  for (const childId of getNodeChildren(document, nodeId)) {
    removeNodeCascade(document, childId);
  }

  removeNodeReference(document, nodeId, node.parentId);
  delete document.nodes[nodeId];
}

function removeDanglingEdges(document: EditorDocument): void {
  document.edgeIds = document.edgeIds.filter((edgeId) => {
    const edge = document.edges[edgeId];
    if (!edge) {
      return false;
    }

    const sourceExists = !edge.sourceId || Boolean(document.nodes[edge.sourceId]);
    const targetExists = !edge.targetId || Boolean(document.nodes[edge.targetId]);
    if (!sourceExists || !targetExists) {
      delete document.edges[edgeId];
      return false;
    }

    return true;
  });
}

function getSiblingIds(document: EditorDocument, parentId: ParentId): NodeId[] {
  if (parentId === "board") {
    return [...document.rootIds];
  }

  const parent = document.nodes[parentId];
  return isContainerNode(parent) ? [...parent.children] : [];
}

function getSharedParentId(
  document: EditorDocument,
  selection: NodeId[],
): ParentId | null {
  const topLevelSelection = getTopLevelSelection(document, selection);
  if (topLevelSelection.length === 0) {
    return null;
  }

  const firstParentId = document.nodes[topLevelSelection[0]]?.parentId;
  if (!firstParentId) {
    return null;
  }

  return topLevelSelection.every(
    (nodeId) => document.nodes[nodeId]?.parentId === firstParentId,
  )
    ? firstParentId
    : null;
}

function getAncestorScreenId(
  document: EditorDocument,
  nodeId: NodeId,
): NodeId | null {
  let current = document.nodes[nodeId];

  while (current) {
    if (current.type === "screen") {
      return current.id;
    }

    if (current.parentId === "board") {
      return null;
    }

    current = document.nodes[current.parentId];
  }

  return null;
}

function reorderItems(
  items: NodeId[],
  nodeId: NodeId,
  direction: "forward" | "backward" | "front" | "back",
): NodeId[] {
  const nextItems = [...items];
  const index = nextItems.indexOf(nodeId);
  if (index === -1) {
    return nextItems;
  }

  const [item] = nextItems.splice(index, 1);
  if (!item) {
    return nextItems;
  }

  if (direction === "back") {
    nextItems.unshift(item);
    return nextItems;
  }

  if (direction === "front") {
    nextItems.push(item);
    return nextItems;
  }

  const nextIndex =
    direction === "backward"
      ? Math.max(0, index - 1)
      : Math.min(nextItems.length, index + 1);
  nextItems.splice(nextIndex, 0, item);
  return nextItems;
}

function resolveEdgeParentId(
  document: EditorDocument,
  sourceId: NodeId,
  targetId: NodeId,
): ParentId {
  const source = document.nodes[sourceId];
  const target = document.nodes[targetId];
  if (!source || !target) {
    return "board";
  }

  if (source.parentId === target.parentId) {
    const sharedParent = source.parentId;
    if (
      sharedParent === "board" ||
      getParentType(document, sharedParent) === "flowLane" ||
      getParentType(document, sharedParent) === "screen"
    ) {
      return sharedParent;
    }
  }

  return "board";
}

function createDefaultEdge(
  document: EditorDocument,
  sourceId: NodeId,
  targetId: NodeId,
): EditorEdge {
  return {
    id: generateId(document, "edge"),
    type: "edge",
    parentId: resolveEdgeParentId(document, sourceId, targetId),
    sourceId,
    targetId,
    orthogonal: true,
    startArrow: "none",
    endArrow: "classic",
    strokeColor: "#000000",
    strokeWidth: 5,
  };
}

export const useEditorStore = create<EditorStoreState>((set, get) => ({
  document: createDemoDocument(),
  selection: [],
  clipboard: null,
  history: { past: [], future: [] },
  viewport: { width: 1280, height: 720 },
  debugMessage: null,
  hoveredDropTarget: null,
  activeInspectorTab: "properties",

  setDebugMessage(message) {
    set({ debugMessage: message });
  },

  setActiveInspectorTab(tab) {
    set({ activeInspectorTab: tab });
  },

  setSelection(nodeIds) {
    set({ selection: nodeIds });
  },

  setViewportSize(width, height) {
    set({ viewport: { width, height } });
  },

  clearSelection() {
    set({ selection: [] });
  },

  setHoveredDropTarget(parentId) {
    set({ hoveredDropTarget: parentId });
  },

  setBoardPan(panX, panY) {
    set((state) => ({
      document: {
        ...state.document,
        board: { ...state.document.board, panX, panY },
      },
    }));
  },

  setBoardZoom(zoom) {
    set((state) => ({
      document: {
        ...state.document,
        board: { ...state.document.board, zoom },
      },
    }));
  },

  fitView(scope) {
    const { document, selection, viewport } = get();
    const selectionNodeIds = getTopLevelSelection(document, selection);
    const nodeIds =
      scope === "selection" && selectionNodeIds.length > 0
        ? selectionNodeIds
        : scope === "screen"
          ? (() => {
              const selectedScreenId =
                selection[0] ? getAncestorScreenId(document, selection[0]) : null;
              if (selectedScreenId) {
                return [selectedScreenId];
              }

              const firstScreenId = document.rootIds.find(
                (nodeId) => document.nodes[nodeId]?.type === "screen",
              );
              return firstScreenId ? [firstScreenId] : document.rootIds;
            })()
          : document.rootIds;
    const bounds = getBoundsForNodeIds(document, nodeIds);
    if (!bounds || viewport.width <= 0 || viewport.height <= 0) {
      return;
    }

    const width = Math.max(120, bounds.right - bounds.left);
    const height = Math.max(120, bounds.bottom - bounds.top);
    const zoom = Math.max(
      0.2,
      Math.min(
        2,
        (viewport.width - 120) / width,
        (viewport.height - 120) / height,
      ),
    );
    const centerX = bounds.left + width / 2;
    const centerY = bounds.top + height / 2;

    set((state) => ({
      document: {
        ...state.document,
        board: {
          ...state.document.board,
          zoom,
          panX: viewport.width / 2 - centerX * zoom,
          panY: viewport.height / 2 - centerY * zoom,
        },
      },
    }));
  },

  toggleBoardFlag(flag) {
    set((state) => ({
      document: {
        ...state.document,
        board: {
          ...state.document.board,
          [flag]: !state.document.board[flag],
        },
      },
    }));
  },

  addNode(type, parentId, position) {
    const explicitParent =
      parentId !== "board" ? get().document.nodes[parentId] : null;
    if (explicitParent?.locked) {
      set({ debugMessage: `Cannot place ${type} into locked ${explicitParent.type}.` });
      return null;
    }

    const parentType = getParentType(get().document, parentId);
    if (!isValidParent(type, parentType)) {
      set({ debugMessage: `Cannot place ${type} inside ${parentType}.` });
      return null;
    }

    let createdId: string | null = null;
    commitDocumentChange(set, get, (draft) => {
      const id = generateId(draft, type);
      draft.idCounter += 1;
      const node = resolvePreferredParent(
        draft,
        createNodeFromPalette(type, id, parentId, position),
        { preferredParentId: parentId },
      );
      appendNode(draft, normalizeNodeForParent(draft, node));
      reflowLayoutChain(draft, node.parentId);
      createdId = id;
    });

    if (createdId) {
      set({ selection: [createdId], debugMessage: null });
    }

    return createdId;
  },

  updateNode(nodeId, patch) {
    commitDocumentChange(set, get, (draft) => {
      const current = draft.nodes[nodeId];
      if (!current) {
        return;
      }

      draft.nodes[nodeId] = normalizeNodeForParent(draft, {
        ...current,
        ...patch,
      } as EditorNode);
      sortChildrenByZIndex(draft, draft.nodes[nodeId].parentId);
      if (isContainerNode(draft.nodes[nodeId])) {
        reflowLayoutChain(draft, nodeId);
      }
      reflowLayoutChain(draft, draft.nodes[nodeId].parentId);
    });
  },

  moveNode(nodeId, x, y, nextParentId) {
    commitDocumentChange(set, get, (draft) => {
      const node = draft.nodes[nodeId];
      if (!node || node.locked) {
        return;
      }
      const previousParentId = node.parentId;

      if (
        nextParentId &&
        nextParentId !== node.parentId &&
        (!draft.nodes[nextParentId] || !draft.nodes[nextParentId].locked) &&
        !isDescendant(draft, nodeId, nextParentId) &&
        isValidParent(node.type, getParentType(draft, nextParentId))
      ) {
        const absoluteRect = getAbsoluteRectForLocalPlacement(draft, node.parentId, {
          x,
          y,
          width: node.width,
          height: node.height,
        });
        removeNodeReference(draft, nodeId, node.parentId);
        const nextLocal = absoluteToLocal(draft, nextParentId, {
          x: absoluteRect.x,
          y: absoluteRect.y,
        });
        appendNode(
          draft,
          normalizeNodeForParent(draft, {
            ...node,
            parentId: nextParentId,
            x: nextLocal.x,
            y: nextLocal.y,
          }),
        );
        reflowLayoutChain(draft, previousParentId);
        reflowLayoutChain(draft, nextParentId);
        return;
      }

      draft.nodes[nodeId] = normalizeNodeForParent(draft, { ...node, x, y });
      reflowLayoutChain(draft, previousParentId);
    });
  },

  resizeNode(nodeId, width, height, x, y) {
    commitDocumentChange(set, get, (draft) => {
      const node = draft.nodes[nodeId];
      if (!node || node.locked) {
        return;
      }

      if (isContainerNode(node)) {
        const contentBounds = getContentBounds(draft, node);
        width = Math.max(width, contentBounds.width);
        height = Math.max(height, contentBounds.height);
      }

      draft.nodes[nodeId] = normalizeNodeForParent(draft, {
        ...node,
        x: x ?? node.x,
        y: y ?? node.y,
        width,
        height,
      });
      if (isContainerNode(draft.nodes[nodeId])) {
        reflowLayoutChain(draft, nodeId);
      }
      reflowLayoutChain(draft, node.parentId);
    });
  },

  deleteNode(nodeId) {
    const parentId = get().document.nodes[nodeId]?.parentId ?? "board";
    commitDocumentChange(set, get, (draft) => {
      removeNodeCascade(draft, nodeId);
      removeDanglingEdges(draft);
      reflowLayoutChain(draft, parentId);
    });
    set((state) => ({ selection: state.selection.filter((id) => id !== nodeId) }));
  },

  deleteSelection() {
    const selection = getTopLevelSelection(get().document, get().selection);
    if (selection.length === 0) {
      return;
    }
    const affectedParentIds = [
      ...new Set(
        selection
          .map((nodeId) => get().document.nodes[nodeId]?.parentId ?? "board"),
      ),
    ];

    commitDocumentChange(set, get, (draft) => {
      for (const nodeId of selection) {
        removeNodeCascade(draft, nodeId);
      }
      removeDanglingEdges(draft);
      for (const parentId of affectedParentIds) {
        reflowLayoutChain(draft, parentId);
      }
    });
    set({ selection: [] });
  },

  duplicateSelection() {
    const document = get().document;
    const selection = getTopLevelSelection(document, get().selection);
    if (selection.length === 0) {
      return;
    }

    const clipboard = selection.flatMap((nodeId) => collectSubtreeNodes(document, nodeId));
    const { nodes, nextCounter } = cloneClipboardNodes(clipboard, document.idCounter, {
      x: 20,
      y: 20,
    });

    commitDocumentChange(set, get, (draft) => {
      draft.idCounter = nextCounter;
      for (const node of nodes) {
        appendNode(draft, normalizeNodeForParent(draft, node));
        reflowLayoutChain(draft, node.parentId);
      }
    });

    set({
      selection: nodes
        .filter((node) => !nodes.some((candidate) => candidate.id === node.parentId))
        .map((node) => node.id),
    });
  },

  copySelection() {
    const document = get().document;
    const selection = getTopLevelSelection(document, get().selection);
    if (selection.length === 0) {
      return;
    }

    const clipboard = selection.flatMap((nodeId) => collectSubtreeNodes(document, nodeId));
    set({ clipboard });
  },

  pasteClipboard() {
    const clipboard = get().clipboard;
    if (!clipboard || clipboard.length === 0) {
      return;
    }

    const { nodes, nextCounter } = cloneClipboardNodes(
      clipboard,
      get().document.idCounter,
      { x: 20, y: 20 },
    );

    commitDocumentChange(set, get, (draft) => {
      draft.idCounter = nextCounter;
      for (const node of nodes) {
        appendNode(draft, normalizeNodeForParent(draft, node));
        reflowLayoutChain(draft, node.parentId);
      }
    });

    set({
      selection: nodes
        .filter((node) => !nodes.some((candidate) => candidate.id === node.parentId))
        .map((node) => node.id),
    });
  },

  nudgeSelection(dx, dy) {
    const selection = get().selection;
    if (selection.length === 0) {
      return;
    }

    commitDocumentChange(set, get, (draft) => {
      for (const nodeId of selection) {
        const node = draft.nodes[nodeId];
        if (!node || node.locked) {
          continue;
        }

        draft.nodes[nodeId] = normalizeNodeForParent(draft, {
          ...node,
          x: node.x + dx,
          y: node.y + dy,
        });
        reflowLayoutChain(draft, node.parentId);
      }
    });
  },

  reparentNode(nodeId, nextParentId) {
    const currentDocument = get().document;
    const node = currentDocument.nodes[nodeId];
    if (!node || node.parentId === nextParentId) {
      return;
    }

    if (nextParentId !== "board" && isDescendant(currentDocument, nodeId, nextParentId)) {
      set({ debugMessage: "Cannot reparent a node into its descendant." });
      return;
    }

    const nextParentType = getParentType(currentDocument, nextParentId);
    if (nextParentId !== "board" && currentDocument.nodes[nextParentId]?.locked) {
      set({ debugMessage: "Cannot move a node into a locked parent." });
      return;
    }

    if (!isValidParent(node.type, nextParentType)) {
      set({ debugMessage: `Cannot move ${node.type} into ${nextParentType}.` });
      return;
    }

    commitDocumentChange(set, get, (draft) => {
      const current = draft.nodes[nodeId];
      if (!current) {
        return;
      }
      const previousParentId = current.parentId;

      const absolutePosition = getAbsolutePosition(draft, nodeId);
      removeNodeReference(draft, nodeId, current.parentId);
      const nextLocal = absoluteToLocal(draft, nextParentId, absolutePosition);
      current.parentId = nextParentId;
      current.x = nextLocal.x;
      current.y = nextLocal.y;
      appendNode(draft, normalizeNodeForParent(draft, current));
      reflowLayoutChain(draft, previousParentId);
      reflowLayoutChain(draft, nextParentId);
    });

    set({ selection: [nodeId], debugMessage: null });
  },

  toggleNodeVisibility(nodeId) {
    const document = get().document;
    const node = document.nodes[nodeId];
    const affectedIds =
      node && node.visible
        ? new Set([nodeId, ...getDescendantIds(document, nodeId)])
        : null;

    commitDocumentChange(set, get, (draft) => {
      const node = draft.nodes[nodeId];
      if (!node) {
        return;
      }

      node.visible = !node.visible;
    });

    if (affectedIds) {
      set((state) => ({
        selection: state.selection.filter((selectedId) => !affectedIds.has(selectedId)),
      }));
    }
  },

  toggleNodeLock(nodeId) {
    commitDocumentChange(set, get, (draft) => {
      const node = draft.nodes[nodeId];
      if (!node) {
        return;
      }

      node.locked = !node.locked;
    });
  },

  reorderNode(nodeId, direction) {
    commitDocumentChange(set, get, (draft) => {
      const node = draft.nodes[nodeId];
      if (!node) {
        return;
      }

      const orderedIds = reorderItems(
        getSiblingIds(draft, node.parentId),
        nodeId,
        direction,
      );
      orderedIds.forEach((id, index) => {
        const sibling = draft.nodes[id];
        if (sibling) {
          sibling.zIndex = index;
        }
      });
      sortChildrenByZIndex(draft, node.parentId);
      reflowLayoutChain(draft, node.parentId);
    });
  },

  alignSelection(mode) {
    const { document, selection } = get();
    const topLevelSelection = getTopLevelSelection(document, selection);
    if (topLevelSelection.length < 2) {
      set({ debugMessage: "Select at least two sibling nodes to align them." });
      return;
    }

    const sharedParentId = getSharedParentId(document, topLevelSelection);
    if (!sharedParentId) {
      set({ debugMessage: "Align works only for nodes with the same parent." });
      return;
    }

    if (topLevelSelection.some((nodeId) => document.nodes[nodeId]?.locked)) {
      set({ debugMessage: "Unlock selected nodes before aligning them." });
      return;
    }

    const nodes = topLevelSelection
      .map((nodeId) => document.nodes[nodeId])
      .filter((node): node is EditorNode => Boolean(node));
    const nextPositions = alignRects(
      nodes.map((node) => ({
        id: node.id,
        x: node.x,
        y: node.y,
        width: node.width,
        height: node.height,
      })),
      mode,
    );
    if (Object.keys(nextPositions).length === 0) {
      return;
    }

    commitDocumentChange(set, get, (draft) => {
      for (const nodeId of topLevelSelection) {
        const node = draft.nodes[nodeId];
        if (!node) {
          continue;
        }

        const nextPosition = nextPositions[nodeId];
        if (!nextPosition) {
          continue;
        }

        draft.nodes[nodeId] = normalizeNodeForParent(draft, {
          ...node,
          x: nextPosition.x,
          y: nextPosition.y,
        });
      }
    });

    set({ debugMessage: `Aligned ${topLevelSelection.length} nodes.` });
  },

  distributeSelection(axis) {
    const { document, selection } = get();
    const topLevelSelection = getTopLevelSelection(document, selection);
    if (topLevelSelection.length < 3) {
      set({ debugMessage: "Select at least three sibling nodes to distribute them." });
      return;
    }

    const sharedParentId = getSharedParentId(document, topLevelSelection);
    if (!sharedParentId) {
      set({ debugMessage: "Distribute works only for nodes with the same parent." });
      return;
    }

    if (topLevelSelection.some((nodeId) => document.nodes[nodeId]?.locked)) {
      set({ debugMessage: "Unlock selected nodes before distributing them." });
      return;
    }

    const nodes = topLevelSelection
      .map((nodeId) => document.nodes[nodeId])
      .filter((node): node is EditorNode => Boolean(node));
    const nextPositions = distributeRects(
      nodes.map((node) => ({
        id: node.id,
        x: node.x,
        y: node.y,
        width: node.width,
        height: node.height,
      })),
      axis,
    );
    if (Object.keys(nextPositions).length === 0) {
      return;
    }

    commitDocumentChange(set, get, (draft) => {
      topLevelSelection.forEach((nodeId) => {
        const node = draft.nodes[nodeId];
        if (!node) {
          return;
        }

        const nextPosition = nextPositions[nodeId];
        if (!nextPosition) {
          return;
        }

        draft.nodes[node.id] = normalizeNodeForParent(draft, {
          ...node,
          x: nextPosition.x,
          y: nextPosition.y,
        });
      });
    });

    set({ debugMessage: `Distributed ${topLevelSelection.length} nodes.` });
  },

  createEdge(sourceId, targetId) {
    if (sourceId === targetId) {
      set({ debugMessage: "Edge source and target must be different." });
      return null;
    }

    if (!get().document.nodes[sourceId] || !get().document.nodes[targetId]) {
      set({ debugMessage: "Cannot create edge for missing nodes." });
      return null;
    }

    let createdId: string | null = null;
    commitDocumentChange(set, get, (draft) => {
      const edge = createDefaultEdge(draft, sourceId, targetId);
      draft.idCounter += 1;
      draft.edges[edge.id] = edge;
      draft.edgeIds.push(edge.id);
      createdId = edge.id;
    });

    set({ debugMessage: createdId ? `Created edge ${createdId}.` : null });
    return createdId;
  },

  addTemplateScreen(templateId) {
    let createdId: string | null = null;
    commitDocumentChange(set, get, (draft) => {
      const x = 180 + draft.rootIds.length * 36;
      const y = 100 + draft.rootIds.length * 24;
      createdId = appendTemplateScreen(draft, templateId, { x, y });
    });

    if (createdId) {
      set({ selection: [createdId], debugMessage: `Inserted ${templateId} template.` });
    }

    return createdId;
  },

  addScreen() {
    get().addNode("screen", "board", { x: 200, y: 120 });
  },

  resetToDemo() {
    set({
      document: createDemoDocument(),
      selection: [],
      history: { past: [], future: [] },
      debugMessage: null,
    });
  },

  createEmpty() {
    set({
      document: createEmptyDocument(),
      selection: [],
      history: { past: [], future: [] },
      debugMessage: null,
    });
  },

  saveToLocalStorage() {
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(get().document));
    set({ debugMessage: "Saved to local storage." });
  },

  loadFromLocalStorage() {
    const payload = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!payload) {
      set({ debugMessage: "No autosave found." });
      return;
    }

    try {
      get().loadJson(payload);
      set({ debugMessage: "Loaded from local storage." });
    } catch (error) {
      set({
        debugMessage: error instanceof Error ? error.message : "Failed to load local storage payload.",
      });
    }
  },

  exportJson() {
    return JSON.stringify(get().document, null, 2);
  },

  loadJson(json) {
    const parsed = JSON.parse(json) as unknown;
    const document = editorDocumentSchema.parse(parsed);
    const validation = validateDocument(document);
    if (validation.errors.length > 0) {
      throw new Error(`JSON document validation failed: ${validation.errors.join(" ")}`);
    }
    set({
      document,
      selection: [],
      history: { past: [], future: [] },
      debugMessage: "JSON document loaded.",
    });
  },

  importDrawio(xml, fileName) {
    const document = parseDrawioXml(xml, fileName);
    const validation = validateDocument(document);
    if (validation.errors.length > 0) {
      throw new Error(`Draw.io import validation failed: ${validation.errors.join(" ")}`);
    }
    set({
      document,
      selection: [],
      history: { past: [], future: [] },
      debugMessage: `Imported ${fileName ?? "draw.io file"}.`,
    });
  },

  exportDrawio() {
    return serializeDrawioXml(get().document);
  },

  undo() {
    const past = [...get().history.past];
    const previous = past.pop();
    if (!previous) {
      return;
    }

    const current = cloneDocument(get().document);
    set((state) => ({
      document: previous,
      history: {
        past,
        future: [current, ...state.history.future],
      },
    }));
  },

  redo() {
    const [next, ...rest] = get().history.future;
    if (!next) {
      return;
    }

    const current = cloneDocument(get().document);
    set((state) => ({
      document: next,
      history: {
        past: [...state.history.past, current],
        future: rest,
      },
    }));
  },

  getValidationReport() {
    return validateDocument(get().document);
  },
}));

export function useSelectedNode(): EditorNode | null {
  const selection = useEditorStore((state) => state.selection);
  const document = useEditorStore((state) => state.document);
  return selection.length === 1 ? document.nodes[selection[0]] ?? null : null;
}

export function getSelectionSummary(state: EditorStoreState): string {
  if (state.selection.length === 0) {
    return "No selection";
  }

  if (state.selection.length > 1) {
    return `${state.selection.length} nodes selected`;
  }

  const node = state.document.nodes[state.selection[0]];
  return node ? getNodeLabel(node) : "Missing node";
}
