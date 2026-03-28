import { DEFAULT_LAYOUT_CONFIG } from "@/lib/layout/config";
import type {
  ContainerNodeType,
  EditorDocument,
  LayoutConfig,
  NodeId,
  ParentId,
} from "@/lib/model/document";
import { isContainerNode } from "@/lib/model/node-utils";

function getResolvedLayout(node: ContainerNodeType): LayoutConfig {
  return {
    ...DEFAULT_LAYOUT_CONFIG,
    ...node.layout,
  };
}

function getContentBox(node: ContainerNodeType, layout: LayoutConfig) {
  const topOffset =
    node.type === "flowLane"
      ? node.startSize + layout.padding
      : layout.padding;

  return {
    x: layout.padding,
    y: topOffset,
    width: Math.max(0, node.width - layout.padding * 2),
    height: Math.max(0, node.height - topOffset - layout.padding),
  };
}

function getCrossAxisPosition(
  contentStart: number,
  contentSize: number,
  itemSize: number,
  align: LayoutConfig["align"],
) {
  if (align === "center") {
    return contentStart + Math.max(0, (contentSize - itemSize) / 2);
  }

  if (align === "end") {
    return contentStart + Math.max(0, contentSize - itemSize);
  }

  return contentStart;
}

function normalizeGridDimension(value: number | undefined, fallback: number): number {
  if (!Number.isFinite(value ?? Number.NaN)) {
    return fallback;
  }

  return Math.max(1, Math.floor(value ?? fallback));
}

function getMinimumNodeSize(node: EditorDocument["nodes"][NodeId]) {
  if (node.type === "checkbox") {
    return { width: node.boxSize + 40, height: 24 };
  }

  if (node.type === "field") {
    return { width: 140, height: 42 };
  }

  if (node.type === "segmentedControl") {
    return { width: 120, height: node.itemHeight };
  }

  if (node.type === "badge") {
    return { width: 48, height: 24 };
  }

  if (node.type === "banner") {
    return { width: 180, height: 56 };
  }

  if (node.type === "text") {
    return { width: 60, height: 20 };
  }

  return { width: 24, height: 24 };
}

function getGridShape(layout: LayoutConfig, itemCount: number) {
  const fallbackColumns = Math.max(1, Math.ceil(Math.sqrt(Math.max(1, itemCount))));
  let columns = normalizeGridDimension(layout.gridColumns, fallbackColumns);
  let rows = normalizeGridDimension(layout.gridRows, 0);

  if (columns > itemCount && itemCount > 0) {
    columns = itemCount;
  }

  if (rows > 0 && layout.gridColumns == null) {
    columns = Math.max(1, Math.ceil(itemCount / rows));
  }

  if (itemCount > 0) {
    rows = Math.max(rows, Math.ceil(itemCount / columns));
  } else {
    rows = Math.max(rows, 1);
  }

  return { columns, rows };
}

function getGridCellPosition(
  cellStart: number,
  cellSize: number,
  itemSize: number,
  align: LayoutConfig["align"],
) {
  if (align === "center") {
    return cellStart + Math.max(0, (cellSize - itemSize) / 2);
  }

  if (align === "end") {
    return cellStart + Math.max(0, cellSize - itemSize);
  }

  return cellStart;
}

