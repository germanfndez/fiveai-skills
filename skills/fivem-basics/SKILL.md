---
name: fivem-basics
description: "Trigger: FiveM resource, fxmanifest, client/server script, RegisterNetEvent, TriggerServerEvent, TriggerClientEvent, exports, F8 logs, how FiveM works. Structure resources, manifests, events and exports for FiveM Lua."
license: MIT
metadata:
  author: germanfndez
  version: "1.0.0"
---

# FiveM basics

Resource structure, fxmanifest, client/server split, events, exports and debugging for FiveM Lua.

## Activation Contract

Load this skill when the user creates or edits any FiveM resource, `fxmanifest.lua`, `client*.lua` or `server*.lua`, asks how client/server, events or exports work, or reports a bug that needs server vs F8 logs.

## Hard Rules

- Manifest: `fx_version 'cerulean'` and `game 'gta5'` (or `'rdr3'` / `'common'`); every client-served file goes in `files`.
- Register networked events with `RegisterNetEvent`; local-only events use `AddEventHandler` alone, never `RegisterNetEvent`.
- Server handlers read the sender from `source`; broadcast with `TriggerClientEvent(event, -1, ...)`.
- `GetInvokingResource()` is nil for every net event that crosses the network; it is not an authentication check. Validate types, ranges and server-owned state instead.
- Never handle money or item transactions on the client; validate and apply on the server.
- No game natives in `shared_scripts` unless guarded by environment.
- Use `PlayerPedId()` not `GetPlayerPed(-1)`; use `#(a - b)` not `GetDistanceBetweenCoords`.
- Prefer `local`; prefer variable `Wait()` over fixed `Wait(0)`.
- Resource names use underscores, no spaces or special characters.

## Decision Gates

| Need | Use |
|---|---|
| Client to server | `TriggerServerEvent(event, ...)` |
| Server to one / all clients | `TriggerClientEvent(event, playerId \| -1, ...)` |
| Same side only | `TriggerEvent` + `AddEventHandler` |
| Data back across the network | a callback (ox_lib / framework), not paired events |
| Single-resource, non-networked call | a plain function, not an event |
| Cross-resource function | `exports` / `server_export` in manifest, `exports.res:fn()` |
| Bug with clean server console | ask for F8 client logs |

## Execution Steps

1. Lay out `client/`, `server/`, `shared/` and the manifest; read rules/structure.md and rules/fxmanifest.md.
2. Decide the side for each piece of logic (natives on client, data and validation on server).
3. Wire communication from Decision Gates; name events `resource:side:action`.
4. Validate every server handler argument; add distance and state checks.
5. Point to https://docs.fivem.net/natives/ for native lookups.

## Output Contract

Return the manifest plus runnable Lua split by side, with event names, validation and `source` handling explicit.

## References

- rules/structure.md — scope, client/server separation, naming.
- rules/fxmanifest.md — manifest entries, globbing, minimal example.
- rules/client-server.md — what runs where and how sides communicate.
- rules/events.md — register, trigger, naming, events vs functions, security.
- rules/exports.md — defining and consuming exports.
- rules/debugging.md — server console vs F8 logs.
- rules/optimization.md — locals, tables, natives, loops, security.
- rules/reference-links.md — official docs and natives reference.

Upstream docs: https://docs.fivem.net/docs/
