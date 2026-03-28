import type {
  DslAstNode,
  DslDiagnostic,
  DslNodeKind,
  DslParseResult,
  DslValue,
} from "@/lib/dsl/types";

const SUPPORTED_DIRECTIVES = new Set<DslNodeKind>([
  "project",
  "screen",
  "section",
  "container",
  "text",
  "button",
  "field",
  "badge",
  "checkbox",
  "segmentedControl",
  "chatBubble",
]);

const CONTAINER_DIRECTIVES = new Set<DslNodeKind>([
  "project",
  "screen",
  "section",
  "container",
]);

type Token = {
  text: string;
  column: number;
};

function pushDiagnostic(
  diagnostics: DslDiagnostic[],
  severity: DslDiagnostic["severity"],
  code: string,
  message: string,
  line: number,
  column: number,
) {
  diagnostics.push({ severity, code, message, line, column });
}

function normalizeIndent(line: string): { indent: number; content: string } | null {
  const leading = line.match(/^[ \t]*/)?.[0] ?? "";
  const spaces = leading.replace(/\t/g, "  ").length;
  if (spaces % 2 !== 0) {
    return null;
  }

  return {
    indent: spaces / 2,
    content: line.slice(leading.length),
  };
}

function tokenizeLine(content: string): Token[] {
  const tokens: Token[] = [];
  let current = "";
  let startColumn = 0;
  let quote: '"' | "'" | null = null;
  let bracketDepth = 0;
  let escapeNext = false;

  const flush = () => {
    if (current.length === 0) {
      return;
    }

    tokens.push({ text: current, column: startColumn + 1 });
    current = "";
    startColumn = 0;
  };

  for (let index = 0; index < content.length; index += 1) {
    const char = content[index] ?? "";
    if (quote) {
      current += char;
      if (escapeNext) {
        escapeNext = false;
        continue;
      }

      if (char === "\\") {
        escapeNext = true;
        continue;
      }

      if (char === quote) {
        quote = null;
      }
      continue;
    }

    if (char === "#") {
      break;
    }

    if (/\s/.test(char) && bracketDepth === 0) {
      flush();
      continue;
    }

    if (startColumn === 0) {
      startColumn = index;
    }

    current += char;

    if (char === '"' || char === "'") {
      quote = char;
    } else if (char === "[") {
      bracketDepth += 1;
    } else if (char === "]") {
      bracketDepth = Math.max(0, bracketDepth - 1);
    }
  }

  flush();
  return tokens;
}

function unescapeQuoted(value: string): string {
  const quote = value[0];
  if (!quote || value.length < 2) {
    return value;
  }

  const body = value.slice(1, -1);
  if (quote !== '"' && quote !== "'") {
    return value;
  }

  return body.replace(/\\(["'\\nrt])/g, (_match, escaped: string) => {
    if (escaped === "n") {
      return "\n";
    }
    if (escaped === "r") {
      return "\r";
    }
    if (escaped === "t") {
      return "\t";
    }
    return escaped;
  });
}

function splitTopLevel(value: string, separator = ","): string[] {
  const items: string[] = [];
  let current = "";
  let quote: '"' | "'" | null = null;
  let bracketDepth = 0;
  let escapeNext = false;

  const flush = () => {
    const trimmed = current.trim();
    if (trimmed.length > 0) {
      items.push(trimmed);
    }
    current = "";
  };

  for (let index = 0; index < value.length; index += 1) {
    const char = value[index] ?? "";
    if (quote) {
      current += char;
      if (escapeNext) {
        escapeNext = false;
        continue;
      }

      if (char === "\\") {
        escapeNext = true;
        continue;
      }

      if (char === quote) {
        quote = null;
      }
      continue;
    }

    if (char === '"' || char === "'") {
      quote = char;
      current += char;
      continue;
    }

    if (char === "[") {
      bracketDepth += 1;
      current += char;
      continue;
    }

    if (char === "]") {
      bracketDepth = Math.max(0, bracketDepth - 1);
      current += char;
      continue;
    }

    if (char === separator && bracketDepth === 0) {
      flush();
      continue;
    }

    current += char;
  }

  flush();
  return items;
}

function parseScalar(raw: string): DslValue {
  const trimmed = raw.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return unescapeQuoted(trimmed);
  }

  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    return splitTopLevel(trimmed.slice(1, -1)).map((item) => parseScalar(item)) as DslValue;
  }

  if (trimmed === "true") {
    return true;
  }

  if (trimmed === "false") {
    return false;
  }

  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    return Number(trimmed);
  }

  return trimmed;
}

function getDefaultSubjectKey(kind: DslNodeKind): string | null {
  switch (kind) {
    case "project":
      return "name";
    case "screen":
    case "section":
    case "container":
    case "badge":
    case "button":
    case "checkbox":
      return "text";
    case "text":
      return "value";
    case "field":
      return "label";
    case "segmentedControl":
      return "label";
    case "chatBubble":
      return "text";
    case "unsupported":
      return null;
  }
}

