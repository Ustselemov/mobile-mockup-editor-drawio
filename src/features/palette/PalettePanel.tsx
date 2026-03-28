import { useDraggable } from "@dnd-kit/core";

import { componentPresetItems } from "@/core/demo/componentPresets";
import { useEditorStore } from "@/core/store/editorStore";
import { paletteItems } from "@/lib/model/defaults";
import { isContainerNode } from "@/lib/model/node-utils";
import type { PaletteItemType } from "@/lib/model/document";

function PaletteCard({
  type,
  label,
  description,
}: {
  type: PaletteItemType;
  label: string;
  description: string;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette:${type}`,
    data: {
      kind: "palette",
      itemType: type,
      label,
    },
  });

  return (
    <button
      ref={setNodeRef}
      type="button"
      className={`palette-card${isDragging ? " is-dragging" : ""}`}
      {...listeners}
      {...attributes}
    >
      <strong>{label}</strong>
      <span>{description}</span>
    </button>
  );
}

export function PalettePanel() {
  const document = useEditorStore((state) => state.document);
  const selection = useEditorStore((state) => state.selection);
  const addNode = useEditorStore((state) => state.addNode);
  const updateNode = useEditorStore((state) => state.updateNode);

  const resolveInsertParentId = () => {
    const selectedNode = selection[0] ? document.nodes[selection[0]] : null;
    if (!selectedNode) {
      return "board" as const;
    }

    return isContainerNode(selectedNode) ? selectedNode.id : selectedNode.parentId;
  };

  const computeDefaultDropPosition = (parentId: string) => {
    if (parentId === "board") {
      return {
        x: 180 + document.rootIds.length * 24,
        y: 120 + document.rootIds.length * 24,
      };
    }

    const parent = document.nodes[parentId];
    if (isContainerNode(parent)) {
      return { x: 20, y: 20 + parent.children.length * 48 };
    }

    return { x: 20, y: 20 };
  };

  return (
    <section className="sidebar-section">
      <header className="sidebar-header">
        <h2>Palette</h2>
      </header>
      <div className="palette-grid">
        {paletteItems.map((item) => (
          <PaletteCard key={item.type} {...item} />
        ))}
      </div>
      <div className="sidebar-header">
        <h2>Component presets</h2>
        <span className="sidebar-meta">{componentPresetItems.length} ready-to-use</span>
      </div>
      <div className="preset-grid">
        {componentPresetItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className="preset-card"
            onClick={() => {
              const parentId = resolveInsertParentId();
              const createdNodeId = addNode(
                item.type,
                parentId,
                computeDefaultDropPosition(parentId),
              );
              if (createdNodeId) {
                updateNode(createdNodeId, item.patch as never);
              }
            }}
          >
            <strong>{item.label}</strong>
            <span>{item.description}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