function reflowGridContainerChildren(
  document: EditorDocument,
  parentId: NodeId,
): boolean {
  const parent = document.nodes[parentId];
  if (!isContainerNode(parent)) {
    return false;
  }

  const layout = getResolvedLayout(parent);
  const contentBox = getContentBox(parent, layout);
  const children = parent.children
    .map((childId) => document.nodes[childId])
    .filter((child): child is EditorDocument["nodes"][NodeId] => Boolean(child));

  if (children.length === 0) {
    return false;
  }

  const { columns, rows } = getGridShape(layout, children.length);
  const columnWidths = new Array(columns).fill(0);
  const rowHeights = new Array(rows).fill(0);

  children.forEach((child, index) => {
    const minimumSize = getMinimumNodeSize(child);
    const column = index % columns;
    const row = Math.floor(index / columns);
    const measuredWidth = Math.max(child.width, minimumSize.width);
    const measuredHeight = Math.max(child.height, minimumSize.height);

    columnWidths[column] = Math.max(columnWidths[column], measuredWidth);
    rowHeights[row] = Math.max(rowHeights[row], measuredHeight);
  });

  let changed = false;
  let cursorY = contentBox.y;

  for (let row = 0; row < rows; row += 1) {
    let cursorX = contentBox.x;

    for (let column = 0; column < columns; column += 1) {
      const childIndex = row * columns + column;
      const child = children[childIndex];
      const cellWidth = columnWidths[column] ?? 0;
      const cellHeight = rowHeights[row] ?? 0;
      if (!child || cellWidth <= 0 || cellHeight <= 0) {
        cursorX += cellWidth + layout.gap;
        continue;
      }

      const minimumSize = getMinimumNodeSize(child);
      const nextWidth =
        layout.align === "stretch"
          ? cellWidth
          : Math.max(minimumSize.width, Math.min(child.width, cellWidth));
      const nextHeight =
        layout.align === "stretch"
          ? cellHeight
          : Math.max(minimumSize.height, Math.min(child.height, cellHeight));
      const nextX = getGridCellPosition(cursorX, cellWidth, nextWidth, layout.align);
      const nextY = getGridCellPosition(cursorY, cellHeight, nextHeight, layout.align);

      if (
        child.x !== nextX ||
        child.y !== nextY ||
        child.width !== nextWidth ||
        child.height !== nextHeight
      ) {
        document.nodes[child.id] = {
          ...child,
          x: nextX,
          y: nextY,
          width: nextWidth,
          height: nextHeight,
        };
        changed = true;
      }

      if (isContainerNode(document.nodes[child.id])) {
        changed = reflowContainerChildren(document, child.id) || changed;
      }

      cursorX += cellWidth + layout.gap;
    }

    cursorY += rowHeights[row] + layout.gap;
  }

  return changed;
}

export function reflowContainerChildren(
  document: EditorDocument,
  parentId: NodeId,
): boolean {
  const parent = document.nodes[parentId];
  if (!isContainerNode(parent)) {
    return false;
  }

  const layout = getResolvedLayout(parent);
  if (layout.mode === "absolute") {
    return false;
  }

  if (layout.mode === "grid") {
    return reflowGridContainerChildren(document, parentId);
  }

  const contentBox = getContentBox(parent, layout);
  let cursorX = contentBox.x;
  let cursorY = contentBox.y;
  let changed = false;

  for (const childId of parent.children) {
    const child = document.nodes[childId];
    if (!child) {
      continue;
    }
    const minimumSize = getMinimumNodeSize(child);

    const nextWidth =
      layout.mode === "vstack" && layout.align === "stretch"
        ? Math.max(minimumSize.width, contentBox.width)
        : Math.max(minimumSize.width, child.width);
    const nextHeight =
      layout.mode === "hstack" && layout.align === "stretch"
        ? Math.max(minimumSize.height, contentBox.height)
        : Math.max(minimumSize.height, child.height);
    const nextX =
      layout.mode === "vstack"
        ? getCrossAxisPosition(contentBox.x, contentBox.width, nextWidth, layout.align)
        : cursorX;
    const nextY =
      layout.mode === "hstack"
        ? getCrossAxisPosition(contentBox.y, contentBox.height, nextHeight, layout.align)
        : cursorY;

    if (
      child.x !== nextX ||
      child.y !== nextY ||
      child.width !== nextWidth ||
      child.height !== nextHeight
    ) {
      document.nodes[childId] = {
        ...child,
        x: nextX,
        y: nextY,
        width: nextWidth,
        height: nextHeight,
      };
      changed = true;
    }

    if (layout.mode === "vstack") {
      cursorY += nextHeight + layout.gap;
    } else {
      cursorX += nextWidth + layout.gap;
    }

    if (isContainerNode(document.nodes[childId])) {
      changed = reflowContainerChildren(document, childId) || changed;
    }
  }

  return changed;
}

export function reflowLayoutChain(
  document: EditorDocument,
  startParentId: ParentId,
) {
  if (startParentId === "board") {
    return;
  }

  const chain: NodeId[] = [];
  let currentId: ParentId = startParentId;

  while (currentId !== "board") {
    const current = document.nodes[currentId];
    if (!current || !isContainerNode(current)) {
      break;
    }

    chain.unshift(currentId);
    currentId = current.parentId;
  }

  for (const parentId of chain) {
    reflowContainerChildren(document, parentId);
  }
}
