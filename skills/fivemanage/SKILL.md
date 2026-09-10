---
name: fivemanage
description: "Trigger: Fivemanage, fmsdk, takeImage, takeServerImage, uploadImage, Log, Info/Warn/Error, player screenshots, logs dashboard. Install and use the Fivemanage SDK for images and centralized logs."
license: MIT
metadata:
  author: germanfndez
  version: "1.0.0"
---

# Fivemanage SDK

Screenshots, image uploads and centralized logs for FiveM through `exports.fmsdk`.

## Activation Contract

Load this skill when the user installs or configures the Fivemanage SDK, captures or uploads player screenshots, sends logs to the Fivemanage dashboard, or calls any `exports.fmsdk` function in Lua or JavaScript.

## Hard Rules

- The resource folder must be named `fmsdk` and sit directly in `resources/`; category folders are not supported.
- `screenshot-basic` is required for `takeImage` / `takeServerImage` and must `ensure` BEFORE `fmsdk` in `server.cfg`.
- API keys are ConVars in `server.cfg` (`FIVEMANAGE_MEDIA_API_KEY`, `FIVEMANAGE_LOGS_API_KEY`), never in `config.json`. Set only the keys for the features used.
- `takeImage` is CLIENT-side; `takeServerImage(playerSource, ...)` and `uploadImage(buffer, ...)` are SERVER-side.
- `Log(dataset, level, message, metadata)` is the primary log export; `Info/Warn/Error(dataset, message, metadata)` are fixed-level shorthands. `LogMessage` is legacy.
- Include `playerSource` / `targetSource` in metadata so the SDK attaches player identifiers automatically.
- Never expose API tokens to NUI; use presigned URLs for client-side uploads.

## Decision Gates

| Need | Call |
|---|---|
| Screenshot from the player's own client | `exports.fmsdk:takeImage({ ... })` |
| Screenshot of a player from the server | `exports.fmsdk:takeServerImage(playerSource, { ... })` |
| Upload an existing image file/buffer | `exports.fmsdk:uploadImage(buffer, { ... })` |
| Log with explicit level | `exports.fmsdk:Log(dataset, level, message, metadata)` |
| Quick log | `exports.fmsdk:Info/Warn/Error(dataset, message, metadata)` |
| Automatic player/chat/resource logs | `config.json` inside `fmsdk` |

## Execution Steps

1. Verify install order and ConVars (read rules/installation.md).
2. Pick the side and export from Decision Gates.
3. Attach metadata (`name`, `description`, `playerSource`) so entries are searchable.
4. Choose a dataset per concern (`economy`, `anticheat`, `admin_actions`).
5. Enable automatic events in `config.json` when useful (read rules/configuration.md).

## Output Contract

Return the `server.cfg` lines when installing, then runnable Lua or JS using `exports.fmsdk` with the side explicit and metadata included.

## References

- rules/installation.md — download, folder placement, server.cfg order, API keys.
- rules/images.md — takeImage, takeServerImage, uploadImage, metadata.
- rules/logs.md — Log, Info/Warn/Error, LogMessage, datasets, identifiers.
- rules/configuration.md — config.json, automatic events, presigned URLs.
- rules/reference-links.md — official docs and SDK download.

Upstream docs: https://docs.fivemanage.com/fivem-sdk/installation
