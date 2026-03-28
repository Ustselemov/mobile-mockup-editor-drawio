import { useMemo, useState } from "react";

import { useEditorStore } from "@/core/store/editorStore";
import { compileDsl, dslExampleSources, getDefaultDslSource } from "@/lib/dsl";

function DiagnosticRow({
  severity,
  message,
  line,
  column,
}: {
  severity: "error" | "warning";
  message: string;
  line: number;
  column: number;
}) {
  return (
    <li
      style={{
        padding: "8px 10px",
        borderRadius: 10,
        background: severity === "error" ? "#fff4f4" : "#fff8e8",
        border: `1px solid ${severity === "error" ? "#f1b5b5" : "#e4c777"}`,
        color: "#1f2b2d",
        fontSize: 12,
        lineHeight: 1.4,
      }}
    >
      <strong style={{ display: "block", marginBottom: 2 }}>{severity.toUpperCase()}</strong>
      <span>{message}</span>
      <span style={{ display: "block", marginTop: 2, color: "#66757a" }}>
        Line {line}, column {column}
      </span>
    </li>
  );
}

export function DslPanel() {
  const loadJson = useEditorStore((state) => state.loadJson);
  const setDebugMessage = useEditorStore((state) => state.setDebugMessage);
  const [source, setSource] = useState(getDefaultDslSource);
  const [selectedExampleId, setSelectedExampleId] = useState<string>(
    dslExampleSources[0]?.id ?? "product-page",
  );
  const compilation = useMemo(() => compileDsl(source), [source]);
  const screenCount = compilation.document?.rootIds.length ?? 0;
  const nodeCount = compilation.document ? Object.keys(compilation.document.nodes).length : 0;
  const fatalErrors = compilation.diagnostics.filter((diagnostic) => diagnostic.severity === "error");
  const warnings = compilation.diagnostics.filter((diagnostic) => diagnostic.severity === "warning");

  const handleGenerate = () => {
    if (!compilation.document) {
      setDebugMessage("Resolve DSL errors before generating a document.");
      return;
    }

    try {
      loadJson(JSON.stringify(compilation.document));
      setDebugMessage(
        `Generated DSL document with ${screenCount} screen(s) and ${nodeCount} node(s).`,
      );
    } catch (error) {
      setDebugMessage(error instanceof Error ? error.message : "Failed to load generated DSL.");
    }
  };

  return (
    <section
      aria-label="DSL panel"
      style={{
        margin: "0 20px 20px",
        border: "1px solid rgba(28, 42, 48, 0.16)",
        borderRadius: 18,
        background:
          "linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(244, 248, 247, 0.98))",
        boxShadow: "0 18px 36px rgba(31, 43, 45, 0.08)",
        overflow: "hidden",
      }}
    >
      <header
        style={{
          padding: "14px 16px",
          borderBottom: "1px solid rgba(28, 42, 48, 0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 12,
              color: "#66757a",
              textTransform: "uppercase",
              letterSpacing: 0.8,
            }}
          >
            DSL v1
          </div>
          <h2 style={{ margin: "4px 0 0", fontSize: 18 }}>Lower panel compiler</h2>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
          {dslExampleSources.map((example) => (
            <button
              key={example.id}
              type="button"
              onClick={() => {
                setSource(example.source);
                setSelectedExampleId(example.id);
              }}
              style={{
                borderRadius: 999,
                border:
                  selectedExampleId === example.id ? "1px solid #0f766e" : "1px solid #d7e1e3",
                background: selectedExampleId === example.id ? "#dff4f0" : "#ffffff",
                padding: "7px 12px",
              }}
            >
              {example.label}
            </button>
          ))}
        </div>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.4fr) minmax(320px, 0.8fr)",
          gap: 0,
        }}
      >
        <div style={{ padding: 16 }}>
          <label style={{ display: "grid", gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#1f2b2d" }}>DSL source</span>
            <textarea
              value={source}
              onChange={(event) => setSource(event.target.value)}
              spellCheck={false}
              style={{
                width: "100%",
                minHeight: 320,
                resize: "vertical",
                borderRadius: 14,
                border: "1px solid #d7e1e3",
                padding: 14,
                fontFamily:
                  'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace',
                fontSize: 13,
                lineHeight: 1.55,
                background: "#fbfcfc",
                color: "#1f2b2d",
              }}
            />
          </label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
            <button
              type="button"
              className="toolbar-primary"
              onClick={handleGenerate}
              disabled={fatalErrors.length > 0}
            >
              Generate screen
            </button>
            <button type="button" onClick={() => setSource(getDefaultDslSource())}>
              Reset example
            </button>
            <span style={{ alignSelf: "center", color: "#66757a", fontSize: 13 }}>
              {screenCount} screen(s), {nodeCount} node(s)
            </span>
          </div>
        </div>

        <div
          style={{
            borderLeft: "1px solid rgba(28, 42, 48, 0.12)",
            padding: 16,
            display: "grid",
            gap: 14,
            alignContent: "start",
          }}
        >
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Diagnostics</div>
            <div style={{ display: "grid", gap: 8 }}>
              <div style={{ fontSize: 12, color: "#66757a" }}>
                {fatalErrors.length} error(s), {warnings.length} warning(s)
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8 }}>
                {compilation.diagnostics.length > 0 ? (
                  compilation.diagnostics.map((diagnostic, index) => (
                    <DiagnosticRow
                      key={`${diagnostic.code}-${diagnostic.line}-${diagnostic.column}-${index}`}
                      severity={diagnostic.severity}
                      message={diagnostic.message}
                      line={diagnostic.line}
                      column={diagnostic.column}
                    />
                  ))
                ) : (
                  <li
                    style={{
                      padding: "10px 12px",
                      borderRadius: 10,
                      border: "1px solid #d7e1e3",
                      background: "#f7fafb",
                      color: "#4b5b61",
                      fontSize: 12,
                    }}
                  >
                    No diagnostics.
                  </li>
                )}
              </ul>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Supported slice</div>
            <div style={{ display: "grid", gap: 6, color: "#4b5b61", fontSize: 13, lineHeight: 1.45 }}>
              <div>screen, section/container, text, button, field, badge, checkbox</div>
              <div>layout:vstack | hstack | absolute</div>
              <div>Arrays like `items:["A", "B"]` and booleans like `checked:true`</div>
              <div>Unsupported directives are reported with line numbers.</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
