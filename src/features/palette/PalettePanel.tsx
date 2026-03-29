import { useDraggable } from "@dnd-kit/core";
import { useEffect, useMemo, useState } from "react";

import { componentPresetItems } from "@/core/demo/componentPresets";
import { universalArtifactPresets } from "@/core/demo/universalArtifactPresets";
import { useEditorStore } from "@/core/store/editorStore";
import {
  getTemplateInsertionTargetLabel,
  insertTemplateDefinition,
  templatePackItems,
  type TemplateDefinition,
} from "@/core/demo/templatePacks";
import { LibraryPreview } from "@/features/palette/LibraryPreview";
import { paletteItems } from "@/lib/model/defaults";
import { isContainerNode } from "@/lib/model/node-utils";
import type { EditorNode, PaletteItemType } from "@/lib/model/document";

const FAVORITES_KEY = "codex-mobile-mockup:favorites";
const RECENT_KEY = "codex-mobile-mockup:recent";

export type PaletteMode =
  | "elements"
  | "components"
  | "patterns"
  | "screens"
  | "recent"
  | "favorites";

type CatalogItem =
  | {
      id: string;
      category: PaletteMode;
      group: string;
      kind: "element";
      type: PaletteItemType;
      label: string;
      description: string;
    }
  | {
      id: string;
      category: PaletteMode;
      group: string;
      kind: "preset";
      type: PaletteItemType;
      label: string;
      description: string;
      patch: Record<string, unknown>;
    }
  | {
      id: string;
      category: PaletteMode;
      group: string;
      kind: "template";
      label: string;
      description: string;
      scope: "screen" | "section";
      definition: TemplateDefinition;
    }
  | {
      id: string;
      category: PaletteMode;
      group: string;
      kind: "blank-screen";
      label: string;
      description: string;
    };

function getElementGroup(type: PaletteItemType) {
  if (type === "screen" || type === "flowLane" || type === "container") {
    return "Structure";
  }

  if (type === "field" || type === "button" || type === "checkbox" || type === "segmentedControl") {
    return "Controls";
  }

  return "Content";
}

function getPresetGroup(type: PaletteItemType) {
  if (type === "button") {
    return "Actions";
  }

  if (type === "field" || type === "segmentedControl" || type === "checkbox") {
    return "Inputs";
  }

  return "Status";
}

function getTemplatePreviewType(item: CatalogItem): PaletteItemType {
  if (item.kind === "element" || item.kind === "preset") {
    return item.type;
  }

  if (item.kind === "blank-screen") {
    return "screen";
  }

  return item.scope === "screen" ? "screen" : item.definition.root?.type ?? "container";
}

function getTemplatePreviewPatch(item: CatalogItem) {
  if (item.kind === "preset") {
    return item.patch;
  }

  if (item.kind === "template" && item.definition.root?.patch) {
    return item.definition.root.patch;
  }

  return null;
}

function createCatalog(): CatalogItem[] {
  const elements: CatalogItem[] = paletteItems.map((item) => ({
    id: `element:${item.type}`,
    category: "elements",
    group: getElementGroup(item.type),
    kind: "element",
    type: item.type,
    label: item.label,
    description: item.description,
  }));
  const universalElements: CatalogItem[] = universalArtifactPresets.map((item) => ({
    id: `artifact:${item.id}`,
    category: "elements",
    group: item.group,
    kind: "preset",
    type: item.type,
    label: item.label,
    description: item.description,
    patch: item.patch,
  }));

  const components: CatalogItem[] = componentPresetItems.map((item) => ({
    id: `preset:${item.id}`,
    category: "components",
    group: getPresetGroup(item.type),
    kind: "preset",
    type: item.type,
    label: item.label,
    description: item.description,
    patch: item.patch,
  }));

  const patternItems: CatalogItem[] = templatePackItems.flatMap((pack) =>
    pack.templates
      .filter((template) => template.scope === "section")
      .map((template) => ({
        id: `pattern:${template.id}`,
        category: "patterns" as const,
        group: pack.label,
        kind: "template" as const,
        label: template.label,
        description: template.description,
        scope: "section" as const,
        definition: template,
      })),
  );

  const screenItems: CatalogItem[] = [
    {
      id: "screen:blank",
      category: "screens",
      group: "Core",
      kind: "blank-screen",
      label: "Blank screen",
      description: "Start from a clean mobile frame.",
    },
    ...templatePackItems.flatMap((pack) =>
      pack.templates
        .filter((template) => template.scope === "screen")
        .map((template) => ({
          id: `screen:${template.id}`,
          category: "screens" as const,
          group: pack.label,
          kind: "template" as const,
          label: template.label,
          description: template.description,
          scope: "screen" as const,
          definition: template,
        })),
    ),
  ];

  return [...elements, ...universalElements, ...components, ...patternItems, ...screenItems];
}

