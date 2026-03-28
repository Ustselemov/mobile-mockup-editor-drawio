import type { TextStyle } from "@/lib/model/document";

const entityMap: Record<string, string> = {
  "&lt;": "<",
  "&gt;": ">",
  "&amp;": "&",
  "&quot;": "\"",
  "&#39;": "'",
};

export function decodeEntities(input: string): string {
  return Object.entries(entityMap).reduce(
    (value, [entity, replacement]) => value.split(entity).join(replacement),
    input,
  );
}

export function escapeHtml(input: string): string {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#39;");
}

export function htmlToPlainText(input: string | undefined): string {
  if (!input) {
    return "";
  }

  if (typeof DOMParser !== "undefined") {
    const parser = new DOMParser();
    const document = parser.parseFromString(`<body>${input}</body>`, "text/html");
    return decodeEntities(document.body.textContent ?? "")
      .replace(/\s+/g, " ")
      .trim();
  }

  const withoutTags = input.replace(/<[^>]+>/g, " ");
  const decoded = decodeEntities(withoutTags);
  return decoded.replace(/\s+/g, " ").trim();
}

function parseInlineStyle(styleValue: string): Record<string, string> {
  return styleValue
    .split(";")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((accumulator, entry) => {
      const separatorIndex = entry.indexOf(":");
      if (separatorIndex < 0) {
        return accumulator;
      }

      const key = entry.slice(0, separatorIndex).trim();
      const value = entry.slice(separatorIndex + 1).trim();
      accumulator[key] = value;
      return accumulator;
    }, {});
}

export function extractTextStyleFromHtml(
  input: string | undefined,
): Partial<TextStyle> {
  if (!input) {
    return {};
  }

  const decoded = decodeEntities(input);
  const styleMatch = decoded.match(/style="([^"]+)"/i);
  if (!styleMatch) {
    return {};
  }

  const styleMap = parseInlineStyle(styleMatch[1]);
  const fontSize = Number.parseFloat(styleMap["font-size"] ?? "");
  const lineHeight = Number.parseFloat(styleMap["line-height"] ?? "");
  const fontWeightRaw = styleMap["font-weight"];
  const textAlign = styleMap["text-align"];

  const partialStyle: Partial<TextStyle> = {
    fontFamily: styleMap["font-family"],
    fontSize: Number.isFinite(fontSize) ? fontSize : undefined,
    fontWeight:
      fontWeightRaw === "700" || fontWeightRaw === "bold"
        ? 700
        : fontWeightRaw
          ? 400
          : undefined,
    lineHeight: Number.isFinite(lineHeight) ? lineHeight : undefined,
    color: styleMap.color,
    align:
      textAlign === "center" || textAlign === "right" || textAlign === "left"
        ? textAlign
        : undefined,
  };

  return Object.fromEntries(
    Object.entries(partialStyle).filter(([, value]) => value !== undefined),
  ) as Partial<TextStyle>;
}

export function textStyleToHtml(text: string, style: TextStyle): string {
  return `<div style="font-size:${style.fontSize}px;font-family:${style.fontFamily};color:${style.color};text-align:${style.align};line-height:${style.lineHeight};font-weight:${style.fontWeight};white-space:normal;">${escapeHtml(text)}</div>`;
}
