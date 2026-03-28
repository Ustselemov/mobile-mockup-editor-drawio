import { getContentBounds } from "@/lib/geometry/coords";
import { reflowLayoutChain } from "@/lib/layout/reflow";
import { createEmptyDocument } from "@/lib/model/defaults";
import { appendNode, createNodeFromPalette } from "@/lib/model/node-utils";
import type {
  BadgeNode,
  ButtonNode,
  CheckboxNode,
  ContainerNode,
  EditorDocument,
  EditorNode,
  FieldNode,
  LayoutAlign,
  LayoutMode,
  ScreenNode,
  SegmentedControlNode,
  TextNode,
} from "@/lib/model/document";
import { parseDsl } from "@/lib/dsl/parser";
import type { DslAstNode, DslCompileResult, DslDiagnostic, DslValue } from "@/lib/dsl/types";

type CompileContext = {
  diagnostics: DslDiagnostic[];
};

const SCREEN_PRESETS: Record<string, { width: number; height: number }> = {
  iphone15: { width: 393, height: 852 },
  iphone14: { width: 390, height: 844 },
  iphoneSE: { width: 375, height: 667 },
  androidLarge: { width: 412, height: 915 },
};

function nextId(document: EditorDocument, prefix: string): string {
  const id = `${prefix}-${document.idCounter}`;
  document.idCounter += 1;
  return id;
}

function addDiagnostic(
  diagnostics: DslDiagnostic[],
  severity: DslDiagnostic["severity"],
  code: string,
  message: string,
  node: DslAstNode,
) {
  diagnostics.push({
    severity,
    code,
    message,
    line: node.line,
    column: node.column,
  });
}

function asString(value: DslValue | undefined): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function asNumber(value: DslValue | undefined): number | undefined {
  return typeof value === "number" ? value : undefined;
}

function asBoolean(value: DslValue | undefined): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

function asStringArray(value: DslValue | undefined): string[] | undefined {
  return Array.isArray(value) ? value.map(String) : undefined;
}

function resolveButtonVariant(value: string | undefined): ButtonNode["variant"] {
  if (value === "secondary" || value === "secondaryOutline") {
    return "secondaryOutline";
  }

  if (value === "accent" || value === "accentOutline") {
    return "accentOutline";
  }

  return "primarySuccess";
}

function resolveLayoutMode(value: string | undefined): LayoutMode | undefined {
  if (value === "absolute" || value === "vstack" || value === "hstack") {
    return value;
  }

  return undefined;
}

function resolveLayoutAlign(value: string | undefined): LayoutAlign | undefined {
  if (value === "start" || value === "center" || value === "end" || value === "stretch") {
    return value;
  }

  return undefined;
}

function applyCommonNodeStyles(node: EditorNode, props: Record<string, DslValue>): void {
  const fillColor = asString(props.fillColor ?? props.fill);
  const strokeColor = asString(props.strokeColor ?? props.stroke);
  const borderRadius = asNumber(props.borderRadius ?? props.radius);
  const strokeWidth = asNumber(props.strokeWidth);
  const opacity = asNumber(props.opacity);

  if (fillColor) {
    node.fillColor = fillColor;
  }
  if (strokeColor) {
    node.strokeColor = strokeColor;
  }
  if (borderRadius !== undefined) {
    node.borderRadius = borderRadius;
  }
  if (strokeWidth !== undefined) {
    node.strokeWidth = strokeWidth;
  }
  if (opacity !== undefined) {
    node.opacity = opacity;
  }
  if (typeof props.name === "string") {
    node.name = props.name;
  }
}

function applyLayoutConfig(
  node: ScreenNode | ContainerNode,
  props: Record<string, DslValue>,
  hasChildren: boolean,
) {
  const mode = resolveLayoutMode(asString(props.layout));
  const align = resolveLayoutAlign(asString(props.align));
  const gap = asNumber(props.gap);
  const padding = asNumber(props.padding);

  node.layout = {
    mode: mode ?? (hasChildren ? "vstack" : "absolute"),
    gap: gap ?? (hasChildren ? 12 : 16),
    padding:
      padding ?? (node.type === "screen" ? 20 : hasChildren ? 28 : 16),
    align: align ?? "start",
  };
}

function applyContainerSizing(document: EditorDocument, node: ContainerNode) {
  const bounds = getContentBounds(document, node);
  const padding = node.layout?.padding ?? 16;
  node.width = Math.max(node.width, bounds.width + padding * 2);
  node.height = Math.max(node.height, bounds.height + padding * 2);
}

