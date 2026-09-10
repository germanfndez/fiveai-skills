---
name: qbcore-framework
description: "Trigger: QBCore, qb-core, Player object, PlayerData, QBCore.Functions.GetPlayer, Player.Functions, QBCore callbacks, jobs, gangs, economy. Build qb-core resources with player methods, callbacks and events."
license: MIT
metadata:
  author: germanfndez
  version: "1.0.0"
---

# QBCore Framework

Server/client API for qb-core: Player object, PlayerData, callbacks, jobs, gangs, money and metadata.

## Activation Contract

Load this skill when the user creates or edits a qb-core resource, touches `Player` / `QBCore.PlayerData`, needs jobs, gangs, money, items or metadata through QBCore, or asks about QBCore callbacks, events or best practices.

This skill targets qb-core (qbcore-framework). If the user is on Qbox (`qbx_core`, `exports.qbx_core`), the APIs diverge: state it and do not apply this skill blindly.

## Hard Rules

- Acquire the core once with `local QBCore = exports['qb-core']:GetCoreObject()`; never call it inside every function.
- `Player` exists on the SERVER only (`QBCore.Functions.GetPlayer(source)`). `QBCore.PlayerData` exists on the CLIENT only, populated after `QBCore:Client:OnPlayerLoaded`.
- Always nil-check: `if not Player then return end` before calling any method.
- Money, jobs, gangs, items and metadata are mutated on the server through `Player.Functions.*`, never from the client.
- Pass a `reason` to `AddMoney`, `RemoveMoney`, `SetMoney`.
- Use state bags OR events for a given piece of state, never both.
- Validate every client-supplied argument on the server; never trust amounts, prices or item names sent by the client.
- Prefer ox_lib for notifications, menus, dialogs and progress bars.
- Use dynamic `Wait()` values in loops; avoid `Wait(0)` unless per-frame work is required.

## Decision Gates

| Need | Use |
|---|---|
| Client asks server for data | `QBCore.Functions.CreateCallback` + `QBCore.Functions.TriggerCallback` |
| Money | `Player.Functions.AddMoney/RemoveMoney/SetMoney/GetMoney(moneyType, ...)` |
| Job / duty / gang | `Player.Functions.SetJob`, `SetJobDuty`, `SetGang` |
| Persistent per-player flags | `Player.Functions.SetMetaData` / `GetMetaData` |
| Items (qb-inventory) | `Player.Functions.AddItem/RemoveItem/GetItemByName/GetItemBySlot` |
| Shared runtime state | state bags (see rules/core-concepts.md) |

## Execution Steps

1. Confirm `qb-core` starts before the resource; cache `QBCore` per side.
2. Decide the side: mutation and validation on server, display on client.
3. Fetch `Player`, nil-check, then validate every client-supplied argument.
4. Pick the call from Decision Gates; read the matching rules file for signatures.
5. Return data via callbacks, not paired events.

## Output Contract

Return runnable Lua with the client/server split explicit, `Player` nil-checked, and reasons on money operations. Use ox_lib for UI unless the user asks otherwise.

## References

- rules/core-concepts.md — architecture, PlayerData, Player object, events, state bags.
- rules/player-methods.md — Player.Functions money, job, gang, metadata, items.
- rules/best-practices.md — naming, caching, waits, state management, security.
- rules/reference-links.md — official QBCore documentation links.

Upstream docs: https://docs.qbcore.org
