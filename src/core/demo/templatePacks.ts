import {
  badgeVariantStyles,
  bannerVariantStyles,
  buttonVariantStyles,
  textStyles,
} from "@/lib/model/defaults";
import { DEFAULT_LAYOUT_CONFIG } from "@/lib/layout/config";
import type {
  EditorDocument,
  EditorNode,
  LayoutConfig,
  NodeId,
  PaletteItemType,
  ParentId,
} from "@/lib/model/document";
import type { ScreenTemplateId } from "@/core/demo/screenTemplates";
import { isContainerNode } from "@/lib/model/node-utils";

export type TemplateScope = "screen" | "section";

export type TemplateNodeSpec = {
  type: PaletteItemType;
  position: { x: number; y: number };
  patch?: Record<string, unknown>;
  children?: TemplateNodeSpec[];
};

export type TemplateDefinition = {
  id: string;
  scope: TemplateScope;
  label: string;
  description: string;
  screenTemplateId?: ScreenTemplateId;
  root?: TemplateNodeSpec;
};

export type TemplatePack = {
  id: string;
  label: string;
  description: string;
  accent: string;
  templates: TemplateDefinition[];
};

type TemplateInsertContext = {
  document: EditorDocument;
  selection: NodeId[];
  addNode: (
    type: PaletteItemType,
    parentId: ParentId,
    position: { x: number; y: number },
  ) => NodeId | null;
  updateNode: (nodeId: NodeId, patch: Partial<EditorNode>) => void;
  setSelection: (nodeIds: NodeId[]) => void;
  addTemplateScreen: (templateId: ScreenTemplateId) => NodeId | null;
};

function makeSectionLayout(): LayoutConfig {
  return {
    ...DEFAULT_LAYOUT_CONFIG,
    mode: "vstack",
    gap: 12,
    padding: 16,
    align: "stretch",
  };
}

function makeButtonPatch(
  text: string,
  variant: "primarySuccess" | "secondaryOutline" | "accentOutline" = "primarySuccess",
) {
  const style = buttonVariantStyles[variant];
  return {
    text,
    variant,
    fillColor: style.fillColor,
    strokeColor: style.strokeColor,
    textStyle: {
      ...textStyles.cta,
      color: style.textColor,
    },
  };
}

function makeBadgePatch(
  text: string,
  variant: keyof typeof badgeVariantStyles = "info",
) {
  const style = badgeVariantStyles[variant];
  return {
    text,
    variant,
    fillColor: style.fillColor,
    strokeColor: style.strokeColor,
    textStyle: {
      ...textStyles.bodyStrong,
      fontSize: 10,
      align: "center",
      color: style.textColor,
    },
  };
}

function makeBannerPatch(
  title: string,
  body: string,
  variant: keyof typeof bannerVariantStyles = "info",
) {
  const style = bannerVariantStyles[variant];
  return {
    title,
    body,
    variant,
    fillColor: style.fillColor,
    strokeColor: style.strokeColor,
  };
}

function makeSectionRoot(
  width: number,
  height: number,
  title: string,
  extraPatch: Record<string, unknown> = {},
  children: TemplateNodeSpec[] = [],
): TemplateNodeSpec {
  return {
    type: "container",
    position: { x: 20, y: 20 },
    patch: {
      width,
      height,
      title,
      layout: makeSectionLayout(),
      ...extraPatch,
    },
    children,
  };
}

function resolveTemplateTargetParentId(
  document: EditorDocument,
  selection: NodeId[],
): ParentId {
  const selectedNodeId = selection[0];
  if (!selectedNodeId) {
    return "board";
  }

  const selectedNode = document.nodes[selectedNodeId];
  if (!selectedNode) {
    return "board";
  }

  if (isContainerNode(selectedNode)) {
    return selectedNode.id;
  }

  const parentNode = selectedNode.parentId === "board" ? null : document.nodes[selectedNode.parentId];
  if (parentNode && isContainerNode(parentNode)) {
    return parentNode.id;
  }

  return "board";
}

function getTemplateRootPosition(
  document: EditorDocument,
  parentId: ParentId,
): { x: number; y: number } {
  if (parentId === "board") {
    return {
      x: 180 + document.rootIds.length * 28,
      y: 120 + document.rootIds.length * 24,
    };
  }

  const parent = document.nodes[parentId];
  if (!parent || !isContainerNode(parent)) {
    return { x: 20, y: 20 };
  }

  return {
    x: 20,
    y: 20 + parent.children.length * 24,
  };
}

