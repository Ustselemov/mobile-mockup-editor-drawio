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

import { componentPresetItems } from "@/core/demo/componentPresets";
import { BoardView, type PalettePlacementPreview } from "@/features/editor/components/BoardView";
import { ContextToolbar } from "@/features/context-toolbar/ContextToolbar";
import { DslPanel } from "@/features/dsl/DslPanel";
import { InspectorPanel } from "@/features/inspector/InspectorPanel";
import { LayersPanel } from "@/features/layers/LayersPanel";
import { Minimap } from "@/features/minimap/Minimap";
import { PalettePanel, type PaletteMode } from "@/features/palette/PalettePanel";
import { QuickInsertMenu } from "@/features/quick-insert/QuickInsertMenu";
import {
  useEditorStore,
  useSelectedNode,
} from "@/core/store/editorStore";
import { snapRectToParentCenter } from "@/lib/geometry/center-snap";
import { getAbsolutePosition, getParentBounds } from "@/lib/geometry/coords";
import { snapRectToSiblingGuides } from "@/lib/geometry/sibling-snap";
import { validateDocument } from "@/lib/drawio/validate";
import { createNodeFromPalette, isContainerNode } from "@/lib/model/node-utils";
import { getParentDepth } from "@/lib/model/placement";
import type { ParentId, PaletteItemType } from "@/lib/model/document";

type DragState =
  | { kind: "palette"; label: string }
  | { kind: "layer-node"; label: string }
  | null;

type ToolbarIconName =
  | "new"
  | "screen"
  | "open"
  | "save"
  | "import"
  | "export"
  | "undo"
  | "redo"
  | "dsl"
  | "connect"
  | "view"
  | "arrange"
  | "more"
  | "elements"
  | "components"
  | "patterns"
  | "recent"
  | "favorites"
  | "inspector"
  | "layers";

