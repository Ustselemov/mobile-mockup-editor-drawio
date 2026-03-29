import { useDroppable } from "@dnd-kit/core";
import type { PointerEvent as ReactPointerEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import { useEditorStore } from "@/core/store/editorStore";
import { getAbsolutePosition } from "@/lib/geometry/coords";
import type { CenterGuide } from "@/lib/geometry/center-snap";
import { snapRectToParentCenter } from "@/lib/geometry/center-snap";
import { snapRectToSiblingGuides } from "@/lib/geometry/sibling-snap";
import {
  findBestParentForAbsoluteRect,
  getAbsoluteRectForLocalPlacement,
  getParentDepth,
} from "@/lib/model/placement";
import { isContainerNode, isNodeVisibleInTree } from "@/lib/model/node-utils";
import type { EditorNode, ParentId } from "@/lib/model/document";
import { RenderNode, renderEdgePath } from "@/features/editor/components/RenderNode";
import { SelectionOverlay } from "@/features/editor/components/SelectionOverlay";
import { useEditorHotkeys } from "@/features/editor/hooks/useEditorHotkeys";

type Interaction =
  | {
      mode: "pan";
      startClientX: number;
      startClientY: number;
      startPanX: number;
      startPanY: number;
    }
  | {
      mode: "move";
      nodeId: string;
      startClientX: number;
      startClientY: number;
      startX: number;
      startY: number;
    }
  | {
      mode: "resize";
      nodeId: string;
      handle: "nw" | "ne" | "sw" | "se";
      startClientX: number;
      startClientY: number;
      startX: number;
      startY: number;
      startWidth: number;
      startHeight: number;
    }
  | {
      mode: "marquee";
      startX: number;
      startY: number;
      additive: boolean;
      baseSelection: string[];
    }
  | {
      mode: "connect";
      sourceId: string;
      startX: number;
      startY: number;
      currentX: number;
      currentY: number;
    }
  | null;

type PreviewRect = {
  nodeId: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

type GuideOverlay = {
  parentId: ParentId;
  guides: CenterGuide[];
  badgeLabel?: string;
};

export type PalettePlacementPreview = {
  label: string;
  parentId: ParentId;
  x: number;
  y: number;
  width: number;
  height: number;
  guides: CenterGuide[];
};

type GuideBadge = {
  x: number;
  y: number;
  label: string;
};

function getDropTargets(nodes: Record<string, EditorNode>) {
  return Object.values(nodes).filter(
    (node) => isContainerNode(node) && node.visible && !node.locked,
  );
}

function isInlineEditableNode(
  node: EditorNode | undefined,
): node is Extract<EditorNode, { type: "text" | "button" | "checkbox" | "badge" }> {
  return node?.type === "text" || node?.type === "button" || node?.type === "checkbox" || node?.type === "badge";
}

function getInlineEditableText(
  node: Extract<EditorNode, { type: "text" | "button" | "checkbox" | "badge" }>,
): string {
  return node.text;
}

function DropTargetOverlay({
  nodeId,
  left,
  top,
  width,
  height,
  active,
}: {
  nodeId: string;
  left: number;
  top: number;
  width: number;
  height: number;
  active: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `drop:${nodeId}`,
    data: { kind: "drop-target", parentId: nodeId },
  });

  return (
    <div
      ref={setNodeRef}
      className={`board-drop-target${isOver || active ? " is-over" : ""}`}
      style={{ left, top, width, height }}
    />
  );
}

export function BoardView({
  dropModeEnabled,
  palettePreview,
}: {
  dropModeEnabled: boolean;
  palettePreview?: PalettePlacementPreview | null;
}) {
  const boardRef = useRef<HTMLDivElement | null>(null);
  const document = useEditorStore((state) => state.document);
  const selection = useEditorStore((state) => state.selection);
  const setSelection = useEditorStore((state) => state.setSelection);
  const clearSelection = useEditorStore((state) => state.clearSelection);
  const setBoardPan = useEditorStore((state) => state.setBoardPan);
  const setBoardZoom = useEditorStore((state) => state.setBoardZoom);
  const createEdge = useEditorStore((state) => state.createEdge);
  const setViewportSize = useEditorStore((state) => state.setViewportSize);
  const hoveredDropTarget = useEditorStore((state) => state.hoveredDropTarget);
  const setHoveredDropTarget = useEditorStore((state) => state.setHoveredDropTarget);
  const moveNode = useEditorStore((state) => state.moveNode);
  const resizeNode = useEditorStore((state) => state.resizeNode);
  const updateNode = useEditorStore((state) => state.updateNode);
  const { spacePressed } = useEditorHotkeys();
  const [interaction, setInteraction] = useState<Interaction>(null);
  const [previewRect, setPreviewRect] = useState<PreviewRect | undefined>(undefined);
  const [marqueeRect, setMarqueeRect] = useState<
    { x: number; y: number; width: number; height: number } | undefined
  >(undefined);
  const [moveGuides, setMoveGuides] = useState<GuideOverlay | null>(null);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const editorRef = useRef<HTMLTextAreaElement | null>(null);
  const selectedNode =
    selection.length === 1 && isNodeVisibleInTree(document, selection[0])
      ? document.nodes[selection[0]]
      : null;
  const selectedIds = useMemo(() => new Set(selection), [selection]);
  const { setNodeRef: setBoardDropRef } = useDroppable({
    id: "drop:board",
    data: { kind: "drop-target", parentId: "board" },
  });

  const getResolvedParentForMove = (
    nodeId: string,
    rect: { x: number; y: number; width: number; height: number },
  ): ParentId | null => {
    const node = document.nodes[nodeId];
    if (!node) {
      return null;
    }

    const nextParentId = findBestParentForAbsoluteRect(
      document,
      node.type,
      getAbsoluteRectForLocalPlacement(document, node.parentId, rect),
      {
        preferredParentId: node.parentId,
        excludeNodeId: nodeId,
      },
    );

    return nextParentId === node.parentId ? null : nextParentId;
  };

  const getSiblingRects = (
    parentId: ParentId,
    excludeNodeId: string,
  ) => {
    const siblingIds =
      parentId === "board"
        ? document.rootIds
        : isContainerNode(document.nodes[parentId])
          ? document.nodes[parentId].children
          : [];

    return siblingIds
      .filter((siblingId) => siblingId !== excludeNodeId)
      .map((siblingId) => document.nodes[siblingId])
      .filter((sibling): sibling is EditorNode => Boolean(sibling) && sibling.visible)
      .map((sibling) => ({
        id: sibling.id,
        x: sibling.x,
        y: sibling.y,
        width: sibling.width,
        height: sibling.height,
      }));
  };

  const resolveGuidedRect = (
    parentId: ParentId,
    nodeId: string,
    rect: { x: number; y: number; width: number; height: number },
  ) => {
    const threshold = 16 / document.board.zoom;
    const parentSnap =
      parentId === "board"
        ? { rect, guides: [], snappedX: false, snappedY: false }
        : snapRectToParentCenter(
            rect,
            document.nodes[parentId]
              ? {
                  width: document.nodes[parentId].width,
                  height: document.nodes[parentId].height,
                }
              : null,
            threshold,
          );
    const siblingSnap = snapRectToSiblingGuides(
      parentSnap.rect,
      getSiblingRects(parentId, nodeId),
      threshold,
    );
    const guides = [
      ...(siblingSnap.snappedX
        ? siblingSnap.guides.filter((guide) => guide.orientation === "vertical")
        : parentSnap.guides.filter((guide) => guide.orientation === "vertical")),
      ...(siblingSnap.snappedY
        ? siblingSnap.guides.filter((guide) => guide.orientation === "horizontal")
        : parentSnap.guides.filter((guide) => guide.orientation === "horizontal")),
    ];

    return {
      rect: siblingSnap.rect,
      guideOverlay:
        guides.length > 0
          ? {
              parentId,
              guides,
              badgeLabel:
                siblingSnap.guides.length > 0
                  ? "Sibling align"
                  : parentId === "board"
                    ? undefined
                    : guides.length === 2
                      ? "Parent center"
                      : guides[0]?.orientation === "vertical"
                        ? "Center X"
                        : "Center Y",
            }
          : null,
    };
  };

  const getMovePreviewWithGuides = (
    nodeId: string,
    rect: { x: number; y: number; width: number; height: number },
  ) => {
    const node = document.nodes[nodeId];
    if (!node) {
      return {
        rect,
        nextParentId: null,
        guideOverlay: null,
      };
    }

    const nextParentId = getResolvedParentForMove(nodeId, rect);
    if (nextParentId) {
      return {
        rect,
        nextParentId,
        guideOverlay: null,
      };
    }

    const guided = resolveGuidedRect(node.parentId, nodeId, rect);
    return {
      rect: guided.rect,
      nextParentId: null,
      guideOverlay: guided.guideOverlay,
    };
  };

  useEffect(() => {
    const element = boardRef.current;
    if (!element) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) {
        return;
      }

      setViewportSize(entry.contentRect.width, entry.contentRect.height);
    });
    observer.observe(element);

    return () => observer.disconnect();
  }, [setViewportSize]);

  useEffect(() => {
    if (!editingNodeId) {
      return;
    }

    const node = document.nodes[editingNodeId];
    if (!isInlineEditableNode(node) || !selection.includes(editingNodeId)) {
      setEditingNodeId(null);
      setEditingValue("");
    }
  }, [document.nodes, editingNodeId, selection]);

  useEffect(() => {
    if (!editingNodeId || !editorRef.current) {
      return;
    }

    editorRef.current.focus();
    editorRef.current.select();
  }, [editingNodeId]);

  const toWorldPoint = (clientX: number, clientY: number) => {
    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect) {
      return { x: 0, y: 0 };
    }

    return {
      x: (clientX - rect.left - document.board.panX) / document.board.zoom,
      y: (clientY - rect.top - document.board.panY) / document.board.zoom,
    };
  };

  const commitInlineEdit = () => {
    if (!editingNodeId) {
      return;
    }

    const node = document.nodes[editingNodeId];
    if (isInlineEditableNode(node) && node.text !== editingValue) {
      updateNode(editingNodeId, { text: editingValue } as never);
    }

    setEditingNodeId(null);
    setEditingValue("");
  };

  const cancelInlineEdit = () => {
    setEditingNodeId(null);
    setEditingValue("");
  };

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (!interaction) {
        return;
      }

      if (interaction.mode === "pan") {
        setBoardPan(
          interaction.startPanX + (event.clientX - interaction.startClientX),
          interaction.startPanY + (event.clientY - interaction.startClientY),
        );
        return;
      }

      if (interaction.mode === "move") {
        const deltaX = (event.clientX - interaction.startClientX) / document.board.zoom;
        const deltaY = (event.clientY - interaction.startClientY) / document.board.zoom;
        const node = document.nodes[interaction.nodeId];
        if (!node) {
          return;
        }

        const nextPreviewRect = {
          nodeId: interaction.nodeId,
          x: interaction.startX + deltaX,
          y: interaction.startY + deltaY,
          width: node.width,
          height: node.height,
        };
        const snappedPreview = getMovePreviewWithGuides(interaction.nodeId, nextPreviewRect);
        setPreviewRect({
          ...nextPreviewRect,
          x: snappedPreview.rect.x,
          y: snappedPreview.rect.y,
        });
        setMoveGuides(snappedPreview.guideOverlay);
        setHoveredDropTarget(snappedPreview.nextParentId ?? null);
        return;
      }

      if (interaction.mode === "connect") {
        const worldPoint = toWorldPoint(event.clientX, event.clientY);
        setInteraction({
          ...interaction,
          currentX: worldPoint.x,
          currentY: worldPoint.y,
        });
        return;
      }

      if (interaction.mode === "resize") {
        const deltaX = (event.clientX - interaction.startClientX) / document.board.zoom;
        const deltaY = (event.clientY - interaction.startClientY) / document.board.zoom;
        const next = {
          nodeId: interaction.nodeId,
          x: interaction.startX,
          y: interaction.startY,
          width: interaction.startWidth,
          height: interaction.startHeight,
        };

        if (interaction.handle.includes("e")) {
          next.width = interaction.startWidth + deltaX;
        }
        if (interaction.handle.includes("s")) {
          next.height = interaction.startHeight + deltaY;
        }
        if (interaction.handle.includes("w")) {
          next.x = interaction.startX + deltaX;
          next.width = interaction.startWidth - deltaX;
        }
        if (interaction.handle.includes("n")) {
          next.y = interaction.startY + deltaY;
          next.height = interaction.startHeight - deltaY;
        }

        setPreviewRect(next);
        return;
      }

      if (interaction.mode === "marquee") {
        const worldPoint = toWorldPoint(event.clientX, event.clientY);
        setMarqueeRect({
          x: Math.min(interaction.startX, worldPoint.x),
          y: Math.min(interaction.startY, worldPoint.y),
          width: Math.abs(worldPoint.x - interaction.startX),
          height: Math.abs(worldPoint.y - interaction.startY),
        });
      }
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (!interaction) {
        return;
      }

      if (interaction.mode === "move" && previewRect) {
        const snappedPreview = getMovePreviewWithGuides(interaction.nodeId, previewRect);
        moveNode(
          interaction.nodeId,
          snappedPreview.rect.x,
          snappedPreview.rect.y,
          snappedPreview.nextParentId ?? undefined,
        );
      }

      if (interaction.mode === "connect") {
        const targetElement = window.document.elementFromPoint(event.clientX, event.clientY);
        const targetNodeId = targetElement
          ?.closest("[data-node-id]")
          ?.getAttribute("data-node-id");

        if (targetNodeId && targetNodeId !== interaction.sourceId) {
          createEdge(interaction.sourceId, targetNodeId);
        }
      }

      if (interaction.mode === "resize" && previewRect) {
        resizeNode(
          interaction.nodeId,
          previewRect.width,
          previewRect.height,
          previewRect.x,
          previewRect.y,
        );
      }

      if (interaction.mode === "marquee" && marqueeRect) {
        const hits = Object.values(document.nodes)
          .filter((node) => {
            if (!isNodeVisibleInTree(document, node.id)) {
              return false;
            }

            const absolute = getAbsolutePosition(document, node.id);
            return (
              absolute.x < marqueeRect.x + marqueeRect.width &&
              absolute.x + node.width > marqueeRect.x &&
              absolute.y < marqueeRect.y + marqueeRect.height &&
              absolute.y + node.height > marqueeRect.y
            );
          })
          .map((node) => node.id);

        setSelection(
          interaction.additive
            ? [...new Set([...interaction.baseSelection, ...hits])]
            : hits,
        );
      }

      setInteraction(null);
      setPreviewRect(undefined);
      setMarqueeRect(undefined);
      setMoveGuides(null);
      setHoveredDropTarget(null);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [
    document,
    interaction,
    marqueeRect,
    moveNode,
    previewRect,
    resizeNode,
    createEdge,
    setBoardPan,
    setHoveredDropTarget,
    setSelection,
  ]);

  const boardDropTargets = useMemo(
    () =>
      getDropTargets(document.nodes)
        .sort((left, right) => {
          const depthDelta = getParentDepth(document, left.id) - getParentDepth(document, right.id);
          if (depthDelta !== 0) {
            return depthDelta;
          }

          return right.width * right.height - left.width * left.height;
        })
        .map((node) => {
        const absolute = getAbsolutePosition(document, node.id);
        return {
          nodeId: node.id,
          left: document.board.panX + absolute.x * document.board.zoom,
          top: document.board.panY + absolute.y * document.board.zoom,
          width: node.width * document.board.zoom,
          height: node.height * document.board.zoom,
          active: hoveredDropTarget === node.id,
        };
        }),
    [document, hoveredDropTarget],
  );

  const startPan = (clientX: number, clientY: number) => {
    setInteraction({
      mode: "pan",
      startClientX: clientX,
      startClientY: clientY,
      startPanX: document.board.panX,
      startPanY: document.board.panY,
    });
  };

  const onCanvasPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button === 1 || event.button === 2 || spacePressed) {
      startPan(event.clientX, event.clientY);
      return;
    }

    const target = event.target;
    const isBackground =
      target === event.currentTarget ||
      target instanceof SVGSVGElement ||
      (target instanceof SVGElement && target.tagName.toLowerCase() === "svg");

    if (isBackground) {
      const worldPoint = toWorldPoint(event.clientX, event.clientY);
      setInteraction({
        mode: "marquee",
        startX: worldPoint.x,
        startY: worldPoint.y,
        additive: event.shiftKey,
        baseSelection: selection,
      });
      if (!event.shiftKey) {
        clearSelection();
      }
    }
  };

  const onNodePointerDown = (
    nodeId: string,
    event: ReactPointerEvent<SVGGElement>,
  ) => {
    if (editingNodeId && editingNodeId !== nodeId) {
      commitInlineEdit();
    }

    event.stopPropagation();
    const node = document.nodes[nodeId];
    if (!node) {
      return;
    }

    if (event.button === 1 || event.button === 2 || spacePressed) {
      startPan(event.clientX, event.clientY);
      return;
    }

    if (event.shiftKey) {
      setSelection(
        selection.includes(nodeId)
          ? selection.filter((id) => id !== nodeId)
          : [...selection, nodeId],
      );
      return;
    }

    setSelection([nodeId]);

    if (event.button !== 0 || node.locked || selection.length > 1) {
      return;
    }

    setInteraction({
      mode: "move",
      nodeId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startX: node.x,
      startY: node.y,
    });
  };

  const onHandlePointerDown = (
    handle: "nw" | "ne" | "sw" | "se",
    event: ReactPointerEvent<SVGRectElement>,
  ) => {
    event.stopPropagation();
    const node = selectedNode;
    if (!node) {
      return;
    }

    setInteraction({
      mode: "resize",
      nodeId: node.id,
      handle,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startX: previewRect?.x ?? node.x,
      startY: previewRect?.y ?? node.y,
      startWidth: previewRect?.width ?? node.width,
      startHeight: previewRect?.height ?? node.height,
    });
  };

  const onNodeDoubleClick = (nodeId: string) => {
    const node = document.nodes[nodeId];
    if (!isInlineEditableNode(node)) {
      return;
    }

    setSelection([nodeId]);
    setEditingNodeId(nodeId);
    setEditingValue(getInlineEditableText(node));
  };

  const editingNode = editingNodeId ? document.nodes[editingNodeId] : null;
  const guideOverlay = palettePreview
    ? {
        parentId: palettePreview.parentId,
        guides: palettePreview.guides,
      }
    : moveGuides;
  const palettePreviewAbsolute =
    palettePreview
      ? (() => {
          const parentAbsolute =
            palettePreview.parentId === "board"
              ? { x: 0, y: 0 }
              : getAbsolutePosition(document, palettePreview.parentId);
          return {
            x: parentAbsolute.x + palettePreview.x,
            y: parentAbsolute.y + palettePreview.y,
          };
        })()
      : null;
  const guideBadge =
    document.board.guides && guideOverlay
      ? (() => {
          if (guideOverlay.badgeLabel) {
            const previewAbsolute =
              palettePreview && palettePreviewAbsolute
                ? {
                    x: palettePreviewAbsolute.x,
                    y: palettePreviewAbsolute.y,
                    width: palettePreview.width,
                    height: palettePreview.height,
                  }
                : previewRect
                  ? (() => {
                      const node = document.nodes[previewRect.nodeId];
                      if (!node) {
                        return null;
                      }

                      const parentAbsolute =
                        node.parentId === "board"
                          ? { x: 0, y: 0 }
                          : getAbsolutePosition(document, node.parentId);
                      return {
                        x: parentAbsolute.x + previewRect.x,
                        y: parentAbsolute.y + previewRect.y,
                        width: previewRect.width,
                        height: previewRect.height,
                      };
                    })()
                  : null;
            if (!previewAbsolute) {
              return null;
            }

            return {
              x: previewAbsolute.x + previewAbsolute.width / 2,
              y: previewAbsolute.y - 12,
              label: guideOverlay.badgeLabel,
            } satisfies GuideBadge;
          }

          if (guideOverlay.parentId === "board") {
            return null;
          }

          const parentNode = document.nodes[guideOverlay.parentId];
          if (!parentNode) {
            return null;
          }

          const parentAbsolute = getAbsolutePosition(document, guideOverlay.parentId);
          const hasVertical = guideOverlay.guides.some((guide) => guide.orientation === "vertical");
          const hasHorizontal = guideOverlay.guides.some((guide) => guide.orientation === "horizontal");
          if (!hasVertical && !hasHorizontal) {
            return null;
          }

          return {
            x: parentAbsolute.x + parentNode.width / 2,
            y: parentAbsolute.y + 14,
            label: hasVertical && hasHorizontal ? "Parent center" : hasVertical ? "Center X" : "Center Y",
          } satisfies GuideBadge;
        })()
      : null;
  const editingOverlay = editingNode && isInlineEditableNode(editingNode)
    ? (() => {
        const absolute = getAbsolutePosition(document, editingNode.id);
        const textOffsetX = editingNode.type === "checkbox" ? editingNode.boxSize + 8 : 0;
        return {
          left: document.board.panX + (absolute.x + textOffsetX) * document.board.zoom,
          top: document.board.panY + absolute.y * document.board.zoom,
          width: Math.max(60, (editingNode.width - textOffsetX) * document.board.zoom),
          height: Math.max(26, editingNode.height * document.board.zoom),
          textAlign: editingNode.type === "button" ? "center" : editingNode.textStyle.align,
          fontFamily: editingNode.textStyle.fontFamily,
          fontSize: `${editingNode.textStyle.fontSize * document.board.zoom}px`,
          fontWeight: editingNode.textStyle.fontWeight,
          lineHeight: editingNode.textStyle.lineHeight,
          color: editingNode.textStyle.color,
        };
      })()
    : null;
  const connectPreviewPath =
    interaction?.mode === "connect"
      ? (() => {
          const midX = interaction.startX + (interaction.currentX - interaction.startX) / 2;
          return `M ${interaction.startX} ${interaction.startY} L ${midX} ${interaction.startY} L ${midX} ${interaction.currentY} L ${interaction.currentX} ${interaction.currentY}`;
        })()
      : null;

  return (
    <div className="board-view">
      <div
        ref={(element) => {
          boardRef.current = element;
          setBoardDropRef(element);
        }}
        className="board-canvas"
        onPointerDown={onCanvasPointerDown}
        onContextMenu={(event) => event.preventDefault()}
        onWheel={(event) => {
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            const nextZoom = Math.min(3, Math.max(0.4, document.board.zoom - event.deltaY * 0.001));
            setBoardZoom(nextZoom);
            return;
          }

          setBoardPan(document.board.panX - event.deltaX, document.board.panY - event.deltaY);
        }}
        style={{
          backgroundImage: document.board.showGrid ? undefined : "none",
          backgroundSize: document.board.showGrid
            ? `${document.board.gridSize * document.board.zoom}px ${document.board.gridSize * document.board.zoom}px`
            : undefined,
          cursor:
            interaction?.mode === "pan"
              ? "grabbing"
              : spacePressed
                ? "grab"
                : interaction?.mode === "marquee"
                  ? "crosshair"
                  : "default",
        }}
        >
        <svg className="board-svg">
          <g transform={`translate(${document.board.panX} ${document.board.panY}) scale(${document.board.zoom})`}>
            {document.edgeIds.map((edgeId) => {
              const path = renderEdgePath(document, edgeId);
              const edge = document.edges[edgeId];
              if (
                !path ||
                !edge ||
                (edge.sourceId && !isNodeVisibleInTree(document, edge.sourceId)) ||
                (edge.targetId && !isNodeVisibleInTree(document, edge.targetId))
              ) {
                return null;
              }

              return (
                <path
                  key={edgeId}
                  d={path}
                  fill="none"
                  stroke={edge.strokeColor}
                  strokeWidth={edge.strokeWidth}
                  markerStart={edge.startArrow === "classic" ? "url(#arrowhead)" : undefined}
                  markerEnd={edge.endArrow === "classic" ? "url(#arrowhead)" : undefined}
                />
              );
            })}
            {connectPreviewPath ? (
              <path
                d={connectPreviewPath}
                fill="none"
                stroke="#0f766e"
                strokeWidth={2}
                strokeDasharray="6 4"
                markerEnd="url(#arrowhead)"
              />
            ) : null}
            <defs>
              <marker
                id="arrowhead"
                markerWidth="8"
                markerHeight="8"
                refX="6"
                refY="3"
                orient="auto-start-reverse"
                markerUnits="strokeWidth"
              >
                <path d="M 0 0 L 6 3 L 0 6 z" fill="context-stroke" />
              </marker>
            </defs>
            {document.rootIds.map((nodeId) => (
              <RenderNode
                key={nodeId}
                document={document}
                nodeId={nodeId}
                previewRect={previewRect}
                selectedIds={selectedIds}
                onNodePointerDown={onNodePointerDown}
                onNodeDoubleClick={(doubleClickedId, event) => {
                  event.stopPropagation();
                  onNodeDoubleClick(doubleClickedId);
                }}
              />
            ))}
            {document.board.guides && guideOverlay
              ? (() => {
                  const parentNode =
                    guideOverlay.parentId === "board" ? null : document.nodes[guideOverlay.parentId];
                  if (!parentNode) {
                    return null;
                  }

                  const parentAbsolute = getAbsolutePosition(document, guideOverlay.parentId);
                  return guideOverlay.guides.map((guide) =>
                    guide.orientation === "vertical" ? (
                      <line
                        key={`${guideOverlay.parentId}-vertical-${guide.position}`}
                        x1={parentAbsolute.x + guide.position}
                        y1={parentAbsolute.y}
                        x2={parentAbsolute.x + guide.position}
                        y2={parentAbsolute.y + parentNode.height}
                        stroke="#0f766e"
                        strokeWidth={1.5}
                        strokeDasharray="6 4"
                      />
                    ) : (
                      <line
                        key={`${guideOverlay.parentId}-horizontal-${guide.position}`}
                        x1={parentAbsolute.x}
                        y1={parentAbsolute.y + guide.position}
                        x2={parentAbsolute.x + parentNode.width}
                        y2={parentAbsolute.y + guide.position}
                        stroke="#0f766e"
                        strokeWidth={1.5}
                        strokeDasharray="6 4"
                      />
                    ),
                  );
                })()
              : null}
            {guideBadge ? (
              <g transform={`translate(${guideBadge.x} ${guideBadge.y})`}>
                <rect
                  x={-42}
                  y={-14}
                  width={84}
                  height={18}
                  rx={9}
                  fill="#0f766e"
                  fillOpacity={0.92}
                />
                <text
                  x={0}
                  y={-1}
                  fontSize={9}
                  fontWeight={700}
                  fill="#ffffff"
                  textAnchor="middle"
                >
                  {guideBadge.label}
                </text>
              </g>
            ) : null}
            {palettePreview && palettePreviewAbsolute ? (
              <g transform={`translate(${palettePreviewAbsolute.x} ${palettePreviewAbsolute.y})`}>
                <rect
                  width={palettePreview.width}
                  height={palettePreview.height}
                  rx={12}
                  fill="rgba(15, 118, 110, 0.08)"
                  stroke="#0f766e"
                  strokeWidth={1.5}
                  strokeDasharray="6 4"
                />
                <text x={12} y={22} fontSize={11} fontWeight={700} fill="#0f766e">
                  {palettePreview.label}
                </text>
              </g>
            ) : null}
            {marqueeRect ? (
              <rect
                x={marqueeRect.x}
                y={marqueeRect.y}
                width={marqueeRect.width}
                height={marqueeRect.height}
                fill="rgba(15, 118, 110, 0.08)"
                stroke="#0f766e"
                strokeDasharray="6 4"
              />
            ) : null}
            {selectedNode ? (
              <SelectionOverlay
                document={document}
                nodeId={selectedNode.id}
                zoom={document.board.zoom}
                previewRect={
                  previewRect && previewRect.nodeId === selectedNode.id
                    ? (() => {
                        const absolute = getAbsolutePosition(document, selectedNode.id);
                        return {
                          x: absolute.x + (previewRect.x - selectedNode.x),
                          y: absolute.y + (previewRect.y - selectedNode.y),
                          width: previewRect.width,
                          height: previewRect.height,
                        };
                      })()
                    : undefined
                }
                onHandlePointerDown={onHandlePointerDown}
                onConnectPointerDown={(event) => {
                  event.stopPropagation();
                  const absolute = getAbsolutePosition(document, selectedNode.id);
                  setInteraction({
                    mode: "connect",
                    sourceId: selectedNode.id,
                    startX: absolute.x + selectedNode.width,
                    startY: absolute.y + selectedNode.height / 2,
                    currentX: absolute.x + selectedNode.width,
                    currentY: absolute.y + selectedNode.height / 2,
                  });
                }}
              />
            ) : null}
          </g>
        </svg>
        {dropModeEnabled || interaction?.mode === "move" ? (
          <div className="drop-target-layer">
            {boardDropTargets.map((target) => (
              <DropTargetOverlay key={target.nodeId} {...target} />
            ))}
          </div>
        ) : null}
        {editingOverlay ? (
          <textarea
            ref={editorRef}
            className="inline-text-editor"
            value={editingValue}
            onChange={(event) => setEditingValue(event.target.value)}
            onBlur={commitInlineEdit}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                cancelInlineEdit();
                event.preventDefault();
              }
              if (event.key === "Enter" && !event.shiftKey) {
                commitInlineEdit();
                event.preventDefault();
              }
            }}
            style={editingOverlay}
          />
        ) : null}
      </div>
    </div>
  );
}