function materializeNodeSpec(
  context: TemplateInsertContext,
  parentId: ParentId,
  spec: TemplateNodeSpec,
): NodeId | null {
  const createdId = context.addNode(spec.type, parentId, spec.position);
  if (!createdId) {
    return null;
  }

  if (spec.patch) {
    context.updateNode(createdId, spec.patch as Partial<EditorNode>);
  }

  for (const child of spec.children ?? []) {
    materializeNodeSpec(context, createdId, child);
  }

  return createdId;
}

export function insertTemplateDefinition(
  definition: TemplateDefinition,
  context: TemplateInsertContext,
): NodeId | null {
  if (definition.scope === "screen") {
    if (!definition.screenTemplateId) {
      return null;
    }

    return context.addTemplateScreen(definition.screenTemplateId);
  }

  if (!definition.root) {
    return null;
  }

  const parentId = resolveTemplateTargetParentId(context.document, context.selection);
  const rootPosition = getTemplateRootPosition(context.document, parentId);
  const rootSpec = {
    ...definition.root,
    position: rootPosition,
  };
  const createdRootId = materializeNodeSpec(context, parentId, rootSpec);
  if (createdRootId) {
    context.setSelection([createdRootId]);
  }

  return createdRootId;
}

export const templatePackItems: TemplatePack[] = [
  {
    id: "ecommerce",
    label: "E-commerce",
    description: "Product pages and order flows",
    accent: "#0f766e",
    templates: [
      {
        id: "ecommerce-product-page",
        scope: "screen",
        label: "Product page",
        description: "Hero, price, and add-to-cart screen",
        screenTemplateId: "productPage",
      },
      {
        id: "ecommerce-checkout-section",
        scope: "section",
        label: "Checkout summary",
        description: "Reusable order summary card",
        root: makeSectionRoot(320, 218, "Checkout summary", {}, [
          {
            type: "text",
            position: { x: 0, y: 0 },
            patch: {
              text: "Order details",
              textStyle: {
                ...textStyles.sectionTitle,
                fontSize: 12,
              },
            },
          },
          {
            type: "field",
            position: { x: 0, y: 0 },
            patch: {
              label: "Pickup point",
              value: "Main st. 24, Yekaterinburg",
              width: 288,
            },
          },
          {
            type: "badge",
            position: { x: 0, y: 0 },
            patch: makeBadgePatch("Verified", "success"),
          },
          {
            type: "button",
            position: { x: 0, y: 0 },
            patch: makeButtonPatch("Continue to payment"),
          },
        ]),
      },
    ],
  },
  {
    id: "fintech",
    label: "Fintech",
    description: "Wallets, transfers, and statements",
    accent: "#1d4ed8",
    templates: [
      {
        id: "fintech-wallet-home",
        scope: "screen",
        label: "Wallet home",
        description: "Balance and actions dashboard",
        screenTemplateId: "walletHome",
      },
      {
        id: "fintech-transfer-strip",
        scope: "section",
        label: "Transfer strip",
        description: "Compact money transfer block",
        root: makeSectionRoot(320, 200, "Transfer strip", {}, [
          {
            type: "text",
            position: { x: 0, y: 0 },
            patch: {
              text: "Quick transfer",
              textStyle: {
                ...textStyles.sectionTitle,
                fontSize: 12,
              },
            },
          },
          {
            type: "segmentedControl",
            position: { x: 0, y: 0 },
            patch: {
              items: ["Card", "Bank"],
              width: 288,
            },
          },
          {
            type: "field",
            position: { x: 0, y: 0 },
            patch: {
              label: "Amount",
              value: "5 000 RUB",
              width: 288,
            },
          },
          {
            type: "button",
            position: { x: 0, y: 0 },
            patch: makeButtonPatch("Send money", "accentOutline"),
          },
        ]),
      },
    ],
  },
  {
    id: "delivery",
    label: "Delivery",
    description: "Carts, addresses, and courier states",
    accent: "#ea580c",
    templates: [
      {
        id: "delivery-cart",
        scope: "screen",
        label: "Delivery cart",
        description: "Fast checkout with delivery context",
        screenTemplateId: "deliveryCart",
      },
      {
        id: "delivery-status-strip",
        scope: "section",
        label: "Delivery status",
        description: "Reusable address and ETA block",
        root: makeSectionRoot(320, 196, "Delivery status", {}, [
          {
            type: "badge",
            position: { x: 0, y: 0 },
            patch: makeBadgePatch("Courier nearby", "success"),
          },
          {
            type: "field",
            position: { x: 0, y: 0 },
            patch: {
              label: "Address",
              value: "Lenina ave. 18",
              width: 288,
            },
          },
          {
            type: "button",
            position: { x: 0, y: 0 },
            patch: makeButtonPatch("Track order"),
          },
        ]),
      },
    ],
  },
  {
    id: "healthcare",
    label: "Healthcare",
    description: "Appointments, services, and results",
    accent: "#0ea5a4",
    templates: [
      {
        id: "healthcare-appointment-hub",
        scope: "screen",
        label: "Appointment hub",
        description: "Booking screen with availability state",
        screenTemplateId: "clinicOverview",
      },
      {
        id: "healthcare-visit-banner",
        scope: "section",
        label: "Visit banner",
        description: "Shared advisory section for booking flows",
        root: makeSectionRoot(320, 192, "Visit banner", {}, [
          {
            type: "badge",
            position: { x: 0, y: 0 },
            patch: makeBadgePatch("Confirmed", "success"),
          },
          {
            type: "banner",
            position: { x: 0, y: 0 },
            patch: makeBannerPatch(
              "Bring your ID",
              "Bring your passport and insurance card to the clinic.",
              "warning",
            ),
          },
          {
            type: "field",
            position: { x: 0, y: 0 },
            patch: {
              label: "Doctor",
              value: "Dr. Smirnova",
              width: 288,
            },
          },
        ]),
      },
    ],
  },
  {
    id: "social",
    label: "Social",
    description: "Chats, feeds, and messaging states",
    accent: "#7c3aed",
    templates: [
      {
        id: "social-chat-thread",
        scope: "screen",
        label: "Chat thread",
        description: "Messaging screen with thread and composer",
        screenTemplateId: "chatThread",
      },
      {
        id: "social-composer-row",
        scope: "section",
        label: "Composer row",
        description: "Reusable message composer block",
        root: makeSectionRoot(320, 170, "Composer row", {}, [
          {
            type: "text",
            position: { x: 0, y: 0 },
            patch: {
              text: "Reply",
              textStyle: {
                ...textStyles.sectionTitle,
                fontSize: 12,
              },
            },
          },
          {
            type: "field",
            position: { x: 0, y: 0 },
            patch: {
              label: "Message",
              value: "Type a short reply",
              width: 288,
            },
          },
          {
            type: "button",
            position: { x: 0, y: 0 },
            patch: makeButtonPatch("Send", "secondaryOutline"),
          },
        ]),
      },
    ],
  },
  {
    id: "media",
    label: "Media",
    description: "Players, queues, and libraries",
    accent: "#2563eb",
    templates: [
      {
        id: "media-player",
        scope: "screen",
        label: "Media player",
        description: "Playback view with queue access",
        screenTemplateId: "mediaPlayer",
      },
      {
        id: "media-episode-strip",
        scope: "section",
        label: "Episode strip",
        description: "Reusable now-playing summary section",
        root: makeSectionRoot(320, 188, "Episode strip", {}, [
          {
            type: "badge",
            position: { x: 0, y: 0 },
            patch: makeBadgePatch("Playing", "info"),
          },
          {
            type: "banner",
            position: { x: 0, y: 0 },
            patch: makeBannerPatch(
              "Lo-fi evening mix",
              "A focused playlist for deep work and reading.",
              "info",
            ),
          },
          {
            type: "button",
            position: { x: 0, y: 0 },
            patch: makeButtonPatch("View queue", "secondaryOutline"),
          },
        ]),
      },
    ],
  },
  {
    id: "travel",
    label: "Travel",
    description: "Search, fares, and trip booking",
    accent: "#0891b2",
    templates: [
      {
        id: "travel-booking",
        scope: "screen",
        label: "Travel booking",
        description: "Booking step with fare context",
        screenTemplateId: "travelBooking",
      },
      {
        id: "travel-fare-summary",
        scope: "section",
        label: "Fare summary",
        description: "Reusable travel fare block",
        root: makeSectionRoot(320, 208, "Fare summary", {}, [
          {
            type: "badge",
            position: { x: 0, y: 0 },
            patch: makeBadgePatch("Refundable", "status"),
          },
          {
            type: "field",
            position: { x: 0, y: 0 },
            patch: {
              label: "Destination",
              value: "Istanbul",
              width: 288,
            },
          },
          {
            type: "button",
            position: { x: 0, y: 0 },
            patch: makeButtonPatch("Choose seats"),
          },
        ]),
      },
    ],
  },
  {
    id: "productivity",
    label: "Productivity",
    description: "Tasks, dashboards, and planning",
    accent: "#f59e0b",
    templates: [
      {
        id: "productivity-task-overview",
        scope: "screen",
        label: "Task overview",
        description: "Sprint board with task state",
        screenTemplateId: "taskOverview",
      },
      {
        id: "productivity-stats-strip",
        scope: "section",
        label: "Stats strip",
        description: "Compact productivity metrics block",
        root: makeSectionRoot(320, 182, "Stats strip", {}, [
          {
            type: "badge",
            position: { x: 0, y: 0 },
            patch: makeBadgePatch("3 overdue", "status"),
          },
          {
            type: "banner",
            position: { x: 0, y: 0 },
            patch: makeBannerPatch(
              "Weekly focus",
              "Keep the sprint to three active priorities.",
              "info",
            ),
          },
          {
            type: "button",
            position: { x: 0, y: 0 },
            patch: makeButtonPatch("Open board"),
          },
        ]),
      },
    ],
  },
  {
    id: "education",
    label: "Education",
    description: "Lessons, progress, and study actions",
    accent: "#65a30d",
    templates: [
      {
        id: "education-lesson",
        scope: "screen",
        label: "Lesson screen",
        description: "Lesson shell with progress context",
        screenTemplateId: "educationLesson",
      },
      {
        id: "education-progress-card",
        scope: "section",
        label: "Progress card",
        description: "Reusable lesson completion block",
        root: makeSectionRoot(320, 204, "Progress card", {}, [
          {
            type: "badge",
            position: { x: 0, y: 0 },
            patch: makeBadgePatch("65% done", "success"),
          },
          {
            type: "banner",
            position: { x: 0, y: 0 },
            patch: makeBannerPatch(
              "Keep going",
              "Finish the recap and continue to the knowledge check.",
              "success",
            ),
          },
          {
            type: "checkbox",
            position: { x: 0, y: 0 },
            patch: {
              text: "Mark recap as reviewed",
            },
          },
        ]),
      },
    ],
  },
  {
    id: "services",
    label: "Services",
    description: "On-demand booking and availability",
    accent: "#dc2626",
    templates: [
      {
        id: "services-booking",
        scope: "screen",
        label: "Service booking",
        description: "Booking screen for household or local services",
        screenTemplateId: "serviceBooking",
      },
      {
        id: "services-availability-block",
        scope: "section",
        label: "Availability block",
        description: "Reusable service availability section",
        root: makeSectionRoot(320, 216, "Availability block", {}, [
          {
            type: "segmentedControl",
            position: { x: 0, y: 0 },
            patch: {
              items: ["Morning", "Evening"],
              width: 288,
            },
          },
          {
            type: "field",
            position: { x: 0, y: 0 },
            patch: {
              label: "Address",
              value: "Tatischeva st. 88",
              width: 288,
            },
          },
          {
            type: "button",
            position: { x: 0, y: 0 },
            patch: makeButtonPatch("Reserve slot", "accentOutline"),
          },
        ]),
      },
    ],
  },
];

export function getTemplateInsertionTargetLabel(
  document: EditorDocument,
  selection: NodeId[],
): string {
  const parentId = resolveTemplateTargetParentId(document, selection);
  if (parentId === "board") {
    return "Board";
  }

  const node = document.nodes[parentId];
  if (!node) {
    return "Board";
  }

  const title =
    "title" in node
      ? node.title
      : "label" in node
        ? node.label
        : "text" in node
          ? node.text
          : node.name ?? node.id;

  return `${node.type}: ${title}`;
}
