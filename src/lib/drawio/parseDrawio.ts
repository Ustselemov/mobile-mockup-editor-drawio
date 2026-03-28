import { XMLParser } from "fast-xml-parser";

import { createEmptyDocument } from "@/lib/model/defaults";
import {
  appendNode,
  createFlowLane,
  getParentType,
  isContainerNode,
} from "@/lib/model/node-utils";
import type {
  EditorDocument,
  EditorEdge,
  EditorNode,
  ParentId,
  TextStyle,
} from "@/lib/model/document";
import { extractTextStyleFromHtml, htmlToPlainText } from "@/lib/drawio/text";
import { parseStyle } from "@/lib/drawio/style";

type ParsedPoint = {
  "@_x": string;
  "@_y": string;
  "@_as"?: string;
};

type ParsedCell = {
  "@_id": string;
  "@_parent"?: string;
  "@_style"?: string;
  "@_value"?: string;
  "@_vertex"?: string;
  "@_edge"?: string;
  "@_source"?: string;
  "@_target"?: string;
  mxGeometry?: {
    "@_x"?: string;
    "@_y"?: string;
    "@_width"?: string;
    "@_height"?: string;
    "@_relative"?: string;
    mxPoint?: ParsedPoint | ParsedPoint[];
    Array?: {
      mxPoint?: ParsedPoint | ParsedPoint[];
    };
  };
};

type CompositeAuxCells = {
  label?: ParsedCell;
  value?: ParsedCell;
  title?: ParsedCell;
  body?: ParsedCell;
  items?: ParsedCell[];
};

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  parseTagValue: false,
  trimValues: false,
});

const SUPPORTED_STYLE_KEYS = new Set([
  "align",
  "arcSize",
  "collapsible",
  "connectable",
  "container",
  "dropTarget",
  "edgeStyle",
  "endArrow",
  "endFill",
  "entryDx",
  "entryDy",
  "entryX",
  "entryY",
  "exitDx",
  "exitDy",
  "exitX",
  "exitY",
  "fillColor",
  "fontStyle",
  "horizontal",
  "html",
  "jettySize",
  "orthogonalLoop",
  "rounded",
  "startArrow",
  "startSize",
  "strokeColor",
  "strokeWidth",
  "swimlane",
  "text",
  "verticalAlign",
  "whiteSpace",
]);

