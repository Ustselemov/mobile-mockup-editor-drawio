import type {
  CSSProperties,
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
} from "react";

import { getAbsolutePosition } from "@/lib/geometry/coords";
import type { EditorDocument, EditorNode, TextStyle } from "@/lib/model/document";
import { isNodeVisibleInTree } from "@/lib/model/node-utils";

type PreviewRect = {
  nodeId: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

function createTextStyle(style: TextStyle, extra?: CSSProperties): CSSProperties {
  return {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems:
      style.verticalAlign === "top"
        ? "flex-start"
        : style.verticalAlign === "bottom"
          ? "flex-end"
          : "center",
    justifyContent:
      style.align === "center"
        ? "center"
        : style.align === "right"
          ? "flex-end"
          : "flex-start",
    fontFamily: style.fontFamily,
    fontSize: `${style.fontSize}px`,
    lineHeight: style.lineHeight,
    fontWeight: style.fontWeight,
    color: style.color,
    textAlign: style.align,
    overflow: "hidden",
    ...extra,
  };
}

function foreignDiv(text: string, style: TextStyle, extra?: CSSProperties) {
  return (
    <div style={createTextStyle(style, extra)}>
      {text}
    </div>
  );
}

function applyPreview(node: EditorNode, previewRect?: PreviewRect): EditorNode {
  if (!previewRect || previewRect.nodeId !== node.id) {
    return node;
  }

  return {
    ...node,
    x: previewRect.x,
    y: previewRect.y,
    width: previewRect.width,
    height: previewRect.height,
  };
}

function RenderNodeInner({
  document,
  node,
  previewRect,
  selectedIds,
  onNodePointerDown,
  onNodeDoubleClick,
}: {
  document: EditorDocument;
  node: EditorNode;
  previewRect?: PreviewRect;
  selectedIds: Set<string>;
  onNodePointerDown: (nodeId: string, event: ReactPointerEvent<SVGGElement>) => void;
  onNodeDoubleClick?: (nodeId: string, event: ReactMouseEvent<SVGGElement>) => void;
}) {
  const current = applyPreview(node, previewRect);
  const isSelected = selectedIds.has(current.id);

  if (current.type === "text") {
    return (
      <g
        data-node-id={current.id}
        data-node-type={current.type}
        data-testid={`node-${current.id}`}
        transform={`translate(${current.x} ${current.y})`}
        onPointerDown={(event) => onNodePointerDown(current.id, event)}
        onDoubleClick={(event) => onNodeDoubleClick?.(current.id, event)}
      >
        <rect width={current.width} height={current.height} fill="transparent" />
        <foreignObject width={current.width} height={current.height} pointerEvents="none">
          {foreignDiv(current.text, current.textStyle, {
            display: "block",
          })}
        </foreignObject>
        {isSelected ? <rect width={current.width} height={current.height} fill="none" stroke="#0f766e" strokeDasharray="4 2" /> : null}
      </g>
    );
  }

  if (current.type === "segmentedControl") {
    const itemWidth = current.items.length > 0 ? current.width / current.items.length : current.width;
    return (
      <g
        data-node-id={current.id}
        data-node-type={current.type}
        data-testid={`node-${current.id}`}
        transform={`translate(${current.x} ${current.y})`}
        onPointerDown={(event) => onNodePointerDown(current.id, event)}
      >
        {current.label ? (
          <text x={0} y={-8} fontSize={9} fontWeight={700} fill="#66757a">
            {current.label}
          </text>
        ) : null}
        <rect
          width={current.width}
          height={current.height}
          rx={current.borderRadius ?? 12}
          fill={current.fillColor ?? "#ffffff"}
          stroke={current.strokeColor ?? "#d7e1e3"}
          strokeWidth={current.strokeWidth ?? 1}
        />
        {current.items.map((item, index) => (
          <g key={`${current.id}-segment-${index}`} transform={`translate(${index * itemWidth} 0)`}>
            <rect
              x={2}
              y={2}
              width={Math.max(0, itemWidth - 4)}
              height={Math.max(0, current.itemHeight - 4)}
              rx={Math.max(8, (current.borderRadius ?? 12) - 2)}
              fill={index === current.activeIndex ? current.activeFill : current.inactiveFill}
              stroke={index === current.activeIndex ? current.activeStroke : current.inactiveStroke}
              strokeWidth={1}
            />
            <foreignObject
              x={2}
              y={2}
              width={Math.max(0, itemWidth - 4)}
              height={Math.max(0, current.itemHeight - 4)}
              pointerEvents="none"
            >
              {foreignDiv(item, current.textStyle)}
            </foreignObject>
          </g>
        ))}
        {isSelected ? (
          <rect
            width={current.width}
            height={current.height}
            rx={current.borderRadius ?? 12}
            fill="none"
            stroke="#0f766e"
            strokeDasharray="4 2"
          />
        ) : null}
      </g>
    );
  }

  if (current.type === "badge") {
    return (
      <g
        data-node-id={current.id}
        data-node-type={current.type}
        data-testid={`node-${current.id}`}
        transform={`translate(${current.x} ${current.y})`}
        onPointerDown={(event) => onNodePointerDown(current.id, event)}
        onDoubleClick={(event) => onNodeDoubleClick?.(current.id, event)}
      >
        <rect
          width={current.width}
          height={current.height}
          rx={current.borderRadius ?? 9}
          fill={current.fillColor ?? "#dae8fc"}
          stroke={current.strokeColor ?? "#6c8ebf"}
          strokeWidth={current.strokeWidth ?? 1}
        />
        <foreignObject width={current.width} height={current.height} pointerEvents="none">
          {foreignDiv(current.text, current.textStyle)}
        </foreignObject>
        {isSelected ? (
          <rect
            width={current.width}
            height={current.height}
            rx={current.borderRadius ?? 9}
            fill="none"
            stroke="#0f766e"
            strokeDasharray="4 2"
          />
        ) : null}
      </g>
    );
  }

  if (current.type === "banner") {
    return (
      <g
        data-node-id={current.id}
        data-node-type={current.type}
        data-testid={`node-${current.id}`}
        transform={`translate(${current.x} ${current.y})`}
        onPointerDown={(event) => onNodePointerDown(current.id, event)}
      >
        <rect
          width={current.width}
          height={current.height}
          rx={current.borderRadius ?? 16}
          fill={current.fillColor ?? "#ffe6cc"}
          stroke={current.strokeColor ?? "#d79b00"}
          strokeWidth={current.strokeWidth ?? 1}
        />
        <foreignObject
          x={14}
          y={12}
          width={Math.max(0, current.width - 28)}
          height={Math.max(0, current.height - 24)}
          pointerEvents="none"
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "grid",
              alignContent: "center",
              gap: "4px",
              overflow: "hidden",
            }}
          >
            <div style={createTextStyle(current.titleStyle, { height: "auto" })}>{current.title}</div>
            <div style={createTextStyle(current.bodyStyle, { height: "auto" })}>{current.body}</div>
          </div>
        </foreignObject>
        {isSelected ? (
          <rect
            width={current.width}
            height={current.height}
            rx={current.borderRadius ?? 16}
            fill="none"
            stroke="#0f766e"
            strokeDasharray="4 2"
          />
        ) : null}
      </g>
    );
  }

  if (current.type === "button") {
    return (
      <g
        data-node-id={current.id}
        data-node-type={current.type}
        data-testid={`node-${current.id}`}
        transform={`translate(${current.x} ${current.y})`}
        onPointerDown={(event) => onNodePointerDown(current.id, event)}
        onDoubleClick={(event) => onNodeDoubleClick?.(current.id, event)}
      >
        <rect
          width={current.width}
          height={current.height}
          rx={current.borderRadius ?? 14}
          fill={current.fillColor ?? "#d5e8d4"}
          stroke={current.strokeColor ?? "#82b366"}
          strokeWidth={current.strokeWidth ?? 1}
        />
        <foreignObject width={current.width} height={current.height} pointerEvents="none">
          {foreignDiv(current.text, current.textStyle)}
        </foreignObject>
        {isSelected ? (
          <rect
            width={current.width}
            height={current.height}
            rx={current.borderRadius ?? 14}
            fill="none"
            stroke="#0f766e"
            strokeDasharray="4 2"
          />
        ) : null}
      </g>
    );
  }

  if (current.type === "checkbox") {
    const boxY = (current.height - current.boxSize) / 2;
    const midY = boxY + current.boxSize / 2;
    return (
      <g
        data-node-id={current.id}
        data-node-type={current.type}
        data-testid={`node-${current.id}`}
        transform={`translate(${current.x} ${current.y})`}
        onPointerDown={(event) => onNodePointerDown(current.id, event)}
        onDoubleClick={(event) => onNodeDoubleClick?.(current.id, event)}
      >
        <rect
          y={boxY}
          width={current.boxSize}
          height={current.boxSize}
          rx={current.borderRadius ?? 6}
          fill={current.fillColor ?? "#ffffff"}
          stroke={current.strokeColor ?? "#0f766e"}
          strokeWidth={current.strokeWidth ?? 2}
        />
        {current.checked ? (
          <path
            d={`M ${current.boxSize * 0.24} ${midY} L ${current.boxSize * 0.42} ${midY + current.boxSize * 0.22} L ${current.boxSize * 0.76} ${midY - current.boxSize * 0.24}`}
            fill="none"
            stroke="#0f766e"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : null}
        <foreignObject
          x={current.boxSize + 8}
          width={current.width - current.boxSize - 8}
          height={current.height}
          pointerEvents="none"
        >
          {foreignDiv(current.text, current.textStyle)}
        </foreignObject>
        {isSelected ? (
          <rect
            width={current.width}
            height={current.height}
            rx={current.borderRadius ?? 6}
            fill="none"
            stroke="#0f766e"
            strokeDasharray="4 2"
          />
        ) : null}
      </g>
    );
  }

  if (current.type === "field") {
    return (
      <g
        data-node-id={current.id}
        data-node-type={current.type}
        data-testid={`node-${current.id}`}
        transform={`translate(${current.x} ${current.y})`}
        onPointerDown={(event) => onNodePointerDown(current.id, event)}
      >
        <rect
          width={current.width}
          height={current.height}
          rx={current.borderRadius ?? 10}
          fill={current.fillColor ?? "#f7fafb"}
          stroke={current.strokeColor ?? "#d7e1e3"}
          strokeWidth={current.strokeWidth ?? 1}
        />
        <foreignObject
          x={12}
          y={7}
          width={Math.max(0, current.width - 24)}
          height={Math.max(0, current.height - 14)}
          pointerEvents="none"
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "grid",
              alignContent: "center",
              gap: "2px",
              overflow: "hidden",
            }}
          >
            <div style={createTextStyle(current.labelStyle, { height: "auto" })}>{current.label}</div>
            <div style={createTextStyle(current.valueStyle, { height: "auto" })}>{current.value}</div>
          </div>
        </foreignObject>
        {isSelected ? (
          <rect
            width={current.width}
            height={current.height}
            rx={current.borderRadius ?? 10}
            fill="none"
            stroke="#0f766e"
            strokeDasharray="4 2"
          />
        ) : null}
      </g>
    );
  }

  if (current.type === "flowLane") {
    return (
      <g
        data-node-id={current.id}
        data-node-type={current.type}
        data-testid={`node-${current.id}`}
        transform={`translate(${current.x} ${current.y})`}
        onPointerDown={(event) => onNodePointerDown(current.id, event)}
      >
        <rect width={current.width} height={current.height} rx={10} fill="#eff6f5" stroke="#d7e1e3" strokeWidth={1} />
        <rect width={current.width} height={current.startSize} rx={10} fill="#e5efee" stroke="#d7e1e3" strokeWidth={1} />
        <text x={16} y={22} fontSize={12} fontWeight={700} fill="#476065">
          {current.title}
        </text>
        {current.children.map((childId) => (
          <RenderNode
            key={childId}
            document={document}
            nodeId={childId}
            previewRect={previewRect}
            selectedIds={selectedIds}
            onNodePointerDown={onNodePointerDown}
            onNodeDoubleClick={onNodeDoubleClick}
          />
        ))}
      </g>
    );
  }

  if (current.type === "screen" || current.type === "container") {
    const clipId = `clip-${current.id}`;
    return (
      <g
        data-node-id={current.id}
        data-node-type={current.type}
        data-testid={`node-${current.id}`}
        transform={`translate(${current.x} ${current.y})`}
        onPointerDown={(event) => onNodePointerDown(current.id, event)}
      >
        {current.type === "screen" ? (
          <>
            <text x={current.width / 2} y={-10} fontSize={14} fontWeight={700} fill="#1f2b2d" textAnchor="middle">
              {current.title}
            </text>
            <rect
              width={current.width}
              height={current.height}
              rx={current.borderRadius ?? 14}
              fill={current.fillColor ?? "#ffffff"}
              stroke={current.strokeColor ?? "#1c2a30"}
              strokeWidth={current.strokeWidth ?? 2}
            />
          </>
        ) : (
          <>
            <rect
              width={current.width}
              height={current.height}
              rx={current.borderRadius ?? 10}
              fill={current.fillColor ?? "#f7fafb"}
              stroke={current.strokeColor ?? "#d7e1e3"}
              strokeWidth={current.strokeWidth ?? 1}
            />
            {current.title ? (
              <text x={16} y={20} fontSize={10} fontWeight={700} fill="#66757a">
                {current.title}
              </text>
            ) : null}
          </>
        )}
        <defs>
          <clipPath id={clipId}>
            <rect width={current.width} height={current.height} rx={current.borderRadius ?? 10} />
          </clipPath>
        </defs>
        <g clipPath={`url(#${clipId})`}>
          {current.children.map((childId) => (
            <RenderNode
              key={childId}
              document={document}
              nodeId={childId}
              previewRect={previewRect}
              selectedIds={selectedIds}
              onNodePointerDown={onNodePointerDown}
              onNodeDoubleClick={onNodeDoubleClick}
            />
          ))}
        </g>
        {isSelected ? (
          <rect
            width={current.width}
            height={current.height}
            rx={current.borderRadius ?? 10}
            fill="none"
            stroke="#0f766e"
            strokeDasharray="6 4"
          />
        ) : null}
      </g>
    );
  }

  return (
    <g
      data-node-id={current.id}
      data-node-type={current.type}
      data-testid={`node-${current.id}`}
      transform={`translate(${current.x} ${current.y})`}
      onPointerDown={(event) => onNodePointerDown(current.id, event)}
    >
      <rect
        width={current.width}
        height={current.height}
        rx={current.borderRadius ?? 10}
        fill={current.fillColor ?? "#fff4e6"}
        stroke={current.strokeColor ?? "#d79b00"}
        strokeDasharray="4 2"
      />
      <text x={12} y={20} fontSize={11} fill="#6f4b18">
        Unsupported
      </text>
      {isSelected ? (
        <rect
          width={current.width}
          height={current.height}
          rx={current.borderRadius ?? 10}
          fill="none"
          stroke="#0f766e"
          strokeDasharray="4 2"
        />
      ) : null}
    </g>
  );
}

