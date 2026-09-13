---
name: fivem-security
description: "Trigger: security, anti-cheat, exploit, secure events, validate client data, server authority, distance check, rate limit, review server code. Harden FiveM net events and server-side validation."
license: MIT
metadata:
  author: germanfndez
  version: "1.0.0"
---

# FiveM Security

## Activation Contract

Load for any net event handler, code granting money, items, vehicles or permissions, admin commands, ban logic, or questions about cheats, exploits or hardening.

## Hard Rules

- Never trust the client. The client REQUESTS; the server DECIDES from its own config and state.
- Never accept prices, amounts, rewards or item names from the client. Derive them server-side.
- `GetInvokingResource()` is nil for every net event crossing the network, player or cheater alike. NOT auth.
- `RegisterNUICallback` is NOT authenticated: a cheater POSTs to any endpoint. Never the only gate before `TriggerServerEvent`.
- Distance-check server-side: `#(GetEntityCoords(GetPlayerPed(source)) - target)`, ~10 units.
- Re-verify state server-side (job, item, cooldown) even if the client checked.
- Rate-limit critical events; clear per-source state in `playerDropped`.
- Filter native game events (`weaponDamageEvent`, `startProjectileEvent`, `removeAllWeaponsEvent`, `ptFxEvent`) with `AddEventHandler` + `CancelEvent()`.
- Authorize admin actions with ACE only: `IsPlayerAceAllowed(source, object)`. Never an identifier list.
- Key persistent data on `license:`. `steam:` is absent for non-Steam launches.
- The sandbox blocks writes outside the resource's own folder, `os.execute` and `io.tmpfile()`.
- Log rejections. Escalate on counts, never auto-ban on one hit.

## Decision Gates

| Situation | Reference |
|---|---|
| Client-sent price, amount, or any argument | rules/events.md |
| Repeated or spammable event | rules/rate-limiting.md |
| Damage, projectile, weapon strip, particles | rules/net-game-events.md |
| Admin command or admin-only event | rules/ace-permissions.md |
| Ban, whitelist, persistent record | rules/identifiers.md |
| Resource writes files or spawns processes | rules/sandbox.md |
| Hardening the server itself | rules/server-convars.md |

## Execution Steps

1. List every net event and NUI callback and the state each changes.
2. Strip client values the server can compute itself.
3. Add type/range, distance and state checks at the top; return early.
4. Cooldown or token-bucket anything spammable; clean up on drop.
5. Gate admin paths behind `IsPlayerAceAllowed`.
6. Add game event filters for damage, projectiles, weapons.
7. Log rejections with name and source id.

## Output Contract

Return hardened handler(s) with validation, distance, ACE and state checks first; name the client parameters removed; include required `server.cfg` lines.

## References

- rules/events.md — handlers, distance, NUI callbacks.
- rules/net-game-events.md — game event payloads, cancelling.
- rules/ace-permissions.md — principals, objects, ACE guards.
- rules/rate-limiting.md — cooldowns, token buckets, cleanup.
- rules/identifiers.md — `license:`, tokens, deferrals.
- rules/sandbox.md — filesystem, process, convar limits.
- rules/server-convars.md — hardening convars.

Upstream docs: https://docs.fivem.net/docs/scripting-manual/
