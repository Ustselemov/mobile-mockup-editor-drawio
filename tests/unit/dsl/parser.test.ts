import { expect, test } from "vitest";

import { parseDsl } from "@/lib/dsl";

test("parses nested DSL blocks and properties", () => {
  const result = parseDsl(`project name:"Checkout flow"
screen Checkout preset:iphone15
  section Address layout:vstack gap:8
    field label:"Address" value:"Yekaterinburg"
    button variant:primary text:"Continue"
`);

  expect(result.diagnostics).toHaveLength(0);
  expect(result.ast?.projectName).toBe("Checkout flow");
  expect(result.ast?.roots).toHaveLength(1);
  const project = result.ast?.roots[0];
  expect(project?.kind).toBe("project");
  expect(project?.properties.name).toBe("Checkout flow");
  expect(project?.children).toHaveLength(1);
  const screen = project?.children[0];
  expect(screen?.kind).toBe("screen");
  expect(screen?.subject).toBe("Checkout");
  expect(screen?.properties.preset).toBe("iphone15");
  expect(screen?.children).toHaveLength(1);
  expect(screen?.children[0]?.kind).toBe("section");
  expect(screen?.children[0]?.children[0]?.kind).toBe("field");
});

test("reports invalid nesting and unknown directives", () => {
  const result = parseDsl(`screen Checkout
  text value:"Broken nesting"
    button text:"Nope"
unknown Example
`);

  expect(result.diagnostics.some((diagnostic) => diagnostic.code === "invalid-nesting")).toBe(true);
  expect(result.diagnostics.some((diagnostic) => diagnostic.code === "unknown-directive")).toBe(true);
});
