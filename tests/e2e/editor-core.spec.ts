import { expect, test, type Locator, type Page } from "@playwright/test";

type StoredNode = {
  id: string;
  parentId: string | "board";
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  metadata?: Record<string, unknown>;
};

type StoredDocument = {
  board: {
    zoom: number;
    panX: number;
    panY: number;
  };
  nodes: Record<string, StoredNode>;
  edges?: Record<string, unknown>;
};

const LOCAL_STORAGE_KEY = "codex-mobile-mockup-editor";

function getAbsolutePosition(document: StoredDocument, nodeId: string): { x: number; y: number } {
  const node = document.nodes[nodeId];
  if (!node) {
    return { x: 0, y: 0 };
  }

  if (node.parentId === "board") {
    return { x: node.x, y: node.y };
  }

  const parentPosition = getAbsolutePosition(document, node.parentId);
  return {
    x: parentPosition.x + node.x,
    y: parentPosition.y + node.y,
  };
}

function getBoardPoint(
  document: StoredDocument,
  absolute: { x: number; y: number },
): { x: number; y: number } {
  return {
    x: document.board.panX + absolute.x * document.board.zoom,
    y: document.board.panY + absolute.y * document.board.zoom,
  };
}

async function readDocument(page: Page): Promise<StoredDocument> {
  return page.evaluate((storageKey) => {
    const payload = window.localStorage.getItem(storageKey);
    if (!payload) {
      throw new Error("Editor document was not found in localStorage.");
    }

    return JSON.parse(payload);
  }, LOCAL_STORAGE_KEY);
}

async function dragFromElementToPoint(
  page: Page,
  selector: Locator,
  target: { x: number; y: number },
) {
  const sourceBox = await selector.boundingBox();
  if (!sourceBox) {
    throw new Error("Source element bounding box is not available.");
  }

  const startX = sourceBox.x + Math.min(20, sourceBox.width / 2);
  const startY = sourceBox.y + Math.min(20, sourceBox.height / 2);
  await selector.dispatchEvent("pointerdown", {
    bubbles: true,
    button: 0,
    buttons: 1,
    clientX: startX,
    clientY: startY,
    pointerId: 1,
    pointerType: "mouse",
    isPrimary: true,
  });

  const deltaX = target.x - startX;
  const deltaY = target.y - startY;
  for (let step = 1; step <= 12; step += 1) {
    const progress = step / 12;
    await page.evaluate(
      ({ clientX, clientY }) => {
        window.dispatchEvent(
          new PointerEvent("pointermove", {
            bubbles: true,
            button: 0,
            buttons: 1,
            clientX,
            clientY,
            pointerId: 1,
            pointerType: "mouse",
            isPrimary: true,
          }),
        );
      },
      {
        clientX: startX + deltaX * progress,
        clientY: startY + deltaY * progress,
      },
    );
  }

  await page.evaluate(
    ({ clientX, clientY }) => {
      window.dispatchEvent(
        new PointerEvent("pointerup", {
          bubbles: true,
          button: 0,
          buttons: 0,
          clientX,
          clientY,
          pointerId: 1,
          pointerType: "mouse",
          isPrimary: true,
        }),
      );
    },
    {
      clientX: target.x,
      clientY: target.y,
    },
  );
}

function getNodeLocator(page: Page, nodeId: string): Locator {
  return page.locator(`[data-node-id="${nodeId}"]`).first();
}

async function dragElementByOffset(
  page: Page,
  selector: Locator,
  offset: { x: number; y: number },
) {
  const sourceBox = await selector.boundingBox();
  if (!sourceBox) {
    throw new Error("Source element bounding box is not available.");
  }

  const startX = sourceBox.x + Math.min(20, sourceBox.width / 2);
  const startY = sourceBox.y + Math.min(20, sourceBox.height / 2);
  await dragFromElementToPoint(page, selector, {
    x: startX + offset.x,
    y: startY + offset.y,
  });
}

async function selectNode(page: Page, nodeId: string) {
  const node = getNodeLocator(page, nodeId);
  const box = await node.boundingBox();
  if (!box) {
    throw new Error(`Node ${nodeId} bounding box is not available.`);
  }

  const clientX = box.x + Math.min(20, box.width / 2);
  const clientY = box.y + Math.min(20, box.height / 2);

  await node.dispatchEvent("pointerdown", {
    bubbles: true,
    button: 0,
    buttons: 1,
    clientX,
    clientY,
    pointerId: 1,
    pointerType: "mouse",
    isPrimary: true,
  });
  await page.evaluate(
    ({ x, y }) => {
      window.dispatchEvent(
        new PointerEvent("pointerup", {
          bubbles: true,
          button: 0,
          buttons: 0,
          clientX: x,
          clientY: y,
          pointerId: 1,
          pointerType: "mouse",
          isPrimary: true,
        }),
      );
    },
    { x: clientX, y: clientY },
  );
}

