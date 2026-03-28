# Contributing

This project was generated with the assistance of Codex AI and prompted by Ustselemov.

## Development flow

1. Install dependencies with `npm install`.
2. Start the dev server with `npm run dev`.
3. Run `npm test` during implementation work.
4. Run `npm run test:e2e` for interaction, board, or drag-and-drop changes.
5. Run `npm run build` for release-facing changes.
6. Prefer `npm run verify` before submitting substantial changes.

## Standards

- Keep the internal JSON model and Draw.io mapping in sync.
- Keep repository documentation links relative so they remain valid outside the local machine.
- Prefer small, explicit modules over generic abstractions.
- Do not hardcode secrets or environment-specific values.
- Preserve AI attribution and existing licensing notices.
