import { expect, test, type Page } from "@playwright/test";

const LOCAL_STORAGE_KEY = "codex-mobile-mockup-editor";

async function readDocument(page: Page) {
  return page.evaluate((storageKey) => {
    const payload = window.localStorage.getItem(storageKey);
    if (!payload) {
      throw new Error("Editor document was not found in localStorage.");
    }

    return JSON.parse(payload);
  }, LOCAL_STORAGE_KEY);
}

test("compiles DSL from the lower panel into an editable screen", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".app-shell")).toBeVisible();

  const panel = page.getByLabel("DSL panel");
  await expect(panel).toBeVisible();

  const source = panel.locator("textarea");
  await source.fill(`project name:"Checkout flow"
screen Checkout preset:iphone15
  section Address layout:vstack gap:8
    field label:"Address" value:"Yekaterinburg"
    button variant:primary text:"Continue"
`);

  await panel.getByRole("button", { name: "Generate screen" }).click();

  const document = await readDocument(page);
  expect(document.name).toBe("Checkout flow");
  expect(document.rootIds).toHaveLength(1);

  const screenId = document.rootIds[0];
  expect(document.nodes[screenId]?.type).toBe("screen");
  expect(document.nodes[screenId]?.children.length).toBeGreaterThan(0);
  await expect(page.getByText("Generated DSL document")).toBeVisible();
});

