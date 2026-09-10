---
name: fivem-nui
description: "Trigger: NUI, ui_page, SendNUIMessage, SetNUIFocus, RegisterNUICallback, HTML/CSS/JS for FiveM, FiveM menu UI. Build FiveM NUI pages, wire Lua-browser messaging, callbacks and focus."
license: MIT
metadata:
  author: germanfndez
  version: "1.0.0"
---

# FiveM NUI

HTML/CSS/JS interfaces for FiveM: manifest setup, Lua-to-browser messages, NUI callbacks and focus handling.

## Activation Contract

Load this skill when the user asks to create or edit a FiveM UI, writes HTML/CSS/JS inside a resource, sets `ui_page`, or asks about `SendNUIMessage`, `SetNUIFocus` or `RegisterNUICallback`.

## Hard Rules

- Declare `ui_page` and include every UI file in `files` in `fxmanifest.lua`; a missing file silently fails to load.
- Reference assets with `https://cfx-nui-<resource>/path`; the `nui://` protocol is deprecated.
- `RegisterNUICallback` handlers must ALWAYS call `cb(...)` (at least `cb({})`), or the browser request hangs.
- Browser calls callbacks with `fetch('https://' + GetParentResourceName() + '/<name>', { method: 'POST', body: JSON.stringify(...) })`; the URL name must match the registered name exactly.
- `SetNUIFocus(keyboard, mouse)`: always call `SetNUIFocus(false, false)` when closing the UI.
- NUI callbacks run on the CLIENT. Validate their data client-side, then re-validate on the server before any state change; never trust UI-sent prices, amounts or ids.
- Minimize `SendNUIMessage` calls: batch updates rather than sending per frame.
- Debug with F8 and Chrome DevTools; test the page in a browser with a mock mode.

## Decision Gates

| Direction | Mechanism |
|---|---|
| Lua to browser | `SendNUIMessage({ type = ..., data = ... })` + `window.addEventListener('message')` |
| Browser to Lua | `fetch` POST to `https://<resource>/<callback>` + `RegisterNUICallback` |
| Browser wants server data | callback to Lua client, then a server callback |
| Show / hide cursor | `SetNUIFocus(true, true)` / `SetNUIFocus(false, false)` |
| Keyboard only | `SetNUIFocus(true, false)` |

## Execution Steps

1. Add `ui_page` and `files` to the manifest (read rules/setup.md).
2. Build `index.html`, CSS and JS; listen for `message` events keyed by `type`.
3. Register Lua callbacks for every action the UI can request; call `cb` on every path.
4. Manage focus on open/close; handle `Escape` to close.
5. Forward any state-changing action to the server and validate there.

## Output Contract

Return the manifest entries, the HTML/CSS/JS files, and the Lua client script with callbacks and focus handling. Keep security-relevant logic on the server.

## References

- rules/setup.md — folder layout, manifest, build tools, common mistakes.
- rules/fullscreen-nui.md — SendNUIMessage, SetNUIFocus, focus stack, assets, devtools.
- rules/nui-callbacks.md — RegisterNUICallback, fetch, async, errors, security.
- rules/best-practices.md — performance, security, state, error handling, testing.
- rules/reference-links.md — official docs and natives reference.

Upstream docs: https://docs.fivem.net/docs/scripting-manual/nui-development/
