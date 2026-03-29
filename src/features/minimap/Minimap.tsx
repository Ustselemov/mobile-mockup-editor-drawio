import { useMemo, type MouseEvent } from "react";

import { getAbsolutePosition } from "@/lib/geometry/coords";
import type { EditorDocument } from "@/lib/model/document";

type Bounds = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};

function getDocumentBounds(document: EditorDocument): Bounds | null {
  const bounds = Object.values(document.nodes)
    .map((node) => {
      const absolute = getAbsolutePosition(document, node.id);
      return {
        left: absolute.x,
        top: absolute.y,
        right: absolute.x + node.width,
        bottom: absolute.y + node.height,
      };
    })
    .reduce<Bounds | null>((accumulator, rect) => {
      if (!accumulator) {
        return rect;
      }

      return {
        left: Math.min(accumulator.left, rect.left),
        top: Math.min(accumulator.top, rect.top),
        right: Math.max(accumulator.right, rect.right),
        bottom: Math.max(accumulator.bottom, rect.bottom),
      };
    }, null);

  if (!bounds) {
    return null;
  }

  return {
    left: bounds.left - 80,
    top: bounds.top - 80,
    right: bounds.right + 80,
    bottom: bounds.bottom + 80,
  };
}

export function Minimap({
  document,
  viewport,
  onFocusPoint,
}: {
  document: EditorDocument;
  viewport: { width: number; height: number };
  onFocusPoint: (point: { x: number; y: number }) => void;
}) {
  const minimapBounds = useMemo(() => getDocumentBounds(document), [document]);

  const metrics = useMemo(() => {
    if (!minimapBounds) {
      return null;
    }

    const width = 168;
    const height = 126;
    const sourceWidth = Math.max(1, minimapBounds.right - minimapBounds.left);
    const sourceHeight = Math.max(1, minimapBounds.bottom - minimapBounds.top);
    const scale = Math.min((width - 20) / sourceWidth, (height - 20) / sourceHeight);
    const contentWidth = sourceWidth * scale;
    const contentHeight = sourceHeight * scale;
    const offsetX = (width - contentWidth) / 2;
    const offsetY = (height - contentHeight) / 2;
    const viewLeft = (-document.board.panX) / document.board.zoom;
    const viewTop = (-document.board.panY) / document.board.zoom;
    const viewWidth = viewport.width / document.board.zoom;
    const viewHeight = viewport.height / document.board.zoom;

    return {
      width,
      height,
      scale,
      offsetX,
      offsetY,
      sourceWidth,
      sourceHeight,
      viewLeft,
      viewTop,
      viewWidth,
      viewHeight,
    };
  }, [document.board.panX, document.board.panY, document.board.zoom, minimapBounds, viewport.height, viewport.width]);

  if (!minimapBounds || !metrics) {
    return null;
  }

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const localX = event.clientX - rect.left;
    const localY = event.clientY - rect.top;
    const worldX =
      minimapBounds.left + (localX - metrics.offsetX) / metrics.scale;
    const worldY =
      minimapBounds.top + (localY - metrics.offsetY) / metrics.scale;

    onFocusPoint({ x: worldX, y: worldY });
  };

  return (
    <button type="button" className="minimap" onClick={handleClick} title="Click to recenter the board">
      <span className="minimap-label">Minimap</span>
      <svg viewBox={`0 0 ${metrics.width} ${metrics.height}`} aria-hidden="true">
        <rect
          x={0.5}
          y={0.5}
          width={metrics.width - 1}
          height={metrics.height - 1}
          rx={16}
          fill="#f7fbfa"
          stroke="rgba(22, 51, 58, 0.12)"
        />
        {document.rootIds.map((nodeId) => {
          const node = document.nodes[nodeId];
          if (!node || !node.visible) {
            return null;
          }

          const absolute = getAbsolutePosition(document, node.id);
          const x =
            metrics.offsetX + (absolute.x - minimapBounds.left) * metrics.scale;
          const y =
            metrics.offsetY + (absolute.y - minimapBounds.top) * metrics.scale;

          return (
            <rect
              key={node.id}
              x={x}
              y={y}
              width={Math.max(3, node.width * metrics.scale)}
              height={Math.max(3, node.height * metrics.scale)}
              rx={node.type === "screen" ? 5 : 3}
              fill={node.type === "screen" ? "rgba(15, 118, 110, 0.18)" : "rgba(22, 51, 58, 0.08)"}
              stroke={node.type === "screen" ? "#0f766e" : "rgba(22, 51, 58, 0.16)"}
              strokeWidth={0.8}
            />
          );
        })}
        <rect
          x={metrics.offsetX + (metrics.viewLeft - minimapBounds.left) * metrics.scale}
          y={metrics.offsetY + (metrics.viewTop - minimapBounds.top) * metrics.scale}
          width={Math.max(12, metrics.viewWidth * metrics.scale)}
          height={Math.max(12, metrics.viewHeight * metrics.scale)}
          rx={10}
          fill="rgba(15, 118, 110, 0.08)"
          stroke="#0f766e"
          strokeWidth={1.3}
        />
      </svg>
    </button>
  );
}
