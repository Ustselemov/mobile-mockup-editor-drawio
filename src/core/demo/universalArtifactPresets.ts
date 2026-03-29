import { DEFAULT_LAYOUT_CONFIG } from "@/lib/layout/config";
import type { PaletteItemType } from "@/lib/model/document";

export type UniversalArtifactPreset = {
  id: string;
  label: string;
  description: string;
  group: string;
  type: PaletteItemType;
  patch: Record<string, unknown>;
};

export const universalArtifactPresets: UniversalArtifactPreset[] = [
  {
    id: "desktopFrame",
    label: "Desktop frame",
    description: "Browser-like frame for web and dashboard layouts.",
    group: "Frames",
    type: "screen",
    patch: {
      width: 1280,
      height: 860,
      title: "Desktop frame",
      borderRadius: 18,
      metadata: {
        frameKind: "desktop",
        artifactPack: "desktop-web",
      },
      layout: {
        ...DEFAULT_LAYOUT_CONFIG,
        padding: 32,
      },
    },
  },
  {
    id: "genericFrame",
    label: "Generic frame",
    description: "Neutral container frame for diagrams and mixed boards.",
    group: "Frames",
    type: "screen",
    patch: {
      width: 900,
      height: 640,
      title: "Generic frame",
      borderRadius: 18,
      metadata: {
        frameKind: "generic",
        artifactPack: "generic",
      },
      layout: {
        ...DEFAULT_LAYOUT_CONFIG,
        padding: 28,
      },
    },
  },
  {
    id: "terminator",
    label: "Start / End",
    description: "Flowchart terminator block.",
    group: "Flowchart",
    type: "container",
    patch: {
      width: 180,
      height: 72,
      title: "Start",
      borderRadius: 999,
      metadata: {
        shapeVariant: "terminator",
        artifactPack: "flowchart",
      },
    },
  },
  {
    id: "process",
    label: "Process",
    description: "Standard process step box.",
    group: "Flowchart",
    type: "container",
    patch: {
      width: 180,
      height: 78,
      title: "Process",
      metadata: {
        shapeVariant: "process",
        artifactPack: "flowchart",
      },
    },
  },
  {
    id: "decision",
    label: "Decision",
    description: "Diamond decision node.",
    group: "Flowchart",
    type: "container",
    patch: {
      width: 160,
      height: 100,
      title: "Decision",
      metadata: {
        shapeVariant: "diamond",
        artifactPack: "flowchart",
      },
    },
  },
  {
    id: "serviceBox",
    label: "Service",
    description: "Architecture service box.",
    group: "Architecture",
    type: "container",
    patch: {
      width: 200,
      height: 96,
      title: "Service",
      fillColor: "#eef6fb",
      strokeColor: "#6c8ebf",
      metadata: {
        shapeVariant: "service",
        artifactPack: "architecture",
      },
    },
  },
  {
    id: "apiBox",
    label: "API",
    description: "Architecture API boundary box.",
    group: "Architecture",
    type: "container",
    patch: {
      width: 180,
      height: 88,
      title: "Public API",
      fillColor: "#eff6f5",
      strokeColor: "#0f766e",
      metadata: {
        shapeVariant: "api",
        artifactPack: "architecture",
      },
    },
  },
  {
    id: "databaseBox",
    label: "Database",
    description: "Database cylinder block.",
    group: "Architecture",
    type: "container",
    patch: {
      width: 180,
      height: 104,
      title: "Database",
      fillColor: "#fdf5e8",
      strokeColor: "#d79b00",
      metadata: {
        shapeVariant: "database",
        artifactPack: "architecture",
      },
    },
  },
  {
    id: "treeNode",
    label: "Tree node",
    description: "Mind map or org-tree node.",
    group: "Tree / Mind",
    type: "container",
    patch: {
      width: 176,
      height: 72,
      title: "Tree node",
      metadata: {
        shapeVariant: "treeNode",
        artifactPack: "tree-mind",
      },
    },
  },
  {
    id: "stickyNote",
    label: "Sticky note",
    description: "Whiteboard note with folded corner.",
    group: "Whiteboard",
    type: "container",
    patch: {
      width: 180,
      height: 160,
      title: "Idea",
      fillColor: "#fff6b8",
      strokeColor: "#d6b656",
      metadata: {
        shapeVariant: "sticky",
        artifactPack: "whiteboard",
      },
    },
  },
  {
    id: "circleNode",
    label: "Circle",
    description: "Generic circular node for maps and quick sketches.",
    group: "Basic shapes",
    type: "container",
    patch: {
      width: 120,
      height: 120,
      title: "Node",
      metadata: {
        shapeVariant: "circle",
        artifactPack: "generic",
      },
    },
  },
];