export function RenderNode({
  document,
  nodeId,
  previewRect,
  selectedIds,
  onNodePointerDown,
  onNodeDoubleClick,
}: {
  document: EditorDocument;
  nodeId: string;
  previewRect?: PreviewRect;
  selectedIds: Set<string>;
  onNodePointerDown: (nodeId: string, event: ReactPointerEvent<SVGGElement>) => void;
  onNodeDoubleClick?: (nodeId: string, event: ReactMouseEvent<SVGGElement>) => void;
}) {
  const node = document.nodes[nodeId];
  if (!node || !isNodeVisibleInTree(document, nodeId)) {
    return null;
  }

  return (
    <RenderNodeInner
      document={document}
      node={node}
      previewRect={previewRect}
      selectedIds={selectedIds}
      onNodePointerDown={onNodePointerDown}
      onNodeDoubleClick={onNodeDoubleClick}
    />
  );
}

export function renderEdgePath(
  document: EditorDocument,
  edgeId: string,
): string | null {
  const edge = document.edges[edgeId];
  if (!edge) {
    return null;
  }

  const source = edge.sourceId ? document.nodes[edge.sourceId] : undefined;
  const target = edge.targetId ? document.nodes[edge.targetId] : undefined;

  const sourcePoint = source
    ? (() => {
        const absolute = getAbsolutePosition(document, source.id);
        return { x: absolute.x + source.width, y: absolute.y + source.height / 2 };
      })()
    : edge.sourcePoint;

  const targetPoint = target
    ? (() => {
        const absolute = getAbsolutePosition(document, target.id);
        return { x: absolute.x, y: absolute.y + target.height / 2 };
      })()
    : edge.targetPoint;

  if (!sourcePoint || !targetPoint) {
    return null;
  }

  const points =
    edge.waypoints && edge.waypoints.length > 0
      ? [sourcePoint, ...edge.waypoints, targetPoint]
      : edge.orthogonal
        ? [
            sourcePoint,
            {
              x: sourcePoint.x + (targetPoint.x - sourcePoint.x) / 2,
              y: sourcePoint.y,
            },
            {
              x: sourcePoint.x + (targetPoint.x - sourcePoint.x) / 2,
              y: targetPoint.y,
            },
            targetPoint,
          ]
        : [sourcePoint, targetPoint];

  return `M ${points.map((point) => `${point.x} ${point.y}`).join(" L ")}`;
}