function ToolbarIcon({
  name,
}: {
  name: ToolbarIconName;
}) {
  const commonProps = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (name) {
    case "new":
      return (
        <svg {...commonProps}>
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
      );
    case "screen":
      return (
        <svg {...commonProps}>
          <rect x="5" y="3.5" width="14" height="17" rx="2.5" />
          <path d="M10 17h4" />
        </svg>
      );
    case "open":
      return (
        <svg {...commonProps}>
          <path d="M4 19.5V7.5a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" />
          <path d="M9.5 13.5 12 11l2.5 2.5" />
          <path d="M12 11v6" />
        </svg>
      );
    case "save":
      return (
        <svg {...commonProps}>
          <path d="M6 4.5h10l3 3v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2Z" />
          <path d="M8 4.5v5h8v-5" />
          <path d="M9 17h6" />
        </svg>
      );
    case "import":
      return (
        <svg {...commonProps}>
          <path d="M12 4.5v10" />
          <path d="m8.5 11 3.5 3.5 3.5-3.5" />
          <path d="M5 19.5h14" />
        </svg>
      );
    case "export":
      return (
        <svg {...commonProps}>
          <path d="M12 19.5v-10" />
          <path d="m15.5 13  -3.5-3.5L8.5 13" />
          <path d="M5 4.5h14" />
        </svg>
      );
    case "undo":
      return (
        <svg {...commonProps}>
          <path d="M9 7 5 11l4 4" />
          <path d="M19 17a7 7 0 0 0-7-7H5" />
        </svg>
      );
    case "redo":
      return (
        <svg {...commonProps}>
          <path d="m15 7 4 4-4 4" />
          <path d="M5 17a7 7 0 0 1 7-7h7" />
        </svg>
      );
    case "dsl":
      return (
        <svg {...commonProps}>
          <path d="m9 8-4 4 4 4" />
          <path d="m15 8 4 4-4 4" />
          <path d="M13 6 11 18" />
        </svg>
      );
    case "connect":
      return (
        <svg {...commonProps}>
          <circle cx="7" cy="12" r="2.5" />
          <circle cx="17" cy="7" r="2.5" />
          <circle cx="17" cy="17" r="2.5" />
          <path d="M9.5 11 14.5 8.5" />
          <path d="m9.5 13 5 2.5" />
        </svg>
      );
    case "view":
      return (
        <svg {...commonProps}>
          <circle cx="11" cy="11" r="5.5" />
          <path d="m16 16 3.5 3.5" />
        </svg>
      );
    case "arrange":
      return (
        <svg {...commonProps}>
          <rect x="4.5" y="5" width="6" height="6" rx="1.5" />
          <rect x="13.5" y="5" width="6" height="6" rx="1.5" />
          <rect x="9" y="13" width="6" height="6" rx="1.5" />
        </svg>
      );
    case "more":
      return (
        <svg {...commonProps}>
          <circle cx="6" cy="12" r="1.4" fill="currentColor" stroke="none" />
          <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
          <circle cx="18" cy="12" r="1.4" fill="currentColor" stroke="none" />
        </svg>
      );
    case "elements":
      return (
        <svg {...commonProps}>
          <rect x="4.5" y="4.5" width="6" height="6" rx="1.5" />
          <rect x="13.5" y="4.5" width="6" height="6" rx="1.5" />
          <rect x="9" y="13.5" width="6" height="6" rx="1.5" />
        </svg>
      );
    case "components":
      return (
        <svg {...commonProps}>
          <rect x="4.5" y="5" width="15" height="10" rx="2.5" />
          <path d="M9.5 5v10" />
          <path d="M14.5 5v10" />
        </svg>
      );
    case "patterns":
      return (
        <svg {...commonProps}>
          <path d="M5 7.5h14" />
          <path d="M5 12h14" />
          <path d="M5 16.5h8" />
        </svg>
      );
    case "recent":
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="7" />
          <path d="M12 8.5v4l2.5 2.5" />
        </svg>
      );
    case "favorites":
      return (
        <svg {...commonProps}>
          <path d="m12 3.5 2.6 5.1 5.6.8-4.1 4 .9 5.6-5-2.6-5 2.6.9-5.6-4.1-4 5.6-.8Z" />
        </svg>
      );
    case "inspector":
      return (
        <svg {...commonProps}>
          <path d="M5 7.5h14" />
          <circle cx="9" cy="7.5" r="1.8" />
          <path d="M5 12h14" />
          <circle cx="14" cy="12" r="1.8" />
          <path d="M5 16.5h14" />
          <circle cx="11" cy="16.5" r="1.8" />
        </svg>
      );
    case "layers":
      return (
        <svg {...commonProps}>
          <path d="M12 4.5 4.5 8.5 12 12.5l7.5-4Z" />
          <path d="M4.5 11.5 12 15.5l7.5-4" />
        </svg>
      );
  }
}

function IconButton({
  label,
  icon,
  active = false,
  primary = false,
  disabled = false,
  onClick,
}: {
  label: string;
  icon: ToolbarIconName;
  active?: boolean;
  primary?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`icon-button${primary ? " toolbar-primary" : ""}${active ? " is-active" : ""}`}
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
    >
      <ToolbarIcon name={icon} />
    </button>
  );
}

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

function ToolbarDropdown({
  label,
  icon,
  align = "right",
  children,
}: {
  label: string;
  icon: ToolbarIconName;
  align?: "left" | "right";
  children: ReactNode;
}) {
  return (
    <details className={`toolbar-dropdown is-${align}`}>
      <summary className="toolbar-trigger" aria-label={label} title={label}>
        <ToolbarIcon name={icon} />
        <span>{label}</span>
      </summary>
      <div className="toolbar-dropdown-panel">{children}</div>
    </details>
  );
}

