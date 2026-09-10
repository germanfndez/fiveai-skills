---
name: oxlib
description: "Trigger: ox_lib, lib.notify, lib.alertDialog, lib.inputDialog, lib.callback, lib.addCommand, lib.zones, menus, progress bars, keybinds, client-server callbacks. Use ox_lib UI, callbacks, commands and zones."
license: MIT
metadata:
  author: germanfndez
  version: "1.0.0"
---

# ox_lib

Shared FiveM library: UI (notify, dialogs, menus, progress), client/server callbacks, commands and zones via the global `lib`.

## Activation Contract

Load this skill when the user needs notifications, alert or input dialogs, menus, progress bars, TextUI, a client-server request/response, a typed server command, zones ("player enters/leaves area"), keybinds, or any resource that depends on ox_lib.

## Hard Rules

- Add `shared_scripts { '@ox_lib/init.lua' }` to `fxmanifest.lua` and ensure `ox_lib` starts before the resource; without it `lib` is nil.
- Prefer `lib.callback` / `lib.callback.await` over paired events or framework-specific callbacks for data across the network.
- `lib.callback.register(name, function(source, ...))` on the server receives `source` first; validate arguments there.
- Callback names must be unique (`resourcename:action`).
- UI functions (`lib.notify`, `lib.alertDialog`, `lib.inputDialog`, `lib.progress`, `lib.context`, `lib.menu`, `lib.showTextUI`) render on the CLIENT; from the server trigger the client to call them.
- Icons are Font Awesome 6, default style `solid`; brand icons use `{'fab', 'name'}`.
- `lib.addCommand` is SERVER-side; use `restricted` for permissions and typed `params` (`number`, `playerId`, `string`, `longString`).
- Zones: `onEnter`, `onExit` and `inside` do not work on the server; create zones on the client. Keep the returned zone to call `zone:remove()`.
- Modules load on first use or via `ox_libs { ... }` / `lib.require`.

## Decision Gates

| Need | Call |
|---|---|
| Toast message | `lib.notify({ title, description, type })` |
| Confirm / OK dialog | `lib.alertDialog({ header, content, centered, cancel })` |
| Form input | `lib.inputDialog(title, rows)` |
| Client asks server | `lib.callback.await(name, false, ...)` + server `lib.callback.register` |
| Server asks client | `lib.callback.await(name, source, ...)` + client `lib.callback.register` |
| Chat command with args | `lib.addCommand(name, { help, params, restricted }, cb)` |
| Area trigger | `lib.zones.poly` / `lib.zones.box` / `lib.zones.sphere` |

## Execution Steps

1. Add the manifest line and start order (read rules/init.md).
2. Pick the call from Decision Gates; read the matching rules file for the option table.
3. Put request handling on the server callback; put UI on the client.
4. Name callbacks and commands with the resource prefix.
5. Store zone handles for removal.

## Output Contract

Return runnable Lua using the global `lib`, with the manifest line when the resource is new and the client/server side explicit.

## References

- rules/init.md — fxmanifest, shared_script, ox_libs, lib.require.
- rules/callback.md — lib.callback, await, register on both sides.
- rules/interface.md — notify, alertDialog, inputDialog, other UI modules, icons.
- rules/addCommand.md — server commands with help, params, restricted.
- rules/zones.md — poly, box, sphere zones, methods and utilities.

Upstream docs: https://overextended.dev/ox_lib
