import { useMemo, type ReactNode } from "react";
import { useDraggable, useDroppable } from "@dnd-kit/core";

import { useEditorStore } from "@/core/store/editorStore";
import {
  getNodeLabel,
  isContainerNode,
  isNodeVisibleInTree,
} from "@/lib/model/node-utils";
import type { EditorEdge, EditorNode, ParentId } from "@/lib/model/document";

function getLayerTypeLabel(node: EditorNode) {
  switch (node.type) {
    case "screen":
      return "Screen";
    case "container":
      return "Section";
    case "flowLane":
      return "Lane";
    case "field":
      return "Field";
    case "segmentedControl":
      return "Segmented";
    case "badge":
      return "Badge";
    case "banner":
      return "Banner";
    case "text":
      return "Text";
    case "button":
      return "Button";
    case "checkbox":
      return "Checkbox";
    case "unsupported":
      return "Unsupported";
  }
}

function getCompactLayerLabel(node: EditorNode) {
  const label = getNodeLabel(node) || node.name || node.id;
  if (node.type === "segmentedControl" && !node.label) {
    return "Segmented control";
  }
  return label;
}

function LayerGlyph({
  type,
}: {
  type: EditorNode["type"] | "edge";
}) {
  if (type === "edge") {
    return (
      <svg viewBox="0 0 20 20" aria-hidden="true">
        <path d="M4 14h4l2-8h6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="m13 3 3 3-3 3" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (type === "screen") {
    return (
      <svg viewBox="0 0 20 20" aria-hidden="true">
        <rect x="4.5" y="2.5" width="11" height="15" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    );
  }

  if (type === "container" || type === "banner" || type === "flowLane") {
    return (
      <svg viewBox="0 0 20 20" aria-hidden="true">
        <rect x="3.5" y="4.5" width="13" height="11" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
        {type === "flowLane" ? <path d="M4 8h12" fill="none" stroke="currentColor" strokeWidth="1.4" /> : null}
      </svg>
    );
  }

  if (type === "field" || type === "button" || type === "badge") {
    return (
      <svg viewBox="0 0 20 20" aria-hidden="true">
        <rect x="3.5" y="6" width="13" height="8" rx="3" fill="none" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    );
  }

  if (type === "checkbox") {
    return (
      <svg viewBox="0 0 20 20" aria-hidden="true">
        <rect x="3.5" y="5" width="5.5" height="5.5" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path d="M12 7.75h4.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === "segmentedControl") {
    return (
      <svg viewBox="0 0 20 20" aria-hidden="true">
        <rect x="3.5" y="6" width="13" height="8" rx="4" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path d="M10 6v8" fill="none" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M4 10h12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M4 6h8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M4 14h6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function LayerActionButton({
  label,
  title,
  children,
  onClick,
}: {
  label: string;
  title: string;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="layer-action"
      aria-label={label}
      title={title}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
    >
      {children}
    </button>
  );
}

function LayerRow({
  node,
  depth,
}: {
  node: EditorNode;
  depth: number;
}) {
  const setSelection = useEditorStore((state) => state.setSelection);
  const selection = useEditorStore((state) => state.selection);
  const selected = useEditorStore((state) => state.selection.includes(node.id));
  const toggleNodeVisibility = useEditorStore((state) => state.toggleNodeVisibility);
  const toggleNodeLock = useEditorStore((state) => state.toggleNodeLock);
  const reorderNode = useEditorStore((state) => state.reorderNode);
  const visibleInTree = useEditorStore((state) => isNodeVisibleInTree(state.document, node.id));
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `drop:${node.id}`,
    data: { kind: "drop-target", parentId: node.id },
  });
  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
    isDragging,
  } = useDraggable({
    id: `layer:${node.id}`,
    data: { kind: "layer-node", nodeId: node.id, label: node.type },
  });

  return (
    <>
      <div
        ref={setDropRef}
        className={`layer-row-shell${isOver ? " is-over" : ""}${selected ? " is-selected" : ""}`}
        style={{ paddingLeft: `${10 + depth * 14}px` }}
      >
        <button
          ref={setDragRef}
          type="button"
          className={`layer-row${selected ? " is-selected" : ""}${isDragging ? " is-dragging" : ""}${!node.visible ? " is-hidden" : ""}${node.locked ? " is-locked" : ""}${!visibleInTree ? " is-muted" : ""}`}
          onClick={(event) => {
            if (event.shiftKey) {
              setSelection(
                selection.includes(node.id)
                  ? selection.filter((id) => id !== node.id)
                  : [...selection, node.id],
              );
              return;
            }

            setSelection([node.id]);
          }}
          {...listeners}
          {...attributes}
        >
          <span className={`layer-glyph is-${node.type}`} aria-hidden="true">
            <LayerGlyph type={node.type} />
          </span>
          <span className="layer-label-stack">
            <span className="layer-primary-label">{getCompactLayerLabel(node)}</span>
            <span className="layer-secondary-label">{getLayerTypeLabel(node)}</span>
          </span>
        </button>
        <div className="layer-actions">
          <LayerActionButton
            label={node.visible ? "Hide layer" : "Show layer"}
            title={node.visible ? "Hide layer" : "Show layer"}
            onClick={() => toggleNodeVisibility(node.id)}
          >
            <svg viewBox="0 0 20 20" aria-hidden="true">
              {node.visible ? (
                <>
                  <path d="M2.5 10s2.5-4.5 7.5-4.5S17.5 10 17.5 10 15 14.5 10 14.5 2.5 10 2.5 10Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="10" cy="10" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.5" />
                </>
              ) : (
                <>
                  <path d="M3.5 4 16.5 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M4.5 10s2-3.5 5.5-4.2c3.5-.7 6 2.2 6 2.2" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </>
              )}
            </svg>
          </LayerActionButton>
          <LayerActionButton
            label={node.locked ? "Unlock layer" : "Lock layer"}
            title={node.locked ? "Unlock layer" : "Lock layer"}
            onClick={() => toggleNodeLock(node.id)}
          >
            <svg viewBox="0 0 20 20" aria-hidden="true">
              {node.locked ? (
                <>
                  <rect x="5" y="9" width="10" height="7" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M7 9V7a3 3 0 0 1 6 0v2" fill="none" stroke="currentColor" strokeWidth="1.5" />
                </>
              ) : (
                <>
                  <rect x="5" y="9" width="10" height="7" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M12.5 9V7a2.5 2.5 0 1 0-5 0" fill="none" stroke="currentColor" strokeWidth="1.5" />
                </>
              )}
            </svg>
          </LayerActionButton>
          <LayerActionButton
            label="Bring forward"
            title="Bring forward"
            onClick={() => reorderNode(node.id, "forward")}
          >
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <path d="M10 5v10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="m6.5 8 3.5-3.5L13.5 8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </LayerActionButton>
          <LayerActionButton
            label="Send backward"
            title="Send backward"
            onClick={() => reorderNode(node.id, "backward")}
          >
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <path d="M10 5v10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="m6.5 12 3.5 3.5 3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </LayerActionButton>
        </div>
      </div>
      {isContainerNode(node) &&
        node.children.map((childId) => (
          <ConnectedLayerRow key={childId} nodeId={childId} depth={depth + 1} />
        ))}
      {(node.type === "flowLane" || node.type === "screen") ? (
        <EdgeRowsForParent parentId={node.id} depth={depth + 1} />
      ) : null}
    </>
  );
}

function ConnectedLayerRow({
  nodeId,
  depth,
}: {
  nodeId: string;
  depth: number;
}) {
  const node = useEditorStore((state) => state.document.nodes[nodeId]);
  if (!node) {
    return null;
  }

  return <LayerRow node={node} depth={depth} />;
}

function EdgeRow({
  edge,
  depth,
}: {
  edge: EditorEdge;
  depth: number;
}) {
  return (
    <div className="layer-row-shell is-edge" style={{ paddingLeft: `${10 + depth * 14}px` }}>
      <div className="layer-row layer-row-edge">
        <span className="layer-glyph is-edge" aria-hidden="true">
          <LayerGlyph type="edge" />
        </span>
        <span className="layer-label-stack">
          <span className="layer-primary-label">
            {edge.sourceId ?? "point"} {"->"} {edge.targetId ?? "point"}
          </span>
          <span className="layer-secondary-label">Connection</span>
        </span>
      </div>
    </div>
  );
}

function EdgeRowsForParent({
  parentId,
  depth,
}: {
  parentId: ParentId;
  depth: number;
}) {
  const edgeIds = useEditorStore((state) => state.document.edgeIds);
  const edgesById = useEditorStore((state) => state.document.edges);
  const edges = useMemo(
    () =>
      edgeIds
        .map((edgeId) => edgesById[edgeId])
        .filter((edge): edge is EditorEdge => Boolean(edge) && edge.parentId === parentId),
    [edgeIds, edgesById, parentId],
  );

  if (edges.length === 0) {
    return null;
  }

  return (
    <>
      {edges.map((edge) => (
        <EdgeRow key={edge.id} edge={edge} depth={depth} />
      ))}
    </>
  );
}

export function LayersPanel() {
  const rootIds = useEditorStore((state) => state.document.rootIds);
  const visibleNodes = useEditorStore(
    (state) => Object.values(state.document.nodes).filter((node) => node.visible).length,
  );
  const totalNodes = useEditorStore((state) => Object.keys(state.document.nodes).length);
  const { setNodeRef, isOver } = useDroppable({
    id: "drop:board",
    data: { kind: "drop-target", parentId: "board" satisfies ParentId },
  });

  return (
    <section className="sidebar-section">
      <header className="sidebar-header">
        <div>
          <h2>Layers</h2>
          <span className="sidebar-description">Structure of the board and nested elements.</span>
        </div>
        <span className="sidebar-meta">
          {visibleNodes}/{totalNodes} visible
        </span>
      </header>
      <div ref={setNodeRef} className={`layers-tree${isOver ? " is-over" : ""}`}>
        <div className="layer-root">Board</div>
        {rootIds.map((nodeId) => (
          <ConnectedLayerRow key={nodeId} nodeId={nodeId} depth={1} />
        ))}
        <EdgeRowsForParent parentId="board" depth={1} />
      </div>
    </section>
  );
}
