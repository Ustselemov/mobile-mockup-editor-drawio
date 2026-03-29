import { useMemo } from "react";

import { useEditorStore, useSelectedNode } from "@/core/store/editorStore";
import { getAbsolutePosition } from "@/lib/geometry/coords";
import { serializeDrawioXml } from "@/lib/drawio/serializeDrawio";
import { validateDocument } from "@/lib/drawio/validate";
import { DEFAULT_LAYOUT_CONFIG } from "@/lib/layout/config";
import type { EditorDocument, LayoutAlign, LayoutMode } from "@/lib/model/document";

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getParentChain(document: EditorDocument, nodeId: string) {
  const chain: string[] = [];
  let current = document.nodes[nodeId];

  while (current) {
    chain.unshift(current.id);
    if (current.parentId === "board") {
      chain.unshift("board");
      break;
    }
    current = document.nodes[current.parentId];
  }

  return chain;
}

function extractNodeXmlFragment(xml: string, nodeId: string): string {
  const expression = new RegExp(
    `<mxCell[^>]*id="(${escapeRegex(nodeId)}(?:__[^"]+)?)"[\\s\\S]*?<\\/mxCell>`,
    "g",
  );
  const matches = xml.match(expression);
  return matches?.join("\n\n") ?? "No fragment available";
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="inspector-field">
      <span>{label}</span>
      <input
        type="number"
        value={Number.isFinite(value) ? value : 0}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="inspector-field">
      <span>{label}</span>
      <input type="color" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function SelectField<TValue extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: TValue;
  options: { value: TValue; label: string }[];
  onChange: (value: TValue) => void;
}) {
  return (
    <label className="inspector-field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value as TValue)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function InspectorPanel() {
  const selectedNode = useSelectedNode();
  const document = useEditorStore((state) => state.document);
  const updateNode = useEditorStore((state) => state.updateNode);
  const reparentNode = useEditorStore((state) => state.reparentNode);
  const toggleNodeVisibility = useEditorStore((state) => state.toggleNodeVisibility);
  const toggleNodeLock = useEditorStore((state) => state.toggleNodeLock);
  const reorderNode = useEditorStore((state) => state.reorderNode);
  const activeTab = useEditorStore((state) => state.activeInspectorTab);
  const setActiveTab = useEditorStore((state) => state.setActiveInspectorTab);
  const validation = useMemo(() => validateDocument(document), [document]);
  const xmlPreview = useMemo(() => {
    try {
      return serializeDrawioXml(document);
    } catch (error) {
      return `Export error: ${error instanceof Error ? error.message : String(error)}`;
    }
  }, [document]);
  const absolutePosition = selectedNode
    ? getAbsolutePosition(document, selectedNode.id)
    : null;
  const parentChain = selectedNode ? getParentChain(document, selectedNode.id) : [];
  const selectedXmlFragment = selectedNode
    ? extractNodeXmlFragment(xmlPreview, selectedNode.id)
    : "No selection";
  const computedStyle = selectedNode
    ? {
        fillColor: selectedNode.fillColor,
        strokeColor: selectedNode.strokeColor,
        borderRadius: selectedNode.borderRadius,
        strokeWidth: selectedNode.strokeWidth,
        textStyle: "textStyle" in selectedNode ? selectedNode.textStyle : undefined,
        labelStyle: "labelStyle" in selectedNode ? selectedNode.labelStyle : undefined,
        valueStyle: "valueStyle" in selectedNode ? selectedNode.valueStyle : undefined,
      }
    : null;
  const layoutConfig =
    selectedNode && "children" in selectedNode
      ? {
          ...DEFAULT_LAYOUT_CONFIG,
          ...selectedNode.layout,
        }
      : null;
  const updateLayout = (patch: Partial<typeof DEFAULT_LAYOUT_CONFIG>) => {
    if (!selectedNode || !("children" in selectedNode)) {
      return;
    }

    updateNode(selectedNode.id, {
      layout: {
        ...DEFAULT_LAYOUT_CONFIG,
        ...selectedNode.layout,
        ...patch,
      },
    } as never);
  };

  return (
    <section className="inspector-panel">
      <header className="sidebar-header">
        <h2>Inspector</h2>
        <div className="segmented-tabs">
          <button
            type="button"
            className={activeTab === "properties" ? "is-active" : ""}
            onClick={() => setActiveTab("properties")}
          >
            Properties
          </button>
          <button
            type="button"
            className={activeTab === "debug" ? "is-active" : ""}
            onClick={() => setActiveTab("debug")}
          >
            Debug
          </button>
        </div>
      </header>
      {activeTab === "properties" ? (
        selectedNode ? (
          <div className="inspector-content">
            <div className="inspector-summary">
              <div className={`summary-pill${validation.errors.length > 0 ? " is-error" : " is-ok"}`}>
                {validation.errors.length} errors
              </div>
              <div className={`summary-pill${validation.warnings.length > 0 ? " is-warning" : ""}`}>
                {validation.warnings.length} warnings
              </div>
              <div className="summary-pill">
                Parent {selectedNode.parentId}
              </div>
            </div>
            {selectedNode.parentId !== "board" ? (
              <div className="inspector-parent-actions">
                <strong>Attached to {selectedNode.parentId}</strong>
                <button type="button" onClick={() => reparentNode(selectedNode.id, "board")}>
                  Move to board
                </button>
              </div>
            ) : null}
            <div className="inspector-grid">
              <NumberField label="X" value={selectedNode.x} onChange={(x) => updateNode(selectedNode.id, { x })} />
              <NumberField label="Y" value={selectedNode.y} onChange={(y) => updateNode(selectedNode.id, { y })} />
              <NumberField
                label="Width"
                value={selectedNode.width}
                onChange={(width) => updateNode(selectedNode.id, { width })}
              />
              <NumberField
                label="Height"
                value={selectedNode.height}
                onChange={(height) => updateNode(selectedNode.id, { height })}
              />
            </div>
            {layoutConfig ? (
              <div className="inspector-grid">
                <SelectField<LayoutMode>
                  label="Layout"
                  value={layoutConfig.mode}
                  options={[
                    { value: "absolute", label: "Absolute" },
                    { value: "vstack", label: "VStack" },
                    { value: "hstack", label: "HStack" },
                    { value: "grid", label: "Grid" },
                  ]}
                  onChange={(mode) => updateLayout({ mode })}
                />
                <SelectField<LayoutAlign>
                  label="Align"
                  value={layoutConfig.align}
                  options={[
                    { value: "start", label: "Start" },
                    { value: "center", label: "Center" },
                    { value: "end", label: "End" },
                    { value: "stretch", label: "Stretch" },
                  ]}
                  onChange={(align) => updateLayout({ align })}
                />
                <NumberField label="Gap" value={layoutConfig.gap} onChange={(gap) => updateLayout({ gap })} />
                <NumberField
                  label="Padding"
                  value={layoutConfig.padding}
                  onChange={(padding) => updateLayout({ padding })}
                />
                {layoutConfig.mode === "grid" ? (
                  <NumberField
                    label="Columns"
                    value={layoutConfig.gridColumns ?? 2}
                    onChange={(gridColumns) => updateLayout({ gridColumns })}
                  />
                ) : null}
              </div>
            ) : null}
            {"text" in selectedNode && (
              <label className="inspector-field">
                <span>Text</span>
                <textarea
                  rows={3}
                  value={selectedNode.text}
                  onChange={(event) => updateNode(selectedNode.id, { text: event.target.value } as never)}
                />
              </label>
            )}
            {"title" in selectedNode && (
              <label className="inspector-field">
                <span>Title</span>
                <input
                  type="text"
                  value={selectedNode.title ?? ""}
                  onChange={(event) => updateNode(selectedNode.id, { title: event.target.value } as never)}
                />
              </label>
            )}
            {"label" in selectedNode && (
              <label className="inspector-field">
                <span>Label</span>
                <input
                  type="text"
                  value={selectedNode.label}
                  onChange={(event) => updateNode(selectedNode.id, { label: event.target.value } as never)}
                />
              </label>
            )}
            {"value" in selectedNode && (
              <label className="inspector-field">
                <span>Value</span>
                <textarea
                  rows={2}
                  value={selectedNode.value}
                  onChange={(event) => updateNode(selectedNode.id, { value: event.target.value } as never)}
                />
              </label>
            )}
            {"body" in selectedNode && (
              <label className="inspector-field">
                <span>Body</span>
                <textarea
                  rows={3}
                  value={selectedNode.body}
                  onChange={(event) => updateNode(selectedNode.id, { body: event.target.value } as never)}
                />
              </label>
            )}
            {"items" in selectedNode && (
              <>
                <label className="inspector-field">
                  <span>Items</span>
                  <input
                    type="text"
                    value={selectedNode.items.join(", ")}
                    onChange={(event) =>
                      updateNode(selectedNode.id, {
                        items: event.target.value
                          .split(",")
                          .map((item) => item.trim())
                          .filter(Boolean),
                      } as never)
                    }
                  />
                </label>
                <NumberField
                  label="Active"
                  value={selectedNode.activeIndex}
                  onChange={(activeIndex) => updateNode(selectedNode.id, { activeIndex } as never)}
                />
              </>
            )}
            {"checked" in selectedNode && (
              <label className="inspector-checkbox">
                <input
                  type="checkbox"
                  checked={selectedNode.checked}
                  onChange={(event) => updateNode(selectedNode.id, { checked: event.target.checked } as never)}
                />
                <span>Checked</span>
              </label>
            )}
            {"textStyle" in selectedNode && (
              <ColorField
                label="Text color"
                value={selectedNode.textStyle.color}
                onChange={(color) =>
                  updateNode(selectedNode.id, {
                    textStyle: {
                      ...selectedNode.textStyle,
                      color,
                    },
                  } as never)
                }
              />
            )}
            {"labelStyle" in selectedNode && (
              <div className="inspector-grid">
                <ColorField
                  label="Label color"
                  value={selectedNode.labelStyle.color}
                  onChange={(color) =>
                    updateNode(selectedNode.id, {
                      labelStyle: {
                        ...selectedNode.labelStyle,
                        color,
                      },
                    } as never)
                  }
                />
                <ColorField
                  label="Value color"
                  value={selectedNode.valueStyle.color}
                  onChange={(color) =>
                    updateNode(selectedNode.id, {
                      valueStyle: {
                        ...selectedNode.valueStyle,
                        color,
                      },
                    } as never)
                  }
                />
              </div>
            )}
            {"bodyStyle" in selectedNode && (
              <div className="inspector-grid">
                <ColorField
                  label="Title color"
                  value={selectedNode.titleStyle.color}
                  onChange={(color) =>
                    updateNode(selectedNode.id, {
                      titleStyle: {
                        ...selectedNode.titleStyle,
                        color,
                      },
                    } as never)
                  }
                />
                <ColorField
                  label="Body color"
                  value={selectedNode.bodyStyle.color}
                  onChange={(color) =>
                    updateNode(selectedNode.id, {
                      bodyStyle: {
                        ...selectedNode.bodyStyle,
                        color,
                      },
                    } as never)
                  }
                />
              </div>
            )}
            <div className="inspector-grid">
              <ColorField
                label="Fill"
                value={selectedNode.fillColor ?? "#ffffff"}
                onChange={(fillColor) => updateNode(selectedNode.id, { fillColor })}
              />
              <ColorField
                label="Stroke"
                value={selectedNode.strokeColor ?? "#1c2a30"}
                onChange={(strokeColor) => updateNode(selectedNode.id, { strokeColor })}
              />
              <NumberField
                label="Radius"
                value={selectedNode.borderRadius ?? 0}
                onChange={(borderRadius) => updateNode(selectedNode.id, { borderRadius })}
              />
            </div>
            <div className="inspector-actions">
              <button type="button" onClick={() => toggleNodeVisibility(selectedNode.id)}>
                {selectedNode.visible ? "Hide node" : "Show node"}
              </button>
              <button type="button" onClick={() => toggleNodeLock(selectedNode.id)}>
                {selectedNode.locked ? "Unlock node" : "Lock node"}
              </button>
              <button type="button" onClick={() => reorderNode(selectedNode.id, "backward")}>
                Send backward
              </button>
              <button type="button" onClick={() => reorderNode(selectedNode.id, "forward")}>
                Bring forward
              </button>
            </div>
          </div>
        ) : (
          <div className="empty-state">
            Select one node to edit its properties.
            <div className="empty-state-meta">
              Validation: {validation.errors.length} errors, {validation.warnings.length} warnings
            </div>
          </div>
        )
      ) : (
        <div className="inspector-content">
          <div className="debug-block">
            <h3>Selected node JSON</h3>
            <pre>{selectedNode ? JSON.stringify(selectedNode, null, 2) : "No selection"}</pre>
          </div>
          <div className="debug-block">
            <h3>Selected fragment XML</h3>
            <pre>{selectedXmlFragment}</pre>
          </div>
          <div className="debug-block">
            <h3>Parent chain and coordinates</h3>
            <pre>
              {JSON.stringify(
                selectedNode
                  ? {
                      parentChain,
                      relative: {
                        x: selectedNode.x,
                        y: selectedNode.y,
                        width: selectedNode.width,
                        height: selectedNode.height,
                      },
                      absolute: absolutePosition
                        ? {
                            x: absolutePosition.x,
                            y: absolutePosition.y,
                          }
                        : null,
                    }
                  : null,
                null,
                2,
              )}
            </pre>
          </div>
          <div className="debug-block">
            <h3>Computed style</h3>
            <pre>{JSON.stringify(computedStyle, null, 2)}</pre>
          </div>
          <div className="debug-block">
            <h3>Validation</h3>
            <pre>{JSON.stringify(validation, null, 2)}</pre>
          </div>
          <div className="debug-block">
            <h3>Unsupported import tokens</h3>
            <pre>{JSON.stringify(document.meta.unsupportedTokens, null, 2)}</pre>
          </div>
          <div className="debug-block">
            <h3>Draw.io XML</h3>
            <pre>{xmlPreview}</pre>
          </div>
        </div>
      )}
    </section>
  );
}
