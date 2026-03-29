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
    <li className={`dsl-diagnostic is-${severity}`}>
      <strong>{severity.toUpperCase()}</strong>
      <span>{message}</span>
      <span className="dsl-diagnostic-meta">
        Line {line}, column {column}
      </span>
    </li>
  );
}

export function DslPanel({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
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
    <section className="dsl-dock" aria-label="DSL panel" hidden={!isOpen}>
      <div className="dsl-panel">
        <header className="dsl-panel-header">
          <div>
            <div className="dsl-panel-eyebrow">DSL v1</div>
            <h2>Screen compiler</h2>
          </div>
          <div className="dsl-panel-actions">
            {dslExampleSources.map((example) => (
              <button
                key={example.id}
                type="button"
                className={`dsl-example-button${
                  selectedExampleId === example.id ? " is-active" : ""
                }`}
                onClick={() => {
                  setSource(example.source);
                  setSelectedExampleId(example.id);
                }}
              >
                {example.label}
              </button>
            ))}
            <button type="button" onClick={onClose}>
              Close
            </button>
          </div>
        </header>

        <div className="dsl-panel-grid">
          <div className="dsl-panel-editor">
            <label className="dsl-panel-label">
              <span>DSL source</span>
              <textarea
                className="dsl-panel-textarea"
                value={source}
                onChange={(event) => setSource(event.target.value)}
                spellCheck={false}
              />
            </label>
            <div className="dsl-panel-footer">
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
              <span className="dsl-panel-meta">
                {screenCount} screen(s), {nodeCount} node(s)
              </span>
            </div>
          </div>

          <aside className="dsl-panel-sidebar">
            <div className="dsl-panel-stack">
              <div className="dsl-panel-subtitle">Diagnostics</div>
              <div className="dsl-panel-muted">
                {fatalErrors.length} error(s), {warnings.length} warning(s)
              </div>
              <ul className="dsl-panel-diagnostics">
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
                  <li className="dsl-panel-empty">No diagnostics.</li>
                )}
              </ul>
            </div>

            <div className="dsl-panel-stack">
              <div className="dsl-panel-subtitle">Supported slice</div>
              <div className="dsl-panel-supported">
                <div>screen, section/container, text, button, field, badge, checkbox</div>
                <div>layout:vstack | hstack | absolute</div>
                <div>Arrays like `items:[&quot;A&quot;, &quot;B&quot;]` and booleans like `checked:true`</div>
                <div>Unsupported directives are reported with line numbers.</div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