function parseLine(
  content: string,
  lineNumber: number,
  diagnostics: DslDiagnostic[],
): DslAstNode | null {
  const tokens = tokenizeLine(content);
  if (tokens.length === 0) {
    return null;
  }

  const directive = tokens[0]?.text as DslNodeKind | undefined;
  if (!directive || !SUPPORTED_DIRECTIVES.has(directive)) {
    pushDiagnostic(
      diagnostics,
      "error",
      "unknown-directive",
      `Unknown DSL directive "${tokens[0]?.text ?? ""}".`,
      lineNumber,
      tokens[0]?.column ?? 1,
    );
    return null;
  }

  const subjectParts: string[] = [];
  const properties: Record<string, DslValue> = {};
  const defaultSubjectKey = getDefaultSubjectKey(directive);

  for (const token of tokens.slice(1)) {
    const separatorIndex = token.text.indexOf(":");
    if (separatorIndex === -1) {
      subjectParts.push(token.text);
      continue;
    }

    const key = token.text.slice(0, separatorIndex).trim();
    const rawValue = token.text.slice(separatorIndex + 1).trim();
    if (!key) {
      pushDiagnostic(
        diagnostics,
        "error",
        "invalid-property",
        "Property name cannot be empty.",
        lineNumber,
        token.column,
      );
      continue;
    }

    properties[key] = parseScalar(rawValue);
  }

  const subject = subjectParts.length > 0 ? subjectParts.join(" ") : null;
  if (subject && defaultSubjectKey && properties[defaultSubjectKey] === undefined) {
    properties[defaultSubjectKey] = subject;
  }

  if (directive === "project" && !properties.name && !subject) {
    properties.name = "Untitled mockup";
  }

  return {
    kind: directive,
    subject,
    properties,
    children: [],
    line: lineNumber,
    column: tokens[0]?.column ?? 1,
    indent: 0,
  };
}

function canAcceptChildren(node: DslAstNode): boolean {
  return CONTAINER_DIRECTIVES.has(node.kind);
}

export function parseDsl(source: string): DslParseResult {
  const diagnostics: DslDiagnostic[] = [];
  const roots: DslAstNode[] = [];
  const stack: Array<{ indent: number; node: DslAstNode | null }> = [{ indent: -1, node: null }];

  const normalizedSource = source.replace(/\r\n?/g, "\n");
  const lines = normalizedSource.split("\n");

  for (let index = 0; index < lines.length; index += 1) {
    const lineNumber = index + 1;
    const rawLine = lines[index] ?? "";
    const normalized = normalizeIndent(rawLine);
    if (!normalized) {
      pushDiagnostic(
        diagnostics,
        "error",
        "indentation",
        "Indentation must use full two-space steps.",
        lineNumber,
        1,
      );
      continue;
    }

    const { indent, content } = normalized;
    if (content.trim().length === 0 || content.trimStart().startsWith("#")) {
      continue;
    }

    let currentIndent = indent;
    while (stack.length > 1) {
      const top = stack[stack.length - 1]!;
      if (top.node?.kind === "project" && currentIndent === top.indent) {
        break;
      }

      if (currentIndent <= top.indent) {
        stack.pop();
        continue;
      }

      break;
    }

    if (currentIndent > stack[stack.length - 1]!.indent + 1) {
      pushDiagnostic(
        diagnostics,
        "error",
        "indentation",
        "Indentation jumped more than one level.",
        lineNumber,
        1,
      );
      currentIndent = stack[stack.length - 1]!.indent + 1;
    }

    const parent = stack[stack.length - 1]?.node;
    if (parent && !canAcceptChildren(parent)) {
      pushDiagnostic(
        diagnostics,
        "error",
        "invalid-nesting",
        `Directive "${parent.kind}" cannot contain child nodes.`,
        lineNumber,
        1,
      );
    }

    const node = parseLine(content, lineNumber, diagnostics);
    if (!node) {
      continue;
    }

    node.indent = currentIndent;
    if (parent) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }

    stack.push({ indent: currentIndent, node });
  }

  const projectRoots = roots.filter((node) => node.kind === "project");
  if (projectRoots.length > 1) {
    pushDiagnostic(
      diagnostics,
      "warning",
      "multiple-projects",
      "Multiple project directives were found. Only the first one is used for the document name.",
      projectRoots[1]!.line,
      projectRoots[1]!.column,
    );
  }

  const firstProject = projectRoots[0];
  const projectName =
    typeof firstProject?.properties.name === "string"
      ? firstProject.properties.name
      : firstProject?.subject ?? null;

  return {
    ast: {
      projectName,
      roots,
    },
    diagnostics,
  };
}
