import { create } from "xmlbuilder2/lib/xmlbuilder2.min.js";

import type {
  EditorDocument,
  EditorEdge,
  EditorNode,
  ParentId,
  TextStyle,
} from "@/lib/model/document";
import { isContainerNode } from "@/lib/model/node-utils";
import { serializeStyle } from "@/lib/drawio/style";
import { textStyleToHtml } from "@/lib/drawio/text";
import { validateDocument } from "@/lib/drawio/validate";

type XmlCell = Record<string, unknown>;

function appendAttributes(target: any, source: Record<string, unknown>) {
  for (const [key, value] of Object.entries(source)) {
    if (!key.startsWith("@") || value === undefined) {
      continue;
    }

    target.att(key.slice(1), String(value));
  }
}

function appendGeometry(target: any, geometry: Record<string, unknown>) {
  const geometryElement = target.ele("mxGeometry");
  appendAttributes(geometryElement, geometry);

  const points = geometry.mxPoint;
  if (Array.isArray(points)) {
    for (const point of points) {
      const pointElement = geometryElement.ele("mxPoint");
      appendAttributes(pointElement, point as Record<string, unknown>);
    }
  }

  const arrayNode = geometry.Array;
  if (arrayNode && typeof arrayNode === "object") {
    const arrayElement = geometryElement.ele("Array");
    appendAttributes(arrayElement, arrayNode as Record<string, unknown>);
    const arrayPoints = (arrayNode as { mxPoint?: unknown }).mxPoint;
    if (Array.isArray(arrayPoints)) {
      for (const point of arrayPoints) {
        const pointElement = arrayElement.ele("mxPoint");
        appendAttributes(pointElement, point as Record<string, unknown>);
      }
    }
  }
}

function appendCell(target: any, cell: XmlCell) {
  const cellElement = target.ele("mxCell");
  appendAttributes(cellElement, cell);
  if (cell.mxGeometry && typeof cell.mxGeometry === "object") {
    appendGeometry(cellElement, cell.mxGeometry as Record<string, unknown>);
  }
}

function geometryForNode(node: EditorNode) {
  return {
    "@as": "geometry",
    "@x": node.x,
    "@y": node.y,
    "@width": node.width,
    "@height": node.height,
  };
}

function parentToMx(parentId: ParentId): string {
  return parentId === "board" ? "1" : parentId;
}

function textStyleToDrawioStyle(textStyle: TextStyle): Record<string, string | number> {
  return {
    text: 1,
    html: 1,
    whiteSpace: "wrap",
    align: textStyle.align,
    verticalAlign: textStyle.verticalAlign ?? "middle",
    fontStyle: textStyle.fontWeight === 700 ? 1 : 0,
  };
}

function edgeToCell(edge: EditorEdge): XmlCell {
  const geometry: Record<string, unknown> = {
    "@as": "geometry",
    "@relative": "1",
  };

  const points = [];
  if (edge.sourcePoint) {
    points.push({
      "@x": edge.sourcePoint.x,
      "@y": edge.sourcePoint.y,
      "@as": "sourcePoint",
    });
  }

  if (edge.targetPoint) {
    points.push({
      "@x": edge.targetPoint.x,
      "@y": edge.targetPoint.y,
      "@as": "targetPoint",
    });
  }

  if (points.length > 0) {
    geometry.mxPoint = points;
  }

  if (edge.waypoints && edge.waypoints.length > 0) {
    geometry.Array = {
      "@as": "points",
      mxPoint: edge.waypoints.map((point) => ({
        "@x": point.x,
        "@y": point.y,
      })),
    };
  }

  return {
    "@id": edge.id,
    "@edge": "1",
    "@parent": parentToMx(edge.parentId),
    "@source": edge.sourceId ?? undefined,
    "@target": edge.targetId ?? undefined,
    "@style": serializeStyle({
      edgeStyle: edge.orthogonal ? "orthogonalEdgeStyle" : "none",
      rounded: 0,
      orthogonalLoop: 1,
      jettySize: "auto",
      html: 1,
      strokeWidth: edge.strokeWidth,
      strokeColor: edge.strokeColor,
      startArrow: edge.startArrow === "classic" ? "classic" : undefined,
      endArrow: edge.endArrow === "classic" ? "classic" : "none",
      endFill: edge.endArrow === "classic" ? 1 : 0,
    }),
    mxGeometry: geometry,
  };
}

