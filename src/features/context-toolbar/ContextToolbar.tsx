type ContextToolbarProps = {
  left: number;
  top: number;
  locked: boolean;
  onDuplicate: () => void;
  onDelete: () => void;
  onToggleLock: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
};

function ActionIcon({
  name,
}: {
  name: "duplicate" | "delete" | "lock" | "unlock" | "forward" | "backward";
}) {
  const commonProps = {
    viewBox: "0 0 20 20",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (name) {
    case "duplicate":
      return (
        <svg {...commonProps}>
          <rect x="6.5" y="6.5" width="8" height="8" rx="2" />
          <path d="M5 11.5h-1A1.5 1.5 0 0 1 2.5 10V4A1.5 1.5 0 0 1 4 2.5h6A1.5 1.5 0 0 1 11.5 4v1" />
        </svg>
      );
    case "delete":
      return (
        <svg {...commonProps}>
          <path d="M4.5 5.5h11" />
          <path d="M7.5 5.5v-1A1.5 1.5 0 0 1 9 3h2a1.5 1.5 0 0 1 1.5 1.5v1" />
          <path d="m6.5 5.5.7 9a1.5 1.5 0 0 0 1.5 1.4h2.6a1.5 1.5 0 0 0 1.5-1.4l.7-9" />
        </svg>
      );
    case "lock":
      return (
        <svg {...commonProps}>
          <rect x="5" y="9" width="10" height="7" rx="2" />
          <path d="M7.5 9V7a2.5 2.5 0 1 1 5 0v2" />
        </svg>
      );
    case "unlock":
      return (
        <svg {...commonProps}>
          <rect x="5" y="9" width="10" height="7" rx="2" />
          <path d="M12.5 9V7a2.5 2.5 0 1 0-5 0" />
        </svg>
      );
    case "forward":
      return (
        <svg {...commonProps}>
          <path d="M10 4.5v11" />
          <path d="m6.5 8 3.5-3.5L13.5 8" />
        </svg>
      );
    case "backward":
      return (
        <svg {...commonProps}>
          <path d="M10 4.5v11" />
          <path d="m6.5 12 3.5 3.5 3.5-3.5" />
        </svg>
      );
  }
}

function ActionButton({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: "duplicate" | "delete" | "lock" | "unlock" | "forward" | "backward";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="context-toolbar-button"
      aria-label={label}
      title={label}
      onClick={onClick}
    >
      <ActionIcon name={icon} />
    </button>
  );
}

export function ContextToolbar({
  left,
  top,
  locked,
  onDuplicate,
  onDelete,
  onToggleLock,
  onBringForward,
  onSendBackward,
}: ContextToolbarProps) {
  return (
    <div
      className="context-toolbar"
      style={{ left, top }}
      role="toolbar"
      aria-label="Object quick actions"
    >
      <ActionButton label="Duplicate" icon="duplicate" onClick={onDuplicate} />
      <ActionButton label={locked ? "Unlock" : "Lock"} icon={locked ? "unlock" : "lock"} onClick={onToggleLock} />
      <ActionButton label="Bring forward" icon="forward" onClick={onBringForward} />
      <ActionButton label="Send backward" icon="backward" onClick={onSendBackward} />
      <div className="context-toolbar-divider" />
      <ActionButton label="Delete" icon="delete" onClick={onDelete} />
    </div>
  );
}