async function addNodeToSelection(page: Page, nodeId: string) {
  const node = getNodeLocator(page, nodeId);
  const box = await node.boundingBox();
  if (!box) {
    throw new Error(`Node ${nodeId} bounding box is not available.`);
  }

  const clientX = box.x + Math.min(20, box.width / 2);
  const clientY = box.y + Math.min(20, box.height / 2);

  await node.dispatchEvent("pointerdown", {
    bubbles: true,
    button: 0,
    buttons: 1,
    clientX,
    clientY,
    pointerId: 1,
    pointerType: "mouse",
    isPrimary: true,
    shiftKey: true,
  });
  await page.evaluate(
    ({ x, y }) => {
      window.dispatchEvent(
        new PointerEvent("pointerup", {
          bubbles: true,
          button: 0,
          buttons: 0,
          clientX: x,
          clientY: y,
          pointerId: 1,
          pointerType: "mouse",
          isPrimary: true,
          shiftKey: true,
        }),
      );
    },
    { x: clientX, y: clientY },
  );
}

async function loadDemo(page: Page) {
  await page.locator('.toolbar-dropdown summary[aria-label="Project"]').click();
  await page.getByRole("button", { name: "Load demo" }).click();
}

test("preserves child-parent geometry when moving containers", async ({
  page,
}) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto("/");
  await expect(page.locator(".app-shell")).toBeVisible();
  await loadDemo(page);

  const canvas = page.locator(".board-canvas");
  await expect(canvas).toBeVisible();

  let document = await readDocument(page);
  const container = document.nodes["node-3"];
  const button = document.nodes["node-4"];
  expect(container?.type).toBe("container");
  expect(button?.parentId).toBe(container?.id);
  if (!container || !button) {
    return;
  }

  const beforeContainerAbsolute = getAbsolutePosition(document, container.id);
  const beforeButtonAbsolute = getAbsolutePosition(document, button.id);
  const beforeButtonLocal = { x: button.x, y: button.y };
  await dragElementByOffset(page, getNodeLocator(page, container.id), {
    x: 90,
    y: 70,
  });

  await expect
    .poll(async () => {
      const nextDocument = await readDocument(page);
      const nextContainer = nextDocument.nodes[container.id];
      return `${nextContainer?.x}:${nextContainer?.y}`;
    })
    .not.toBe(`${container.x}:${container.y}`);

  document = await readDocument(page);
  const movedContainer = document.nodes[container.id];
  const movedButton = document.nodes[button.id];
  const afterContainerAbsolute = getAbsolutePosition(document, container.id);
  const afterButtonAbsolute = getAbsolutePosition(document, button.id);

  expect(movedButton.parentId).toBe(container.id);
  expect(movedButton.x).toBe(beforeButtonLocal.x);
  expect(movedButton.y).toBe(beforeButtonLocal.y);
  expect(afterButtonAbsolute.x - beforeButtonAbsolute.x).toBe(
    afterContainerAbsolute.x - beforeContainerAbsolute.x,
  );
  expect(afterButtonAbsolute.y - beforeButtonAbsolute.y).toBe(
    afterContainerAbsolute.y - beforeContainerAbsolute.y,
  );
  expect(pageErrors).toEqual([]);
});

test("pans the board with right-button drag", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".app-shell")).toBeVisible();
  await loadDemo(page);

  const canvas = page.locator(".board-canvas");
  const canvasBox = await canvas.boundingBox();
  if (!canvasBox) {
    throw new Error("Board canvas bounding box is not available.");
  }

  const beforeDocument = await readDocument(page);
  const startX = canvasBox.x + Math.min(240, canvasBox.width / 2);
  const startY = canvasBox.y + Math.min(240, canvasBox.height / 2);

  await canvas.dispatchEvent("pointerdown", {
    bubbles: true,
    button: 2,
    buttons: 2,
    clientX: startX,
    clientY: startY,
    pointerId: 1,
    pointerType: "mouse",
    isPrimary: true,
  });

  for (let step = 1; step <= 10; step += 1) {
    const progress = step / 10;
    await page.evaluate(
      ({ clientX, clientY }) => {
        window.dispatchEvent(
          new PointerEvent("pointermove", {
            bubbles: true,
            button: 2,
            buttons: 2,
            clientX,
            clientY,
            pointerId: 1,
            pointerType: "mouse",
            isPrimary: true,
          }),
        );
      },
      {
        clientX: startX + 120 * progress,
        clientY: startY + 80 * progress,
      },
    );
  }

  await page.evaluate(
    ({ clientX, clientY }) => {
      window.dispatchEvent(
        new PointerEvent("pointerup", {
          bubbles: true,
          button: 2,
          buttons: 0,
          clientX,
          clientY,
          pointerId: 1,
          pointerType: "mouse",
          isPrimary: true,
        }),
      );
    },
    {
      clientX: startX + 120,
      clientY: startY + 80,
    },
  );

  await expect
    .poll(async () => {
      const nextDocument = await readDocument(page);
      return `${nextDocument.board.panX}:${nextDocument.board.panY}`;
    })
    .toBe(`${beforeDocument.board.panX + 120}:${beforeDocument.board.panY + 80}`);

  const afterDocument = await readDocument(page);
  expect(afterDocument.board.zoom).toBe(1);
  expect(afterDocument.board.panX).toBe(beforeDocument.board.panX + 120);
  expect(afterDocument.board.panY).toBe(beforeDocument.board.panY + 80);
});