export default function App() {
  const [leftSidebarTab, setLeftSidebarTab] = useState<PaletteMode>("elements");
  const [rightSidebarTab, setRightSidebarTab] = useState<"inspector" | "layers">("inspector");
  const [mobilePanelTab, setMobilePanelTab] = useState<"library" | "inspector" | "layers">("library");
  const [isMobileLayout, setIsMobileLayout] = useState(
    () => typeof window !== "undefined" && window.innerWidth <= 980,
  );
  const [showDslPanel, setShowDslPanel] = useState(false);
  const [showQuickInsert, setShowQuickInsert] = useState(false);
  const document = useEditorStore((state) => state.document);
  const viewport = useEditorStore((state) => state.viewport);
  const debugMessage = useEditorStore((state) => state.debugMessage);
  const addNode = useEditorStore((state) => state.addNode);
  const updateNode = useEditorStore((state) => state.updateNode);
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
  const setBoardPan = useEditorStore((state) => state.setBoardPan);
  const createEdge = useEditorStore((state) => state.createEdge);
  const duplicateSelection = useEditorStore((state) => state.duplicateSelection);
  const deleteSelection = useEditorStore((state) => state.deleteSelection);
  const toggleNodeLock = useEditorStore((state) => state.toggleNodeLock);
  const reorderNode = useEditorStore((state) => state.reorderNode);
  const alignSelection = useEditorStore((state) => state.alignSelection);
  const distributeSelection = useEditorStore((state) => state.distributeSelection);
  const selection = useEditorStore((state) => state.selection);
  const setDebugMessage = useEditorStore((state) => state.setDebugMessage);
  const selectedNode = useSelectedNode();

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

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleResize = () => setIsMobileLayout(window.innerWidth <= 980);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isMobileLayout && selection.length > 0 && mobilePanelTab === "library") {
      setMobilePanelTab("inspector");
    }
  }, [isMobileLayout, mobilePanelTab, selection.length]);

  const boardZoomPercent = useMemo(
    () => Math.round(document.board.zoom * 100),
    [document.board.zoom],
  );
  const validation = useMemo(() => validateDocument(document), [document]);
  const canCreateEdge = selection.length === 2;
  const canAlignSelection = selection.length >= 2;
  const canDistributeSelection = selection.length >= 3;
  const screenCount = useMemo(
    () => Object.values(document.nodes).filter((node) => node.type === "screen").length,
    [document.nodes],
  );
  const boardPadding = 12;
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
  const validationToneClass =
    validation.errors.length > 0
      ? "is-danger"
      : validation.warnings.length > 0
        ? "is-warning"
        : "is-ok";
  const validationSummaryLabel =
    validation.errors.length > 0
      ? `${validation.errors.length} validation error${validation.errors.length === 1 ? "" : "s"}`
      : validation.warnings.length > 0
        ? `${validation.warnings.length} validation warning${validation.warnings.length === 1 ? "" : "s"}`
        : "Validation clear";

  const toBoardOverlayPoint = (x: number, y: number) => ({
    left: boardPadding + document.board.panX + x * document.board.zoom,
    top: boardPadding + document.board.panY + y * document.board.zoom,
  });

  const selectedNodeBounds = useMemo(() => {
    if (!selectedNode) {
      return null;
    }

    const absolute = getAbsolutePosition(document, selectedNode.id);
    return {
      left: absolute.x,
      top: absolute.y,
      width: selectedNode.width,
      height: selectedNode.height,
    };
  }, [document, selectedNode]);

  const quickInsertParent = useMemo(() => {
    if (selectedNode && isContainerNode(selectedNode)) {
      return selectedNode;
    }

    if (selectedNode && selectedNode.parentId !== "board") {
      const parentNode = document.nodes[selectedNode.parentId];
      if (parentNode && isContainerNode(parentNode)) {
        return parentNode;
      }
    }

    const firstScreenId = document.rootIds.find(
      (nodeId) => document.nodes[nodeId]?.type === "screen",
    );
    if (!firstScreenId) {
      return null;
    }

    const firstScreen = document.nodes[firstScreenId];
    return isContainerNode(firstScreen) ? firstScreen : null;
  }, [document, selectedNode]);

  const quickInsertAnchor = useMemo(() => {
    if (!quickInsertParent) {
      return null;
    }

    const absolute = getAbsolutePosition(document, quickInsertParent.id);
    return toBoardOverlayPoint(
      absolute.x + quickInsertParent.width,
      absolute.y + quickInsertParent.height,
    );
  }, [document.board.panX, document.board.zoom, quickInsertParent]);

  const contextToolbarPosition = useMemo(() => {
    if (!selectedNodeBounds || selection.length !== 1) {
      return null;
    }

    return toBoardOverlayPoint(
      selectedNodeBounds.left + selectedNodeBounds.width / 2,
      selectedNodeBounds.top,
    );
  }, [document.board.panX, document.board.zoom, selectedNodeBounds, selection.length]);

  useEffect(() => {
    setShowQuickInsert(false);
  }, [selection, leftSidebarTab]);

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
    const siblingRects =
      parentId === "board"
        ? document.rootIds
            .map((nodeId) => document.nodes[nodeId])
            .filter((node): node is typeof templateNode => Boolean(node))
            .map((node) => ({
              id: node.id,
              x: node.x,
              y: node.y,
              width: node.width,
              height: node.height,
            }))
        : isContainerNode(document.nodes[parentId])
          ? document.nodes[parentId].children
              .map((nodeId) => document.nodes[nodeId])
              .filter((node): node is typeof templateNode => Boolean(node))
              .map((node) => ({
                id: node.id,
                x: node.x,
                y: node.y,
                width: node.width,
                height: node.height,
              }))
          : [];
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
    const siblingSnap = snapRectToSiblingGuides(
      snapped.rect,
      siblingRects,
      16 / zoom,
    );
    const guides = [
      ...(siblingSnap.snappedX
        ? siblingSnap.guides.filter((guide) => guide.orientation === "vertical")
        : snapped.guides.filter((guide) => guide.orientation === "vertical")),
      ...(siblingSnap.snappedY
        ? siblingSnap.guides.filter((guide) => guide.orientation === "horizontal")
        : snapped.guides.filter((guide) => guide.orientation === "horizontal")),
    ];

    return {
      label,
      parentId,
      x: siblingSnap.rect.x,
      y: siblingSnap.rect.y,
      width: templateNode.width,
      height: templateNode.height,
      guides,
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

  const insertQuickItem = (
    type: PaletteItemType,
    patch?: Record<string, unknown>,
  ) => {
    if (!quickInsertParent) {
      return;
    }

    const position = {
      x: 20,
      y: 20 + quickInsertParent.children.length * 28,
    };
    const createdId = addNode(type, quickInsertParent.id, position);
    if (createdId && patch) {
      updateNode(createdId, patch as never);
    }
    setShowQuickInsert(false);
  };

  const quickInsertItems = componentPresetItems
    .filter((item) =>
      [
        "primaryCta",
        "searchField",
        "successBadge",
        "infoBanner",
        "deliverySegment",
      ].includes(item.id),
    )
    .map((item) => ({
      id: item.id,
      label: item.label,
      description: item.description,
      type: item.type,
      fillColor:
        typeof item.patch.fillColor === "string" ? item.patch.fillColor : undefined,
      strokeColor:
        typeof item.patch.strokeColor === "string" ? item.patch.strokeColor : undefined,
      text:
        typeof item.patch.text === "string"
          ? item.patch.text
          : typeof item.patch.label === "string"
            ? item.patch.label
            : undefined,
      onSelect: () => insertQuickItem(item.type, item.patch),
    }));

  const sidebarItems: Array<{
    id: PaletteMode;
    label: string;
    icon: ToolbarIconName;
  }> = [
    { id: "elements", label: "Elements", icon: "elements" },
    { id: "components", label: "Components", icon: "components" },
    { id: "patterns", label: "Patterns", icon: "patterns" },
    { id: "screens", label: "Screens", icon: "screen" },
    { id: "recent", label: "Recent", icon: "recent" },
    { id: "favorites", label: "Favorites", icon: "favorites" },
  ];

  const librarySidebar = (
    <>
      <div className="sidebar-nav-rail" aria-label="Library sections">
        {sidebarItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`sidebar-nav-button${leftSidebarTab === item.id ? " is-active" : ""}`}
            title={item.label}
            aria-label={item.label}
            onClick={() => {
              setLeftSidebarTab(item.id);
              setMobilePanelTab("library");
            }}
          >
            <ToolbarIcon name={item.icon} />
            <span>{item.label}</span>
          </button>
        ))}
      </div>
      <div className="left-sidebar-content">
        <PalettePanel mode={leftSidebarTab} />
      </div>
    </>
  );

  const boardSurface = (
    <>
      {debugMessage ? <div className="workspace-toast">{debugMessage}</div> : null}
      <div className="board-stage">
        <BoardView
          dropModeEnabled={dragState?.kind === "palette"}
          palettePreview={palettePreview}
        />
        {screenCount === 0 ? (
          <div className="board-empty-state">
            <div className="board-empty-card">
              <span className="board-empty-kicker">Start here</span>
              <h2>Build the first screen fast</h2>
              <p>
                Add a blank screen, then use Elements, Components, or Patterns from the library.
              </p>
              <div className="board-empty-actions">
                <button type="button" className="primary-cta" onClick={addScreen}>
                  Add blank screen
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLeftSidebarTab("components");
                    setMobilePanelTab("library");
                  }}
                >
                  Open components
                </button>
              </div>
            </div>
          </div>
        ) : null}
        {contextToolbarPosition && selectedNode ? (
          <ContextToolbar
            left={contextToolbarPosition.left}
            top={contextToolbarPosition.top - 18}
            locked={selectedNode.locked}
            onDuplicate={duplicateSelection}
            onDelete={deleteSelection}
            onToggleLock={() => toggleNodeLock(selectedNode.id)}
            onBringForward={() => reorderNode(selectedNode.id, "forward")}
            onSendBackward={() => reorderNode(selectedNode.id, "backward")}
          />
        ) : null}
        {quickInsertAnchor && quickInsertParent ? (
          <QuickInsertMenu
            open={showQuickInsert}
            left={quickInsertAnchor.left - 30}
            top={quickInsertAnchor.top - 30}
            items={quickInsertItems}
            onToggle={() => setShowQuickInsert((current) => !current)}
          />
        ) : null}
        <Minimap
          document={document}
          viewport={viewport}
          onFocusPoint={(point) => {
            setBoardPan(
              viewport.width / 2 - point.x * document.board.zoom,
              viewport.height / 2 - point.y * document.board.zoom,
            );
          }}
        />
      </div>
    </>
  );

  const rightSidebar = (
    <aside className="right-sidebar">
      <div className="sidebar-tabs is-secondary">
        <button
          type="button"
          className={rightSidebarTab === "inspector" ? "is-active" : ""}
          onClick={() => setRightSidebarTab("inspector")}
        >
          <ToolbarIcon name="inspector" />
          <span>Inspector</span>
        </button>
        <button
          type="button"
          className={rightSidebarTab === "layers" ? "is-active" : ""}
          onClick={() => setRightSidebarTab("layers")}
        >
          <ToolbarIcon name="layers" />
          <span>Layers</span>
        </button>
      </div>
      {rightSidebarTab === "inspector" ? <InspectorPanel /> : <LayersPanel />}
    </aside>
  );

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
          <div className="topbar-start">
            <div className="brand-block">
              <span className="eyebrow">Codex mobile mockup editor</span>
              <h1>{document.name}</h1>
              <div className="topbar-meta-row">
                <span className="save-indicator" title="Changes are stored in browser state while you work.">
                  Autosave ready
                </span>
                <span className="topbar-metric">Screens {screenCount}</span>
                <span className={`topbar-metric ${validationToneClass}`}>{validationSummaryLabel}</span>
              </div>
            </div>
            <div className="toolbar-cluster toolbar-cluster-files" aria-label="Document tools">
              <IconButton label="New document" icon="new" onClick={createEmpty} />
              <IconButton label="Add screen" icon="screen" primary onClick={addScreen} />
              <IconButton
                label="Load JSON"
                icon="open"
                onClick={() => jsonInputRef.current?.click()}
              />
              <IconButton
                label="Save JSON"
                icon="save"
                onClick={() =>
                  saveTextFile(exportJson(), `${document.name}.json`, "application/json")
                }
              />
              <IconButton
                label="Import Draw.io"
                icon="import"
                onClick={() => drawioInputRef.current?.click()}
              />
              <IconButton
                label="Export Draw.io"
                icon="export"
                primary
                disabled={exportBlocked}
                onClick={() =>
                  saveTextFile(exportDrawio(), `${document.name}.drawio`, "application/xml")
                }
              />
            </div>
          </div>

          <div className="topbar-center">
            <div className="toolbar-cluster toolbar-cluster-canvas" aria-label="Canvas controls">
              <IconButton label="Undo" icon="undo" onClick={undo} />
              <IconButton label="Redo" icon="redo" onClick={redo} />
              <IconButton
                label="Connect"
                icon="connect"
                primary
                disabled={!canCreateEdge}
                onClick={() => {
                  if (canCreateEdge) {
                    createEdge(selection[0]!, selection[1]!);
                  }
                }}
              />
              <div className="zoom-control" aria-label="Zoom controls">
                <button
                  type="button"
                  className="toolbar-chip"
                  onClick={() => setBoardZoom(Math.max(0.4, document.board.zoom - 0.1))}
                >
                  -
                </button>
                <button type="button" className="toolbar-chip toolbar-zoom" onClick={() => setBoardZoom(1)}>
                  {boardZoomPercent}%
                </button>
                <button
                  type="button"
                  className="toolbar-chip"
                  onClick={() => setBoardZoom(Math.min(3, document.board.zoom + 0.1))}
                >
                  +
                </button>
              </div>
              <div className="toolbar-chip-row toolbar-chip-row-fit" aria-label="Fit controls">
                <button type="button" className="toolbar-chip" onClick={() => fitView("selection")}>
                  Selection
                </button>
                <button type="button" className="toolbar-chip" onClick={() => fitView("screen")}>
                  Screen
                </button>
                <button type="button" className="toolbar-chip" onClick={() => fitView("board")}>
                  Board
                </button>
              </div>
              <div className="toolbar-chip-row toolbar-chip-row-display" aria-label="Display controls">
                <button
                  type="button"
                  className={`toolbar-chip${document.board.showGrid ? " is-active" : ""}`}
                  onClick={() => toggleBoardFlag("showGrid")}
                >
                  Grid
                </button>
                <button
                  type="button"
                  className={`toolbar-chip${document.board.snapToGrid ? " is-active" : ""}`}
                  onClick={() => toggleBoardFlag("snapToGrid")}
                >
                  Snap
                </button>
                <button
                  type="button"
                  className={`toolbar-chip${document.board.guides ? " is-active" : ""}`}
                  onClick={() => toggleBoardFlag("guides")}
                >
                  Guides
                </button>
              </div>
            </div>
          </div>

          <div className="topbar-end">
            <ToolbarDropdown label="Arrange" icon="arrange">
              <div className="toolbar-menu-section">
                <span className="toolbar-menu-title">Align</span>
                <div className="toolbar-menu-row">
                  <button type="button" onClick={() => alignSelection("left")} disabled={!canAlignSelection}>
                    Left
                  </button>
                  <button
                    type="button"
                    onClick={() => alignSelection("center")}
                    disabled={!canAlignSelection}
                  >
                    Center
                  </button>
                  <button type="button" onClick={() => alignSelection("right")} disabled={!canAlignSelection}>
                    Right
                  </button>
                </div>
                <div className="toolbar-menu-row">
                  <button type="button" onClick={() => alignSelection("top")} disabled={!canAlignSelection}>
                    Top
                  </button>
                  <button
                    type="button"
                    onClick={() => alignSelection("middle")}
                    disabled={!canAlignSelection}
                  >
                    Middle
                  </button>
                  <button
                    type="button"
                    onClick={() => alignSelection("bottom")}
                    disabled={!canAlignSelection}
                  >
                    Bottom
                  </button>
                </div>
              </div>
              <div className="toolbar-menu-section">
                <span className="toolbar-menu-title">Distribute</span>
                <div className="toolbar-menu-row is-two-columns">
                  <button
                    type="button"
                    onClick={() => distributeSelection("horizontal")}
                    disabled={!canDistributeSelection}
                  >
                    Horizontal
                  </button>
                  <button
                    type="button"
                    onClick={() => distributeSelection("vertical")}
                    disabled={!canDistributeSelection}
                  >
                    Vertical
                  </button>
                </div>
              </div>
              <div className="toolbar-menu-section">
                <span className="toolbar-menu-title">Connect</span>
                <div className="toolbar-menu-stack">
                  <button
                    type="button"
                    disabled={!canCreateEdge}
                    onClick={() => {
                      if (canCreateEdge) {
                        createEdge(selection[0]!, selection[1]!);
                      }
                    }}
                  >
                    Create edge
                  </button>
                </div>
              </div>
            </ToolbarDropdown>

            <ToolbarDropdown label="Project" icon="more">
              <div className="toolbar-menu-section">
                <span className="toolbar-menu-title">Workspace</span>
                <div className="toolbar-menu-stack">
                  <button type="button" onClick={resetToDemo}>
                    Load demo
                  </button>
                  <button type="button" onClick={saveToLocalStorage}>
                    Save to browser
                  </button>
                  <button type="button" onClick={loadFromLocalStorage}>
                    Load from browser
                  </button>
                </div>
              </div>
            </ToolbarDropdown>

            <button
              type="button"
              className={`toolbar-trigger${showDslPanel ? " is-active" : ""}`}
              aria-label={showDslPanel ? "Hide DSL panel" : "Show DSL panel"}
              title={showDslPanel ? "Hide DSL panel" : "Show DSL panel"}
              onClick={() => setShowDslPanel((current) => !current)}
            >
              <ToolbarIcon name="dsl" />
              <span>Code</span>
            </button>
          </div>
        </header>

        <main className="workspace-grid">
          {isMobileLayout ? (
            <>
              <section className="board-shell board-shell-mobile">{boardSurface}</section>
              <section className="mobile-panel-shell">
                <div className="mobile-panel-tabs">
                  <button
                    type="button"
                    className={mobilePanelTab === "library" ? "is-active" : ""}
                    onClick={() => setMobilePanelTab("library")}
                  >
                    <ToolbarIcon name="elements" />
                    <span>Library</span>
                  </button>
                  <button
                    type="button"
                    className={mobilePanelTab === "inspector" ? "is-active" : ""}
                    onClick={() => setMobilePanelTab("inspector")}
                  >
                    <ToolbarIcon name="inspector" />
                    <span>Inspector</span>
                  </button>
                  <button
                    type="button"
                    className={mobilePanelTab === "layers" ? "is-active" : ""}
                    onClick={() => setMobilePanelTab("layers")}
                  >
                    <ToolbarIcon name="layers" />
                    <span>Layers</span>
                  </button>
                </div>
                <div className="mobile-panel-surface">
                  {mobilePanelTab === "library" ? (
                    <section className="left-sidebar left-sidebar-mobile">{librarySidebar}</section>
                  ) : mobilePanelTab === "inspector" ? (
                    <div className="mobile-panel-body">
                      <InspectorPanel />
                    </div>
                  ) : (
                    <div className="mobile-panel-body">
                      <LayersPanel />
                    </div>
                  )}
                </div>
              </section>
            </>
          ) : (
            <>
              <aside className="left-sidebar">{librarySidebar}</aside>
              <section className="board-shell">{boardSurface}</section>
              {rightSidebar}
            </>
          )}
        </main>
        <DslPanel isOpen={showDslPanel} onClose={() => setShowDslPanel(false)} />

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