function applyScreenSizing(document: EditorDocument, node: ScreenNode, hasPreset: boolean) {
  if (hasPreset) {
    return;
  }

  const bounds = getContentBounds(document, node);
  const padding = node.layout?.padding ?? 20;
  node.width = Math.max(node.width, bounds.width + padding * 2);
  node.height = Math.max(node.height, bounds.height + padding * 2);
}

function maybeWarnOverflow(
  document: EditorDocument,
  node: ScreenNode,
  nodeAst: DslAstNode,
  diagnostics: DslDiagnostic[],
) {
  const bounds = getContentBounds(document, node);
  if (bounds.width > node.width || bounds.height > node.height) {
    addDiagnostic(
      diagnostics,
      "warning",
      "screen-overflow",
      `Screen "${node.title}" content exceeds the configured preset bounds.`,
      nodeAst,
    );
  }
}

function createUnsupportedNode(
  parentId: string | "board",
  id: string,
  rawValue: string,
): EditorNode {
  return {
    id,
    type: "unsupported",
    parentId,
    x: 0,
    y: 0,
    width: 260,
    height: 64,
    zIndex: 0,
    visible: true,
    locked: false,
    opacity: 1,
    rawValue,
    originalXml: undefined,
  };
}

function compileLeafNode(
  document: EditorDocument,
  parentId: string | "board",
  node: DslAstNode,
  ctx: CompileContext,
) {
  const id = nextId(document, node.kind === "chatBubble" ? "unsupported" : node.kind);
  const position = { x: 0, y: 0 };
  let compiled: EditorNode | null = null;

  if (node.kind === "text") {
    const leaf = createNodeFromPalette("text", id, parentId, position) as TextNode;
    leaf.text = asString(node.properties.value ?? node.subject) ?? leaf.text;
    const textSize = asNumber(node.properties.fontSize);
    if (textSize !== undefined) {
      leaf.textStyle.fontSize = textSize;
    }
    compiled = leaf;
  } else if (node.kind === "button") {
    const leaf = createNodeFromPalette("button", id, parentId, position) as ButtonNode;
    leaf.text = asString(node.properties.text ?? node.subject) ?? leaf.text;
    leaf.variant = resolveButtonVariant(asString(node.properties.variant));
    compiled = leaf;
  } else if (node.kind === "field") {
    const leaf = createNodeFromPalette("field", id, parentId, position) as FieldNode;
    leaf.label = asString(node.properties.label ?? node.subject) ?? leaf.label;
    leaf.value = asString(node.properties.value) ?? leaf.value;
    compiled = leaf;
  } else if (node.kind === "badge") {
    const leaf = createNodeFromPalette("badge", id, parentId, position) as BadgeNode;
    leaf.text = asString(node.properties.text ?? node.subject) ?? leaf.text;
    const variant = asString(node.properties.variant);
    if (variant === "success" || variant === "code" || variant === "status" || variant === "info") {
      leaf.variant = variant;
    }
    compiled = leaf;
  } else if (node.kind === "checkbox") {
    const leaf = createNodeFromPalette("checkbox", id, parentId, position) as CheckboxNode;
    leaf.text = asString(node.properties.text ?? node.subject) ?? leaf.text;
    const checked = asBoolean(node.properties.checked);
    if (checked !== undefined) {
      leaf.checked = checked;
    }
    compiled = leaf;
  } else if (node.kind === "segmentedControl") {
    const leaf = createNodeFromPalette("segmentedControl", id, parentId, position) as SegmentedControlNode;
    leaf.label = asString(node.properties.label ?? node.subject);
    const items = asStringArray(node.properties.items);
    if (items && items.length > 0) {
      leaf.items = items;
    }
    const activeIndex = asNumber(node.properties.activeIndex);
    if (activeIndex !== undefined) {
      leaf.activeIndex = Math.max(0, Math.min((items?.length ?? 1) - 1, Math.floor(activeIndex)));
    }
    compiled = leaf;
  } else if (node.kind === "chatBubble") {
    compiled = createUnsupportedNode(
      parentId,
      id,
      asString(node.properties.text ?? node.subject) ?? "chatBubble",
    );
    addDiagnostic(
      ctx.diagnostics,
      "warning",
      "unsupported-directive",
      'Directive "chatBubble" is not part of the current DSL v1 slice and was converted to an unsupported placeholder.',
      node,
    );
  }

  if (!compiled) {
    return null;
  }

  applyCommonNodeStyles(compiled, node.properties);
  const width = asNumber(node.properties.width);
  const height = asNumber(node.properties.height);
  const x = asNumber(node.properties.x);
  const y = asNumber(node.properties.y);

  if (width !== undefined) {
    compiled.width = width;
  }
  if (height !== undefined) {
    compiled.height = height;
  }
  if (x !== undefined) {
    compiled.x = x;
  }
  if (y !== undefined) {
    compiled.y = y;
  }

  appendNode(document, compiled);
  reflowLayoutChain(document, compiled.parentId);
  return compiled;
}

