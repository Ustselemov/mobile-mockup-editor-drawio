import { appendNode, createNodeFromPalette } from "@/lib/model/node-utils";
import type {
  BadgeNode,
  BannerNode,
  ButtonNode,
  CheckboxNode,
  ContainerNode,
  EditorDocument,
  FieldNode,
  ScreenNode,
  SegmentedControlNode,
  TextNode,
} from "@/lib/model/document";

export type ScreenTemplateId =
  | "checkout"
  | "appointment"
  | "confirmation"
  | "productPage"
  | "walletHome"
  | "deliveryCart"
  | "clinicOverview"
  | "chatThread"
  | "mediaPlayer"
  | "travelBooking"
  | "taskOverview"
  | "educationLesson"
  | "serviceBooking";

type Position = {
  x: number;
  y: number;
};

function nextId(document: EditorDocument, prefix: string): string {
  const id = `${prefix}-${document.idCounter}`;
  document.idCounter += 1;
  return id;
}

function createBaseScreen(
  document: EditorDocument,
  position: Position,
  title: string,
): ScreenNode {
  const screen = createNodeFromPalette(
    "screen",
    nextId(document, "screen"),
    "board",
    position,
  ) as ScreenNode;
  screen.title = title;
  appendNode(document, screen);
  return screen;
}

