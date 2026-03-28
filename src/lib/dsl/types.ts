import type { EditorDocument } from "@/lib/model/document";

export type DslSeverity = "error" | "warning";

export type DslDiagnostic = {
  code: string;
  severity: DslSeverity;
  message: string;
  line: number;
  column: number;
};

export type DslValue = string | number | boolean | string[] | number[];

export type DslNodeKind =
  | "project"
  | "screen"
  | "section"
  | "container"
  | "text"
  | "button"
  | "field"
  | "badge"
  | "checkbox"
  | "segmentedControl"
  | "chatBubble"
  | "unsupported";

export type DslAstNode = {
  kind: DslNodeKind;
  subject: string | null;
  properties: Record<string, DslValue>;
  children: DslAstNode[];
  line: number;
  column: number;
  indent: number;
};

export type DslAstDocument = {
  projectName: string | null;
  roots: DslAstNode[];
};

export type DslParseResult = {
  ast: DslAstDocument | null;
  diagnostics: DslDiagnostic[];
};

export type DslCompileResult = {
  document: EditorDocument | null;
  ast: DslAstDocument | null;
  diagnostics: DslDiagnostic[];
};

