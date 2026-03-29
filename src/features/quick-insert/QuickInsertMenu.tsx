import { LibraryPreview } from "@/features/palette/LibraryPreview";
import type { PaletteItemType } from "@/lib/model/document";

export type QuickInsertItem = {
  id: string;
  label: string;
  description: string;
  type: PaletteItemType;
  fillColor?: string;
  strokeColor?: string;
  text?: string;
  onSelect: () => void;
};

export function QuickInsertMenu({
  open,
  left,
  top,
  items,
  onToggle,
}: {
  open: boolean;
  left: number;
  top: number;
  items: QuickInsertItem[];
  onToggle: () => void;
}) {
  return (
    <div className={`quick-insert${open ? " is-open" : ""}`} style={{ left, top }}>
      <button
        type="button"
        className="quick-insert-trigger"
        aria-label={open ? "Close quick insert" : "Open quick insert"}
        title={open ? "Close quick insert" : "Quick insert"}
        onClick={onToggle}
      >
        <span />
        <span />
      </button>
      {open ? (
        <div className="quick-insert-menu">
          <header className="quick-insert-header">
            <strong>Quick insert</strong>
            <span>Visual shortcuts for the active screen or container.</span>
          </header>
          <div className="quick-insert-grid">
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                className="quick-insert-card"
                onClick={item.onSelect}
              >
                <LibraryPreview
                  type={item.type}
                  fillColor={item.fillColor}
                  strokeColor={item.strokeColor}
                  text={item.text}
                />
                <div className="quick-insert-copy">
                  <strong>{item.label}</strong>
                  <span>{item.description}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
