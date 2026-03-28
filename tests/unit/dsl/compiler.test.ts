import { expect, test } from "vitest";

import { compileDsl } from "@/lib/dsl";

test("compiles a supported DSL screen into the editor model", () => {
  const result = compileDsl(`project name:"Checkout flow"
screen Checkout preset:iphone15
  section Address layout:vstack gap:8
    field label:"Address" value:"Yekaterinburg"
    checkbox text:"Save address" checked:true
  section Actions layout:hstack gap:8
    button variant:secondary text:"Back"
    button variant:primary text:"Continue"
`);

  expect(result.diagnostics.filter((diagnostic) => diagnostic.severity === "error")).toHaveLength(0);
  expect(result.document?.name).toBe("Checkout flow");
  expect(result.document?.rootIds).toHaveLength(1);

  const screenId = result.document?.rootIds[0];
  const screen = screenId ? result.document?.nodes[screenId] : null;
  expect(screen?.type).toBe("screen");
  expect(screen?.title).toBe("Checkout");
  expect(screen?.width).toBe(393);
  expect(screen?.height).toBe(852);

  const containers = Object.values(result.document?.nodes ?? {}).filter(
    (node) => node.type === "container",
  );
  expect(containers.length).toBeGreaterThanOrEqual(2);
});

test("keeps chatBubble directives as unsupported placeholders with warnings", () => {
  const result = compileDsl(`screen Chat preset:iphone15
  chatBubble text:"Hello"
`);

  expect(result.diagnostics.some((diagnostic) => diagnostic.code === "unsupported-directive")).toBe(true);
  const unsupported = Object.values(result.document?.nodes ?? {}).find(
    (node) => node.type === "unsupported",
  );
  expect(unsupported?.type).toBe("unsupported");
});

