import { z } from "zod";

const textStyleSchema = z.object({
  fontFamily: z.string(),
  fontSize: z.number(),
  fontWeight: z.union([z.literal(400), z.literal(700)]),
  lineHeight: z.number(),
  color: z.string(),
  align: z.union([z.literal("left"), z.literal("center"), z.literal("right")]),
  verticalAlign: z
    .union([z.literal("top"), z.literal("middle"), z.literal("bottom")])
    .optional(),
});

const baseNodeSchema = z.object({
  id: z.string(),
  type: z.string(),
  name: z.string().optional(),
  parentId: z.union([z.string(), z.literal("board")]),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  zIndex: z.number(),
  visible: z.boolean(),
  locked: z.boolean(),
  fillColor: z.string().optional(),
  strokeColor: z.string().optional(),
  strokeWidth: z.number().optional(),
  borderRadius: z.number().optional(),
  opacity: z.number().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

const layoutSchema = z.object({
  mode: z.union([
    z.literal("absolute"),
    z.literal("vstack"),
    z.literal("hstack"),
    z.literal("grid"),
  ]),
  gap: z.number(),
  padding: z.number(),
  align: z.union([
    z.literal("start"),
    z.literal("center"),
    z.literal("end"),
    z.literal("stretch"),
  ]),
  gridColumns: z.number().int().positive().optional(),
  gridRows: z.number().int().positive().optional(),
});

export const editorNodeSchema = z.discriminatedUnion("type", [
  baseNodeSchema.extend({
    type: z.literal("flowLane"),
    title: z.string(),
    startSize: z.number(),
    layout: layoutSchema.optional(),
    children: z.array(z.string()),
  }),
  baseNodeSchema.extend({
    type: z.literal("screen"),
    title: z.string(),
    subtitle: z.string().optional(),
    clipChildren: z.boolean(),
    layout: layoutSchema.optional(),
    children: z.array(z.string()),
    preset: z.string().optional(),
  }),
  baseNodeSchema.extend({
    type: z.literal("container"),
    title: z.string().optional(),
    text: z.string().optional(),
    padding: z.number(),
    layout: layoutSchema.optional(),
    children: z.array(z.string()),
  }),
  baseNodeSchema.extend({
    type: z.literal("field"),
    label: z.string(),
    value: z.string(),
    labelStyle: textStyleSchema,
    valueStyle: textStyleSchema,
  }),
  baseNodeSchema.extend({
    type: z.literal("segmentedControl"),
    label: z.string().optional(),
    items: z.array(z.string()),
    activeIndex: z.number(),
    itemHeight: z.number(),
    activeFill: z.string(),
    activeStroke: z.string(),
    inactiveFill: z.string(),
    inactiveStroke: z.string(),
    textStyle: textStyleSchema,
  }),
  baseNodeSchema.extend({
    type: z.literal("badge"),
    text: z.string(),
    variant: z.union([
      z.literal("info"),
      z.literal("success"),
      z.literal("code"),
      z.literal("status"),
    ]),
    textStyle: textStyleSchema,
  }),
  baseNodeSchema.extend({
    type: z.literal("banner"),
    title: z.string(),
    body: z.string(),
    variant: z.union([
      z.literal("info"),
      z.literal("warning"),
      z.literal("success"),
    ]),
    titleStyle: textStyleSchema,
    bodyStyle: textStyleSchema,
  }),
  baseNodeSchema.extend({
    type: z.literal("text"),
    text: z.string(),
    textStyle: textStyleSchema,
  }),
  baseNodeSchema.extend({
    type: z.literal("button"),
    text: z.string(),
    variant: z.union([
      z.literal("primarySuccess"),
      z.literal("secondaryOutline"),
      z.literal("accentOutline"),
    ]),
    textStyle: textStyleSchema,
  }),
  baseNodeSchema.extend({
    type: z.literal("checkbox"),
    text: z.string(),
    checked: z.boolean(),
    boxSize: z.number(),
    textStyle: textStyleSchema,
  }),
  baseNodeSchema.extend({
    type: z.literal("unsupported"),
    rawValue: z.string().optional(),
    originalStyle: z.record(z.string(), z.string()).optional(),
    originalXml: z.string().optional(),
  }),
]);

export const editorEdgeSchema = z.object({
  id: z.string(),
  type: z.literal("edge"),
  parentId: z.union([z.string(), z.literal("board")]),
  sourceId: z.string().nullable().optional(),
  targetId: z.string().nullable().optional(),
  sourcePoint: z.object({ x: z.number(), y: z.number() }).optional(),
  targetPoint: z.object({ x: z.number(), y: z.number() }).optional(),
  waypoints: z.array(z.object({ x: z.number(), y: z.number() })).optional(),
  orthogonal: z.boolean(),
  startArrow: z.union([z.literal("none"), z.literal("classic")]).optional(),
  endArrow: z.union([z.literal("none"), z.literal("classic")]).optional(),
  strokeColor: z.string(),
  strokeWidth: z.number(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const editorDocumentSchema = z.object({
  id: z.string(),
  name: z.string(),
  version: z.string(),
  idCounter: z.number(),
  board: z.object({
    zoom: z.number(),
    panX: z.number(),
    panY: z.number(),
    gridSize: z.number(),
    showGrid: z.boolean().default(true),
    snapToGrid: z.boolean(),
    guides: z.boolean(),
  }),
  nodes: z.record(z.string(), editorNodeSchema),
  rootIds: z.array(z.string()),
  edges: z.record(z.string(), editorEdgeSchema),
  edgeIds: z.array(z.string()),
  meta: z.object({
    source: z.union([z.literal("new"), z.literal("imported-drawio")]),
    originalFileName: z.string().optional(),
    importedAt: z.string().optional(),
    warnings: z.array(z.string()),
    unsupportedCount: z.number(),
    unsupportedTokens: z.array(z.string()),
  }),
});
