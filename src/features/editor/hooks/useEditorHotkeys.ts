import { useEffect, useState } from "react";

import { useEditorStore } from "@/core/store/editorStore";

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const tagName = target.tagName.toLowerCase();
  return (
    tagName === "input" ||
    tagName === "textarea" ||
    tagName === "select" ||
    target.isContentEditable
  );
}

export function useEditorHotkeys() {
  const [spacePressed, setSpacePressed] = useState(false);
  const selection = useEditorStore((state) => state.selection);
  const deleteSelection = useEditorStore((state) => state.deleteSelection);
  const duplicateSelection = useEditorStore((state) => state.duplicateSelection);
  const copySelection = useEditorStore((state) => state.copySelection);
  const pasteClipboard = useEditorStore((state) => state.pasteClipboard);
  const undo = useEditorStore((state) => state.undo);
  const redo = useEditorStore((state) => state.redo);
  const clearSelection = useEditorStore((state) => state.clearSelection);
  const nudgeSelection = useEditorStore((state) => state.nudgeSelection);

  useEffect(() => {
    const handleBlur = () => setSpacePressed(false);
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space" && !isEditableTarget(event.target)) {
        setSpacePressed(true);
        event.preventDefault();
      }

      if (isEditableTarget(event.target)) {
        return;
      }

      const modifier = event.ctrlKey || event.metaKey;

      if ((event.key === "Delete" || event.key === "Backspace") && selection[0]) {
        deleteSelection();
        event.preventDefault();
        return;
      }

      if (modifier && event.key.toLowerCase() === "d") {
        duplicateSelection();
        event.preventDefault();
        return;
      }

      if (modifier && event.key.toLowerCase() === "c") {
        copySelection();
        event.preventDefault();
        return;
      }

      if (modifier && event.key.toLowerCase() === "v") {
        pasteClipboard();
        event.preventDefault();
        return;
      }

      if (modifier && event.key.toLowerCase() === "z") {
        if (event.shiftKey) {
          redo();
        } else {
          undo();
        }
        event.preventDefault();
        return;
      }

      if (event.key === "Escape") {
        clearSelection();
        event.preventDefault();
        return;
      }

      const distance = event.shiftKey ? 10 : 1;
      if (event.key === "ArrowLeft") {
        nudgeSelection(-distance, 0);
        event.preventDefault();
      }
      if (event.key === "ArrowRight") {
        nudgeSelection(distance, 0);
        event.preventDefault();
      }
      if (event.key === "ArrowUp") {
        nudgeSelection(0, -distance);
        event.preventDefault();
      }
      if (event.key === "ArrowDown") {
        nudgeSelection(0, distance);
        event.preventDefault();
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        setSpacePressed(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
    };
  }, [
    clearSelection,
    copySelection,
    deleteSelection,
    duplicateSelection,
    nudgeSelection,
    pasteClipboard,
    redo,
    selection,
    undo,
  ]);

  return { spacePressed };
}
