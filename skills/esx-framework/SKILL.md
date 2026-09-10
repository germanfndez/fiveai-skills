---
name: esx-framework
description: "Trigger: ESX, es_extended, xPlayer, PlayerData, ESX.GetPlayerFromId, ESX.RegisterServerCallback, ESX jobs, economy, inventory. Build ESX Legacy resources with server/client functions, xPlayer methods, callbacks and events."
license: MIT
metadata:
  author: germanfndez
  version: "1.0.0"
---

# ESX Framework

Server/client API for ESX Legacy: xPlayer, PlayerData, callbacks, events, jobs and money.

## Activation Contract

Load this skill when the user creates or edits an ESX resource, touches `xPlayer` or `ESX.PlayerData`, needs jobs, money, accounts, items or weapons through ESX, or asks about ESX callbacks, events or best practices.

## Hard Rules

- Get the object with `ESX = exports['es_extended']:getSharedObject()`. On the client, wait for `ESX` and `ESX.IsPlayerLoaded()` before reading `ESX.PlayerData`.
- `xPlayer` exists on the SERVER only (`ESX.GetPlayerFromId(source)`). `ESX.PlayerData` exists on the CLIENT only.
- Always nil-check: `if not xPlayer then return end` before calling any method.
- Money, items, weapons, jobs and metadata are mutated on the server through `xPlayer.*` methods, never from the client.
- Pass a `reason` to `addMoney`, `removeMoney`, `addAccountMoney`, `removeAccountMoney`.
- Client callbacks (`ESX.TriggerClientCallback`, `ESX.AwaitClientCallback`) must never decide anything sensitive: the client can fake the answer.
- Use `ESX.SecureNetEvent` for client events that only the server may trigger.
- Prefer ox_lib for notifications, menus, dialogs and progress bars over ESX UI.
- Cache `PlayerPedId()` and update on `esx:playerPedChanged`; never `Wait(0)` loops without need.

## Decision Gates

| Need | Use |
|---|---|
| Client asks server for data | `ESX.RegisterServerCallback` + `ESX.TriggerServerCallback` |
| Server pushes an event to one player | `xPlayer.triggerEvent(name, ...)` |
| Server-only client event | `ESX.SecureNetEvent(name, cb)` on the client |
| Find player by source / identifier | `ESX.GetPlayerFromId` / `ESX.GetPlayerFromIdentifier` |
| Filter players by job etc. | `ESX.GetExtendedPlayers(key, value)` |
| Usable item | `ESX.RegisterUsableItem(item, cb)` |
| Admin command with group | `ESX.RegisterCommand(name, group, cb, allowConsole, suggestion)` |

## Execution Steps

1. Confirm `es_extended` starts before the resource; acquire `ESX` per side.
2. Decide the side: mutation and validation on server, display on client.
3. Fetch `xPlayer`, nil-check, then validate every client-supplied argument.
4. Pick the call from Decision Gates; read the matching rules file for signatures.
5. Return data via callbacks, not paired events.

## Output Contract

Return runnable Lua with the client/server split explicit, `xPlayer` nil-checked, and reasons on money operations. Use ox_lib for UI unless the user asks otherwise.

## References

- rules/core-concepts.md — architecture, PlayerData, xPlayer, startup flow.
- rules/client-functions.md — client-side ESX functions and player state.
- rules/server-functions.md — player retrieval, callbacks, commands, jobs, items.
- rules/xplayer-methods.md — xPlayer money, accounts, inventory, weapons, meta.
- rules/events-callbacks.md — server/client callbacks, events, SecureNetEvent.
- rules/best-practices.md — naming, caching, loops, security, Lua 5.4.
- rules/reference-links.md — official ESX documentation links.

Upstream docs: https://docs.esx-framework.org