function toArray<T>(value: T | T[] | undefined): T[] {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

function parseNumber(value: string | undefined, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getCompositeIdParts(
  cellId: string,
): { baseId: string; suffix: keyof CompositeAuxCells } | null {
  const suffixMatch = cellId.match(/^(.*)__(label|value|title|body)$/);
  if (suffixMatch) {
    return {
      baseId: suffixMatch[1],
      suffix: suffixMatch[2] as keyof CompositeAuxCells,
    };
  }

  const itemMatch = cellId.match(/^(.*)__item-\d+$/);
  if (itemMatch) {
    return {
      baseId: itemMatch[1],
      suffix: "items",
    };
  }

  return null;
}

function buildOriginalXml(cell: ParsedCell): string {
  const attributes = Object.entries(cell)
    .filter(([key, value]) => key.startsWith("@_") && value !== undefined)
    .map(([key, value]) => `${key.slice(2)}="${String(value)}"`)
    .join(" ");

  const geometry = cell.mxGeometry;
  if (!geometry) {
    return `<mxCell ${attributes} />`;
  }

  const geometryAttributes = Object.entries(geometry)
    .filter(([key, value]) => key.startsWith("@_") && value !== undefined)
    .map(([key, value]) => `${key.slice(2)}="${String(value)}"`)
    .join(" ");

  return `<mxCell ${attributes}><mxGeometry ${geometryAttributes} /></mxCell>`;
}

function getUnsupportedStyleKeys(style: Record<string, string>): string[] {
  return Object.keys(style).filter((key) => !SUPPORTED_STYLE_KEYS.has(key));
}

function isUnsupportedVertex(style: Record<string, string>): boolean {
  return (
    style.shape !== undefined ||
    style.edgeStyle !== undefined ||
    getUnsupportedStyleKeys(style).length > 0
  );
}

function getGeometry(cell: ParsedCell) {
  const geometry = cell.mxGeometry;
  return {
    x: parseNumber(geometry?.["@_x"]),
    y: parseNumber(geometry?.["@_y"]),
    width: parseNumber(geometry?.["@_width"], 120),
    height: parseNumber(geometry?.["@_height"], 40),
  };
}

function getTextValue(cell: ParsedCell | undefined): string {
  return htmlToPlainText(cell?.["@_value"]);
}

function mergeTextStyle(
  base: TextStyle,
  cell: ParsedCell | undefined,
  overrides: Partial<TextStyle> = {},
): TextStyle {
  return {
    ...base,
    ...extractTextStyleFromHtml(cell?.["@_value"]),
    ...overrides,
  };
}

function detectNodeType(
  style: Record<string, string>,
  textValue: string,
  geometry: ReturnType<typeof getGeometry>,
): EditorNode["type"] {
  if (style.swimlane !== undefined) {
    return "flowLane";
  }

  if (style.text !== undefined) {
    return "text";
  }

  if (
    style.container === "1" &&
    style.strokeColor?.toLowerCase() === "#1c2a30" &&
    style.arcSize === "14"
  ) {
    return "screen";
  }

  if (
    geometry.width <= 24 &&
    geometry.height <= 24 &&
    style.strokeColor?.toLowerCase() === "#0f766e"
  ) {
    return "checkbox";
  }

  if (
    textValue &&
    (style.arcSize === "14" ||
      style.fillColor?.toLowerCase() === "#d5e8d4" ||
      style.strokeColor?.toLowerCase() === "#82b366")
  ) {
    return "button";
  }

  return "container";
}

function detectBadgeVariant(style: Record<string, string>) {
  const fillColor = style.fillColor?.toLowerCase();
  const strokeColor = style.strokeColor?.toLowerCase();

  if (fillColor === "#d5e8d4" && strokeColor === "#82b366") {
    return "success" as const;
  }
  if (fillColor === "#f5f5f5" && strokeColor === "#d7e1e3") {
    return "code" as const;
  }
  if (fillColor === "#fff2cc" && strokeColor === "#d6b656") {
    return "status" as const;
  }

  return "info" as const;
}

function parseEdge(cell: ParsedCell): EditorEdge {
  const style = parseStyle(cell["@_style"]);
  const geometryPoints = toArray(cell.mxGeometry?.mxPoint);
  const sourcePoint = geometryPoints.find((point) => point["@_as"] === "sourcePoint");
  const targetPoint = geometryPoints.find((point) => point["@_as"] === "targetPoint");
  const waypoints = toArray(cell.mxGeometry?.Array?.mxPoint).map((point) => ({
    x: parseNumber(point["@_x"]),
    y: parseNumber(point["@_y"]),
  }));

  return {
    id: cell["@_id"],
    type: "edge",
    parentId:
      cell["@_parent"] && cell["@_parent"] !== "1" ? cell["@_parent"] : "board",
    sourceId: cell["@_source"] ?? null,
    targetId: cell["@_target"] ?? null,
    sourcePoint: sourcePoint
      ? { x: parseNumber(sourcePoint["@_x"]), y: parseNumber(sourcePoint["@_y"]) }
      : undefined,
    targetPoint: targetPoint
      ? { x: parseNumber(targetPoint["@_x"]), y: parseNumber(targetPoint["@_y"]) }
      : undefined,
    waypoints: waypoints.length > 0 ? waypoints : undefined,
    orthogonal: style.edgeStyle === "orthogonalEdgeStyle",
    startArrow: style.startArrow === "classic" ? "classic" : "none",
    endArrow: style.endArrow === "classic" ? "classic" : "none",
    strokeColor: style.strokeColor ?? "#000000",
    strokeWidth: parseNumber(style.strokeWidth, 5),
  };
}

function createNodeFromCell(
  cell: ParsedCell,
  auxiliary: CompositeAuxCells = {},
): EditorNode {
  const style = parseStyle(cell["@_style"]);
  const geometry = getGeometry(cell);
  const value = htmlToPlainText(cell["@_value"]);
  const parentId: ParentId =
    cell["@_parent"] && cell["@_parent"] !== "1" ? cell["@_parent"] : "board";
  const nodeType = detectNodeType(style, value, geometry);
  const labelValue = getTextValue(auxiliary.label);
  const fieldValue = getTextValue(auxiliary.value);

  if (isUnsupportedVertex(style)) {
    return {
      id: cell["@_id"],
      type: "unsupported",
      parentId,
      x: geometry.x,
      y: geometry.y,
      width: geometry.width,
      height: geometry.height,
      zIndex: 0,
      visible: true,
      locked: false,
      fillColor: style.fillColor ?? "#fff4e6",
      strokeColor: style.strokeColor ?? "#d79b00",
      strokeWidth: parseNumber(style.strokeWidth, 1),
      borderRadius: parseNumber(style.arcSize, 10),
      opacity: 1,
      rawValue: value || undefined,
      originalStyle: style,
      originalXml: buildOriginalXml(cell),
      metadata: {
        unsupportedStyleKeys: getUnsupportedStyleKeys(style),
      },
    };
  }

  if (auxiliary.label && auxiliary.value) {
    return {
      id: cell["@_id"],
      type: "field",
      parentId,
      x: geometry.x,
      y: geometry.y,
      width: geometry.width,
      height: geometry.height,
      zIndex: 0,
      visible: true,
      locked: false,
      fillColor: style.fillColor ?? "#f7fafb",
      strokeColor: style.strokeColor ?? "#d7e1e3",
      strokeWidth: parseNumber(style.strokeWidth, 1),
      borderRadius: parseNumber(style.arcSize, 10),
      opacity: 1,
      label: labelValue || "Field label",
      value: fieldValue || value || "Field value",
      labelStyle: mergeTextStyle(
        {
          fontFamily: "Helvetica, Arial, sans-serif",
          fontSize: 9,
          fontWeight: 700,
          lineHeight: 1.2,
          color: "#66757a",
          align: "left",
          verticalAlign: "middle",
        },
        auxiliary.label,
      ),
      valueStyle: mergeTextStyle(
        {
          fontFamily: "Helvetica, Arial, sans-serif",
          fontSize: 11,
          fontWeight: 400,
          lineHeight: 1.2,
          color: "#1f2b2d",
          align: "left",
          verticalAlign: "middle",
        },
        auxiliary.value,
      ),
      metadata: { unmappedStyle: style },
    };
  }

  if (auxiliary.items && auxiliary.items.length > 0) {
    const itemValues = auxiliary.items.map((item) => getTextValue(item));
    const activeIndex = auxiliary.items.findIndex((item) => {
      const itemStyle = parseStyle(item["@_style"]);
      return (
        itemStyle.fillColor?.toLowerCase() === "#dcefeb" ||
        itemStyle.strokeColor?.toLowerCase() === "#0f766e"
      );
    });

    return {
      id: cell["@_id"],
      type: "segmentedControl",
      parentId,
      x: geometry.x,
      y: geometry.y,
      width: geometry.width,
      height: geometry.height,
      zIndex: 0,
      visible: true,
      locked: false,
      fillColor: style.fillColor ?? "#ffffff",
      strokeColor: style.strokeColor ?? "#d7e1e3",
      strokeWidth: parseNumber(style.strokeWidth, 1),
      borderRadius: parseNumber(style.arcSize, 12),
      opacity: 1,
      items: itemValues,
      activeIndex: activeIndex >= 0 ? activeIndex : 0,
      itemHeight: geometry.height,
      activeFill: "#dcefeb",
      activeStroke: "#0f766e",
      inactiveFill: "#ffffff",
      inactiveStroke: "#666666",
      textStyle: mergeTextStyle(
        {
          fontFamily: "Helvetica, Arial, sans-serif",
          fontSize: 11,
          fontWeight: 700,
          lineHeight: 1.2,
          color: "#1f2b2d",
          align: "center",
          verticalAlign: "middle",
        },
        auxiliary.items[0],
      ),
      metadata: { unmappedStyle: style },
    };
  }

  if (auxiliary.title && auxiliary.body) {
    return {
      id: cell["@_id"],
      type: "banner",
      parentId,
      x: geometry.x,
      y: geometry.y,
      width: geometry.width,
      height: geometry.height,
      zIndex: 0,
      visible: true,
      locked: false,
      fillColor: style.fillColor ?? "#ffe6cc",
      strokeColor: style.strokeColor ?? "#d79b00",
      strokeWidth: parseNumber(style.strokeWidth, 1),
      borderRadius: parseNumber(style.arcSize, 16),
      opacity: 1,
      title: getTextValue(auxiliary.title) || "Banner",
      body: getTextValue(auxiliary.body) || "",
      variant:
        style.strokeColor?.toLowerCase() === "#82b366"
          ? "success"
          : style.strokeColor?.toLowerCase() === "#9bc4e2"
            ? "info"
            : "warning",
      titleStyle: mergeTextStyle(
        {
          fontFamily: "Helvetica, Arial, sans-serif",
          fontSize: 11,
          fontWeight: 700,
          lineHeight: 1.2,
          color: "#1f2b2d",
          align: "left",
          verticalAlign: "middle",
        },
        auxiliary.title,
      ),
      bodyStyle: mergeTextStyle(
        {
          fontFamily: "Helvetica, Arial, sans-serif",
          fontSize: 10,
          fontWeight: 400,
          lineHeight: 1.2,
          color: "#66757a",
          align: "left",
          verticalAlign: "middle",
        },
        auxiliary.body,
      ),
      metadata: { unmappedStyle: style },
    };
  }

  if (
    value &&
    style.text === undefined &&
    (style.fillColor !== undefined || style.strokeColor !== undefined) &&
    geometry.height <= 28 &&
    parseNumber(style.arcSize, 9) <= 10
  ) {
    const variant = detectBadgeVariant(style);
    return {
      id: cell["@_id"],
      type: "badge",
      parentId,
      x: geometry.x,
      y: geometry.y,
      width: geometry.width,
      height: geometry.height,
      zIndex: 0,
      visible: true,
      locked: false,
      fillColor: style.fillColor ?? "#dae8fc",
      strokeColor: style.strokeColor ?? "#6c8ebf",
      strokeWidth: parseNumber(style.strokeWidth, 1),
      borderRadius: parseNumber(style.arcSize, 9),
      opacity: 1,
      text: value,
      variant,
      textStyle: mergeTextStyle(
        {
          fontFamily: "Helvetica, Arial, sans-serif",
          fontSize: 10,
          fontWeight: 700,
          lineHeight: 1.2,
          color: "#355070",
          align: "center",
          verticalAlign: "middle",
        },
        cell,
      ),
      metadata: { unmappedStyle: style },
    };
  }

  if (nodeType === "flowLane") {
    return createFlowLane(
      cell["@_id"],
      value || "Lane",
      geometry.x,
      geometry.y,
      geometry.width,
      geometry.height,
    );
  }

  if (nodeType === "screen") {
    return {
      id: cell["@_id"],
      type: "screen",
      parentId,
      x: geometry.x,
      y: geometry.y,
      width: geometry.width,
      height: geometry.height,
      zIndex: 0,
      visible: true,
      locked: false,
      fillColor: style.fillColor ?? "#ffffff",
      strokeColor: style.strokeColor ?? "#1c2a30",
      strokeWidth: parseNumber(style.strokeWidth, 2),
      borderRadius: parseNumber(style.arcSize, 14),
      opacity: 1,
      title: getTextValue(auxiliary.title) || value || "Imported screen",
      clipChildren: true,
      children: [],
      metadata: { unmappedStyle: style },
    };
  }

  if (nodeType === "text") {
    return {
      id: cell["@_id"],
      type: "text",
      parentId,
      x: geometry.x,
      y: geometry.y,
      width: geometry.width,
      height: geometry.height,
      zIndex: 0,
      visible: true,
      locked: false,
      opacity: 1,
      text: value,
      textStyle: mergeTextStyle(
        {
          fontFamily: "Helvetica, Arial, sans-serif",
          fontSize: 11,
          fontWeight: style.fontStyle === "1" ? 700 : 400,
          lineHeight: 1.2,
          color: "#1f2b2d",
          align:
          style.align === "center" || style.align === "right"
            ? style.align
            : "left",
          verticalAlign: "middle",
        },
        cell,
      ),
      metadata: { unmappedStyle: style },
    };
  }

  if (nodeType === "button") {
    return {
      id: cell["@_id"],
      type: "button",
      parentId,
      x: geometry.x,
      y: geometry.y,
      width: geometry.width,
      height: geometry.height,
      zIndex: 0,
      visible: true,
      locked: false,
      fillColor: style.fillColor ?? "#d5e8d4",
      strokeColor: style.strokeColor ?? "#82b366",
      strokeWidth: parseNumber(style.strokeWidth, 1),
      borderRadius: parseNumber(style.arcSize, 14),
      opacity: 1,
      text: value || "Button",
      variant:
        style.strokeColor?.toLowerCase() === "#0f766e"
          ? "accentOutline"
          : style.fillColor?.toLowerCase() === "#ffffff"
            ? "secondaryOutline"
            : "primarySuccess",
      textStyle: mergeTextStyle(
        {
          fontFamily: "Helvetica, Arial, sans-serif",
          fontSize: 11,
          fontWeight: 700,
          lineHeight: 1.2,
          color: "#1f2b2d",
          align: "center",
          verticalAlign: "middle",
        },
        cell,
      ),
      metadata: { unmappedStyle: style },
    };
  }

  if (nodeType === "checkbox") {
    return {
      id: cell["@_id"],
      type: "checkbox",
      parentId,
      x: geometry.x,
      y: geometry.y,
      width: 180,
      height: 24,
      zIndex: 0,
      visible: true,
      locked: false,
      fillColor: style.fillColor ?? "#ffffff",
      strokeColor: style.strokeColor ?? "#0f766e",
      strokeWidth: parseNumber(style.strokeWidth, 2),
      borderRadius: parseNumber(style.arcSize, 6),
      opacity: 1,
      text: labelValue || value || "Imported checkbox",
      checked: false,
      boxSize: Math.max(16, geometry.width),
      textStyle: mergeTextStyle(
        {
          fontFamily: "Helvetica, Arial, sans-serif",
          fontSize: 11,
          fontWeight: 400,
          lineHeight: 1.2,
          color: "#1f2b2d",
          align: "left",
          verticalAlign: "middle",
        },
        auxiliary.label,
      ),
      metadata: { unmappedStyle: style },
    };
  }

  return {
    id: cell["@_id"],
    type: "container",
    parentId,
    x: geometry.x,
    y: geometry.y,
    width: geometry.width,
    height: geometry.height,
    zIndex: 0,
    visible: true,
    locked: false,
    fillColor: style.fillColor ?? "#f7fafb",
    strokeColor: style.strokeColor ?? "#d7e1e3",
    strokeWidth: parseNumber(style.strokeWidth, 1),
    borderRadius: parseNumber(style.arcSize, 10),
    opacity: 1,
    title: value || undefined,
    padding: 12,
    children: [],
    metadata: { unmappedStyle: style },
  };
}

export function parseDrawioXml(
  xml: string,
  originalFileName?: string,
): EditorDocument {
  const raw = parser.parse(xml) as {
    mxfile?: {
      diagram?: {
        mxGraphModel?: {
          root?: {
            mxCell?: ParsedCell | ParsedCell[];
          };
        };
      };
    };
  };

  const document = createEmptyDocument(originalFileName ?? "Imported draw.io");
  document.meta.source = "imported-drawio";
  document.meta.originalFileName = originalFileName;
  document.meta.importedAt = new Date().toISOString();

  const cells = toArray(raw.mxfile?.diagram?.mxGraphModel?.root?.mxCell);
  const cellsById = new Map(cells.map((cell) => [cell["@_id"], cell]));
  const auxiliaryByBaseId = new Map<string, CompositeAuxCells>();

  for (const cell of cells) {
    const compositeId = getCompositeIdParts(cell["@_id"]);
    if (!compositeId || !cellsById.has(compositeId.baseId)) {
      continue;
    }

    const current = auxiliaryByBaseId.get(compositeId.baseId) ?? {};
    if (compositeId.suffix === "items") {
      current.items = [...(current.items ?? []), cell];
    } else {
      current[compositeId.suffix] = cell;
    }
    auxiliaryByBaseId.set(compositeId.baseId, current);
  }

  for (const cell of cells) {
    if (cell["@_id"] === "0" || cell["@_id"] === "1") {
      continue;
    }

    if (getCompositeIdParts(cell["@_id"])) {
      continue;
    }

    if (cell["@_edge"] === "1") {
      const edge = parseEdge(cell);
      document.edges[edge.id] = edge;
      document.edgeIds.push(edge.id);
      continue;
    }

    if (cell["@_vertex"] === "1") {
      const node = createNodeFromCell(cell, auxiliaryByBaseId.get(cell["@_id"]));
      appendNode(document, node);
      if (node.type === "unsupported") {
        document.meta.warnings.push(`Unsupported vertex imported: ${node.id}`);
        document.meta.unsupportedTokens.push(
          ...Object.keys(node.originalStyle ?? {}).filter(
            (token) => !document.meta.unsupportedTokens.includes(token),
          ),
        );
      }
      const numericSuffix = Number(node.id.split("-").at(-1));
      if (Number.isFinite(numericSuffix)) {
        document.idCounter = Math.max(document.idCounter, numericSuffix + 1);
      }
    }
  }

  for (const node of Object.values(document.nodes)) {
    if (node.parentId === "board") {
      continue;
    }

    const parent = document.nodes[node.parentId];
    if (!isContainerNode(parent)) {
      node.parentId = "board";
      if (!document.rootIds.includes(node.id)) {
        document.rootIds.push(node.id);
      }
      document.meta.warnings.push(
        `Node ${node.id} had invalid parent and was moved to board.`,
      );
    }
  }

  for (const edge of Object.values(document.edges)) {
    const edgeParentType = getParentType(document, edge.parentId);
    if (
      edge.parentId !== "board" &&
      edgeParentType !== "flowLane" &&
      edgeParentType !== "screen"
    ) {
      edge.parentId = "board";
      document.meta.warnings.push(
        `Edge ${edge.id} had invalid parent and was moved to board.`,
      );
    }
  }

  document.meta.unsupportedCount = Object.values(document.nodes).filter(
    (node) => node.type === "unsupported",
  ).length;
  document.meta.unsupportedTokens = [...new Set(document.meta.unsupportedTokens)];

  return document;
}
