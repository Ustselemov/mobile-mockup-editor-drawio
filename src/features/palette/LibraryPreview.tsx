import type { CSSProperties } from "react";

import type { PaletteItemType } from "@/lib/model/document";

export function LibraryPreview({
  type,
  fillColor,
  strokeColor,
  text,
  variant,
}: {
  type: PaletteItemType;
  fillColor?: string;
  strokeColor?: string;
  text?: string;
  variant?: string;
}) {
  const fill = fillColor ?? "#f4f8f7";
  const stroke = strokeColor ?? "#c9d7d8";
  const tint = fillColor ?? "#0f766e";
  const badgeText = text ?? "Label";

  switch (type) {
    case "screen":
      return (
        <div className={`library-preview is-screen${variant ? ` is-${variant}` : ""}`}>
          {variant === "desktop" ? (
            <div className="library-preview-desktop">
              <div className="library-preview-browser-bar" />
              <div className="library-preview-desktop-grid">
                <div />
                <div />
                <div />
              </div>
            </div>
          ) : variant === "generic" ? (
            <div className="library-preview-generic-frame">
              <div className="library-preview-line is-strong" />
              <div className="library-preview-line" />
            </div>
          ) : (
            <div className="library-preview-phone">
              <div className="library-preview-phone-notch" />
              <div className="library-preview-phone-appbar" />
              <div className="library-preview-phone-card" />
              <div className="library-preview-phone-row" />
              <div className="library-preview-phone-row is-short" />
            </div>
          )}
        </div>
      );
    case "flowLane":
      return (
        <div className="library-preview is-flow-lane">
          <div className="library-preview-lane-head" />
          <div className="library-preview-lane-body">
            <div />
            <div />
          </div>
        </div>
      );
    case "container":
      return (
        <div
          className={`library-preview is-container${variant ? ` is-${variant}` : ""}`}
          style={
            {
              "--preview-fill": fill,
              "--preview-stroke": stroke,
            } as CSSProperties
          }
        >
          {variant === "diamond" ? (
            <div className="library-preview-diamond" />
          ) : variant === "circle" ? (
            <div className="library-preview-circle" />
          ) : variant === "database" ? (
            <div className="library-preview-database">
              <div />
              <div />
              <div />
            </div>
          ) : variant === "sticky" ? (
            <div className="library-preview-sticky">
              <div className="library-preview-sticky-pin" />
              <div className="library-preview-line is-strong" />
              <div className="library-preview-line" />
              <div className="library-preview-line is-short" />
            </div>
          ) : (
            <div className="library-preview-card">
              <div className="library-preview-card-kicker" />
              <div className="library-preview-line is-strong" />
              <div className="library-preview-line" />
              <div className="library-preview-line is-short" />
            </div>
          )}
        </div>
      );
    case "field":
      return (
        <div className="library-preview is-field">
          <div className="library-preview-label" />
          <div className="library-preview-input" />
          <div className="library-preview-field-trailing" />
        </div>
      );
    case "segmentedControl":
      return (
        <div className="library-preview is-segmented">
          <div className="library-preview-segment is-active">A</div>
          <div className="library-preview-segment">B</div>
        </div>
      );
    case "badge":
      return (
        <div className="library-preview is-badge">
          <div
            className="library-preview-pill"
            style={
              {
                "--preview-fill": fill,
                "--preview-stroke": stroke,
                "--preview-text": tint,
              } as CSSProperties
            }
          >
            {badgeText}
          </div>
        </div>
      );
    case "banner":
      return (
        <div className="library-preview is-banner">
          <div
            className="library-preview-banner"
            style={
              {
                "--preview-fill": fill,
                "--preview-stroke": stroke,
              } as CSSProperties
            }
          >
            <div className="library-preview-line is-strong" />
            <div className="library-preview-line" />
          </div>
        </div>
      );
    case "text":
      return (
        <div className="library-preview is-text">
          <div className="library-preview-line is-strong" />
          <div className="library-preview-line" />
          <div className="library-preview-line is-short" />
        </div>
      );
    case "button":
      return (
        <div className="library-preview is-button">
          <div
            className="library-preview-button"
            style={
              {
                "--preview-fill": fill,
                "--preview-stroke": stroke,
              } as CSSProperties
            }
          >
            {text ?? "Continue"}
          </div>
        </div>
      );
    case "checkbox":
      return (
        <div className="library-preview is-checkbox">
          <div className="library-preview-check" />
          <div className="library-preview-checkbox-copy">
            <div className="library-preview-line is-short" />
            <div className="library-preview-line" />
          </div>
        </div>
      );
  }
}
