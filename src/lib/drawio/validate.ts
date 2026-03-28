import { getDescendantIds, getParentType, isContainerNode } from "@/lib/model/node-utils";
import type { EditorDocument } from "@/lib/model/document";

export type ValidationReport = {
  errors: string[];
  warnings: string[];
};

const COLOR_REGEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

function validateLayoutConfig(
  nodeId: string,
  layout:
    | {
        mode: string;
        gap: number;
        padding: number;
        align: string;
        gridColumns?: number;
        gridRows?: number;
      }
    | undefined,
  errors: string[],
  warnings: string[],
) {
  if (!layout) {
    return;
  }

  if (layout.gap < 0) {
    errors.push(`Node ${nodeId} has negative layout gap.`);
  }

  if (layout.padding < 0) {
    errors.push(`Node ${nodeId} has negative layout padding.`);
  }

  if (layout.mode === "grid") {
    if (layout.gridColumns != null && (!Number.isInteger(layout.gridColumns) || layout.gridColumns <= 0)) {
      errors.push(`Node ${nodeId} has invalid grid column count.`);
    }

    if (layout.gridRows != null && (!Number.isInteger(layout.gridRows) || layout.gridRows <= 0)) {
      warnings.push(`Node ${nodeId} has invalid grid row count.`);
    }
  }
}

export function validateDocument(document: EditorDocument): ValidationReport {
  const errors: string[] = [];
  const warnings: string[] = [];
  const referencedRootIds = new Set(document.rootIds);

  for (const node of Object.values(document.nodes)) {
    if (node.parentId !== "board" && !document.nodes[node.parentId]) {
      errors.push(`Node ${node.id} references missing parent ${node.parentId}.`);
    }

    if (node.width <= 0 || node.height <= 0) {
      errors.push(`Node ${node.id} has non-positive size.`);
    }

    if (node.fillColor && !COLOR_REGEX.test(node.fillColor)) {
      warnings.push(`Node ${node.id} has unexpected fill color ${node.fillColor}.`);
    }

    if (node.strokeColor && !COLOR_REGEX.test(node.strokeColor)) {
      warnings.push(`Node ${node.id} has unexpected stroke color ${node.strokeColor}.`);
    }

    validateLayoutConfig(node.id, "layout" in node ? node.layout : undefined, errors, warnings);

    if (isContainerNode(node) && getDescendantIds(document, node.id).includes(node.id)) {
      errors.push(`Node ${node.id} participates in a cycle.`);
    }

    if (node.parentId === "board" && !referencedRootIds.has(node.id)) {
      errors.push(`Root node ${node.id} is missing from rootIds.`);
    }

    if (node.parentId !== "board") {
      const parent = document.nodes[node.parentId];
      if (!isContainerNode(parent)) {
        errors.push(`Node ${node.id} points to non-container parent ${node.parentId}.`);
      } else if (!parent.children.includes(node.id)) {
        errors.push(`Node ${node.id} is missing from parent ${node.parentId} children.`);
      }
    }

    if (isContainerNode(node)) {
      for (const childId of node.children) {
        const child = document.nodes[childId];
        if (!child) {
          errors.push(`Container ${node.id} references missing child ${childId}.`);
          continue;
        }

        if (child.parentId !== node.id) {
          errors.push(`Container ${node.id} references child ${childId} with parent ${child.parentId}.`);
        }
      }
    }
  }

  for (const rootId of document.rootIds) {
    const node = document.nodes[rootId];
    if (!node) {
      errors.push(`rootIds references missing node ${rootId}.`);
      continue;
    }

    if (node.parentId !== "board") {
      errors.push(`rootIds contains non-root node ${rootId} with parent ${node.parentId}.`);
    }
  }

  for (const edge of Object.values(document.edges)) {
    if (edge.sourceId && !document.nodes[edge.sourceId]) {
      warnings.push(`Edge ${edge.id} references missing source ${edge.sourceId}.`);
    }

    if (edge.targetId && !document.nodes[edge.targetId]) {
      warnings.push(`Edge ${edge.id} references missing target ${edge.targetId}.`);
    }

    const edgeParentType = getParentType(document, edge.parentId);
    if (
      edge.parentId !== "board" &&
      edgeParentType !== "flowLane" &&
      edgeParentType !== "screen"
    ) {
      errors.push(
        `Edge ${edge.id} has invalid parent ${edge.parentId}; expected board, flow lane, or screen.`,
      );
    }
  }

  return { errors, warnings };
}
