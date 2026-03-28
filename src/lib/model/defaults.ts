import type {
  BadgeVariant,
  BannerVariant,
  BoardModel,
  ButtonVariant,
  EditorDocument,
  PaletteItemType,
  TextStyle,
} from "@/lib/model/document";

export const DEFAULT_FONT_FAMILY = "Helvetica, Arial, sans-serif";
export const DEFAULT_GRID_SIZE = 10;
export const LOCAL_STORAGE_KEY =
  import.meta.env.VITE_LOCAL_STORAGE_KEY ?? "codex-mobile-mockup-editor";

export const textStyles: Record<string, TextStyle> = {
  body: {
    fontFamily: DEFAULT_FONT_FAMILY,
    fontSize: 11,
    fontWeight: 400,
    lineHeight: 1.2,
    color: "#1f2b2d",
    align: "left",
    verticalAlign: "middle",
  },
  bodyStrong: {
    fontFamily: DEFAULT_FONT_FAMILY,
    fontSize: 11,
    fontWeight: 700,
    lineHeight: 1.2,
    color: "#1f2b2d",
    align: "left",
    verticalAlign: "middle",
  },
  sectionTitle: {
    fontFamily: DEFAULT_FONT_FAMILY,
    fontSize: 9,
    fontWeight: 700,
    lineHeight: 1.2,
    color: "#66757a",
    align: "left",
    verticalAlign: "middle",
  },
  cta: {
    fontFamily: DEFAULT_FONT_FAMILY,
    fontSize: 11,
    fontWeight: 700,
    lineHeight: 1.2,
    color: "#1f2b2d",
    align: "center",
    verticalAlign: "middle",
  },
  caption: {
    fontFamily: DEFAULT_FONT_FAMILY,
    fontSize: 10,
    fontWeight: 400,
    lineHeight: 1.2,
    color: "#66757a",
    align: "left",
    verticalAlign: "middle",
  },
};

export const buttonVariantStyles: Record<
  ButtonVariant,
  { fillColor: string; strokeColor: string; textColor: string }
> = {
  primarySuccess: {
    fillColor: "#d5e8d4",
    strokeColor: "#82b366",
    textColor: "#1f2b2d",
  },
  secondaryOutline: {
    fillColor: "#ffffff",
    strokeColor: "#d7e1e3",
    textColor: "#1f2b2d",
  },
  accentOutline: {
    fillColor: "#ffffff",
    strokeColor: "#0f766e",
    textColor: "#0f766e",
  },
};

export const badgeVariantStyles: Record<
  BadgeVariant,
  { fillColor: string; strokeColor: string; textColor: string }
> = {
  info: {
    fillColor: "#dae8fc",
    strokeColor: "#6c8ebf",
    textColor: "#355070",
  },
  success: {
    fillColor: "#d5e8d4",
    strokeColor: "#82b366",
    textColor: "#355c2b",
  },
  code: {
    fillColor: "#f5f5f5",
    strokeColor: "#d7e1e3",
    textColor: "#4b5b61",
  },
  status: {
    fillColor: "#fff2cc",
    strokeColor: "#d6b656",
    textColor: "#7d5d17",
  },
};

export const bannerVariantStyles: Record<
  BannerVariant,
  { fillColor: string; strokeColor: string }
> = {
  info: {
    fillColor: "#eef6fb",
    strokeColor: "#9bc4e2",
  },
  warning: {
    fillColor: "#ffe6cc",
    strokeColor: "#d79b00",
  },
  success: {
    fillColor: "#e8f5eb",
    strokeColor: "#82b366",
  },
};

export const paletteItems: Array<{
  type: PaletteItemType;
  label: string;
  description: string;
}> = [
  { type: "flowLane", label: "Flow lane", description: "Scenario swimlane" },
  { type: "screen", label: "Screen", description: "Mobile frame" },
  { type: "container", label: "Container", description: "Section or card" },
  { type: "field", label: "Field", description: "Label + value row" },
  { type: "segmentedControl", label: "Segmented", description: "Segment switcher" },
  { type: "badge", label: "Badge", description: "Small status pill" },
  { type: "banner", label: "Banner", description: "Notice banner" },
  { type: "text", label: "Text", description: "Plain text block" },
  { type: "button", label: "Button", description: "CTA button" },
  { type: "checkbox", label: "Checkbox", description: "Checkbox row" },
];

export const defaultBoard: BoardModel = {
  zoom: 1,
  panX: 140,
  panY: 80,
  gridSize: DEFAULT_GRID_SIZE,
  showGrid: true,
  snapToGrid: true,
  guides: true,
};

export function createEmptyDocument(name = "Untitled mockup"): EditorDocument {
  return {
    id: "document-1",
    name,
    version: "0.1.0",
    idCounter: 1,
    board: { ...defaultBoard },
    nodes: {},
    rootIds: [],
    edges: {},
    edgeIds: [],
    meta: {
      source: "new",
      warnings: [],
      unsupportedCount: 0,
      unsupportedTokens: [],
    },
  };
}