test("updates geometry from inspector and reflows when auto-layout mode changes", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".app-shell")).toBeVisible();
  await loadDemo(page);

  await selectNode(page, "node-3");

  const inspector = page.getByRole("complementary").last();
  await expect(inspector).toContainText("Inspector");
  await expect(inspector).toContainText("Parent node-1");

  const numberInputs = inspector.locator("input[type='number']");
  await expect(numberInputs.nth(1)).toHaveValue("72");
  await numberInputs.nth(1).fill("312");
  await numberInputs.nth(1).blur();

  await expect
    .poll(async () => {
      const nextDocument = await readDocument(page);
      const movedContainer = nextDocument.nodes["node-3"];
      return `${movedContainer?.x}:${movedContainer?.y}`;
    })
    .toBe("20:317");

  const selects = inspector.locator("select");
  await selects.nth(0).selectOption("vstack");
  await selects.nth(1).selectOption("center");

  await expect
    .poll(async () => {
      const nextDocument = await readDocument(page);
      const field = nextDocument.nodes["node-4"];
      return `${field?.x}:${field?.y}`;
    })
    .toBe("16:12");
});

test("creates an edge from the visible connect action", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".app-shell")).toBeVisible();
  await loadDemo(page);

  const beforeDocument = await readDocument(page);
  const initialEdgeCount = Object.keys(beforeDocument.edges ?? {}).length;

  await selectNode(page, "node-3");
  await addNodeToSelection(page, "node-4");

  await page.getByRole("button", { name: "Connect" }).click();

  await expect
    .poll(async () => {
      const document = await readDocument(page);
      return Object.keys(document.edges ?? {}).length;
    })
    .toBe(initialEdgeCount + 1);
});

test("exports draw.io XML from the toolbar", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".app-shell")).toBeVisible();
  await loadDemo(page);

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export Draw.io" }).click();
  const download = await downloadPromise;
  const suggestedName = download.suggestedFilename();

  expect(suggestedName).toMatch(/\.drawio$/);
});

test("creates the first screen from empty state and inserts a quick item", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".app-shell")).toBeVisible();
  await page.getByRole("button", { name: "New document" }).click();

  await expect(page.getByRole("button", { name: "Add blank screen" })).toBeVisible();
  await page.getByRole("button", { name: "Add blank screen" }).click();

  const withScreen = await readDocument(page);
  const screen = Object.values(withScreen.nodes).find((node) => node.type === "screen");
  expect(screen).toBeDefined();

  await page.locator(".quick-insert-trigger").click();
  await page.getByRole("button", { name: /Primary CTA/i }).click();

  await expect
    .poll(async () => {
      const document = await readDocument(page);
      return Object.values(document.nodes).filter((node) => node.type === "button").length;
    })
    .toBeGreaterThan(0);

  const finalDocument = await readDocument(page);
  const insertedButton = Object.values(finalDocument.nodes).find(
    (node) => node.type === "button" && node.parentId === screen?.id,
  );
  expect(insertedButton).toBeDefined();
});

test("inserts a desktop frame from the universal elements catalog", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".app-shell")).toBeVisible();
  await page.getByRole("button", { name: "New document" }).click();

  await page.getByPlaceholder("Search elements").fill("Desktop frame");
  await page.getByRole("button", { name: /Desktop frame/i }).last().click();

  const document = await readDocument(page);
  const desktopFrame = Object.values(document.nodes).find(
    (node) =>
      node.type === "screen" &&
      node.metadata &&
      node.metadata.frameKind === "desktop",
  );

  expect(desktopFrame).toBeDefined();
});