function nodeToCells(node: EditorNode): XmlCell[] {
  switch (node.type) {
    case "flowLane":
      return [
        {
          "@id": node.id,
          "@vertex": "1",
          "@parent": "1",
          "@value": node.title,
          "@style": serializeStyle({
            swimlane: "",
            horizontal: 0,
            whiteSpace: "wrap",
            html: 1,
            startSize: node.startSize,
          }),
          mxGeometry: geometryForNode(node),
        },
      ];
    case "screen": {
      const cells: XmlCell[] = [
        {
          "@id": node.id,
          "@vertex": "1",
          "@parent": parentToMx(node.parentId),
          "@value": "",
          "@style": serializeStyle({
            rounded: 1,
            whiteSpace: "wrap",
            html: 1,
            fillColor: node.fillColor ?? "#ffffff",
            strokeColor: node.strokeColor ?? "#1c2a30",
            strokeWidth: node.strokeWidth ?? 2,
            arcSize: node.borderRadius ?? 14,
            container: 1,
            collapsible: 0,
            dropTarget: 1,
            connectable: 0,
          }),
          mxGeometry: geometryForNode(node),
        },
      ];

      if (node.title) {
        const titleStyle: TextStyle = {
          fontFamily: "Helvetica, Arial, sans-serif",
          fontSize: 14,
          fontWeight: 700,
          lineHeight: 1.2,
          color: "#1f2b2d",
          align: "center",
          verticalAlign: "middle",
        };

        cells.push({
          "@id": `${node.id}__title`,
          "@vertex": "1",
          "@parent": parentToMx(node.parentId),
          "@value": textStyleToHtml(node.title, titleStyle),
          "@style": serializeStyle(textStyleToDrawioStyle(titleStyle)),
          mxGeometry: {
            "@as": "geometry",
            "@x": node.x,
            "@y": Math.max(0, node.y - 24),
            "@width": node.width,
            "@height": 20,
          },
        });
      }

      return cells;
    }
    case "container":
      return [
        {
          "@id": node.id,
          "@vertex": "1",
          "@parent": parentToMx(node.parentId),
          "@value": node.text
            ? textStyleToHtml(node.text, {
                fontFamily: "Helvetica, Arial, sans-serif",
                fontSize: 11,
                fontWeight: 400,
                lineHeight: 1.2,
                color: "#1f2b2d",
                align: "left",
                verticalAlign: "middle",
              })
            : "",
          "@style": serializeStyle({
            rounded: 1,
            whiteSpace: "wrap",
            html: 1,
            fillColor: node.fillColor ?? "#f7fafb",
            strokeColor: node.strokeColor ?? "#d7e1e3",
            strokeWidth: node.strokeWidth ?? 1,
            arcSize: node.borderRadius ?? 10,
            container: 1,
            collapsible: 0,
            dropTarget: 1,
            connectable: 0,
          }),
          mxGeometry: geometryForNode(node),
        },
      ];
    case "field":
      return [
        {
          "@id": node.id,
          "@vertex": "1",
          "@parent": parentToMx(node.parentId),
          "@value": "",
          "@style": serializeStyle({
            rounded: 1,
            whiteSpace: "wrap",
            html: 1,
            fillColor: node.fillColor ?? "#f7fafb",
            strokeColor: node.strokeColor ?? "#d7e1e3",
            strokeWidth: node.strokeWidth ?? 1,
            arcSize: node.borderRadius ?? 10,
            container: 1,
            collapsible: 0,
            dropTarget: 0,
            connectable: 0,
          }),
          mxGeometry: geometryForNode(node),
        },
        {
          "@id": `${node.id}__label`,
          "@vertex": "1",
          "@parent": parentToMx(node.parentId),
          "@value": textStyleToHtml(node.label, node.labelStyle),
          "@style": serializeStyle(textStyleToDrawioStyle(node.labelStyle)),
          mxGeometry: {
            "@as": "geometry",
            "@x": node.x + 12,
            "@y": node.y + 8,
            "@width": Math.max(0, node.width - 24),
            "@height": 12,
          },
        },
        {
          "@id": `${node.id}__value`,
          "@vertex": "1",
          "@parent": parentToMx(node.parentId),
          "@value": textStyleToHtml(node.value, node.valueStyle),
          "@style": serializeStyle(textStyleToDrawioStyle(node.valueStyle)),
          mxGeometry: {
            "@as": "geometry",
            "@x": node.x + 12,
            "@y": node.y + 20,
            "@width": Math.max(0, node.width - 24),
            "@height": Math.max(18, node.height - 24),
          },
        },
      ];
    case "segmentedControl": {
      const itemWidth = node.items.length > 0 ? node.width / node.items.length : node.width;
      return [
        {
          "@id": node.id,
          "@vertex": "1",
          "@parent": parentToMx(node.parentId),
          "@value": "",
          "@style": serializeStyle({
            rounded: 1,
            whiteSpace: "wrap",
            html: 1,
            fillColor: node.fillColor ?? "#ffffff",
            strokeColor: node.strokeColor ?? "#d7e1e3",
            strokeWidth: node.strokeWidth ?? 1,
            arcSize: node.borderRadius ?? 12,
            container: 1,
            collapsible: 0,
            dropTarget: 0,
            connectable: 0,
          }),
          mxGeometry: geometryForNode(node),
        },
        ...node.items.map((item, index) => ({
          "@id": `${node.id}__item-${index}`,
          "@vertex": "1",
          "@parent": parentToMx(node.parentId),
          "@value": textStyleToHtml(item, node.textStyle),
          "@style": serializeStyle({
            rounded: 1,
            whiteSpace: "wrap",
            html: 1,
            fillColor: index === node.activeIndex ? node.activeFill : node.inactiveFill,
            strokeColor: index === node.activeIndex ? node.activeStroke : node.inactiveStroke,
            strokeWidth: 1,
            arcSize: node.borderRadius ?? 12,
          }),
          mxGeometry: {
            "@as": "geometry",
            "@x": node.x + index * itemWidth + 2,
            "@y": node.y + 2,
            "@width": Math.max(0, itemWidth - 4),
            "@height": Math.max(0, node.itemHeight - 4),
          },
        })),
      ];
    }
    case "badge":
      return [
        {
          "@id": node.id,
          "@vertex": "1",
          "@parent": parentToMx(node.parentId),
          "@value": textStyleToHtml(node.text, node.textStyle),
          "@style": serializeStyle({
            rounded: 1,
            whiteSpace: "wrap",
            html: 1,
            fillColor: node.fillColor ?? "#dae8fc",
            strokeColor: node.strokeColor ?? "#6c8ebf",
            strokeWidth: node.strokeWidth ?? 1,
            arcSize: node.borderRadius ?? 9,
          }),
          mxGeometry: geometryForNode(node),
        },
      ];
    case "banner":
      return [
        {
          "@id": node.id,
          "@vertex": "1",
          "@parent": parentToMx(node.parentId),
          "@value": "",
          "@style": serializeStyle({
            rounded: 1,
            whiteSpace: "wrap",
            html: 1,
            fillColor: node.fillColor ?? "#ffe6cc",
            strokeColor: node.strokeColor ?? "#d79b00",
            strokeWidth: node.strokeWidth ?? 1,
            arcSize: node.borderRadius ?? 16,
            container: 1,
            collapsible: 0,
            dropTarget: 0,
            connectable: 0,
          }),
          mxGeometry: geometryForNode(node),
        },
        {
          "@id": `${node.id}__title`,
          "@vertex": "1",
          "@parent": parentToMx(node.parentId),
          "@value": textStyleToHtml(node.title, node.titleStyle),
          "@style": serializeStyle(textStyleToDrawioStyle(node.titleStyle)),
          mxGeometry: {
            "@as": "geometry",
            "@x": node.x + 14,
            "@y": node.y + 12,
            "@width": Math.max(0, node.width - 28),
            "@height": 16,
          },
        },
        {
          "@id": `${node.id}__body`,
          "@vertex": "1",
          "@parent": parentToMx(node.parentId),
          "@value": textStyleToHtml(node.body, node.bodyStyle),
          "@style": serializeStyle(textStyleToDrawioStyle(node.bodyStyle)),
          mxGeometry: {
            "@as": "geometry",
            "@x": node.x + 14,
            "@y": node.y + 30,
            "@width": Math.max(0, node.width - 28),
            "@height": Math.max(18, node.height - 40),
          },
        },
      ];
    case "text":
      return [
        {
          "@id": node.id,
          "@vertex": "1",
          "@parent": parentToMx(node.parentId),
          "@value": textStyleToHtml(node.text, node.textStyle),
          "@style": serializeStyle(textStyleToDrawioStyle(node.textStyle)),
          mxGeometry: geometryForNode(node),
        },
      ];
    case "button":
      return [
        {
          "@id": node.id,
          "@vertex": "1",
          "@parent": parentToMx(node.parentId),
          "@value": textStyleToHtml(node.text, node.textStyle),
          "@style": serializeStyle({
            rounded: 1,
            whiteSpace: "wrap",
            html: 1,
            fillColor: node.fillColor ?? "#d5e8d4",
            strokeColor: node.strokeColor ?? "#82b366",
            strokeWidth: node.strokeWidth ?? 1,
            arcSize: node.borderRadius ?? 14,
          }),
          mxGeometry: geometryForNode(node),
        },
      ];
    case "checkbox":
      return [
        {
          "@id": node.id,
          "@vertex": "1",
          "@parent": parentToMx(node.parentId),
          "@value": "",
          "@style": serializeStyle({
            rounded: 1,
            whiteSpace: "wrap",
            html: 1,
            fillColor: node.fillColor ?? "#ffffff",
            strokeColor: node.strokeColor ?? "#0f766e",
            strokeWidth: node.strokeWidth ?? 2,
            arcSize: node.borderRadius ?? 6,
          }),
          mxGeometry: {
            "@as": "geometry",
            "@x": node.x,
            "@y": node.y + Math.max(0, (node.height - node.boxSize) / 2),
            "@width": node.boxSize,
            "@height": node.boxSize,
          },
        },
        {
          "@id": `${node.id}__label`,
          "@vertex": "1",
          "@parent": parentToMx(node.parentId),
          "@value": textStyleToHtml(node.text, node.textStyle),
          "@style": serializeStyle(textStyleToDrawioStyle(node.textStyle)),
          mxGeometry: {
            "@as": "geometry",
            "@x": node.x + node.boxSize + 8,
            "@y": node.y,
            "@width": Math.max(0, node.width - node.boxSize - 8),
            "@height": node.height,
          },
        },
      ];
    case "unsupported":
      return [
        {
          "@id": node.id,
          "@vertex": "1",
          "@parent": parentToMx(node.parentId),
          "@value": node.rawValue ?? "",
          "@style": serializeStyle({
            rounded: 1,
            whiteSpace: "wrap",
            html: 1,
            fillColor: node.fillColor ?? "#fff4e6",
            strokeColor: node.strokeColor ?? "#d79b00",
            strokeWidth: node.strokeWidth ?? 1,
            arcSize: node.borderRadius ?? 10,
          }),
          mxGeometry: geometryForNode(node),
        },
      ];
  }
}

