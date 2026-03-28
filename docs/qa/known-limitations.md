# Known Limitations

This document was generated with the assistance of Codex AI and prompted by Ustselemov.

## Current limitations

- no variant system or batch generation exists yet
- current layout engine covers `absolute`, `vstack`, `hstack`, and `grid`, but not richer constraint systems
- component catalog is still narrower than the MVP3 target
- current runtime DSL parser/compiler supports a useful MVP slice, but not the full component grammar shown in the broader MVP3 examples
- template packs cover the target app families, but not the full per-domain template volume described in the MVP3 spec
- current UI shell does not yet expose the full MVP3 sidebar and inspector tab surface
- current model is not yet the full `ProjectModel`
- current Draw.io subset does not yet include a dedicated `CommentCloud` / `shape=cloud` implementation
- no minimap is implemented
- no visual regression baseline is stored in the repository
- Draw.io fidelity is limited to the current supported subset

## Accepted constraints

- SVG remains the renderer because it keeps debugging and Draw.io mapping simple
- the current normalized editor model is preserved and extended instead of replaced
- MVP3 continues by hardening variants, diagnostics, and broader component/template depth on top of the current editor, DSL, and template baseline
