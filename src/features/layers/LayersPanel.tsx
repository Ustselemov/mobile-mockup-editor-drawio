import { useMemo } from "react";
import { useDraggable, useDroppable } from "@dnd-kit/core";

import { useEditorStore } from "@/core/store/editorStore";
import {
  getNodeLabel,
  isContainerNode,
  isNodeVisibleInTree,
} from "@/lib/model/node-utils";
import type { EditorEdge, EditorNode, ParentId } from "@/lib/model/document";

function LayerActionButton({
  label,
  title,
  onClick,
}: {
  label: string;
  title: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="layer-action"
      title={title}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
    >
      {label}
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
        className={`layer-row-shell${isOver ? " is-over" : ""}`}
        style={{ paddingLeft: `${12 + depth * 16}px` }}
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
          <span className="layer-type">{node.type}</span>
          <span className="layer-label">{getNodeLabel(node) || node.name || node.id}</span>
        </button>
        <div className="layer-actions">
          <LayerActionButton
            label={node.visible ? "Hide" : "Show"}
            title={node.visible ? "Hide layer" : "Show layer"}
            onClick={() => toggleNodeVisibility(node.id)}
          />
          <LayerActionButton
            label={node.locked ? "Unlock" : "Lock"}
            title={node.locked ? "Unlock layer" : "Lock layer"}
            onClick={() => toggleNodeLock(node.id)}
          />
          <LayerActionButton
            label="Raise"
            title="Bring forward"
            onClick={() => reorderNode(node.id, "forward")}
          />
          <LayerActionButton
            label="Lower"
            title="Send backward"
            onClick={() => reorderNode(node.id, "backward")}
          />
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
    <div
      className="layer-row layer-row-edge"
      style={{ paddingLeft: `${12 + depth * 16}px` }}
    >
      <span className="layer-type">edge</span>
      <span className="layer-label">
        {edge.sourceId ?? "point"} -&gt; {edge.targetId ?? "point"}
      </span>
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
        <h2>Layers</h2>
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