function readStoredList(key: string) {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const value = window.localStorage.getItem(key);
    const parsed = value ? (JSON.parse(value) as string[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStoredList(key: string, nextValue: string[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(nextValue));
}

function ItemCard({
  item,
  favorite,
  onToggleFavorite,
  onInsert,
}: {
  item: CatalogItem;
  favorite: boolean;
  onToggleFavorite: (itemId: string) => void;
  onInsert: (item: CatalogItem) => void;
}) {
  const draggable =
    item.kind === "element"
      ? useDraggable({
          id: `palette:${item.type}`,
          data: {
            kind: "palette",
            itemType: item.type,
            label: item.label,
          },
        })
      : null;
  const previewPatch = getTemplatePreviewPatch(item);
  const previewMetadata =
    previewPatch &&
    typeof previewPatch === "object" &&
    "metadata" in previewPatch &&
    typeof previewPatch.metadata === "object" &&
    previewPatch.metadata &&
    !Array.isArray(previewPatch.metadata)
      ? (previewPatch.metadata as Record<string, unknown>)
      : null;
  const previewVariant =
    typeof previewMetadata?.shapeVariant === "string"
      ? previewMetadata.shapeVariant
      : typeof previewMetadata?.frameKind === "string"
        ? previewMetadata.frameKind
        : undefined;

  return (
    <div className={`library-card-shell${draggable?.isDragging ? " is-dragging" : ""}`}>
      <button
        type="button"
        className={`library-favorite${favorite ? " is-active" : ""}`}
        aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
        title={favorite ? "Remove from favorites" : "Add to favorites"}
        onClick={() => onToggleFavorite(item.id)}
      >
        <svg viewBox="0 0 20 20" aria-hidden="true">
          <path
            d="m10 2.8 2.2 4.4 4.8.7-3.5 3.4.8 4.8L10 14l-4.3 2.2.8-4.8L3 7.9l4.8-.7Z"
            fill={favorite ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <button
        ref={draggable?.setNodeRef}
        type="button"
        className="library-card"
        title={item.description}
        onClick={() => onInsert(item)}
        {...(draggable?.listeners ?? {})}
        {...(draggable?.attributes ?? {})}
      >
        <span className="library-kind-badge">
          {item.category === "screens"
            ? item.kind === "blank-screen"
              ? "Blank"
              : "Preset"
            : item.category.slice(0, -1)}
        </span>
        <LibraryPreview
          type={getTemplatePreviewType(item)}
          fillColor={typeof previewPatch?.fillColor === "string" ? previewPatch.fillColor : undefined}
          strokeColor={typeof previewPatch?.strokeColor === "string" ? previewPatch.strokeColor : undefined}
          text={
            typeof previewPatch?.text === "string"
              ? previewPatch.text
              : typeof previewPatch?.label === "string"
                ? previewPatch.label
                : item.label
          }
          variant={previewVariant}
        />
        <div className="library-card-copy">
          <strong>{item.label}</strong>
          <span>{item.description}</span>
        </div>
      </button>
    </div>
  );
}

function EmptyCollection({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="palette-empty-state">
      <strong>{title}</strong>
      <span>{description}</span>
    </div>
  );
}

export function PalettePanel({
  mode,
}: {
  mode: PaletteMode;
}) {
  const document = useEditorStore((state) => state.document);
  const selection = useEditorStore((state) => state.selection);
  const addNode = useEditorStore((state) => state.addNode);
  const updateNode = useEditorStore((state) => state.updateNode);
  const addScreen = useEditorStore((state) => state.addScreen);
  const addTemplateScreen = useEditorStore((state) => state.addTemplateScreen);
  const setSelection = useEditorStore((state) => state.setSelection);
  const setDebugMessage = useEditorStore((state) => state.setDebugMessage);
  const [query, setQuery] = useState("");
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [recentIds, setRecentIds] = useState<string[]>([]);

  useEffect(() => {
    setFavoriteIds(readStoredList(FAVORITES_KEY));
    setRecentIds(readStoredList(RECENT_KEY));
  }, []);

  const catalog = useMemo(() => createCatalog(), []);
  const catalogById = useMemo(
    () => new Map(catalog.map((item) => [item.id, item])),
    [catalog],
  );

  const selectionTargetLabel = useMemo(
    () => getTemplateInsertionTargetLabel(document, selection),
    [document, selection],
  );
  const insertTargetLabel =
    selectionTargetLabel === "Board"
      ? "Insert into board"
      : selectionTargetLabel.startsWith("screen:")
        ? `Insert into ${selectionTargetLabel.replace("screen:", "screen ")}`
        : `Insert into ${selectionTargetLabel}`;

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

  const rememberItem = (itemId: string) => {
    setRecentIds((current) => {
      const next = [itemId, ...current.filter((entry) => entry !== itemId)].slice(0, 12);
      writeStoredList(RECENT_KEY, next);
      return next;
    });
  };

  const toggleFavorite = (itemId: string) => {
    setFavoriteIds((current) => {
      const next = current.includes(itemId)
        ? current.filter((entry) => entry !== itemId)
        : [itemId, ...current].slice(0, 24);
      writeStoredList(FAVORITES_KEY, next);
      return next;
    });
  };

  const handleInsert = (item: CatalogItem) => {
    let createdId: string | null = null;

    if (item.kind === "blank-screen") {
      addScreen();
      rememberItem(item.id);
      return;
    }

    if (item.kind === "element") {
      const parentId = resolveInsertParentId();
      createdId = addNode(item.type, parentId, computeDefaultDropPosition(parentId));
    }

    if (item.kind === "preset") {
      const parentId = resolveInsertParentId();
      createdId = addNode(item.type, parentId, computeDefaultDropPosition(parentId));
      if (createdId) {
        updateNode(createdId, item.patch as Partial<EditorNode>);
      }
    }

    if (item.kind === "template") {
      createdId =
        item.scope === "screen"
          ? item.definition.screenTemplateId
            ? addTemplateScreen(item.definition.screenTemplateId)
            : null
          : insertTemplateDefinition(item.definition, {
              document,
              selection,
              addNode,
              updateNode,
              setSelection,
              addTemplateScreen,
            });
    }

    if (!createdId && item.kind === "template") {
      setDebugMessage(`Failed to insert ${item.label}.`);
      return;
    }

    rememberItem(item.id);
  };

  const modeItems = useMemo(() => {
    if (mode === "recent") {
      return recentIds
        .map((itemId) => catalogById.get(itemId))
        .filter((item): item is CatalogItem => Boolean(item));
    }

    if (mode === "favorites") {
      return favoriteIds
        .map((itemId) => catalogById.get(itemId))
        .filter((item): item is CatalogItem => Boolean(item));
    }

    return catalog.filter((item) => item.category === mode);
  }, [catalog, catalogById, favoriteIds, mode, recentIds]);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return modeItems;
    }

    return modeItems.filter((item) =>
      `${item.label} ${item.description} ${item.group}`.toLowerCase().includes(normalizedQuery),
    );
  }, [modeItems, query]);

  const groupedItems = useMemo(() => {
    const bucket = new Map<string, CatalogItem[]>();

    for (const item of filteredItems) {
      const items = bucket.get(item.group) ?? [];
      items.push(item);
      bucket.set(item.group, items);
    }

    return [...bucket.entries()];
  }, [filteredItems]);

  const copy = {
    elements: {
      title: "Elements",
      description: "Low-level building blocks for screens, layout, and controls.",
    },
    components: {
      title: "Components",
      description: "Reusable UI blocks with sensible starter content and styling.",
    },
    patterns: {
      title: "Patterns",
      description: "Higher-level sections that drop into the selected screen or container.",
    },
    screens: {
      title: "Screens",
      description: "Blank and preset screens. Presets stay secondary to the component library.",
    },
    recent: {
      title: "Recent",
      description: "Your latest insertions for faster repetitive flows.",
    },
    favorites: {
      title: "Favorites",
      description: "Starred items you want close at hand.",
    },
  } satisfies Record<PaletteMode, { title: string; description: string }>;

  return (
    <section className="sidebar-section palette-panel">
      <header className="sidebar-header">
        <div>
          <h2>{copy[mode].title}</h2>
          <span className="sidebar-description">{copy[mode].description}</span>
        </div>
        <span className="sidebar-meta">{insertTargetLabel}</span>
      </header>

      <label className="library-search">
        <svg viewBox="0 0 20 20" aria-hidden="true">
          <circle cx="9" cy="9" r="5.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="m13 13 4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          placeholder={`Search ${copy[mode].title.toLowerCase()}`}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>

      {mode === "screens" ? (
        <div className="template-target-note">
          Screen presets are secondary. The primary workflow is still element, component, and pattern insertion.
        </div>
      ) : null}

      {groupedItems.length > 0 ? (
        <div className="palette-groups">
          {groupedItems.map(([group, items]) => (
            <section key={group} className="palette-group">
              <header className="palette-group-header">
                <h3>{group}</h3>
                <span>{items.length}</span>
              </header>
              <div className="palette-grid">
                {items.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    favorite={favoriteIds.includes(item.id)}
                    onToggleFavorite={toggleFavorite}
                    onInsert={handleInsert}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : mode === "recent" ? (
        <EmptyCollection
          title="No recent items yet"
          description="Insert a few elements or components and they will appear here."
        />
      ) : mode === "favorites" ? (
        <EmptyCollection
          title="No favorites yet"
          description="Use the star action on any card to pin it to this section."
        />
      ) : (
        <EmptyCollection
          title="Nothing matches this search"
          description="Try a shorter term or switch to another library mode."
        />
      )}
    </section>
  );
}