function visitNodes(document: EditorDocument, parentId: ParentId, cells: XmlCell[]): void {
  const childIds =
    parentId === "board"
      ? document.rootIds
      : isContainerNode(document.nodes[parentId])
        ? document.nodes[parentId].children
        : [];

  for (const childId of childIds) {
    const node = document.nodes[childId];
    if (!node) {
      continue;
    }

    cells.push(...nodeToCells(node));
    if (isContainerNode(node)) {
      visitNodes(document, node.id, cells);
    }
  }
}

export function serializeDrawioXml(document: EditorDocument): string {
  const report = validateDocument(document);
  if (report.errors.length > 0) {
    throw new Error(report.errors.join("\n"));
  }

  const root = create({ version: "1.0", encoding: "UTF-8" })
    .ele("mxfile")
    .ele("diagram", { id: "diagram-1", name: document.name })
    .ele("mxGraphModel", {
      dx: "1600",
      dy: "1200",
      grid: document.board.showGrid ? "1" : "0",
      gridSize: String(document.board.gridSize),
      guides: document.board.guides ? "1" : "0",
      tooltips: "1",
      connect: "1",
      arrows: "1",
      fold: "1",
      page: "1",
      pageScale: "1",
      pageWidth: "850",
      pageHeight: "1100",
      math: "0",
      shadow: "0",
    })
    .ele("root");

  const cells: XmlCell[] = [{ "@id": "0" }, { "@id": "1", "@parent": "0" }];
  visitNodes(document, "board", cells);

  for (const edgeId of document.edgeIds) {
    const edge = document.edges[edgeId];
    if (edge) {
      cells.push(edgeToCell(edge));
    }
  }

  for (const cell of cells) {
    appendCell(root, cell);
  }

  return root.end({ prettyPrint: true });
}
