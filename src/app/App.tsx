import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Collision,
  CollisionDetection,
  DndContext,
  DragEndEvent,
  DragMoveEvent,
  DragOverlay,
  DragStartEvent,
  DragOverEvent,
  pointerWithin,
  rectIntersection,
} from "@dnd-kit/core";

import { BoardView, type PalettePlacementPreview } from "@/features/editor/components/BoardView";
import { DslPanel } from "@/features/dsl/DslPanel";
import { InspectorPanel } from "@/features/inspector/InspectorPanel";
import { LayersPanel } from "@/features/layers/LayersPanel";
import { PalettePanel } from "@/features/palette/PalettePanel";
import { TemplatesPanel } from "@/features/templates/TemplatesPanel";
import { getSelectionSummary, useEditorStore } from "@/core/store/editorStore";
import { snapRectToParentCenter } from "@/lib/geometry/center-snap";
import { getParentBounds } from "@/lib/geometry/coords";
import { validateDocument } from "@/lib/drawio/validate";
import { createNodeFromPalette, isContainerNode } from "@/lib/model/node-utils";
import { getParentDepth } from "@/lib/model/placement";
import type { PaletteItemType, ParentId } from "@/lib/model/document";

type DragState =
  | { kind: "palette"; label: string }
  | { kind: "layer-node"; label: string }
  | null;

