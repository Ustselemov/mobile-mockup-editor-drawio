import { createEmptyDocument } from "@/lib/model/defaults";
import { appendNode, createNodeFromPalette } from "@/lib/model/node-utils";
import type {
  ButtonNode,
  CheckboxNode,
  ContainerNode,
  EditorDocument,
  FieldNode,
  ScreenNode,
  TextNode,
} from "@/lib/model/document";

export function createDemoDocument(): EditorDocument {
  const document = createEmptyDocument("Checkout demo");

  const screen = createNodeFromPalette("screen", "node-1", "board", {
    x: 240,
    y: 80,
  }) as ScreenNode;
  screen.title = "Checkout";
  appendNode(document, screen);

  const title = createNodeFromPalette("text", "node-2", screen.id, {
    x: 20,
    y: 24,
  }) as TextNode;
  title.text = "Order details";
  title.textStyle.fontSize = 14;
  title.textStyle.fontWeight = 700;
  appendNode(document, title);

  const container = createNodeFromPalette("container", "node-3", screen.id, {
    x: 20,
    y: 72,
  }) as ContainerNode;
  container.title = "Delivery";
  container.width = 320;
  container.height = 126;
  appendNode(document, container);

  const deliveryField = createNodeFromPalette("field", "node-4", container.id, {
    x: 16,
    y: 18,
  }) as FieldNode;
  deliveryField.label = "Pickup point";
  deliveryField.value = "Yekaterinburg, Vostochnaya 7A";
  deliveryField.width = 288;
  appendNode(document, deliveryField);

  const button = createNodeFromPalette("button", "node-5", screen.id, {
    x: 70,
    y: 670,
  }) as ButtonNode;
  button.text = "Proceed to payment";
  button.width = 220;
  appendNode(document, button);

  const checkboxA = createNodeFromPalette("checkbox", "node-6", screen.id, {
    x: 20,
    y: 236,
  }) as CheckboxNode;
  checkboxA.text = "I agree with personal data processing";
  checkboxA.width = 300;
  appendNode(document, checkboxA);

  const checkboxB = createNodeFromPalette("checkbox", "node-7", screen.id, {
    x: 20,
    y: 274,
  }) as CheckboxNode;
  checkboxB.text = "Send receipt by email";
  checkboxB.width = 220;
  appendNode(document, checkboxB);

  const summary = createNodeFromPalette("container", "node-8", screen.id, {
    x: 20,
    y: 330,
  }) as ContainerNode;
  summary.width = 320;
  summary.height = 180;
  summary.title = "Summary";
  appendNode(document, summary);

  const summaryTextA = createNodeFromPalette("text", "node-9", summary.id, {
    x: 16,
    y: 18,
  }) as TextNode;
  summaryTextA.text = "Purchase amount";
  appendNode(document, summaryTextA);

  const summaryTextB = createNodeFromPalette("text", "node-10", summary.id, {
    x: 200,
    y: 18,
  }) as TextNode;
  summaryTextB.text = "5 420 ₽";
  summaryTextB.textStyle.align = "right";
  summaryTextB.width = 100;
  appendNode(document, summaryTextB);

  document.edges["edge-11"] = {
    id: "edge-11",
    type: "edge",
    parentId: screen.id,
    sourceId: deliveryField.id,
    targetId: button.id,
    orthogonal: true,
    startArrow: "none",
    endArrow: "classic",
    strokeColor: "#000000",
    strokeWidth: 5,
  };
  document.edgeIds.push("edge-11");

  document.idCounter = 12;
  return document;
}
