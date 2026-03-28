import type { PointerEvent as ReactPointerEvent } from "react";

import { getAbsolutePosition } from "@/lib/geometry/coords";
import type { EditorDocument } from "@/lib/model/document";

const HANDLES = [
  { key: "nw", x: 0, y: 0, cursor: "nwse-resize" },
  { key: "ne", x: 1, y: 0, cursor: "nesw-resize" },
  { key: "sw", x: 0, y: 1, cursor: "nesw-resize" },
  { key: "se", x: 1, y: 1, cursor: "nwse-resize" },
] as const;

type ResizeHandle = (typeof HANDLES)[number]["key"];

export function SelectionOverlay({
  document,
  nodeId,
  zoom,
  previewRect,
  onHandlePointerDown,
}: {
  document: EditorDocument;
  nodeId: string;
  zoom: number;
  previewRect?: { x: number; y: number; width: number; height: number };
  onHandlePointerDown: (
    handle: ResizeHandle,
    event: ReactPointerEvent<SVGRectElement>,
  ) => void;
}) {
  const node = document.nodes[nodeId];
  if (!node) {
    return null;
  }

  const absolute = getAbsolutePosition(document, nodeId);
  const x = previewRect?.x ?? absolute.x;
  const y = previewRect?.y ?? absolute.y;
  const width = previewRect?.width ?? node.width;
  const height = previewRect?.height ?? node.height;
  const strokeWidth = 1.5 / zoom;
  const handleSize = 8 / zoom;

  return (
    <g className="selection-overlay">
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill="none"
        stroke="#0f766e"
        strokeWidth={strokeWidth}
        strokeDasharray={`${6 / zoom} ${4 / zoom}`}
      />
      {HANDLES.map((handle) => (
        <rect
          key={handle.key}
          x={x + width * handle.x - handleSize / 2}
          y={y + height * handle.y - handleSize / 2}
          width={handleSize}
          height={handleSize}
          fill="#ffffff"
          stroke="#0f766e"
          strokeWidth={strokeWidth}
          style={{ cursor: handle.cursor }}
          onPointerDown={(event) => onHandlePointerDown(handle.key, event)}
        />
      ))}
    </g>
  );
}