function saveTextFile(content: string, fileName: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

function getCollisionDepth(
  document: ReturnType<typeof useEditorStore.getState>["document"],
  collision: Collision,
): number {
  if (collision.id === "drop:board") {
    return 0;
  }

  if (typeof collision.id !== "string" || !collision.id.startsWith("drop:")) {
    return -1;
  }

  return getParentDepth(document, collision.id.slice(5) as ParentId);
}

function ToolbarGroup({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="toolbar-group">
      <span className="toolbar-group-label">{label}</span>
      <div className="toolbar-group-actions">{children}</div>
    </div>
  );
}

export default function App() {
  const [leftSidebarTab, setLeftSidebarTab] = useState<"palette" | "templates" | "layers">(
    "palette",
  );
  const document = useEditorStore((state) => state.document);
  const debugMessage = useEditorStore((state) => state.debugMessage);
  const addNode = useEditorStore((state) => state.addNode);
  const reparentNode = useEditorStore((state) => state.reparentNode);
  const addScreen = useEditorStore((state) => state.addScreen);
  const createEmpty = useEditorStore((state) => state.createEmpty);
  const resetToDemo = useEditorStore((state) => state.resetToDemo);
  const exportJson = useEditorStore((state) => state.exportJson);
  const loadJson = useEditorStore((state) => state.loadJson);
  const exportDrawio = useEditorStore((state) => state.exportDrawio);
  const importDrawio = useEditorStore((state) => state.importDrawio);
  const setHoveredDropTarget = useEditorStore((state) => state.setHoveredDropTarget);
  const setBoardZoom = useEditorStore((state) => state.setBoardZoom);
  const fitView = useEditorStore((state) => state.fitView);
  const toggleBoardFlag = useEditorStore((state) => state.toggleBoardFlag);
  const saveToLocalStorage = useEditorStore((state) => state.saveToLocalStorage);
  const loadFromLocalStorage = useEditorStore((state) => state.loadFromLocalStorage);
  const undo = useEditorStore((state) => state.undo);
  const redo = useEditorStore((state) => state.redo);
  const createEdge = useEditorStore((state) => state.createEdge);
  const addTemplateScreen = useEditorStore((state) => state.addTemplateScreen);
  const alignSelection = useEditorStore((state) => state.alignSelection);
  const distributeSelection = useEditorStore((state) => state.distributeSelection);
  const selection = useEditorStore((state) => state.selection);
  const setDebugMessage = useEditorStore((state) => state.setDebugMessage);

  const jsonInputRef = useRef<HTMLInputElement>(null);
  const drawioInputRef = useRef<HTMLInputElement>(null);
  const [dragState, setDragState] = useState<DragState>(null);
  const [palettePreview, setPalettePreview] = useState<PalettePlacementPreview | null>(null);

  useEffect(() => {
    window.localStorage.setItem(
      import.meta.env.VITE_LOCAL_STORAGE_KEY ?? "codex-mobile-mockup-editor",
      JSON.stringify(document),
    );
  }, [document]);

  const boardZoomPercent = useMemo(
    () => Math.round(document.board.zoom * 100),
    [document.board.zoom],
  );
  const validation = useMemo(() => validateDocument(document), [document]);
  const selectionSummary = useEditorStore(getSelectionSummary);
  const collisionDetection = useMemo<CollisionDetection>(
    () => (args) => {
      const collisions = pointerWithin(args);
      const fallbackCollisions = collisions.length > 0 ? collisions : rectIntersection(args);

      return [...fallbackCollisions].sort((left, right) => {
        const leftDepth = getCollisionDepth(document, left);
        const rightDepth = getCollisionDepth(document, right);
        if (leftDepth !== rightDepth) {
          return rightDepth - leftDepth;
        }

        if (left.id === "drop:board") {
          return 1;
        }
        if (right.id === "drop:board") {
          return -1;
        }
        return 0;
      });
    },
    [document],
  );
  const exportBlocked = validation.errors.length > 0;

  const computePalettePreview = (
    event: DragMoveEvent | DragOverEvent | DragEndEvent,
    parentId: ParentId,
    itemType: PaletteItemType,
    label: string,
  ): PalettePlacementPreview | null => {
    const translatedRect = event.active.rect.current.translated ?? event.active.rect.current.initial;
    const overRect = event.over?.rect;
    if (!translatedRect || !overRect) {
      return null;
    }

    const templateNode = createNodeFromPalette(itemType, "__preview__", parentId, { x: 0, y: 0 });
    const centerX = translatedRect.left + translatedRect.width / 2;
    const centerY = translatedRect.top + translatedRect.height / 2;
    const zoom = document.board.zoom;
    const localRect =
      parentId === "board"
        ? {
            x: (centerX - overRect.left - document.board.panX) / zoom - templateNode.width / 2,
            y: (centerY - overRect.top - document.board.panY) / zoom - templateNode.height / 2,
            width: templateNode.width,
            height: templateNode.height,
          }
        : {
            x: (centerX - overRect.left) / zoom - templateNode.width / 2,
            y: (centerY - overRect.top) / zoom - templateNode.height / 2,
            width: templateNode.width,
            height: templateNode.height,
          };
    const snapped =
      parentId === "board"
        ? { rect: localRect, guides: [] }
        : snapRectToParentCenter(
            localRect,
            getParentBounds(document, parentId),
            16 / zoom,
          );

    return {
      label,
      parentId,
      x: snapped.rect.x,
      y: snapped.rect.y,
      width: templateNode.width,
      height: templateNode.height,
      guides: snapped.guides,
    };
  };

  const computeDefaultDropPosition = (parentId: ParentId) => {
    if (parentId === "board") {
      return { x: 180 + document.rootIds.length * 24, y: 120 + document.rootIds.length * 24 };
    }

    const parent = document.nodes[parentId];
    if (isContainerNode(parent)) {
      return { x: 20, y: 20 + parent.children.length * 48 };
    }

    return { x: 20, y: 20 };
  };

  const extractParentId = (value: string | number | null | undefined): ParentId | null => {
    if (typeof value !== "string") {
      return null;
    }

    if (value.startsWith("drop:")) {
      return value.slice(5) as ParentId;
    }

    return null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current;
    if (!data) {
      setDragState(null);
      return;
    }

    if (data.kind === "palette") {
      setDragState({ kind: "palette", label: data.label as string });
      return;
    }

    if (data.kind === "layer-node") {
      setDragState({ kind: "layer-node", label: data.label as string });
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const overParentId = extractParentId(event.over?.id);
    setHoveredDropTarget(overParentId ?? null);

    const data = event.active.data.current;
    if (data?.kind === "palette" && overParentId) {
      setPalettePreview(
        computePalettePreview(
          event,
          overParentId,
          data.itemType as PaletteItemType,
          data.label as string,
        ),
      );
      return;
    }

    setPalettePreview(null);
  };

  const handleDragMove = (event: DragMoveEvent) => {
    const data = event.active.data.current;
    const overParentId = extractParentId(event.over?.id);
    if (data?.kind === "palette" && overParentId) {
      setPalettePreview(
        computePalettePreview(
          event,
          overParentId,
          data.itemType as PaletteItemType,
          data.label as string,
        ),
      );
      return;
    }

    setPalettePreview(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const data = event.active.data.current;
    const overParentId = extractParentId(event.over?.id);

    if (data && overParentId) {
      if (data.kind === "palette") {
        const preview =
          palettePreview ??
          computePalettePreview(
            event,
            overParentId,
            data.itemType as PaletteItemType,
            data.label as string,
          );
        addNode(
          data.itemType as PaletteItemType,
          overParentId,
          preview
            ? { x: preview.x, y: preview.y }
            : computeDefaultDropPosition(overParentId),
        );
      }

      if (data.kind === "layer-node") {
        reparentNode(data.nodeId as string, overParentId);
      }
    }

    setDragState(null);
    setPalettePreview(null);
    setHoveredDropTarget(null);
  };

  return (
    <DndContext
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={() => {
        setDragState(null);
        setPalettePreview(null);
        setHoveredDropTarget(null);
      }}
    >
      <div className="app-shell">
        <header className="topbar">
          <div className="brand-block">
            <span className="eyebrow">Codex mobile mockup editor</span>
            <h1>{document.name}</h1>
          </div>
          <div className="toolbar">
            <ToolbarGroup label="Project">
              <button type="button" className="toolbar-primary" onClick={createEmpty}>
                New
              </button>
              <button type="button" onClick={resetToDemo}>
                Demo
              </button>
              <button type="button" className="toolbar-primary" onClick={addScreen}>
                Add screen
              </button>
              <button type="button" onClick={() => addTemplateScreen("checkout")}>
                Checkout
              </button>
              <button type="button" onClick={() => addTemplateScreen("appointment")}>
                Appointment
              </button>
              <button type="button" onClick={() => addTemplateScreen("confirmation")}>
                Confirmation
              </button>
            </ToolbarGroup>
            <ToolbarGroup label="Files">
              <button type="button" onClick={() => jsonInputRef.current?.click()}>
                Load JSON
              </button>
              <button
                type="button"
                onClick={() => saveTextFile(exportJson(), `${document.name}.json`, "application/json")}
              >
                Save JSON
              </button>
              <button type="button" onClick={() => drawioInputRef.current?.click()}>
                Import Draw.io
              </button>
              <button
                type="button"
                className="toolbar-primary"
                disabled={exportBlocked}
                title={
                  exportBlocked
                    ? "Resolve fatal validation errors before export."
                    : "Export the current document to draw.io XML."
                }
                onClick={() =>
                  saveTextFile(exportDrawio(), `${document.name}.drawio`, "application/xml")
                }
              >
                Export Draw.io
              </button>
              <button type="button" onClick={saveToLocalStorage}>
                Save local
              </button>
              <button type="button" onClick={loadFromLocalStorage}>
                Load local
              </button>
            </ToolbarGroup>
            <ToolbarGroup label="History">
              <button type="button" onClick={undo}>
                Undo
              </button>
              <button type="button" onClick={redo}>
                Redo
              </button>
              <button
                type="button"
                disabled={selection.length !== 2}
                onClick={() => createEdge(selection[0], selection[1])}
              >
                Create edge
              </button>
            </ToolbarGroup>
            <ToolbarGroup label="View">
              <button type="button" onClick={() => setBoardZoom(0.5)}>
                50%
              </button>
              <button type="button" onClick={() => setBoardZoom(1)}>
                100%
              </button>
              <button type="button" onClick={() => setBoardZoom(1.5)}>
                150%
              </button>
              <button type="button" onClick={() => setBoardZoom(Math.max(0.4, document.board.zoom - 0.1))}>
                -
              </button>
              <button type="button" className="toolbar-zoom" onClick={() => setBoardZoom(1)}>
                {boardZoomPercent}%
              </button>
              <button type="button" onClick={() => setBoardZoom(Math.min(3, document.board.zoom + 0.1))}>
                +
              </button>
              <button type="button" onClick={() => fitView("selection")}>
                Fit selection
              </button>
              <button type="button" onClick={() => fitView("screen")}>
                Fit screen
              </button>
              <button type="button" onClick={() => fitView("board")}>
                Fit board
              </button>
              <button type="button" onClick={() => toggleBoardFlag("showGrid")}>
                Grid {document.board.showGrid ? "on" : "off"}
              </button>
              <button type="button" onClick={() => toggleBoardFlag("snapToGrid")}>
                Snap {document.board.snapToGrid ? "on" : "off"}
              </button>
              <button type="button" onClick={() => toggleBoardFlag("guides")}>
                Guides {document.board.guides ? "on" : "off"}
              </button>
            </ToolbarGroup>
            <ToolbarGroup label="Arrange">
              <button type="button" onClick={() => alignSelection("left")} disabled={selection.length < 2}>
                Align left
              </button>
              <button type="button" onClick={() => alignSelection("center")} disabled={selection.length < 2}>
                Align center
              </button>
              <button type="button" onClick={() => alignSelection("right")} disabled={selection.length < 2}>
                Align right
              </button>
              <button type="button" onClick={() => alignSelection("top")} disabled={selection.length < 2}>
                Align top
              </button>
              <button type="button" onClick={() => alignSelection("middle")} disabled={selection.length < 2}>
                Align middle
              </button>
              <button type="button" onClick={() => alignSelection("bottom")} disabled={selection.length < 2}>
                Align bottom
              </button>
              <button
                type="button"
                onClick={() => distributeSelection("horizontal")}
                disabled={selection.length < 3}
              >
                Distribute H
              </button>
              <button
                type="button"
                onClick={() => distributeSelection("vertical")}
                disabled={selection.length < 3}
              >
                Distribute V
              </button>
            </ToolbarGroup>
          </div>
        </header>

        <main className="workspace-grid">
          <aside className="left-sidebar">
            <div className="sidebar-tabs">
              <button
                type="button"
                className={leftSidebarTab === "palette" ? "is-active" : ""}
                onClick={() => setLeftSidebarTab("palette")}
              >
                Palette
              </button>
              <button
                type="button"
                className={leftSidebarTab === "templates" ? "is-active" : ""}
                onClick={() => setLeftSidebarTab("templates")}
              >
                Templates
              </button>
              <button
                type="button"
                className={leftSidebarTab === "layers" ? "is-active" : ""}
                onClick={() => setLeftSidebarTab("layers")}
              >
                Layers
              </button>
            </div>
            {leftSidebarTab === "palette" ? <PalettePanel /> : null}
            {leftSidebarTab === "templates" ? <TemplatesPanel /> : null}
            {leftSidebarTab === "layers" ? <LayersPanel /> : null}
          </aside>
          <section className="board-shell">
            <BoardView
              dropModeEnabled={dragState?.kind === "palette"}
              palettePreview={palettePreview}
            />
            <div className="statusbar">
              <span>Grid {document.board.showGrid ? `${document.board.gridSize}px` : "hidden"}</span>
              <span>Zoom {boardZoomPercent}%</span>
              <span>{selectionSummary}</span>
              <span>
                Validation {validation.errors.length} error(s), {validation.warnings.length} warning(s)
              </span>
              {exportBlocked ? <span>Export blocked by fatal validation.</span> : null}
              <span>Pan: middle / right drag or space + drag</span>
              {debugMessage ? <span>{debugMessage}</span> : <span>Ready</span>}
            </div>
          </section>
          <aside className="right-sidebar">
            <InspectorPanel />
          </aside>
        </main>
        <DslPanel />

        <input
          ref={jsonInputRef}
          type="file"
          accept=".json,application/json"
          hidden
          onChange={async (event) => {
            const file = event.target.files?.[0];
            if (!file) {
              return;
            }

            try {
              loadJson(await file.text());
            } catch (error) {
              setDebugMessage(
                error instanceof Error ? error.message : "Failed to load JSON document.",
              );
            }
            event.target.value = "";
          }}
        />
        <input
          ref={drawioInputRef}
          type="file"
          accept=".drawio,.xml,text/xml,application/xml"
          hidden
          onChange={async (event) => {
            const file = event.target.files?.[0];
            if (!file) {
              return;
            }

            try {
              importDrawio(await file.text(), file.name);
            } catch (error) {
              setDebugMessage(
                error instanceof Error ? error.message : "Failed to import Draw.io document.",
              );
            }
            event.target.value = "";
          }}
        />
      </div>
      <DragOverlay>
        {dragState ? <div className="drag-overlay">{dragState.label}</div> : null}
      </DragOverlay>
    </DndContext>
  );
}
