import { describe, expect, it } from "vitest";

import { createEmptyDocument } from "@/lib/model/defaults";
import { generateId } from "@/lib/model/node-utils";

describe("id generation", () => {
  it("is deterministic for the current document counter", () => {
    const document = createEmptyDocument();

    expect(generateId(document, "screen")).toBe("screen-1");
    document.idCounter = 12;
    expect(generateId(document, "field")).toBe("field-12");
  });
});