export function appendTemplateScreen(
  document: EditorDocument,
  templateId: ScreenTemplateId,
  position: Position,
): string {
  if (templateId === "checkout") {
    const screen = createBaseScreen(document, position, "Checkout template");

    const segmented = createNodeFromPalette(
      "segmentedControl",
      nextId(document, "segmented"),
      screen.id,
      { x: 20, y: 24 },
    ) as SegmentedControlNode;
    segmented.items = ["Clinic", "Delivery"];
    appendNode(document, segmented);

    const field = createNodeFromPalette(
      "field",
      nextId(document, "field"),
      screen.id,
      { x: 20, y: 72 },
    ) as FieldNode;
    field.label = "Pickup point";
    field.value = "Yekaterinburg, Main st. 24";
    field.width = 320;
    appendNode(document, field);

    const badge = createNodeFromPalette(
      "badge",
      nextId(document, "badge"),
      screen.id,
      { x: 20, y: 126 },
    ) as BadgeNode;
    badge.text = "Verified";
    badge.width = 84;
    appendNode(document, badge);

    const banner = createNodeFromPalette(
      "banner",
      nextId(document, "banner"),
      screen.id,
      { x: 20, y: 166 },
    ) as BannerNode;
    banner.title = "Delivery notice";
    banner.body = "Bring your ID to the clinic pickup desk.";
    banner.width = 320;
    appendNode(document, banner);

    const button = createNodeFromPalette(
      "button",
      nextId(document, "button"),
      screen.id,
      { x: 70, y: 670 },
    ) as ButtonNode;
    button.text = "Continue";
    button.width = 220;
    appendNode(document, button);

    return screen.id;
  }

  if (templateId === "appointment") {
    const screen = createBaseScreen(document, position, "Appointment template");

    const title = createNodeFromPalette(
      "text",
      nextId(document, "text"),
      screen.id,
      { x: 20, y: 24 },
    ) as TextNode;
    title.text = "Choose a visit type";
    title.textStyle.fontSize = 14;
    title.textStyle.fontWeight = 700;
    appendNode(document, title);

    const segmented = createNodeFromPalette(
      "segmentedControl",
      nextId(document, "segmented"),
      screen.id,
      { x: 20, y: 64 },
    ) as SegmentedControlNode;
    segmented.items = ["Online", "Clinic", "Home"];
    segmented.width = 320;
    appendNode(document, segmented);

    const field = createNodeFromPalette(
      "field",
      nextId(document, "field"),
      screen.id,
      { x: 20, y: 114 },
    ) as FieldNode;
    field.label = "Patient";
    field.value = "Elena Ivanova";
    field.width = 320;
    appendNode(document, field);

    const banner = createNodeFromPalette(
      "banner",
      nextId(document, "banner"),
      screen.id,
      { x: 20, y: 170 },
    ) as BannerNode;
    banner.variant = "info";
    banner.fillColor = "#eef6fb";
    banner.strokeColor = "#9bc4e2";
    banner.title = "Online consult";
    banner.body = "The doctor will call you within the selected 30-minute slot.";
    banner.width = 320;
    appendNode(document, banner);

    const button = createNodeFromPalette(
      "button",
      nextId(document, "button"),
      screen.id,
      { x: 70, y: 670 },
    ) as ButtonNode;
    button.text = "Book visit";
    button.width = 220;
    appendNode(document, button);

    return screen.id;
  }

  if (templateId === "productPage") {
    const screen = createBaseScreen(document, position, "Product page template");

    const badge = createNodeFromPalette(
      "badge",
      nextId(document, "badge"),
      screen.id,
      { x: 20, y: 24 },
    ) as BadgeNode;
    badge.variant = "status";
    badge.text = "Best seller";
    badge.width = 92;
    appendNode(document, badge);

    const title = createNodeFromPalette(
      "text",
      nextId(document, "text"),
      screen.id,
      { x: 20, y: 62 },
    ) as TextNode;
    title.text = "Premium wireless headphones";
    title.textStyle.fontSize = 16;
    title.textStyle.fontWeight = 700;
    appendNode(document, title);

    const banner = createNodeFromPalette(
      "banner",
      nextId(document, "banner"),
      screen.id,
      { x: 20, y: 104 },
    ) as BannerNode;
    banner.variant = "info";
    banner.title = "Free delivery";
    banner.body = "Ships tomorrow with free returns and two-year warranty.";
    banner.width = 320;
    appendNode(document, banner);

    const field = createNodeFromPalette(
      "field",
      nextId(document, "field"),
      screen.id,
      { x: 20, y: 198 },
    ) as FieldNode;
    field.label = "Color";
    field.value = "Midnight black";
    field.width = 320;
    appendNode(document, field);

    const button = createNodeFromPalette(
      "button",
      nextId(document, "button"),
      screen.id,
      { x: 70, y: 670 },
    ) as ButtonNode;
    button.text = "Add to cart";
    button.width = 220;
    appendNode(document, button);

    return screen.id;
  }

  if (templateId === "walletHome") {
    const screen = createBaseScreen(document, position, "Wallet home template");

    const title = createNodeFromPalette(
      "text",
      nextId(document, "text"),
      screen.id,
      { x: 20, y: 24 },
    ) as TextNode;
    title.text = "Available balance";
    title.textStyle.fontSize = 13;
    title.textStyle.fontWeight = 700;
    appendNode(document, title);

    const banner = createNodeFromPalette(
      "banner",
      nextId(document, "banner"),
      screen.id,
      { x: 20, y: 58 },
    ) as BannerNode;
    banner.variant = "success";
    banner.title = "124 500 RUB";
    banner.body = "Main card ends in 1024";
    banner.width = 320;
    appendNode(document, banner);

    const segmented = createNodeFromPalette(
      "segmentedControl",
      nextId(document, "segmented"),
      screen.id,
      { x: 20, y: 152 },
    ) as SegmentedControlNode;
    segmented.items = ["Cards", "History"];
    segmented.width = 320;
    appendNode(document, segmented);

    const field = createNodeFromPalette(
      "field",
      nextId(document, "field"),
      screen.id,
      { x: 20, y: 204 },
    ) as FieldNode;
    field.label = "Recipient";
    field.value = "Alexey Morozov";
    field.width = 320;
    appendNode(document, field);

    const button = createNodeFromPalette(
      "button",
      nextId(document, "button"),
      screen.id,
      { x: 70, y: 670 },
    ) as ButtonNode;
    button.text = "Transfer";
    button.width = 220;
    appendNode(document, button);

    return screen.id;
  }

  if (templateId === "deliveryCart") {
    const screen = createBaseScreen(document, position, "Delivery cart template");

    const badge = createNodeFromPalette(
      "badge",
      nextId(document, "badge"),
      screen.id,
      { x: 20, y: 24 },
    ) as BadgeNode;
    badge.variant = "success";
    badge.text = "25 min";
    badge.width = 72;
    appendNode(document, badge);

    const banner = createNodeFromPalette(
      "banner",
      nextId(document, "banner"),
      screen.id,
      { x: 20, y: 64 },
    ) as BannerNode;
    banner.variant = "warning";
    banner.title = "Courier nearby";
    banner.body = "Review your cart and confirm the delivery window.";
    banner.width = 320;
    appendNode(document, banner);

    const field = createNodeFromPalette(
      "field",
      nextId(document, "field"),
      screen.id,
      { x: 20, y: 158 },
    ) as FieldNode;
    field.label = "Address";
    field.value = "Lenina ave. 18";
    field.width = 320;
    appendNode(document, field);

    const button = createNodeFromPalette(
      "button",
      nextId(document, "button"),
      screen.id,
      { x: 70, y: 670 },
    ) as ButtonNode;
    button.text = "Review order";
    button.width = 220;
    appendNode(document, button);

    return screen.id;
  }

  if (templateId === "clinicOverview") {
    const screen = createBaseScreen(document, position, "Clinic overview template");

    const title = createNodeFromPalette(
      "text",
      nextId(document, "text"),
      screen.id,
      { x: 20, y: 24 },
    ) as TextNode;
    title.text = "Choose a service";
    title.textStyle.fontSize = 14;
    title.textStyle.fontWeight = 700;
    appendNode(document, title);

    const segmented = createNodeFromPalette(
      "segmentedControl",
      nextId(document, "segmented"),
      screen.id,
      { x: 20, y: 64 },
    ) as SegmentedControlNode;
    segmented.items = ["Online", "Clinic", "Home"];
    segmented.width = 320;
    appendNode(document, segmented);

    const banner = createNodeFromPalette(
      "banner",
      nextId(document, "banner"),
      screen.id,
      { x: 20, y: 116 },
    ) as BannerNode;
    banner.variant = "info";
    banner.title = "No queue today";
    banner.body = "Pick the nearest branch or book a video consult.";
    banner.width = 320;
    appendNode(document, banner);

    const field = createNodeFromPalette(
      "field",
      nextId(document, "field"),
      screen.id,
      { x: 20, y: 210 },
    ) as FieldNode;
    field.label = "Patient";
    field.value = "Elena Ivanova";
    field.width = 320;
    appendNode(document, field);

    const button = createNodeFromPalette(
      "button",
      nextId(document, "button"),
      screen.id,
      { x: 70, y: 670 },
    ) as ButtonNode;
    button.text = "Book visit";
    button.width = 220;
    appendNode(document, button);

    return screen.id;
  }

  if (templateId === "chatThread") {
    const screen = createBaseScreen(document, position, "Chat thread template");

    const title = createNodeFromPalette(
      "text",
      nextId(document, "text"),
      screen.id,
      { x: 20, y: 24 },
    ) as TextNode;
    title.text = "Alex";
    title.textStyle.fontSize = 14;
    title.textStyle.fontWeight = 700;
    appendNode(document, title);

    const banner = createNodeFromPalette(
      "banner",
      nextId(document, "banner"),
      screen.id,
      { x: 20, y: 62 },
    ) as BannerNode;
    banner.variant = "info";
    banner.title = "Typing...";
    banner.body = "Send a quick message or attach a file.";
    banner.width = 320;
    appendNode(document, banner);

    const firstMessage = createNodeFromPalette(
      "container",
      nextId(document, "container"),
      screen.id,
      { x: 20, y: 154 },
    ) as ContainerNode;
    firstMessage.title = "Message";
    firstMessage.width = 220;
    firstMessage.height = 74;
    appendNode(document, firstMessage);

    const firstMessageText = createNodeFromPalette(
      "text",
      nextId(document, "text"),
      firstMessage.id,
      { x: 16, y: 18 },
    ) as TextNode;
    firstMessageText.text = "Hi, can we reschedule?";
    appendNode(document, firstMessageText);

    const reply = createNodeFromPalette(
      "container",
      nextId(document, "container"),
      screen.id,
      { x: 120, y: 240 },
    ) as ContainerNode;
    reply.title = "Reply";
    reply.width = 220;
    reply.height = 74;
    appendNode(document, reply);

    const replyText = createNodeFromPalette(
      "text",
      nextId(document, "text"),
      reply.id,
      { x: 16, y: 18 },
    ) as TextNode;
    replyText.text = "Sure, what time works?";
    appendNode(document, replyText);

    const button = createNodeFromPalette(
      "button",
      nextId(document, "button"),
      screen.id,
      { x: 70, y: 670 },
    ) as ButtonNode;
    button.text = "Send message";
    button.width = 220;
    appendNode(document, button);

    return screen.id;
  }

  if (templateId === "mediaPlayer") {
    const screen = createBaseScreen(document, position, "Media player template");

    const title = createNodeFromPalette(
      "text",
      nextId(document, "text"),
      screen.id,
      { x: 20, y: 24 },
    ) as TextNode;
    title.text = "Now playing";
    title.textStyle.fontSize = 14;
    title.textStyle.fontWeight = 700;
    appendNode(document, title);

    const banner = createNodeFromPalette(
      "banner",
      nextId(document, "banner"),
      screen.id,
      { x: 20, y: 60 },
    ) as BannerNode;
    banner.variant = "info";
    banner.title = "Lo-fi evening mix";
    banner.body = "Continue listening, view the queue, or jump to saved tracks.";
    banner.width = 320;
    appendNode(document, banner);

    const segmented = createNodeFromPalette(
      "segmentedControl",
      nextId(document, "segmented"),
      screen.id,
      { x: 20, y: 154 },
    ) as SegmentedControlNode;
    segmented.items = ["Queue", "Lyrics"];
    segmented.width = 320;
    appendNode(document, segmented);

    const button = createNodeFromPalette(
      "button",
      nextId(document, "button"),
      screen.id,
      { x: 70, y: 670 },
    ) as ButtonNode;
    button.text = "Open library";
    button.width = 220;
    appendNode(document, button);

    return screen.id;
  }

  if (templateId === "travelBooking") {
    const screen = createBaseScreen(document, position, "Travel booking template");

    const badge = createNodeFromPalette(
      "badge",
      nextId(document, "badge"),
      screen.id,
      { x: 20, y: 24 },
    ) as BadgeNode;
    badge.variant = "status";
    badge.text = "2 stops";
    badge.width = 70;
    appendNode(document, badge);

    const field = createNodeFromPalette(
      "field",
      nextId(document, "field"),
      screen.id,
      { x: 20, y: 64 },
    ) as FieldNode;
    field.label = "Destination";
    field.value = "Istanbul";
    field.width = 320;
    appendNode(document, field);

    const banner = createNodeFromPalette(
      "banner",
      nextId(document, "banner"),
      screen.id,
      { x: 20, y: 120 },
    ) as BannerNode;
    banner.variant = "info";
    banner.title = "Flexible fare";
    banner.body = "One free date change and cabin baggage included.";
    banner.width = 320;
    appendNode(document, banner);

    const button = createNodeFromPalette(
      "button",
      nextId(document, "button"),
      screen.id,
      { x: 70, y: 670 },
    ) as ButtonNode;
    button.text = "Continue booking";
    button.width = 220;
    appendNode(document, button);

    return screen.id;
  }

  if (templateId === "taskOverview") {
    const screen = createBaseScreen(document, position, "Task overview template");

    const title = createNodeFromPalette(
      "text",
      nextId(document, "text"),
      screen.id,
      { x: 20, y: 24 },
    ) as TextNode;
    title.text = "Sprint board";
    title.textStyle.fontSize = 14;
    title.textStyle.fontWeight = 700;
    appendNode(document, title);

    const badge = createNodeFromPalette(
      "badge",
      nextId(document, "badge"),
      screen.id,
      { x: 20, y: 60 },
    ) as BadgeNode;
    badge.variant = "code";
    badge.text = "12 tasks";
    badge.width = 84;
    appendNode(document, badge);

    const column = createNodeFromPalette(
      "container",
      nextId(document, "container"),
      screen.id,
      { x: 20, y: 104 },
    ) as ContainerNode;
    column.title = "In progress";
    column.width = 320;
    column.height = 184;
    appendNode(document, column);

    const cardTitle = createNodeFromPalette(
      "text",
      nextId(document, "text"),
      column.id,
      { x: 16, y: 18 },
    ) as TextNode;
    cardTitle.text = "Implement template packs";
    appendNode(document, cardTitle);

    const cardBanner = createNodeFromPalette(
      "banner",
      nextId(document, "banner"),
      column.id,
      { x: 16, y: 50 },
    ) as BannerNode;
    cardBanner.variant = "warning";
    cardBanner.title = "Review pending";
    cardBanner.body = "Refine layout and verify insert flow.";
    cardBanner.width = 288;
    appendNode(document, cardBanner);

    const button = createNodeFromPalette(
      "button",
      nextId(document, "button"),
      screen.id,
      { x: 70, y: 670 },
    ) as ButtonNode;
    button.text = "Add task";
    button.width = 220;
    appendNode(document, button);

    return screen.id;
  }

  if (templateId === "educationLesson") {
    const screen = createBaseScreen(document, position, "Education lesson template");

    const title = createNodeFromPalette(
      "text",
      nextId(document, "text"),
      screen.id,
      { x: 20, y: 24 },
    ) as TextNode;
    title.text = "Lesson 4: Layout basics";
    title.textStyle.fontSize = 14;
    title.textStyle.fontWeight = 700;
    appendNode(document, title);

    const banner = createNodeFromPalette(
      "banner",
      nextId(document, "banner"),
      screen.id,
      { x: 20, y: 64 },
    ) as BannerNode;
    banner.variant = "success";
    banner.title = "Progress 65%";
    banner.body = "Review the summary, then continue to the short quiz.";
    banner.width = 320;
    appendNode(document, banner);

    const checkbox = createNodeFromPalette(
      "checkbox",
      nextId(document, "checkbox"),
      screen.id,
      { x: 20, y: 158 },
    ) as CheckboxNode;
    checkbox.text = "Mark summary as reviewed";
    appendNode(document, checkbox);

    const button = createNodeFromPalette(
      "button",
      nextId(document, "button"),
      screen.id,
      { x: 70, y: 670 },
    ) as ButtonNode;
    button.text = "Start quiz";
    button.width = 220;
    appendNode(document, button);

    return screen.id;
  }

  if (templateId === "serviceBooking") {
    const screen = createBaseScreen(document, position, "Service booking template");

    const title = createNodeFromPalette(
      "text",
      nextId(document, "text"),
      screen.id,
      { x: 20, y: 24 },
    ) as TextNode;
    title.text = "Book a cleaning";
    title.textStyle.fontSize = 14;
    title.textStyle.fontWeight = 700;
    appendNode(document, title);

    const segmented = createNodeFromPalette(
      "segmentedControl",
      nextId(document, "segmented"),
      screen.id,
      { x: 20, y: 64 },
    ) as SegmentedControlNode;
    segmented.items = ["One-off", "Weekly"];
    segmented.width = 320;
    appendNode(document, segmented);

    const field = createNodeFromPalette(
      "field",
      nextId(document, "field"),
      screen.id,
      { x: 20, y: 116 },
    ) as FieldNode;
    field.label = "Address";
    field.value = "Tatischeva st. 88";
    field.width = 320;
    appendNode(document, field);

    const button = createNodeFromPalette(
      "button",
      nextId(document, "button"),
      screen.id,
      { x: 70, y: 670 },
    ) as ButtonNode;
    button.text = "Confirm time";
    button.width = 220;
    appendNode(document, button);

    return screen.id;
  }

  const screen = createBaseScreen(document, position, "Confirmation template");

  const badge = createNodeFromPalette(
    "badge",
    nextId(document, "badge"),
    screen.id,
    { x: 20, y: 24 },
  ) as BadgeNode;
  badge.variant = "success";
  badge.fillColor = "#d5e8d4";
  badge.strokeColor = "#82b366";
  badge.textStyle.color = "#355c2b";
  badge.text = "Paid";
  badge.width = 64;
  appendNode(document, badge);

  const title = createNodeFromPalette(
    "text",
    nextId(document, "text"),
    screen.id,
    { x: 20, y: 64 },
  ) as TextNode;
  title.text = "Order confirmed";
  title.textStyle.fontSize = 16;
  title.textStyle.fontWeight = 700;
  appendNode(document, title);

  const banner = createNodeFromPalette(
    "banner",
    nextId(document, "banner"),
    screen.id,
    { x: 20, y: 112 },
  ) as BannerNode;
  banner.variant = "success";
  banner.fillColor = "#e8f5eb";
  banner.strokeColor = "#82b366";
  banner.title = "Receipt sent";
  banner.body = "We emailed the payment receipt and order summary.";
  banner.width = 320;
  appendNode(document, banner);

  const button = createNodeFromPalette(
    "button",
    nextId(document, "button"),
    screen.id,
    { x: 70, y: 670 },
  ) as ButtonNode;
  button.text = "Back to home";
  button.width = 220;
  appendNode(document, button);

  return screen.id;
}
