import { useMemo } from "react";

import { useEditorStore } from "@/core/store/editorStore";
import {
  getTemplateInsertionTargetLabel,
  insertTemplateDefinition,
  templatePackItems,
} from "@/core/demo/templatePacks";

function TemplateCard({
  label,
  description,
  scope,
  onClick,
}: {
  label: string;
  description: string;
  scope: "screen" | "section";
  onClick: () => void;
}) {
  return (
    <button type="button" className="template-card" onClick={onClick}>
      <span className={`template-kind is-${scope}`}>{scope}</span>
      <strong>{label}</strong>
      <span>{description}</span>
    </button>
  );
}

export function TemplatesPanel() {
  const document = useEditorStore((state) => state.document);
  const selection = useEditorStore((state) => state.selection);
  const addNode = useEditorStore((state) => state.addNode);
  const updateNode = useEditorStore((state) => state.updateNode);
  const addTemplateScreen = useEditorStore((state) => state.addTemplateScreen);
  const setSelection = useEditorStore((state) => state.setSelection);
  const setDebugMessage = useEditorStore((state) => state.setDebugMessage);

  const targetLabel = useMemo(
    () => getTemplateInsertionTargetLabel(document, selection),
    [document, selection],
  );

  return (
    <section className="sidebar-section">
      <header className="sidebar-header">
        <div>
          <h2>Templates</h2>
          <span className="sidebar-meta">Insert editable screen or section packs</span>
        </div>
        <span className="sidebar-meta">{targetLabel}</span>
      </header>
      <div className="template-target-note">
        Screen templates land on the board. Section templates use the selected container or screen.
      </div>
      <div className="template-pack-list">
        {templatePackItems.map((pack) => (
          <article key={pack.id} className="template-pack">
            <header className="template-pack-header">
              <div>
                <h3>{pack.label}</h3>
                <p>{pack.description}</p>
              </div>
              <span className="template-pack-accent" style={{ backgroundColor: pack.accent }} />
            </header>
            <div className="template-grid">
              {pack.templates.map((template) => (
                <TemplateCard
                  key={template.id}
                  label={template.label}
                  description={template.description}
                  scope={template.scope}
                  onClick={() => {
                    const createdId =
                      template.scope === "screen"
                        ? template.screenTemplateId
                          ? addTemplateScreen(template.screenTemplateId)
                          : null
                        : insertTemplateDefinition(template, {
                            document,
                            selection,
                            addNode,
                            updateNode,
                            setSelection,
                            addTemplateScreen,
                          });

                    if (!createdId) {
                      setDebugMessage(`Failed to insert template: ${template.label}.`);
                    }
                  }}
                />
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