function compileAstNode(
  document: EditorDocument,
  parentId: string | "board",
  node: DslAstNode,
  ctx: CompileContext,
) {
  if (node.kind === "project") {
    for (const child of node.children) {
      compileAstNode(document, parentId, child, ctx);
    }
    return;
  }

  if (node.kind === "screen" || node.kind === "section" || node.kind === "container") {
    const paletteType = node.kind === "section" ? "container" : node.kind;
    const id = nextId(document, paletteType);
    const created = createNodeFromPalette(paletteType, id, parentId, { x: 0, y: 0 }) as
      | ScreenNode
      | ContainerNode;

    const title = asString(node.properties.title ?? node.subject);
    if (created.type === "screen") {
      created.title = title ?? created.title;
      const preset = asString(node.properties.preset);
      const presetSize = preset ? SCREEN_PRESETS[preset] : undefined;
      if (presetSize) {
        created.width = presetSize.width;
        created.height = presetSize.height;
        created.preset = preset;
      } else if (preset) {
        addDiagnostic(
          ctx.diagnostics,
          "warning",
          "unknown-preset",
          `Unknown screen preset "${preset}". Using the default screen size.`,
          node,
        );
      }
      applyLayoutConfig(created, node.properties, node.children.length > 0);
    } else {
      created.title = title;
      const text = asString(node.properties.text);
      if (text !== undefined) {
        created.text = text;
      }
      const padding = asNumber(node.properties.padding);
      if (padding !== undefined) {
        created.padding = padding;
      }
      applyLayoutConfig(created, node.properties, node.children.length > 0);
    }

    applyCommonNodeStyles(created, node.properties);
    const width = asNumber(node.properties.width);
    const height = asNumber(node.properties.height);
    const x = asNumber(node.properties.x);
    const y = asNumber(node.properties.y);

    if (width !== undefined) {
      created.width = width;
    }
    if (height !== undefined) {
      created.height = height;
    }
    if (x !== undefined) {
      created.x = x;
    }
    if (y !== undefined) {
      created.y = y;
    }

    appendNode(document, created);
    reflowLayoutChain(document, created.parentId);

    for (const child of node.children) {
      compileAstNode(document, created.id, child, ctx);
    }

    if (created.type === "container") {
      applyContainerSizing(document, created);
      reflowLayoutChain(document, created.parentId);
      reflowLayoutChain(document, created.id);
      return;
    }

    applyScreenSizing(document, created, Boolean(asString(node.properties.preset)));
    maybeWarnOverflow(document, created, node, ctx.diagnostics);
    reflowLayoutChain(document, created.parentId);
    reflowLayoutChain(document, created.id);
    return;
  }

  compileLeafNode(document, parentId, node, ctx);
}

export function compileDsl(source: string): DslCompileResult {
  const parsed = parseDsl(source);
  if (!parsed.ast) {
    return {
      document: null,
      ast: null,
      diagnostics: parsed.diagnostics,
    };
  }

  const document = createEmptyDocument(parsed.ast.projectName ?? "Untitled DSL project");
  const ctx: CompileContext = { diagnostics: [...parsed.diagnostics] };

  for (const root of parsed.ast.roots) {
    compileAstNode(document, "board", root, ctx);
  }

  document.meta.warnings = ctx.diagnostics
    .filter((diagnostic) => diagnostic.severity === "warning")
    .map((diagnostic) => diagnostic.message);
  document.meta.unsupportedTokens = ctx.diagnostics
    .filter((diagnostic) => diagnostic.code === "unsupported-directive")
    .map((diagnostic) => diagnostic.message);
  document.meta.unsupportedCount = document.meta.unsupportedTokens.length;

  return {
    document,
    ast: parsed.ast,
    diagnostics: ctx.diagnostics,
  };
}
