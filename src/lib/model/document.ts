export type NodeId = string;
export type ParentId = NodeId | "board";

export type NodeType =
  | "flowLane"
  | "screen"
  | "container"
  | "field"
  | "segmentedControl"
  | "badge"
  | "banner"
  | "text"
  | "button"
  | "checkbox"
  | "unsupported";

export type TextAlign = "left" | "center" | "right";
export type VerticalAlign = "top" | "middle" | "bottom";
export type LayoutMode = "absolute" | "vstack" | "hstack" | "grid";
export type LayoutAlign = "start" | "center" | "end" | "stretch";

export type LayoutConfig = {
  mode: LayoutMode;
  gap: number;
  padding: number;
  align: LayoutAlign;
  gridColumns?: number;
  gridRows?: number;
};

export type TextStyle = {
  fontFamily: string;
  fontSize: number;
  fontWeight: 400 | 700;
  lineHeight: number;
  color: string;
  align: TextAlign;
  verticalAlign?: VerticalAlign;
};

export type BaseNode = {
  id: NodeId;
  type: NodeType;
  name?: string;
  parentId: ParentId;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  visible: boolean;
  locked: boolean;
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  borderRadius?: number;
  opacity?: number;
  metadata?: Record<string, unknown>;
};

export type FlowLaneNode = BaseNode & {
  type: "flowLane";
  title: string;
  startSize: number;
  layout?: LayoutConfig;
  children: NodeId[];
};

export type ScreenNode = BaseNode & {
  type: "screen";
  title: string;
  subtitle?: string;
  clipChildren: boolean;
  layout?: LayoutConfig;
  children: NodeId[];
  preset?: string;
};

export type ContainerNode = BaseNode & {
  type: "container";
  title?: string;
  text?: string;
  padding: number;
  layout?: LayoutConfig;
  children: NodeId[];
};

export type TextNode = BaseNode & {
  type: "text";
  text: string;
  textStyle: TextStyle;
};

export type FieldNode = BaseNode & {
  type: "field";
  label: string;
  value: string;
  labelStyle: TextStyle;
  valueStyle: TextStyle;
};

export type SegmentedControlNode = BaseNode & {
  type: "segmentedControl";
  label?: string;
  items: string[];
  activeIndex: number;
  itemHeight: number;
  activeFill: string;
  activeStroke: string;
  inactiveFill: string;
  inactiveStroke: string;
  textStyle: TextStyle;
};

export type BadgeVariant = "info" | "success" | "code" | "status";

export type BadgeNode = BaseNode & {
  type: "badge";
  text: string;
  variant: BadgeVariant;
  textStyle: TextStyle;
};

export type BannerVariant = "info" | "warning" | "success";

export type BannerNode = BaseNode & {
  type: "banner";
  title: string;
  body: string;
  variant: BannerVariant;
  titleStyle: TextStyle;
  bodyStyle: TextStyle;
};

export type ButtonVariant =
  | "primarySuccess"
  | "secondaryOutline"
  | "accentOutline";

export type ButtonNode = BaseNode & {
  type: "button";
  text: string;
  variant: ButtonVariant;
  textStyle: TextStyle;
};

export type CheckboxNode = BaseNode & {
  type: "checkbox";
  text: string;
  checked: boolean;
  boxSize: number;
  textStyle: TextStyle;
};

export type UnsupportedNode = BaseNode & {
  type: "unsupported";
  rawValue?: string;
  originalStyle?: Record<string, string>;
  originalXml?: string;
};

export type EditorNode =
  | FlowLaneNode
  | ScreenNode
  | ContainerNode
  | FieldNode
  | SegmentedControlNode
  | BadgeNode
  | BannerNode
  | TextNode
  | ButtonNode
  | CheckboxNode
  | UnsupportedNode;

export type Point = {
  x: number;
  y: number;
};

export type EditorEdge = {
  id: string;
  type: "edge";
  parentId: ParentId;
  sourceId?: string | null;
  targetId?: string | null;
  sourcePoint?: Point;
  targetPoint?: Point;
  waypoints?: Point[];
  orthogonal: boolean;
  startArrow?: "none" | "classic";
  endArrow?: "none" | "classic";
  strokeColor: string;
  strokeWidth: number;
  metadata?: Record<string, unknown>;
};

export type BoardModel = {
  zoom: number;
  panX: number;
  panY: number;
  gridSize: number;
  showGrid: boolean;
  snapToGrid: boolean;
  guides: boolean;
};

export type DocumentMeta = {
  source: "new" | "imported-drawio";
  originalFileName?: string;
  importedAt?: string;
  warnings: string[];
  unsupportedCount: number;
  unsupportedTokens: string[];
};

export type EditorDocument = {
  id: string;
  name: string;
  version: string;
  idCounter: number;
  board: BoardModel;
  nodes: Record<NodeId, EditorNode>;
  rootIds: NodeId[];
  edges: Record<string, EditorEdge>;
  edgeIds: string[];
  meta: DocumentMeta;
};

export type ContainerNodeType = FlowLaneNode | ScreenNode | ContainerNode;

export type PaletteItemType =
  | "flowLane"
  | "screen"
  | "container"
  | "field"
  | "segmentedControl"
  | "badge"
  | "banner"
  | "text"
  | "button"
  | "checkbox";
