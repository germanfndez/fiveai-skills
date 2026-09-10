---
name: fivem-security
description: "Trigger: security, anti-cheat, exploit, secure events, validate client data, server authority, distance check, rate limit, review server code. Harden FiveM net events and server-side validation."
license: MIT
metadata:
  author: germanfndez
  version: "1.0.0"
---

# FiveM Security

Server-authority rules for FiveM net events: validation, distance checks, state verification and logging.

## Activation Contract

Load this skill when writing or reviewing any `RegisterNetEvent` / `TriggerServerEvent` handler, any code that grants money, items, vehicles or permissions, or when the user asks about cheats, exploits or securing a resource.

## Hard Rules

- Never trust the client. The client REQUESTS an action; the server DECIDES the outcome from its own config and state.
- Never accept prices, amounts, rewards or sensitive item names from the client. Derive them server-side (`Config.*`, server tables).
- `GetInvokingResource()` is nil for every net event crossing the network, real player or cheater alike; it is NOT an authentication check. Validate types, ranges, server-owned data and distance instead.
- Always distance-check on the server with `#(GetEntityCoords(GetPlayerPed(source)) - target)`; ~10 units is a safe latency margin.
- Verify required state again on the server (job, item, "is working", cooldown), even if the client already checked.
- Rate-limit critical events with server-side cooldowns.
- Log suspicious activity (failed distance/state checks) for admins.

## Decision Gates

| Client sends | Server does |
|---|---|
| "pay me X" | ignore X; pay `Config` amount after verifying state |
| "buy item Y at price P" | ignore P; look up price by Y server-side, check funds |
| "harvest / loot / sell here" | distance check against known coords, then proceed |
| any argument | check `type()`, `tonumber()`, range, then use |
| repeated event | cooldown table keyed by `source`; drop if too soon |

## Execution Steps

1. List every net event the resource exposes and what state it changes.
2. For each, strip client-supplied values that the server can compute itself.
3. Add type/range validation, distance check and state verification at the top of the handler; return early on failure.
4. Add a cooldown for anything spammable.
5. Log rejected attempts with `GetPlayerName(source)`.

## Output Contract

Return the hardened server handler(s) with validation, distance and state checks first, and note which client-sent parameters were removed.

## References

- rules/events.md — bad vs good event handling, distance checks, best practices.

Upstream docs: https://docs.fivem.net/docs/scripting-manual/
