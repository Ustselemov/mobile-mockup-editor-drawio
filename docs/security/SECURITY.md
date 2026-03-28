This project was generated with the assistance of Codex AI and prompted by Ustselemov.

# Security Notes

## Scope

- No backend, authentication, or remote storage is implemented.
- No secrets are required for local use.
- Configuration is limited to the client-side environment variables listed in [`.env.example`](../../.env.example).

## Safe local setup

- Keep local overrides in `.env`, which is ignored by git.
- Do not commit generated artifacts such as `dist/`, `test-results/`, logs, or `.tsbuildinfo` files.
- Treat imported `.drawio` and `.json` files as untrusted input.

## Input handling

- Imported Draw.io and JSON files are validated before they are accepted into the runtime model.
- Unsupported Draw.io tokens are surfaced as warnings or unsupported-node fallbacks instead of being silently trusted.
- Browser local storage is used for autosave/manual save flows and should be treated as user-controlled storage.

## Known limitations

- This is a local browser tool and does not claim production-grade security guarantees.
- There is no sandboxing for imported visual payloads beyond parser/model validation.
- Dependency and browser runtime updates still require human review before production-sensitive use.
